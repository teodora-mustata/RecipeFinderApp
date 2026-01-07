export interface CompletedRecipe {
  id: string; 
  recipeId: string; 
  recipeName: string;
  image: string;
  completedAt: string; 
  stopwatchTime?: number; 
  notes: string[];
}

export class CompletedRecipesStorage {
  private static STORAGE_KEY = 'completedRecipes';

  static getAll(): CompletedRecipe[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  static add(recipe: CompletedRecipe) {
    const all = this.getAll();
    all.push(recipe);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
  }

  static remove(id: string) {
    const all = this.getAll().filter(r => r.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
  }

  static addNote(id: string, note: string) {
    const all = this.getAll();
    const idx = all.findIndex(r => r.id === id);
    if (idx !== -1) {
      all[idx].notes.push(note);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
    }
  }
}
