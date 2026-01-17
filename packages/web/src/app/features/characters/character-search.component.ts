import {
  ChangeDetectionStrategy,
  Component,
  signal,
  inject,
  resource,
  computed,
  effect,
} from '@angular/core';
import type { CharacterSearchResult, CharacterProfile } from '@ff-static/api/types';
import { HlmInputImports } from '@spartan/input';
import { HlmLabelImports } from '@spartan/label';
import { HlmCardImports } from '@spartan/card';
import { CharactersService } from './characters.service';
import { HlmAutocompleteImports } from '@spartan/autocomplete';
import { HlmSpinnerImports } from '@spartan/spinner';
import { HlmAvatarImports } from '@spartan/avatar';
import { debouncedSignal } from '@spartan-ng/brain/core';
import { HlmDialogImports } from '@spartan/dialog';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { JsonPipe, NgOptimizedImage } from '@angular/common';
import { HlmButtonImports } from '@spartan/button';

interface CharacterSearchForm {
  characterName: string;
  world: string;
}

const ALL_WORLDS = [
  // Aether
  'Adamantoise',
  'Cactuar',
  'Faerie',
  'Gilgamesh',
  'Jenova',
  'Midgardsormr',
  'Sargatanas',
  'Siren',
  // Crystal
  'Balmung',
  'Brynhildr',
  'Coeurl',
  'Diabolos',
  'Goblin',
  'Malboro',
  'Mateus',
  'Zalera',
  // Primal
  'Behemoth',
  'Excalibur',
  'Exodus',
  'Famfrit',
  'Hyperion',
  'Lamia',
  'Leviathan',
  'Ultros',
  // Dynamis
  'Halicarnassus',
  'Maduin',
  'Marilith',
  'Seraph',
  // Elemental (JP)
  'Aegis',
  'Atomos',
  'Carbuncle',
  'Garuda',
  'Gungnir',
  'Kujata',
  'Tonberry',
  'Typhon',
  // Gaia (JP)
  'Alexander',
  'Bahamut',
  'Durandal',
  'Fenrir',
  'Ifrit',
  'Ridill',
  'Tiamat',
  'Ultima',
  // Mana (JP)
  'Anima',
  'Asura',
  'Chocobo',
  'Hades',
  'Ixion',
  'Masamune',
  'Pandaemonium',
  'Titan',
  // Chaos (EU)
  'Cerberus',
  'Louisoix',
  'Moogle',
  'Omega',
  'Phantom',
  'Ragnarok',
  'Sagittarius',
  'Spriggan',
  // Light (EU)
  'Alpha',
  'Lich',
  'Odin',
  'Phoenix',
  'Raiden',
  'Shiva',
  'Twintania',
  'Zodiark',
  // Materia (OC)
  'Bismarck',
  'Ravana',
  'Sephirot',
  'Sophia',
  'Zurvan',
];

@Component({
  selector: 'nyct-character-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HlmInputImports,
    HlmLabelImports,
    HlmCardImports,
    HlmAutocompleteImports,
    HlmAvatarImports,
    HlmSpinnerImports,
    HlmDialogImports,
    HlmButtonImports,
  ],
  host: {
    class: 'flex flex-col gap-4',
  },
  template: `
    @if (isInDialog()) {
      <hlm-dialog-header>
        <h3 hlmDialogTitle>Import Character</h3>
      </hlm-dialog-header>
    }

    <form class="flex flex-row gap-2">
      <hlm-autocomplete
        [filteredOptions]="characterSearchResults.value()"
        [(search)]="characterQuery"
        [(value)]="selectedCharacter"
        [loading]="characterSearchResults.isLoading()"
        [transformOptionToString]="characterToString"
        [optionTemplate]="characterOption"
        searchPlaceholderText="Search character name..."
        [displayWith]="characterDisplay"
        [showToggleButton]="characterSearchResults.value().length > 0"
        emptyText="No characters found matching your search."
      >
        <hlm-spinner loading class="size-6" />
      </hlm-autocomplete>

      <hlm-autocomplete
        [(search)]="worldQuery"
        [(value)]="selectedWorld"
        [filteredOptions]="filteredWorlds()"
      >
        <hlm-spinner loading class="size-6" />
      </hlm-autocomplete>
    </form>

    @let selected = characterDetail.value();

    @if (selected) {
      <div class="selected-character-details grid grid-cols-2 gap-4">
        @if (selected.portrait) {
          <div class="character-portrait relative">
            <img [src]="selected.portrait" width="auto" height="auto" class="rounded-md" />
          </div>
        }

        <div class="details flex flex-col gap-2">
          <div>
            <div class="name font-medium text-lg">{{ selected.name }}</div>
            @if (selected.title) {
              <div class="title m-0 text-sm text-muted-foreground">
                {{ selected.title }}
              </div>
            }
          </div>
          <div class="world">
            <span class="text-muted-foreground">World:</span> {{ selected.world }}
          </div>

          <div class="data-center ">
            <span class="text-muted-foreground">Data Center:</span> {{ selected.dc }}
          </div>
          @if (selected.freeCompany) {
            <div class="free-company">
              <span class="text-muted-foreground">Free Company:</span> {{ selected.freeCompany }}
            </div>
          }
          @if (selected.race) {
            <div class="race">
              <span class="text-muted-foreground">Race:</span> {{ selected.race }}
            </div>
          }
        </div>
      </div>
    }

    <hlm-dialog-footer>
      <button hlmBtn variant="destructive" (click)="closeDialog()">Cancel</button>
      <button
        hlmBtn
        variant="outline"
        [disabled]="!selectedCharacter()"
        (click)="characterSelected()"
      >
        Import
      </button>
    </hlm-dialog-footer>

    <ng-template #characterOption let-option>
      <div class="flex flex-row items-center gap-2">
        <hlm-avatar>
          <img [src]="option.avatar" alt="{{ option.name }}" hlmAvatarImage />
        </hlm-avatar>
        <div class="char-info">
          <div class="font-medium">{{ option.name }}</div>
          <div class="location text-sm text-muted-foreground">
            {{ option.world }} - <span class="text-small">{{ option.dc }}</span>
          </div>
        </div>
      </div>
    </ng-template>
  `,
})
export class CharacterSearch {
  private charactersService = inject(CharactersService);
  private readonly dialogRef = inject<BrnDialogRef<CharacterSearchResult>>(BrnDialogRef);
  private readonly dialogContext = injectBrnDialogContext<{}>();

  protected isInDialog = computed(() => this.dialogRef !== null);

  protected characterName = signal<string>('');
  protected worldQuery = signal<string>('');
  protected selectedWorld = signal<string | null>(null);
  protected filteredWorlds = computed(() => {
    const query = this.worldQuery().toLowerCase();
    return ALL_WORLDS.filter((world) => world.toLowerCase().includes(query));
  });

  protected characterQuery = signal<string>('');
  protected debouncedCharacterName = debouncedSignal(this.characterQuery, 500);
  protected selectedCharacter = signal<CharacterSearchResult | undefined>(undefined);
  protected characterSearchResults = resource<CharacterSearchResult[], CharacterSearchForm>({
    defaultValue: [],
    debugName: 'CharacterSearchResults',
    params: () => ({
      characterName: this.debouncedCharacterName() || '',
      world: this.selectedWorld() || '',
    }),
    loader: async ({ params }) => {
      if (params.characterName.trim().length === 0) {
        return [];
      }
      // Skip search if the query matches the currently selected character's display
      const selected = this.selectedCharacter();
      if (selected && this.characterDisplay(selected) === params.characterName) {
        return [];
      }
      return await this.charactersService.searchCharacters(params.characterName, params.world);
    },
  });

  protected characterDetail = resource<CharacterProfile | undefined | null, string>({
    params: () => {
      const selectedCharacter = this.selectedCharacter();
      if (!selectedCharacter) {
        return '';
      }
      return selectedCharacter.lodestoneId;
    },
    loader: async ({ params }) => {
      if (params.length === 0) {
        return undefined;
      }
      return await this.charactersService.getCharacter(params);
    },
  });

  private test = effect(() => {
    const detail = this.characterDetail.value();
    console.log('Character Detail changed:', detail);
  });

  protected selectionEffect = effect(() => {
    const character = this.selectedCharacter();
    console.log('Selected character changed:', character);
  });

  protected characterToString = (opt: CharacterSearchResult) =>
    `${opt.name} (${opt.world} - ${opt.dc})`;
  protected characterDisplay = (opt: CharacterSearchResult) => this.characterToString(opt);
  protected characterToValue = (opt: CharacterSearchResult) => opt.lodestoneId;

  constructor() {}

  closeDialog() {
    this.dialogRef.close();
  }

  characterSelected() {
    this.dialogRef.close(this.selectedCharacter());
  }
}
