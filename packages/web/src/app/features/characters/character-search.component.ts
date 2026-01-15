import { ChangeDetectionStrategy, Component, signal, inject, resource } from '@angular/core';
import { form, Field, debounce, required, minLength } from '@angular/forms/signals';
import { ReactiveFormsModule } from '@angular/forms';
import type { CharacterSearchResult, CharacterProfile } from '@ff-static/api/types';
import {
  InputComponent,
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
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
    <div class="max-w-2xl space-y-4">
      <!-- Search Form -->
      <nyct-card>
        <nyct-card-content class="p-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <nyct-input
              label="Character Name"
              placeholder="Enter character name..."
              size="sm"
              [field]="searchForm.characterName"
            />
            <nyct-input
              label="World"
              placeholder="Enter world name..."
              size="sm"
              [field]="searchForm.world"
            />
          </div>
        </nyct-card-content>
      </nyct-card>

      <!-- Loading State -->
      <nyct-card class="mt-2">
        @if (searchResults.isLoading()) {
        <div class="flex items-center justify-center py-8">
          <nyct-spinner size="md" />
        </div>
        } @else if (selectedCharacterId()) {
        <!-- Character Detail -->
        @if (characterDetail.isLoading()) {
        <nyct-card-content class="flex items-center justify-center py-8">
          <nyct-spinner size="md" />
        </nyct-card-content>
        } @else if (characterDetail.value(); as profile) {
        <nyct-character-detail [profile]="profile" [showBack]="true" (back)="clearSelection()" />
        } } @else if (searchResults.value(); as results) {
        <!-- Search Results -->
        @if (results.length > 0) {
        <nyct-card-content class="p-0">
          <nyct-character-results-list [results]="results" (selected)="selectCharacter($event)" />
        </nyct-card-content>
        } @else {
        <nyct-empty-state
          icon="search"
          title="No characters found"
          description="Try adjusting your search terms."
        />
        } }
      </nyct-card>
    </div>
  `,
})
export class CharacterSearch {
  private charactersService = inject(CharactersService);

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
}
