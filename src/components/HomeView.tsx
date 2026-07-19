import { motion } from "motion/react";
import { PlusCircle, BookOpen, MessageSquare, Quote, Heart, ChevronRight } from "lucide-react";

interface HomeViewProps {
  onNavigate: (tab: "submit" | "recipes" | "stories" | "wisdom") => void;
  recipeCount: number;
  storyCount: number;
  wisdomCount: number;
}

export default function HomeView({
  onNavigate,
  recipeCount,
  storyCount,
  wisdomCount,
}: HomeViewProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="home-view-container">
      {/* Intro Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto mb-16"
      >
        <div className="w-16 h-16 rounded-full bg-art-accent flex items-center justify-center text-white mb-6 shadow-md border border-art-border rotate-3 mx-auto">
          <Heart className="w-8 h-8 text-[#fbf9f5] fill-current" />
        </div>
        
        <h2 className="font-serif text-4xl sm:text-5xl text-art-dark tracking-tight mb-4 select-none font-normal leading-tight">
          Preserving the heartbeat of our family, <span className="italic text-art-accent">one story at a time</span>
        </h2>
        
        <p className="text-base sm:text-lg text-art-dark/85 font-sans max-w-xl mx-auto leading-relaxed mb-8">
          Welcome to our digital heritage chest — a warm, nostalgic space for preserving family recipes, cherished memories, and timeless wisdom for generations to come.
        </p>

        {/* Primary Call to Action */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate("submit")}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-[4px] bg-art-accent hover:bg-[#833f1f] text-[#fbf9f5] font-sans text-sm uppercase tracking-widest font-bold cursor-pointer hn-soft-shadow transition-colors"
          id="cta-add-memory"
        >
          <PlusCircle className="w-5 h-5" />
          Add a Memory
        </motion.button>
      </motion.div>

      {/* Decorative divider */}
      <div className="hn-divider my-12" />

      {/* Archive Books Section */}
      <div className="mt-12">
        <h3 className="font-sans text-xs font-bold text-art-dark/60 uppercase tracking-[0.25em] text-center mb-8">
          Explore the Family Journals
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recipe Book */}
          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => onNavigate("recipes")}
            className="bg-white p-6 rounded-[12px] border border-art-border/85 hn-card-shadow hover:border-art-accent/40 cursor-pointer transition-all flex flex-col justify-between group scrapbook-offset-left min-h-[220px]"
            id="home-book-recipes"
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-art-sidebar border border-art-border flex items-center justify-center mb-4 text-art-accent">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-xl text-art-dark mb-2 font-normal group-hover:text-art-accent transition-colors">
                Recipe Book
              </h4>
              <p className="text-sm text-art-dark/80 font-sans leading-relaxed">
                Taste the history. Handed-down recipes, secret ingredients, and culinary traditions.
              </p>
            </div>
            <div className="flex justify-between items-center border-t border-art-border/40 pt-4 mt-4 text-xs font-sans font-bold text-art-dark/60">
              <span className="px-2.5 py-1 rounded-full bg-art-sidebar border border-art-border text-[10px] uppercase">
                {recipeCount} {recipeCount === 1 ? "recipe" : "recipes"}
              </span>
              <span className="flex items-center gap-0.5 text-art-accent font-serif italic font-semibold group-hover:translate-x-1 transition-transform">
                Open <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </motion.div>

          {/* Story Book */}
          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => onNavigate("stories")}
            className="bg-white p-6 rounded-[12px] border border-art-border/85 hn-card-shadow hover:border-art-accent/40 cursor-pointer transition-all flex flex-col justify-between group scrapbook-offset-right min-h-[220px]"
            id="home-book-stories"
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-art-sidebar border border-art-border flex items-center justify-center mb-4 text-art-accent">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-xl text-art-dark mb-2 font-normal group-hover:text-art-accent transition-colors">
                Story Book
              </h4>
              <p className="text-sm text-art-dark/80 font-sans leading-relaxed">
                Hear the whispers of the past. Childhood memories, family anecdotes, and living memoirs.
              </p>
            </div>
            <div className="flex justify-between items-center border-t border-art-border/40 pt-4 mt-4 text-xs font-sans font-bold text-art-dark/60">
              <span className="px-2.5 py-1 rounded-full bg-art-sidebar border border-art-border text-[10px] uppercase">
                {storyCount} {storyCount === 1 ? "story" : "stories"}
              </span>
              <span className="flex items-center gap-0.5 text-art-accent font-serif italic font-semibold group-hover:translate-x-1 transition-transform">
                Open <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </motion.div>

          {/* Wisdom Book */}
          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => onNavigate("wisdom")}
            className="bg-white p-6 rounded-[12px] border border-art-border/85 hn-card-shadow hover:border-art-accent/40 cursor-pointer transition-all flex flex-col justify-between group scrapbook-offset-left min-h-[220px]"
            id="home-book-wisdom"
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-art-sidebar border border-art-border flex items-center justify-center mb-4 text-art-accent">
                <Quote className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-xl text-art-dark mb-2 font-normal group-hover:text-art-accent transition-colors">
                Wisdom Book
              </h4>
              <p className="text-sm text-art-dark/80 font-sans leading-relaxed">
                Quiet values and gentle advice. Life lessons, old proverbs, and enduring family philosophy.
              </p>
            </div>
            <div className="flex justify-between items-center border-t border-art-border/40 pt-4 mt-4 text-xs font-sans font-bold text-art-dark/60">
              <span className="px-2.5 py-1 rounded-full bg-art-sidebar border border-art-border text-[10px] uppercase">
                {wisdomCount} {wisdomCount === 1 ? "lesson" : "lessons"}
              </span>
              <span className="flex items-center gap-0.5 text-art-accent font-serif italic font-semibold group-hover:translate-x-1 transition-transform">
                Open <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Philosophy Section */}
      <div className="mt-20 bg-white p-8 rounded-[12px] border border-art-border/75 hn-soft-shadow relative overflow-hidden text-center max-w-3xl mx-auto scrapbook-tape">
        <h4 className="font-serif text-2xl text-art-dark mb-3 font-normal">
          How Heirloom Works
        </h4>
        <p className="text-sm text-art-dark/80 font-sans leading-relaxed max-w-xl mx-auto">
          Simply paste or dictate your casual thoughts — rambling voice transcripts, unedited messages, or raw cookbook notes. Our gentle AI assistant preserves every single detail without fabrication, neatly categorizing them into our living books.
        </p>
      </div>
    </div>
  );
}
