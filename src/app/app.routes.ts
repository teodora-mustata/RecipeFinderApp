import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { RecipeDetailComponent } from './recipe-detail/recipe-detail';
import { ShoppingListComponent } from './shopping-list/shopping-list';
import { FavoritesComponent } from './favorites/favorites';
import { TimersComponent } from './timers/timers';
import { CompletedRecipesComponent } from './completed-recipes/completed-recipes';
import { SimilarRecipesComponent } from './similar-recipes/similar-recipes';
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'recipe/:id', component: RecipeDetailComponent },
  { path: 'shopping-list', component: ShoppingListComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'time-manager', component: TimersComponent },
  { path: 'similar-recipes', component: SimilarRecipesComponent },
  { path: 'completed-recipes', component: CompletedRecipesComponent }
];



