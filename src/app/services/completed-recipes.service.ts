import { Injectable } from '@angular/core';
import { CompletedRecipe, CompletedRecipesStorage } from './completed-recipes.storage';

@Injectable({ providedIn: 'root' })
export class CompletedRecipesService {
  getAll(): CompletedRecipe[] {
    return CompletedRecipesStorage.getAll();
  }

  add(recipe: CompletedRecipe) {
    CompletedRecipesStorage.add(recipe);
  }

  remove(id: string) {
    CompletedRecipesStorage.remove(id);
  }

  addNote(id: string, note: string) {
    CompletedRecipesStorage.addNote(id, note);
  }
}
