import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { X, Book, MessageSquare, Quote, Heart, Calendar, FileText, Edit, Trash2, Save, Undo } from "lucide-react";
import { HeritageEntry } from "../types";

interface EntryDetailProps {
  entry: HeritageEntry;
  onClose: () => void;
  onUpdate: (updatedEntry: HeritageEntry) => void;
  onDelete: (deletedId: string) => void;
}

export default function EntryDetail({ entry, onClose, onUpdate, onDelete }: EntryDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states initialized with entry data
  const [editedTitle, setEditedTitle] = useState(entry.recipe?.title || "");
  const [editedIngredients, setEditedIngredients] = useState(
    entry.recipe?.ingredients ? entry.recipe.ingredients.join("\n") : ""
  );
  const [editedSteps, setEditedSteps] = useState(
    entry.recipe?.steps ? entry.recipe.steps.join("\n") : ""
  );
  const [editedStory, setEditedStory] = useState(entry.story || "");
  const [editedWisdom, setEditedWisdom] = useState(entry.wisdom || "");

  // Reset form states if entry changes
  useEffect(() => {
    setEditedTitle(entry.recipe?.title || "");
    setEditedIngredients(entry.recipe?.ingredients ? entry.recipe.ingredients.join("\n") : "");
    setEditedSteps(entry.recipe?.steps ? entry.recipe.steps.join("\n") : "");
    setEditedStory(entry.story || "");
    setEditedWisdom(entry.wisdom || "");
    setIsEditing(false);
    setShowDeleteConfirm(false);
    setError(null);
  }, [entry]);

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

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      console.log(`Attempting to delete document with ID: ${entry.id} from Firestore`);
      const response = await fetch(`/api/entries/${entry.id}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        throw new Error("Failed to delete the entry.");
      }
      console.log(`Document with ID: ${entry.id} successfully deleted from Firestore`);
      onDelete(entry.id);
    } catch (err: any) {
      console.error("Failed to delete the entry from Firestore:", err);
      setError(err.message || "An error occurred while deleting.");
      setIsDeleting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const updatedData = {
      has_recipe: entry.has_recipe,
      recipe: entry.has_recipe ? {
        title: editedTitle,
        ingredients: editedIngredients.split("\n").map(i => i.trim()).filter(Boolean),
        steps: editedSteps.split("\n").map(s => s.trim()).filter(Boolean)
      } : null,
      has_story: entry.has_story,
      story: entry.has_story ? editedStory : null,
      has_wisdom: entry.has_wisdom,
      wisdom: entry.has_wisdom ? editedWisdom : null
    };

    try {
      const response = await fetch(`/api/entries/${entry.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        throw new Error("Failed to save changes.");
      }

      const updatedEntry = await response.json();
      onUpdate(updatedEntry);
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-[#5d4037]/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
      id="entry-detail-modal"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#fbf9f5] rounded-[12px] w-full max-w-4xl border border-art-border hn-soft-shadow relative overflow-hidden flex flex-col my-8 max-h-[90vh]"
      >
        {/* Top bar with close button */}
        <div className="flex justify-between items-center px-6 py-4 bg-art-sidebar border-b border-art-border sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-art-accent" />
            <span className="font-sans text-xs text-art-dark/80 font-bold uppercase tracking-wider">
              Archived on {formatDate(entry.createdAt)}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-art-accent hover:text-white hover:bg-art-accent transition-all cursor-pointer"
            id="close-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
          {/* Main Title */}
          <div className="border-b border-art-border pb-6">
            <h2 className="font-serif text-3xl sm:text-4xl text-art-dark font-normal italic mb-1.5">
              {isEditing ? "Edit Family Record" : (entry.has_recipe && entry.recipe ? entry.recipe.title : "Family Record")}
            </h2>
            <p className="font-sans text-xs uppercase tracking-[0.25em] text-art-accent font-bold">
              Heritage Archive Box
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left side: Extracted content elements OR Edit Form */}
            {isEditing ? (
              <form onSubmit={handleSave} className="lg:col-span-7 space-y-6" id="edit-entry-form">
                {error && (
                  <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-[8px] text-sm font-sans font-medium">
                    {error}
                  </div>
                )}

                {/* Edit Recipe Section */}
                {entry.has_recipe && (
                  <div className="bg-white rounded-[12px] p-6 border border-art-border/80 hn-card-shadow space-y-4">
                    <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-art-accent flex items-center gap-2 border-b border-art-border pb-2">
                      <Book className="w-4 h-4" />
                      Edit Recipe
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-art-dark/60 mb-1.5">
                          Recipe Title
                        </label>
                        <input
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-[4px] bg-[#fbf9f5] border border-art-border text-art-dark placeholder-art-dark/40 focus:outline-none focus:ring-1 focus:ring-art-accent focus:border-art-accent transition-all text-sm font-sans"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-art-dark/60 mb-1.5">
                          Ingredients (one per line)
                        </label>
                        <textarea
                          rows={5}
                          value={editedIngredients}
                          onChange={(e) => setEditedIngredients(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-[4px] bg-[#fbf9f5] border border-art-border text-art-dark placeholder-art-dark/40 focus:outline-none focus:ring-1 focus:ring-art-accent focus:border-art-accent transition-all text-sm font-sans leading-relaxed"
                          placeholder="e.g. 2 cups grandma's favorite flour&#10;1 pinch of love"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-art-dark/60 mb-1.5">
                          Instructions / Steps (one per line)
                        </label>
                        <textarea
                          rows={5}
                          value={editedSteps}
                          onChange={(e) => setEditedSteps(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-[4px] bg-[#fbf9f5] border border-art-border text-art-dark placeholder-art-dark/40 focus:outline-none focus:ring-1 focus:ring-art-accent focus:border-art-accent transition-all text-sm font-sans leading-relaxed"
                          placeholder="e.g. Preheat oven to 350 degrees&#10;Slowly fold in the sugar"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit Story Section */}
                {entry.has_story && (
                  <div className="bg-white rounded-[12px] p-6 border border-art-border/80 hn-card-shadow space-y-4">
                    <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-art-accent flex items-center gap-2 border-b border-art-border pb-2">
                      <MessageSquare className="w-4 h-4" />
                      Edit Memory
                    </h3>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-art-dark/60 mb-1.5">
                        Family Story / Memoir Text
                      </label>
                      <textarea
                        rows={6}
                        value={editedStory}
                        onChange={(e) => setEditedStory(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-[4px] bg-[#fbf9f5] border border-art-border text-art-dark placeholder-art-dark/40 focus:outline-none focus:ring-1 focus:ring-art-accent focus:border-art-accent transition-all text-sm font-sans leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* Edit Wisdom Section */}
                {entry.has_wisdom && (
                  <div className="bg-white rounded-[12px] p-6 border border-art-border/80 hn-card-shadow space-y-4">
                    <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-art-accent flex items-center gap-2 border-b border-art-border pb-2">
                      <Quote className="w-4 h-4" />
                      Edit Family Wisdom
                    </h3>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-art-dark/60 mb-1.5">
                        Wisdom &amp; Life Lessons
                      </label>
                      <textarea
                        rows={4}
                        value={editedWisdom}
                        onChange={(e) => setEditedWisdom(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-[4px] bg-[#fbf9f5] border border-art-border text-art-dark placeholder-art-dark/40 focus:outline-none focus:ring-1 focus:ring-art-accent focus:border-art-accent transition-all text-sm font-sans leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* Inline form actions */}
                <div className="flex items-center gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-art-border text-art-dark hover:bg-art-sidebar font-sans text-xs uppercase tracking-wider font-bold rounded-[4px] shadow-2xs transition-colors cursor-pointer"
                  >
                    <Undo className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-art-accent hover:bg-[#833f1f] text-[#fbf9f5] font-sans text-xs uppercase tracking-wider font-bold rounded-[4px] shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" /> {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="lg:col-span-7 space-y-8">
                {error && (
                  <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-[8px] text-sm font-sans font-medium" id="detail-delete-error">
                    {error}
                  </div>
                )}
                {/* Story/Memoir section if exists */}
                {entry.has_story && entry.story && (
                  <div className="bg-white rounded-[12px] p-6 border border-art-border/80 hn-card-shadow relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-art-accent/10">
                      <Heart className="w-12 h-12 fill-current" />
                    </div>
                    <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-art-accent mb-3 flex items-center gap-2">
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
                  <div className="bg-white rounded-[12px] p-6 border-l-4 border-art-accent border-y border-r border-art-border hn-card-shadow relative overflow-hidden">
                    <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-art-dark/70 mb-3 flex items-center gap-2">
                      <Quote className="w-4 h-4 text-art-accent" />
                      Family Wisdom &amp; Values
                    </h3>
                    <p className="font-serif italic text-2xl sm:text-3xl text-art-dark leading-relaxed pt-1">
                      &ldquo;{entry.wisdom}&rdquo;
                    </p>
                  </div>
                )}

                {/* Recipe section if exists */}
                {entry.has_recipe && entry.recipe && (
                  <div className="bg-white rounded-[12px] p-6 border-t-4 border-art-accent border-x border-b border-art-border hn-card-shadow">
                    <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-art-accent mb-4 flex items-center gap-2">
                      <Book className="w-4 h-4" />
                      The Extracted Recipe
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-sans text-[11px] font-bold text-art-dark/60 uppercase tracking-wider mb-2">
                          Ingredients:
                        </h4>
                        <ul className="text-sm text-art-dark/90 space-y-1.5 list-disc pl-5 font-sans leading-relaxed">
                          {entry.recipe.ingredients.map((ing, i) => (
                            <li key={i}>{ing}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-sans text-[11px] font-bold text-art-dark/60 uppercase tracking-wider mb-2">
                          Instructions:
                        </h4>
                        <ol className="text-sm text-art-dark/90 space-y-2.5 list-decimal pl-5 font-sans leading-relaxed">
                          {entry.recipe.steps.map((step, i) => (
                            <li key={i} className="pl-1">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Right side: Original Source Raw Text (helpful split-screen reference!) */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-[4px] p-6 border border-art-border sticky top-24 hn-card-shadow scrapbook-tape">
                <h3 className="font-sans text-xs font-bold text-art-accent uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-art-border pb-2">
                  <FileText className="w-4 h-4" />
                  Original Raw Submission
                </h3>
                <div className="max-h-[350px] overflow-y-auto pr-1">
                  <p className="font-sans text-sm text-art-dark/85 whitespace-pre-wrap leading-relaxed italic">
                    {entry.rawText}
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-art-border text-[10px] text-art-dark/50 italic font-serif text-center uppercase tracking-widest font-semibold">
                  &ldquo;Preserved Forever in the Family Registry&rdquo;
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Edit and Delete functionality */}
        <div className="bg-art-sidebar border-t border-art-border px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 sticky bottom-0 z-10">
          <div className="flex flex-wrap items-center gap-3">
            {!isEditing ? (
              showDeleteConfirm ? (
                <div className="flex flex-wrap items-center gap-2 bg-red-50 border border-red-200 px-3.5 py-2 rounded-[6px]" id="delete-confirmation-group">
                  <span className="text-xs text-red-800 font-sans font-bold">
                    Are you sure you want to delete this precious record?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-[#fbf9f5] font-sans text-[11px] uppercase tracking-wider font-bold rounded-[4px] transition-colors cursor-pointer disabled:opacity-50 animate-pulse"
                      id="confirm-delete-btn"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> {isDeleting ? "Deleting..." : "Yes, Delete"}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-art-border text-art-dark hover:bg-art-sidebar font-sans text-[11px] uppercase tracking-wider font-bold rounded-[4px] transition-colors cursor-pointer"
                      id="cancel-delete-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-art-border hover:bg-art-accent hover:text-white hover:border-art-accent text-art-dark font-sans text-xs uppercase tracking-widest font-bold rounded-[4px] shadow-xs transition-colors cursor-pointer"
                    id="detail-edit-btn"
                  >
                    <Edit className="w-4 h-4" /> Edit Record
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 text-red-600 font-sans text-xs uppercase tracking-widest font-bold rounded-[4px] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    id="detail-delete-btn"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Record
                  </button>
                </>
              )
            ) : (
              <span className="text-xs text-art-dark/60 font-sans italic">
                Editing this precious family heritage box...
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-3 bg-art-accent hover:bg-[#833f1f] text-[#fbf9f5] font-sans text-xs uppercase tracking-widest font-bold rounded-[4px] shadow-sm transition-colors cursor-pointer w-full sm:w-auto text-center disabled:opacity-50"
          >
            Close Page
          </button>
        </div>
      </motion.div>
    </div>
  );
}
