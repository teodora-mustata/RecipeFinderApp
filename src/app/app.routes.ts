import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { RecipeDetailComponent } from './recipe-detail/recipe-detail';
import { ShoppingListComponent } from './shopping-list/shopping-list';
import { FavoritesComponent } from './favorites/favorites';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'recipe/:id', component: RecipeDetailComponent },
  { path: 'shopping-list', component: ShoppingListComponent },
  { path: 'favorites', component: FavoritesComponent }
];
