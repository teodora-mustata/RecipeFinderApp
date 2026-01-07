import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompletedRecipesService } from '../services/completed-recipes.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-completed-recipes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './completed-recipes.html',
  styleUrls: ['./completed-recipes.css']
})
export class CompletedRecipesComponent {

  private readonly completedRecipesService = inject(CompletedRecipesService);

  completed = signal(this.completedRecipesService.getAll());
  noteInput: Record<string, string> = {};

  remove(id: string) {
    this.completedRecipesService.remove(id);
    this.completed.set(this.completedRecipesService.getAll());
  }

  addNote(id: string) {
    const note = this.noteInput[id]?.trim();
    if (!note) return;

    this.completedRecipesService.addNote(id, note);
    this.completed.set(this.completedRecipesService.getAll());
    this.noteInput[id] = '';
  }
}
