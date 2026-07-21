import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, addDoc, getDocs, query, orderBy, doc, getDocFromServer, updateDoc, deleteDoc } from "firebase/firestore";

dotenv.config();

// Ensure Gemini API Key is available
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not defined in the environment.");
}

// Read Firebase config
let firebaseConfig: any = {};
const configPath = path.join(process.cwd(), "firebase-applet-config.json");
if (fs.existsSync(configPath)) {
  firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
} else {
  firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    appId: process.env.FIREBASE_APP_ID,
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    firestoreDatabaseId: process.env.FIREBASE_FIRESTORE_DATABASE_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || ""
  };
}

if (!firebaseConfig.projectId || !firebaseConfig.apiKey) {
  throw new Error("Firebase configuration is incomplete. Please ensure firebase-applet-config.json is present, or the corresponding FIREBASE_ environment variables are set.");
}

// Initialize Firebase client SDK on the server (highly reliable, no credentials files needed)
const firebaseApp = initializeApp(firebaseConfig);
const db = initializeFirestore(firebaseApp, {}, firebaseConfig.firestoreDatabaseId || "(default)");

// Validate Firestore connection on boot
async function validateDbConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firestore connection test completed.");
  } catch (error) {
    console.warn("Firestore validation on startup returned a connection result (this is normal for empty/new databases):", error);
  }
}
validateDbConnection();

// Initialize Gemini SDK lazily / safely
const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/entries", async (req, res) => {
    try {
      const entriesRef = collection(db, "entries");
      const q = query(entriesRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      res.json(entries);
    } catch (error: any) {
      console.error("Error fetching entries from Firestore:", error);
      res.status(500).json({ error: error.message || "Failed to fetch entries" });
    }
  });

  app.post("/api/entries", async (req, res) => {
    const { text } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Raw text content is required" });
    }

    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key is missing on the server. Please check your secrets." });
    }

    try {
      const systemInstruction = `You are Heirloom's assistant. You receive raw, informal text submitted by a family member — this may be a recipe, a memory/story, or any mix, written in any style (rambling, incomplete, casual). Your job: analyze the text and extract ONLY what is actually present. Do not invent or assume content that isn't there. Return a JSON object with this structure: { "has_recipe": true/false, "recipe": { "title": "short warm title", "ingredients": ["ingredient with quantity as given, or vague terms like 'a pinch' if that's how it was described"], "steps": ["step 1", "step 2"] } or null if has_recipe is false, "has_story": true/false, "story": "2-5 sentence memory/story in a warm personal tone, preserving the original voice and details" or null if has_story is false, "has_wisdom": true/false, "wisdom": "a piece of advice, life lesson, or quiet insight, grounded in something specifically said or done in the text" or null if has_wisdom is false }. Strict rules: Only set has_recipe true if actual ingredients or steps are described or implied. Only set has_story true if there's a genuine memory or anecdote. Wisdom can come from explicit advice OR a specific detail/habit/phrase that reveals a value or lesson — it must trace back to something actually written, never invented. If nothing supports genuine wisdom extraction, set has_wisdom to false. Never fabricate content. Respond with ONLY the JSON object, no markdown, no extra text.`;

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: text,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              has_recipe: { type: Type.BOOLEAN },
              recipe: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  ingredients: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  steps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["title", "ingredients", "steps"]
              },
              has_story: { type: Type.BOOLEAN },
              story: { type: Type.STRING },
              has_wisdom: { type: Type.BOOLEAN },
              wisdom: { type: Type.STRING }
            },
            required: ["has_recipe", "has_story", "has_wisdom"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini API");
      }

      let parsedData;
      try {
        const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        parsedData = JSON.parse(cleanedText);
      } catch (e) {
        console.error("JSON parsing failed for response:", responseText);
        throw new Error("The AI returned a malformed response format. Please try again.");
      }

      // Format and clean structure
      const entry = {
        rawText: text,
        has_recipe: !!parsedData.has_recipe,
        recipe: parsedData.has_recipe && parsedData.recipe ? {
          title: parsedData.recipe.title || "Untitled Recipe",
          ingredients: Array.isArray(parsedData.recipe.ingredients) ? parsedData.recipe.ingredients : [],
          steps: Array.isArray(parsedData.recipe.steps) ? parsedData.recipe.steps : []
        } : null,
        has_story: !!parsedData.has_story,
        story: parsedData.has_story ? parsedData.story : null,
        has_wisdom: !!parsedData.has_wisdom,
        wisdom: parsedData.has_wisdom ? parsedData.wisdom : null,
        createdAt: new Date().toISOString()
      };

      // Store in Firestore
      const docRef = await addDoc(collection(db, "entries"), entry);

      res.status(201).json({
        id: docRef.id,
        ...entry
      });
    } catch (error: any) {
      console.error("Error processing heritage entry:", error);
      res.status(500).json({ error: error.message || "Failed to process entry" });
    }
  });

  app.put("/api/entries/:id", async (req, res) => {
    const { id } = req.params;
    const { recipe, story, wisdom, has_recipe, has_story, has_wisdom } = req.body;
    try {
      const docRef = doc(db, "entries", id);
      const updateData: any = {
        has_recipe: !!has_recipe,
        recipe: has_recipe && recipe ? {
          title: recipe.title || "Untitled Recipe",
          ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
          steps: Array.isArray(recipe.steps) ? recipe.steps : []
        } : null,
        has_story: !!has_story,
        story: has_story ? story : null,
        has_wisdom: !!has_wisdom,
        wisdom: has_wisdom ? wisdom : null,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(docRef, updateData);
      
      // Get the updated doc to return it
      const updatedSnap = await getDocFromServer(docRef);
      res.json({
        id: updatedSnap.id,
        ...updatedSnap.data()
      });
    } catch (error: any) {
      console.error("Error updating entry in Firestore:", error);
      res.status(500).json({ error: error.message || "Failed to update entry" });
    }
  });

  app.delete("/api/entries/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const docRef = doc(db, "entries", id);
      await deleteDoc(docRef);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting entry from Firestore:", error);
      res.status(500).json({ error: error.message || "Failed to delete entry" });
    }
  });

  // Serve Vite app in development vs production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
