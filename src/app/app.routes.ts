import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { RecipeDetailComponent } from './recipe-detail/recipe-detail';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'recipe/:id', component: RecipeDetailComponent }
];
