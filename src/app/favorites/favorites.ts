import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../services/favorites.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css']
})
export class FavoritesComponent implements OnInit {
  // inject în loc de constructor DI
  private readonly favoritesService = inject(FavoritesService);

  // acum poți folosi favoritesService liniștit
  favorites = this.favoritesService.favorites;
  page = signal(1);
  pageSize = 9;

  totalPages = computed(() => {
    const list = this.favorites();
    return list.length ? Math.max(1, Math.ceil(list.length / this.pageSize)) : 1;
  });

  visibleFavorites = computed(() => {
    const list = this.favorites();
    const start = (this.page() - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  ngOnInit() {
    this.ensurePageInRange();
  }

  toggleFavorite(meal: any) {
    this.favoritesService.toggleFavorite(meal);
    this.ensurePageInRange();
  }

  isFavorite(id: string) {
    return this.favoritesService.isFavorite(id);
  }

  goToPage(page: number) {
    const total = this.totalPages();
    const nextPage = Math.min(Math.max(page, 1), total);
    this.page.set(nextPage);
  }

  nextPage() {
    this.goToPage(this.page() + 1);
  }

  prevPage() {
    this.goToPage(this.page() - 1);
  }

  private ensurePageInRange() {
    const total = this.totalPages();
    if (this.page() > total) {
      this.page.set(total);
    }
  }
}