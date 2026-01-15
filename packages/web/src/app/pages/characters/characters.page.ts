import { Component } from '@angular/core';
import { CharacterSearch } from '../../features/characters/character-search.component';

@Component({
  selector: 'nyct-characters-page',
  template: `
    <div class="p-6 max-w-4xl flex justify-center flex-col mx-auto space-y-6">
      <nyct-character-search></nyct-character-search>
      <div class="text-center text-text-secondary">testing stuff</div>
    </div>
  `,
  imports: [CharacterSearch],
  styles: [],
})
export class CharactersPage {}
