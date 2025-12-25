import { Component, OnInit, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ShoppingListService, AggregatedItem } from '../services/shopping-list.service';
import { ShoppingEntry } from '../services/shopping-list.service';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shopping-list.html',
  styleUrls: ['./shopping-list.css']
})
export class ShoppingListComponent implements OnInit {
  entries!: Signal<ShoppingEntry[]>;
  aggregated!: Signal<AggregatedItem[]>;

  constructor(private shoppingListService: ShoppingListService) {}

  ngOnInit() {
    this.entries = this.shoppingListService.entries;
    this.aggregated = this.shoppingListService.aggregated;
  }

  removeEntry(id: string) {
    this.shoppingListService.removeEntry(id);
  }

  clearAll() {
    this.shoppingListService.clearAll();
  }

  copyFinalList() {
    const text = this.buildFinalText();
    if (!text) return;

    navigator.clipboard?.writeText(text);
  }

  downloadFinalList() {
    const text = this.buildFinalText();
    if (!text) return;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shopping-list-final.txt';
    link.click();
    URL.revokeObjectURL(url);
  }

  trackByEntry(index: number, entry: ShoppingEntry) {
    return entry.id;
  }

  trackByItem(index: number, item: AggregatedItem) {
    return item.ingredient + item.measure;
  }

  private buildFinalText(): string {
    const list = this.aggregated();
    if (!list.length) return '';

    return list
      .map((i: AggregatedItem) =>
        `- ${i.ingredient}${i.measure ? ' – ' + i.measure : ''}`
      )
      .join('\n');
  }
}
