import { Component } from '@angular/core';
import { CharacterSearch } from '../../features/characters/character-search.component';

@Component({
  selector: 'nyct-characters-page',
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <nyct-character-search></nyct-character-search>
    </div>
  `,
  imports: [CharacterSearch],
  styles: [],
})
export class CharactersPage {}
