import { ChangeDetectionStrategy, Component, signal, inject, resource, ElementRef } from '@angular/core';
import { form, Field, debounce, required, minLength } from '@angular/forms/signals';
import { ReactiveFormsModule } from '@angular/forms';
import type { CharacterSearchResult, CharacterProfile } from '@ff-static/api/types';
import {
  InputComponent,
  CardComponent,
  CardContentComponent,
  SpinnerComponent,
} from '../../ui/primitives';
import { EmptyStateComponent } from '../../ui/empty-state/empty-state.component';
import { CharactersService } from './characters.service';
import { CharacterResultsListComponent } from './character-results-list.component';
import { CharacterDetailComponent } from './character-detail.component';

interface CharacterSearchForm {
  characterName: string;
  world: string;
}

@Component({
  selector: 'nyct-character-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
  imports: [
    ReactiveFormsModule,
    Field,
    InputComponent,
    CardComponent,
    CardContentComponent,
    SpinnerComponent,
    EmptyStateComponent,
    CharacterResultsListComponent,
    CharacterDetailComponent,
  ],
  template: `
    <div class="max-w-2xl flex justify-center flex-col mx-auto">
      <!-- Search Form -->
      <div class="relative">
        <nyct-card>
          <nyct-card-content class="p-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <nyct-input
                label="Character Name"
                placeholder="Enter character name..."
                size="sm"
                [field]="searchForm.characterName"
                (focus)="openDropdown()"
              />
              <nyct-input
                label="World"
                placeholder="Enter world name..."
                size="sm"
                [field]="searchForm.world"
                (focus)="openDropdown()"
              />
            </div>
          </nyct-card-content>
        </nyct-card>

        <!-- Dropdown Results -->
        @if((searchResults.hasValue() || searchResults.isLoading()) && dropdownOpen()) {
        <div
          class="absolute left-0 right-0 z-10 mt-2"
          animate.enter="dropdown-enter"
          animate.leave="dropdown-leave"
        >
          <nyct-card class="bg-surface/95 backdrop-blur-sm overflow-hidden">
          <div class="content-stack">
          @if (searchResults.isLoading()) {
          <div class="stack-item flex items-center justify-center py-8" animate.enter="fade-in" animate.leave="fade-out">
            <nyct-spinner size="md" />
          </div>
          } @else if (selectedCharacterId()) {
          <!-- Character Detail -->
          @if (characterDetail.isLoading()) {
          <div class="stack-item flex items-center justify-center py-8" animate.enter="fade-in" animate.leave="fade-out">
            <nyct-spinner size="md" />
          </div>
          } @else if (characterDetail.value(); as profile) {
          <div class="stack-item" animate.enter="slide-in-right" animate.leave="slide-out-left">
            <nyct-character-detail [profile]="profile" [showBack]="true" (back)="clearSelection()" />
          </div>
          }
          } @else if (searchResults.value(); as results) {
          <!-- Search Results -->
          @if (results.length > 0) {
          <div class="stack-item" animate.enter="fade-in" animate.leave="fade-out">
            <nyct-card-content class="p-0">
              <nyct-character-results-list [results]="results" (selected)="selectCharacter($event)" />
            </nyct-card-content>
          </div>
          } @else {
          <div class="stack-item" animate.enter="fade-in" animate.leave="fade-out">
            <nyct-empty-state
              icon="search"
              title="No characters found"
              description="Try adjusting your search terms."
            />
          </div>
          }
          }
            </div>
          </nyct-card>
        </div>
        }
      </div>
    </div>
  `,
})
export class CharacterSearch {
  private charactersService = inject(CharactersService);
  private elementRef = inject(ElementRef);

  // Dropdown open state
  dropdownOpen = signal(true);

  // Selected character ID for detail view
  selectedCharacterId = signal<string | null>(null);

  // Search form
  searchModel = signal<CharacterSearchForm>({
    characterName: '',
    world: '',
  });

  searchForm = form(this.searchModel, (model) => {
    debounce(model.characterName, 300);
    debounce(model.world, 300);
    required(model.characterName, { message: 'Name is required' });
    required(model.world, { message: 'World is required' });
    minLength(model.characterName, 3, { message: 'Name must be at least 3 characters long' });
  });

  // Reactive resource for search - only fetches when valid
  searchResults = resource<CharacterSearchResult[] | undefined, CharacterSearchForm | undefined>({
    params: () => {
      const formState = this.searchForm();
      if (!formState.valid()) return undefined;
      return formState.value();
    },
    loader: ({ params }) => {
      if (!params) return Promise.resolve(undefined);
      return this.charactersService.searchCharacters(params.characterName, params.world);
    },
  });

  // Reactive resource for character detail
  characterDetail = resource<CharacterProfile | null, string | null>({
    params: () => this.selectedCharacterId(),
    loader: ({ params }) => {
      if (!params) return Promise.resolve(null);
      return this.charactersService.getCharacter(params);
    },
  });

  selectCharacter(lodestoneId: string): void {
    this.selectedCharacterId.set(lodestoneId);
  }

  clearSelection(): void {
    this.selectedCharacterId.set(null);
  }

  openDropdown(): void {
    this.dropdownOpen.set(true);
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownOpen.set(false);
    }
  }
}
