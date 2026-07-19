import { motion } from "motion/react";
import { BookOpen } from "lucide-react";

interface HeaderProps {
  onHomeClick?: () => void;
}

export default function Header({ onHomeClick }: HeaderProps) {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center pt-12 pb-4 px-4 bg-transparent"
      id="heirloom-header"
    >
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        <div 
          onClick={onHomeClick}
          className="w-14 h-14 rounded-full bg-art-accent flex items-center justify-center text-white mb-4 shadow-md border border-art-border rotate-3 hover:rotate-0 transition-transform duration-300 cursor-pointer"
        >
          <BookOpen className="w-6 h-6 text-[#fbf9f5]" />
        </div>
        <h1 
          onClick={onHomeClick}
          className="font-serif text-5xl sm:text-6xl text-art-dark tracking-tight mb-2 select-none font-normal cursor-pointer hover:text-art-accent transition-colors"
        >
          Heirloom
        </h1>
        <p className="text-xs uppercase tracking-[0.25em] text-art-accent font-sans font-bold mb-4">
          Family Archive &amp; Living Legacy
        </p>
        <p className="font-hand text-2xl text-art-accent/90 mb-3 max-w-lg leading-snug">
          The living archive of our family&apos;s recipes, stories, &amp; wisdom
        </p>
        <p className="text-sm text-art-dark/85 font-sans max-w-md leading-relaxed">
          Paste any messy, rambling text — a voice transcript, an old email, or casual notes. 
          Our AI assistant will gently extract the recipes, memories, and quiet advice.
        </p>
        {/* Hand-drawn decorative divider */}
        <div className="hn-divider" />
      </div>
    </motion.header>
  );
}
