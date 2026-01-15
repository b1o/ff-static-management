import { inject, Injectable } from '@angular/core';
import { apiCall } from '../../core/api/api.utils';
import { API } from '../../core/api/api';

@Injectable({
  providedIn: 'root',
})
export class CharactersService {
  private api = inject(API);

  async searchCharacters(characterName: string, world: string) {
    const response = await apiCall(() =>
      this.api.characters.search.get({ query: { name: characterName, world } })
    );
    if (response.success) {
      return response.data.results;
    }
    return [];
  }

  async getCharacter(id: string) {
    const response = await apiCall(() => this.api.characters({ id }).get());

    if (response.success) {
      return response.data.character;
    }

    return null;
  }
}
