import { Injectable, computed, signal } from '@angular/core';

export interface ShoppingItem {
  ingredient: string;
  measure: string;
}

export interface ShoppingEntry {
  id: string;
  recipe: string;
  addedAt: string; // ISO string
  items: ShoppingItem[];
}

export interface AggregatedItem {
  ingredient: string;
  measure: string;
}

@Injectable({ providedIn: 'root' })
export class ShoppingListService {
  private storageKey = 'shoppingListEntries';
  private entriesSignal = signal<ShoppingEntry[]>([]);
  entries = computed(() => this.entriesSignal());
  aggregated = computed(() => this.aggregateItems(this.entriesSignal()));

  constructor() {
    this.loadFromStorage();
  }

  addRecipe(recipe: string, items: ShoppingItem[]) {
    if (!recipe || !items?.length) return;
    const normalizedItems = items
      .map(i => this.normalizeItem(i))
      .filter((i): i is ShoppingItem => !!i);
    if (!normalizedItems.length) return;

    const entry: ShoppingEntry = {
      id: crypto.randomUUID(),
      recipe: recipe.trim(),
      addedAt: new Date().toISOString(),
      items: normalizedItems
    };

    this.entriesSignal.set([entry, ...this.entriesSignal()]);
    this.persist();
  }

  removeEntry(id: string) {
    this.entriesSignal.set(this.entriesSignal().filter(e => e.id !== id));
    this.persist();
  }

  clearAll() {
    this.entriesSignal.set([]);
    this.persist();
  }

  private normalizeItem(item: ShoppingItem | null): ShoppingItem | null {
    if (!item) return null;
    const ingredient = (item.ingredient || '').trim();
    const measure = (item.measure || '').trim();
    if (!ingredient) return null;
    return { ingredient, measure };
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ShoppingEntry[];
      const normalized = parsed
        .map(e => ({
          ...e,
          recipe: (e.recipe || '').trim(),
          addedAt: e.addedAt || new Date().toISOString(),
          items: (e.items || []).map(i => this.normalizeItem(i)).filter((i): i is ShoppingItem => !!i)
        }))
        .filter(e => e.recipe && e.items.length);
      this.entriesSignal.set(normalized);
    } catch {
      this.entriesSignal.set([]);
    }
  }

  private persist() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.entriesSignal()));
    } catch {
      /* ignore storage errors */
    }
  }

  private aggregateItems(entries: ShoppingEntry[]): AggregatedItem[] {
    const map = new Map<string, { ingredient: string; qty: number | null; unit: string; raw: string; count: number }>();

    for (const entry of entries) {
      for (const item of entry.items) {
        const ingredient = item.ingredient.trim();
        const parsed = this.parseMeasure(item.measure);
        const key = `${ingredient.toLowerCase()}|${parsed.unit}`;
        const current = map.get(key);

        if (parsed.qty !== null) {
          const qty = (current?.qty || 0) + parsed.qty;
          map.set(key, {
            ingredient,
            qty,
            unit: parsed.unit,
            raw: parsed.unit ? `${qty} ${parsed.unit}` : `${qty}`,
            count: 1
          });
        } else {
          const count = (current?.count || 0) + 1;
          map.set(key, {
            ingredient,
            qty: null,
            unit: parsed.unit,
            raw: parsed.unit || item.measure,
            count
          });
        }
      }
    }

    return Array.from(map.values()).map(entry => {
      if (entry.qty !== null) {
        const measure = entry.unit ? `${this.trimNumber(entry.qty)} ${entry.unit}` : this.trimNumber(entry.qty);
        return { ingredient: entry.ingredient, measure };
      }
      if (entry.count > 1 && entry.raw) {
        return { ingredient: entry.ingredient, measure: `${entry.raw} x${entry.count}` };
      }
      return { ingredient: entry.ingredient, measure: entry.raw || '' };
    });
  }

  private parseMeasure(measure: string): { qty: number | null; unit: string } {
    const value = (measure || '').trim();
    if (!value) return { qty: null, unit: '' };

    // Match numbers, decimals, fractions, optional unit text after a space
    const match = value.match(/^([\d.,\/]+)\s*(.*)$/);
    if (!match) return { qty: null, unit: value };

    const qtyNum = this.toNumber(match[1]);
    if (qtyNum === null) return { qty: null, unit: value };

    const unit = match[2]?.trim() || '';
    return { qty: qtyNum, unit };
  }

  private toNumber(input: string): number | null {
    const str = input.replace(',', '.').trim();
    if (!str) return null;
    // handle simple fractions like 1/2
    if (str.includes('/')) {
      const [a, b] = str.split('/').map(n => Number(n));
      if (!isNaN(a) && !isNaN(b) && b !== 0) return a / b;
    }
    const num = Number(str);
    return isNaN(num) ? null : num;
  }

  private trimNumber(value: number) {
    return Number.isInteger(value) ? value.toString() : value.toFixed(2).replace(/\.00$/, '');
  }
}
