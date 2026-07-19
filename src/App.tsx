import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PlusCircle, BookOpen, MessageSquare, Quote, Heart, RotateCcw } from "lucide-react";
import Header from "./components/Header";
import EntryForm from "./components/EntryForm";
import BookView from "./components/BookView";
import EntryDetail from "./components/EntryDetail";
import { HeritageEntry } from "./types";

type ViewTab = "submit" | "recipes" | "stories" | "wisdom";

export default function App() {
  const [entries, setEntries] = useState<HeritageEntry[]>([]);
  const [activeTab, setActiveTab] = useState<ViewTab>("submit");
  const [selectedEntry, setSelectedEntry] = useState<HeritageEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch all entries from the shared public database on mount
  useEffect(() => {
    async function fetchEntries() {
      try {
        const response = await fetch("/api/entries");
        if (!response.ok) {
          throw new Error("Failed to load family archives.");
        }
        const data = await response.json();
        setEntries(data);
      } catch (err: any) {
        console.error(err);
        setFetchError("Could not retrieve the shared archive. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchEntries();
  }, []);

  const handleEntryCreated = (newEntry: HeritageEntry) => {
    // Add new entry to the top of our state
    setEntries((prev) => [newEntry, ...prev]);

    // Intelligently switch tab based on what was extracted from the submission
    if (newEntry.has_recipe) {
      setActiveTab("recipes");
    } else if (newEntry.has_story) {
      setActiveTab("stories");
    } else if (newEntry.has_wisdom) {
      setActiveTab("wisdom");
    } else {
      setActiveTab("recipes"); // default fallback
    }

    // Auto open the detailed card view so the user can admire the extraction!
    setSelectedEntry(newEntry);
  };

  // Counting entries for badges
  const recipeCount = entries.filter((e) => e.has_recipe).length;
  const storyCount = entries.filter((e) => e.has_story).length;
  const wisdomCount = entries.filter((e) => e.has_wisdom).length;

  return (
    <div className="min-h-screen bg-art-bg flex flex-col justify-between text-art-dark" id="app-root">
      <div>
        {/* Universal Header */}
        <Header />

        {/* Navigation Tabs */}
        <div className="max-w-4xl mx-auto px-4 mt-8" id="navigation-tabs-container">
          <div className="flex bg-art-sidebar p-1.5 rounded-sm border border-art-border art-shadow justify-between overflow-x-auto gap-2">
            <button
              onClick={() => setActiveTab("submit")}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-sm font-serif text-xs uppercase tracking-wider font-medium transition-all cursor-pointer flex-1 whitespace-nowrap ${
                activeTab === "submit"
                  ? "bg-art-accent text-white shadow-xs font-semibold"
                  : "text-art-dark/70 hover:text-art-dark hover:bg-art-border/40"
              }`}
              id="tab-submit"
            >
              <PlusCircle className="w-4 h-4" />
              Weave New
            </button>

            <button
              onClick={() => setActiveTab("recipes")}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-sm font-serif text-xs uppercase tracking-wider font-medium transition-all cursor-pointer flex-1 whitespace-nowrap ${
                activeTab === "recipes"
                  ? "bg-art-accent text-white shadow-xs font-semibold"
                  : "text-art-dark/70 hover:text-art-dark hover:bg-art-border/40"
              }`}
              id="tab-recipes"
            >
              <BookOpen className="w-4 h-4" />
              Recipe Book
              {recipeCount > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === "recipes" ? "bg-white text-art-accent" : "bg-art-border text-art-dark"} font-sans font-bold`}>
                  {recipeCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("stories")}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-sm font-serif text-xs uppercase tracking-wider font-medium transition-all cursor-pointer flex-1 whitespace-nowrap ${
                activeTab === "stories"
                  ? "bg-art-accent text-white shadow-xs font-semibold"
                  : "text-art-dark/70 hover:text-art-dark hover:bg-art-border/40"
              }`}
              id="tab-stories"
            >
              <MessageSquare className="w-4 h-4" />
              Story Book
              {storyCount > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === "stories" ? "bg-white text-art-accent" : "bg-art-border text-art-dark"} font-sans font-bold`}>
                  {storyCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("wisdom")}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-sm font-serif text-xs uppercase tracking-wider font-medium transition-all cursor-pointer flex-1 whitespace-nowrap ${
                activeTab === "wisdom"
                  ? "bg-art-accent text-white shadow-xs font-semibold"
                  : "text-art-dark/70 hover:text-art-dark hover:bg-art-border/40"
              }`}
              id="tab-wisdom"
            >
              <Quote className="w-4 h-4" />
              Wisdom Book
              {wisdomCount > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === "wisdom" ? "bg-white text-art-accent" : "bg-art-border text-art-dark"} font-sans font-bold`}>
                  {wisdomCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <main className="py-6 min-h-[50vh]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center" id="loading-state">
              <svg className="animate-spin h-8 w-8 text-art-accent mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="font-serif text-art-dark/70 text-sm italic">Unlocking the family archive boxes...</p>
            </div>
          ) : fetchError ? (
            <div className="max-w-md mx-auto py-20 px-4 text-center border border-art-border bg-art-sidebar art-shadow" id="error-state">
              <span className="font-hand text-5xl text-art-accent block mb-2">Oh dear</span>
              <p className="font-serif text-art-dark mb-6">{fetchError}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-art-accent hover:bg-art-accent/90 text-white rounded-sm text-xs uppercase tracking-wider font-serif shadow-sm flex items-center gap-1.5 mx-auto cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retry Loading
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === "submit" ? (
                <motion.div
                  key="submit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <EntryForm onEntryCreated={handleEntryCreated} />
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <BookView
                    entries={entries}
                    currentBook={
                      activeTab === "recipes"
                        ? "recipes"
                        : activeTab === "stories"
                        ? "stories"
                        : "wisdom"
                    }
                    onSelectEntry={(entry) => setSelectedEntry(entry)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Entry Detail Overlay (Modal) */}
      <AnimatePresence>
        {selectedEntry && (
          <EntryDetail
            entry={selectedEntry}
            onClose={() => setSelectedEntry(null)}
          />
        )}
      </AnimatePresence>

      {/* Warm Heritage Footer */}
      <footer className="border-t border-art-border bg-art-sidebar py-8 px-4 mt-16 text-center text-xs text-art-dark/70 font-serif italic">
        <div className="max-w-xl mx-auto flex flex-col items-center gap-1.5">
          <p className="flex items-center gap-1.5 font-serif text-sm">
            Made with <Heart className="w-3.5 h-3.5 text-art-accent fill-current" /> by the family, for the generations to come.
          </p>
          <p className="text-[10px] text-art-dark/50 uppercase tracking-widest font-sans font-semibold">
            Single Public Shared Archive. No registration required.
          </p>
        </div>
      </footer>
    </div>
  );
}
