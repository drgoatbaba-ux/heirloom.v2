import { motion } from "motion/react";
import { X, Book, MessageSquare, Quote, Heart, Calendar, FileText } from "lucide-react";
import { HeritageEntry } from "../types";

interface EntryDetailProps {
  entry: HeritageEntry;
  onClose: () => void;
}

export default function EntryDetail({ entry, onClose }: EntryDetailProps) {
  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return "Sometime ago";
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-art-dark/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
      id="entry-detail-modal"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-art-bg rounded-sm w-full max-w-4xl border border-art-border shadow-2xl relative overflow-hidden flex flex-col my-8 max-h-[90vh]"
      >
        {/* Top bar with close button */}
        <div className="flex justify-between items-center px-6 py-4 bg-art-sidebar border-b border-art-border sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-art-accent" />
            <span className="font-serif text-sm text-art-dark/80 font-semibold italic">
              Archived on {formatDate(entry.createdAt)}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-sm text-art-accent hover:text-art-accent hover:bg-art-bg transition-all cursor-pointer"
            id="close-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
          {/* Main Title */}
          <div className="border-b border-art-border pb-6">
            <h2 className="font-serif text-3xl sm:text-4xl text-art-dark font-normal italic mb-1">
              {entry.has_recipe && entry.recipe ? entry.recipe.title : "Family Record"}
            </h2>
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-art-dark/50">
              Heritage Archive Box
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left side: Extracted content elements */}
            <div className="lg:col-span-7 space-y-8">
              {/* Story/Memoir section if exists */}
              {entry.has_story && entry.story && (
                <div className="bg-white rounded-sm p-6 border border-art-border art-shadow relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-art-accent/10">
                    <Heart className="w-12 h-12 fill-current" />
                  </div>
                  <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-art-accent mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    The Memory
                  </h3>
                  <p className="font-serif text-art-dark leading-relaxed text-base italic">
                    &ldquo;{entry.story}&rdquo;
                  </p>
                </div>
              )}

              {/* Wisdom section if exists */}
              {entry.has_wisdom && entry.wisdom && (
                <div className="bg-white rounded-sm p-6 border-l-4 border-art-wisdom border-y border-r border-art-border art-shadow">
                  <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-art-wisdom mb-2 flex items-center gap-2">
                    <Quote className="w-4 h-4" />
                    Family Wisdom &amp; Values
                  </h3>
                  <p className="font-hand text-3xl text-art-dark leading-tight pt-1">
                    {entry.wisdom}
                  </p>
                </div>
              )}

              {/* Recipe section if exists */}
              {entry.has_recipe && entry.recipe && (
                <div className="bg-white rounded-sm p-6 border-t-4 border-art-accent border-x border-b border-art-border art-shadow">
                  <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-art-accent mb-4 flex items-center gap-2">
                    <Book className="w-4 h-4" />
                    The Extracted Recipe
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-serif text-xs font-semibold text-art-dark/60 uppercase tracking-wider mb-2">
                        Ingredients:
                      </h4>
                      <ul className="text-sm text-art-dark/90 space-y-1.5 list-disc pl-5 font-sans">
                        {entry.recipe.ingredients.map((ing, i) => (
                          <li key={i}>{ing}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-serif text-xs font-semibold text-art-dark/60 uppercase tracking-wider mb-2">
                        Instructions:
                      </h4>
                      <ol className="text-sm text-art-dark/90 space-y-2.5 list-decimal pl-5">
                        {entry.recipe.steps.map((step, i) => (
                          <li key={i} className="pl-1 leading-relaxed">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right side: Original Source Raw Text */}
            <div className="lg:col-span-5">
              <div className="bg-art-sidebar rounded-sm p-6 border border-art-border sticky top-20">
                <h3 className="font-serif text-xs font-bold text-art-accent uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-art-border pb-2">
                  <FileText className="w-4 h-4" />
                  Original Raw Submission
                </h3>
                <div className="max-h-[350px] overflow-y-auto pr-1">
                  <p className="font-serif text-sm text-art-dark/80 whitespace-pre-wrap leading-relaxed italic">
                    {entry.rawText}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-art-border text-[10px] text-art-dark/50 italic font-serif text-center uppercase tracking-wider">
                  &ldquo;A clean copy of our original words, preserved forever.&rdquo;
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-art-sidebar border-t border-art-border px-6 py-4 flex justify-end sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-art-accent hover:bg-art-accent/90 text-white font-serif text-xs uppercase tracking-wider rounded-sm shadow-sm transition-colors cursor-pointer"
          >
            Close Page
          </button>
        </div>
      </motion.div>
    </div>
  );
}
