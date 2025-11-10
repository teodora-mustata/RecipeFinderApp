import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css'
})
export class SearchBarComponent {
  query = '';
  @Output() search = new EventEmitter<string>();

  onSearch() {
    if (this.query.trim()) {
      this.search.emit(this.query.trim());
    }
  }
}
