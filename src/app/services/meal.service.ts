import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';

@Injectable()
export class MealService {
  private apiUrl = 'https://www.themealdb.com/api/json/v1/1';

  constructor(private http: HttpClient) { }

  searchMealsByName(name: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search.php?s=${name}`);
  }

  searchMealsByIngredient(ingredient: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/filter.php?i=${ingredient}`);
  }

  getMealById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/lookup.php?i=${id}`);
  }

  getRandomMeal(): Observable<any> {
    return this.http.get(`${this.apiUrl}/random.php`);
  }

  getRandomMeals(count: number): Observable<any[]> {
    const calls = Array.from({ length: count }, () => this.getRandomMeal());
    return forkJoin(calls).pipe(
      map(responses => responses.flatMap(res => res.meals || []))
    );
  }
}
