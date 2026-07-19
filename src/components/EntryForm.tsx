import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, MessageSquare, BookOpen, Quote } from "lucide-react";
import { HeritageEntry } from "../types";

interface EntryFormProps {
  onEntryCreated: (entry: HeritageEntry) => void;
}

const EXAMPLES = [
  {
    label: "Peach Cobbler & Sarah's Memory",
    text: "Oh, you wanted that peach cobbler recipe? I don't really have it written down, but my mother (your great grandmother Sarah) used to make it every August when the Georgia peaches were ripe. She'd get a whole bushel. Anyway, you want about 4 or 5 big sweet peaches, slice them up, and toss them with maybe half a cup of sugar and a spoonful of cinnamon. Don't peel them, the skin has the color! For the batter, it's just a cup of flour, a cup of sugar, and a cup of milk, with a stick of melted butter poured in the bottom of a baking dish. Pour the batter on top, then spoon the peaches over it. Bake it at 375 until it bubbles and gets golden brown. She always told me, 'If you rush a cobbler, you miss the juice.' So let it sit for ten minutes before serving with vanilla ice cream. We'd sit on the porch under the oak tree and eat it warm while the fireflies came out."
  },
  {
    label: "Dad's Workshop & Chisels",
    text: "I was thinking about my dad's old workshop last night. It always smelled like sawdust, WD-40, and cherry pipe tobacco. When I was ten, I broke his favorite chisels trying to pry open an old crate. I was terrified he'd yell. But he just sat me down, showed me how to sharpen the blade on an oilstone, and said: 'Tools are meant to be used, son. But if you don't take care of them, they won't take care of you. Same goes for relationships.' He spent the whole afternoon helping me rebuild that crate properly. I still have that chisel on my desk today."
  },
  {
    label: "Grandma's Meatballs",
    text: "Okay, write this down before I forget. Grandma's meatballs: get a pound of ground beef and a pound of ground pork. Grate in some fresh garlic, maybe 3 cloves. Toss in a handful of parsley, fine-chopped. You need 2 eggs and a cup of stale breadcrumbs soaked in a splash of whole milk. Don't skip the milk soaking, that's why they are so tender! Mix it with your hands but don't overwork it, or they'll be like golf balls. Fry them in olive oil until a nice crust forms, then drop them into the slow-simmering marinara sauce for at least 2 hours."
  }
];

const LOADING_STEPS = [
  "Dusting off the archive...",
  "Listening to the voice within the words...",
  "Extracting family secrets...",
  "Polishing raw memories into stories...",
  "Gleaning quiet, timeless wisdom...",
  "Recording in the book of heritage..."
];

export default function EntryForm({ onEntryCreated }: EntryFormProps) {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Cycle through loading steps to keep the user engaged
  const runLoadingAnimation = () => {
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2000);
    return interval;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please write or paste some text first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    const loadingInterval = runLoadingAnimation();

    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to process the text");
      }

      const newEntry: HeritageEntry = await response.json();
      onEntryCreated(newEntry);
      setText("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      clearInterval(loadingInterval);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" id="entry-form-container">
      <div className="bg-white rounded-[12px] p-6 sm:p-8 border border-art-border hn-soft-shadow relative overflow-hidden scrapbook-tape scrapbook-offset-left md:hover:rotate-0 transition-transform duration-500">
        {/* Subtle decorative stamp in the background */}
        <div className="absolute -bottom-2 -right-4 text-art-border font-hand text-7xl select-none rotate-12 opacity-25">
          HEIRLOOM
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl text-art-dark mb-2 flex items-center gap-2.5 font-normal">
          <Sparkles className="w-5 h-5 text-art-accent" />
          Record a Family Memory
        </h2>
        <p className="text-sm text-art-dark/85 mb-6 leading-relaxed font-sans">
          Write down what you remember, or paste a rough transcript of a conversation with an elder. Don&apos;t worry about editing or punctuation — let it flow naturally.
        </p>

        {/* Examples section */}
        <div className="mb-8">
          <span className="text-[11px] font-sans font-bold text-art-dark/60 uppercase tracking-wider block mb-3">
            Need inspiration? Click an archive to load:
          </span>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setText(ex.text)}
                className="text-xs px-3.5 py-2 rounded-[4px] bg-art-sidebar text-art-dark/90 border border-art-border hover:bg-art-border/40 transition-colors font-sans text-left cursor-pointer shadow-2xs font-medium"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError(null);
              }}
              placeholder="E.g., 'Grandma always made a special blueberry pie in July. She said the trick was to add a teaspoon of lemon zest. I remember we would pick the wild berries behind the red barn...'"
              rows={8}
              disabled={isLoading}
              className="w-full bg-transparent p-4 text-art-dark placeholder-art-dark/45 focus:outline-none transition-all font-sans text-base leading-relaxed resize-y ruled-notebook-paper border-b-2 border-art-border"
              id="raw-text-input"
            />
            <span className="absolute bottom-3 right-3 text-[10px] text-art-dark/50 font-mono bg-white/80 px-1.5 py-0.5 rounded-sm">
              {text.length} characters
            </span>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-art-accent bg-art-accent/5 rounded-[4px] p-3 border border-art-accent/20 font-sans"
            >
              {error}
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
            <div className="flex flex-wrap gap-3 text-xs text-art-dark/80 font-sans">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-art-sidebar border border-art-border/50 text-art-dark font-sans text-[11px] font-semibold">
                <BookOpen className="w-3.5 h-3.5 text-art-accent" /> Recipes
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-art-sidebar border border-art-border/50 text-art-dark font-sans text-[11px] font-semibold font-semibold">
                <MessageSquare className="w-3.5 h-3.5 text-art-accent" /> Stories
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-art-sidebar border border-art-border/50 text-art-dark font-sans text-[11px] font-semibold font-semibold">
                <Quote className="w-3.5 h-3.5 text-art-accent" /> Wisdom
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading || !text.trim()}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-[4px] font-sans text-xs uppercase tracking-widest text-[#fbf9f5] flex items-center justify-center gap-2 transition-all cursor-pointer font-bold hn-card-shadow ${
                isLoading || !text.trim()
                  ? "bg-art-border text-art-dark/40 cursor-not-allowed border border-art-border"
                  : "bg-art-accent hover:bg-[#833f1f] active:scale-[0.99]"
              }`}
              id="submit-raw-text-btn"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Weave Heritage
                </>
              )}
            </button>
          </div>
        </form>

        {/* Dynamic Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10"
              id="loading-overlay"
            >
              <div className="flex flex-col items-center max-w-sm">
                <div className="relative w-24 h-24 mb-6">
                  {/* Decorative swirling dots */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-art-accent rounded-full"
                  />
                  <div className="absolute inset-4 bg-art-sidebar rounded-full border border-art-border flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-art-accent animate-pulse" />
                  </div>
                </div>

                <h3 className="font-serif text-2xl text-art-dark mb-2 font-normal">
                  Weaving Your Heritage
                </h3>
                
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="font-hand text-3xl text-art-accent h-8"
                  >
                    {LOADING_STEPS[loadingStep]}
                  </motion.p>
                </AnimatePresence>

                <p className="text-xs text-art-dark/70 mt-6 max-w-[280px] font-sans">
                  Using AI to extract original details without inventing anything. This will take a moment.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
