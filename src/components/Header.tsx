import { motion } from "motion/react";
import { BookOpen } from "lucide-react";

export default function Header() {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center py-10 px-4 border-b border-art-border bg-art-sidebar"
      id="heirloom-header"
    >
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-art-accent flex items-center justify-center text-white mb-4 shadow-sm border border-art-border">
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-5xl italic text-art-accent tracking-tight mb-1">
          Heirloom
        </h1>
        <p className="text-xs uppercase tracking-[0.2em] text-art-dark/60 font-sans font-semibold mb-4">
          Family Archive &amp; Living Legacy
        </p>
        <p className="font-hand text-2xl text-art-wisdom mb-3">
          the living archive of our family&apos;s recipes, stories, &amp; wisdom
        </p>
        <p className="text-xs text-art-dark/70 font-serif italic max-w-md leading-relaxed">
          Paste any messy, rambling text — a voice transcript, an old email, or casual notes. 
          Our AI assistant will gently extract the recipes, memories, and quiet advice.
        </p>
      </div>
    </motion.header>
  );
}
