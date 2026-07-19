export interface Recipe {
  title: string;
  ingredients: string[];
  steps: string[];
}

export interface HeritageEntry {
  id: string;
  rawText: string;
  has_recipe: boolean;
  recipe: Recipe | null;
  has_story: boolean;
  story: string | null;
  has_wisdom: boolean;
  wisdom: string | null;
  createdAt: string;
}
