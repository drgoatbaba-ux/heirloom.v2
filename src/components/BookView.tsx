import { useState } from "react";
import { motion } from "motion/react";
import { Search, ChevronRight, Book, Quote, Heart } from "lucide-react";
import { HeritageEntry } from "../types";

interface BookViewProps {
  entries: HeritageEntry[];
  currentBook: "recipes" | "stories" | "wisdom";
  onSelectEntry: (entry: HeritageEntry) => void;
}

export default function BookView({ entries, currentBook, onSelectEntry }: BookViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter entries based on active book & search query
  const filteredEntries = entries.filter((entry) => {
    // Correct book filter
    if (currentBook === "recipes" && !entry.has_recipe) return false;
    if (currentBook === "stories" && !entry.has_story) return false;
    if (currentBook === "wisdom" && !entry.has_wisdom) return false;

    // Search query
    if (!searchQuery.trim()) return true;
    const queryStr = searchQuery.toLowerCase();
    
    // Check fields based on entry type
    const matchesRaw = entry.rawText.toLowerCase().includes(queryStr);
    const matchesRecipe = entry.has_recipe && entry.recipe && (
      entry.recipe.title.toLowerCase().includes(queryStr) ||
      entry.recipe.ingredients.some(i => i.toLowerCase().includes(queryStr)) ||
      entry.recipe.steps.some(s => s.toLowerCase().includes(queryStr))
    );
    const matchesStory = entry.has_story && entry.story?.toLowerCase().includes(queryStr);
    const matchesWisdom = entry.has_wisdom && entry.wisdom?.toLowerCase().includes(queryStr);

    return matchesRaw || matchesRecipe || matchesStory || matchesWisdom;
  });

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return "Sometime ago";
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6" id="book-view-container">
      {/* Search Input */}
      <div className="mb-10 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-art-accent" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search within the ${
              currentBook === "recipes" ? "Recipe" : currentBook === "stories" ? "Story" : "Wisdom"
            } Book...`}
            className="w-full pl-10 pr-4 py-2.5 rounded-sm bg-art-sidebar border border-art-border text-art-dark placeholder-art-dark/40 focus:outline-none focus:ring-1 focus:ring-art-accent focus:border-art-accent transition-all text-sm font-sans"
          />
        </div>
      </div>

      {/* Grid List */}
      {filteredEntries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 px-4 bg-art-sidebar rounded-sm border border-dashed border-art-border art-shadow"
          id="empty-book-state"
        >
          <div className="max-w-md mx-auto">
            <span className="font-hand text-5xl text-art-accent/40 block mb-2">Empty Page</span>
            <p className="font-serif text-lg text-art-dark mb-4 italic">
              {searchQuery
                ? "No entries matched your search query in this book."
                : `There are no entries in the ${
                    currentBook === "recipes" ? "Recipe" : currentBook === "stories" ? "Story" : "Wisdom"
                  } Book yet.`}
            </p>
            <p className="text-xs text-art-dark/60 font-sans uppercase tracking-wider">
              {searchQuery
                ? "Try searching for ingredients, names, or general keywords."
                : "Submit a new raw story or voice transcript above to start our living archive!"}
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4"
          id="entries-grid"
        >
          {filteredEntries.map((entry, idx) => {
            if (currentBook === "recipes" && entry.recipe) {
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => onSelectEntry(entry)}
                  className="bg-white p-6 border border-art-border art-shadow art-shadow-hover hover:border-art-accent cursor-pointer transition-all flex flex-col justify-between group relative min-h-[250px]"
                  id={`recipe-card-${entry.id}`}
                >
                  {/* Absolute Stamp */}
                  <div className="absolute -top-3 -left-3 bg-art-accent text-white text-[10px] px-2 py-1 uppercase tracking-wider font-sans font-semibold">
                    Recipe
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-end items-center gap-2 mb-3">
                      <span className="text-[10px] text-art-dark/50 font-sans italic">
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>
                    
                    <h3 className="font-serif text-2xl text-art-dark font-normal italic leading-tight group-hover:text-art-accent transition-colors mb-4">
                      {entry.recipe.title}
                    </h3>
                    
                    <div className="mb-4">
                      <span className="text-xs font-serif italic text-art-accent block mb-1">Ingredients:</span>
                      <ul className="text-xs text-art-dark/80 space-y-1 list-disc pl-4 line-clamp-4 font-sans">
                        {entry.recipe.ingredients.slice(0, 4).map((ing, i) => (
                          <li key={i}>{ing}</li>
                        ))}
                        {entry.recipe.ingredients.length > 4 && (
                          <li className="text-art-accent list-none pl-0 italic font-medium">
                            + {entry.recipe.ingredients.length - 4} more ingredients
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-art-dark/60 border-t border-art-border/60 pt-3 mt-4 font-sans">
                    <span className="font-medium flex items-center gap-1">
                      <Book className="w-3.5 h-3.5 text-art-accent" /> {entry.recipe.steps.length} steps
                    </span>
                    <span className="flex items-center gap-0.5 text-art-accent font-serif italic font-medium group-hover:translate-x-1 transition-transform">
                      View Recipe <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              );
            }

            if (currentBook === "stories") {
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => onSelectEntry(entry)}
                  className="bg-art-sidebar p-6 border border-art-border art-shadow art-shadow-hover rounded-tl-[40px] rounded-br-[10px] cursor-pointer transition-all flex flex-col justify-between group relative min-h-[250px]"
                  id={`story-card-${entry.id}`}
                >
                  {/* Absolute Stamp */}
                  <div className="absolute -top-3 -left-3 bg-art-story text-white text-[10px] px-2 py-1 uppercase tracking-wider font-sans font-semibold">
                    Family Story
                  </div>

                  {/* Watermark Section Symbol */}
                  <div className="absolute bottom-4 right-4 opacity-[0.06] select-none pointer-events-none text-art-accent">
                    <Heart className="w-20 h-20 fill-current" />
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-end items-center gap-2 mb-3">
                      <span className="text-[10px] text-art-dark/50 font-sans italic">
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>

                    <p className="font-serif italic text-art-dark/90 leading-relaxed text-base line-clamp-6">
                      &ldquo;{entry.story}&rdquo;
                    </p>
                  </div>

                  <div className="flex justify-end items-center text-xs text-art-accent border-t border-art-border/40 pt-3 mt-4 z-1">
                    <span className="flex items-center gap-0.5 font-serif italic font-medium group-hover:translate-x-1 transition-transform">
                      Read Memoir <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              );
            }

            if (currentBook === "wisdom" && entry.wisdom) {
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => onSelectEntry(entry)}
                  className="bg-white p-6 border border-art-border art-shadow art-shadow-hover hover:border-art-wisdom cursor-pointer transition-all flex flex-col justify-between group relative min-h-[250px]"
                  id={`wisdom-card-${entry.id}`}
                >
                  {/* Absolute Stamp */}
                  <div className="absolute -top-3 -left-3 bg-art-wisdom text-white text-[10px] px-2 py-1 uppercase tracking-wider font-sans font-semibold">
                    Wisdom
                  </div>

                  <div className="pt-2 flex-grow flex flex-col justify-between">
                    <div className="flex justify-end items-center gap-2 mb-4">
                      <span className="text-[10px] text-art-dark/50 font-sans italic">
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>

                    <div className="mb-4 text-center py-2 flex-grow flex flex-col justify-center">
                      <Quote className="w-6 h-6 text-art-border mb-2 mx-auto fill-current opacity-60" />
                      <p className="font-serif italic text-xl text-art-dark leading-relaxed">
                        &ldquo;{entry.wisdom}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end items-center text-xs text-art-dark/60 border-t border-art-border/60 pt-3 mt-2 font-sans">
                    <span className="flex items-center gap-0.5 font-serif italic font-medium text-art-accent group-hover:translate-x-1 transition-transform">
                      Full Details <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              );
            }

            return null;
          })}
        </motion.div>
      )}
    </div>
  );
}
