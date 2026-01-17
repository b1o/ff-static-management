import { Component, inject } from '@angular/core';
import { CharacterSearch } from '../../features/characters/character-search.component';
import { HlmButtonImports } from '@spartan/button';
import { HlmDialogImports, HlmDialogService } from '@spartan/dialog';

@Component({
  selector: 'nyct-characters-page',
  template: `
    <div class="p-6 max-w-4xl flex justify-center flex-col mx-auto space-y-6">
      <button hlmBtn (click)="openCharacterImportDialog()">Import Character</button>
    </div>
  `,
  imports: [HlmButtonImports, HlmDialogImports],
  styles: [],
})
export class CharactersPage {
  private readonly dialogService = inject(HlmDialogService);

  openCharacterImportDialog() {
    console.log('Opening Character Import Dialog');
    const dialogRef = this.dialogService.open(CharacterSearch, {
      contentClass: `sm:!max-w=[750px] min-w-[600px]`,
    });

    dialogRef.closed$.subscribe((data) => {
      console.log('Character Import Dialog closed with data:', data);
    });
  }
}
