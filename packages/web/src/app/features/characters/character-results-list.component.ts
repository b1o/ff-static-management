import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { CharacterSearchResult } from '@ff-static/api/types';
import {
  IconComponent,
  ListComponent,
  ListItemComponent,
  ListItemLeadingComponent,
  ListItemContentComponent,
  ListItemTitleComponent,
  ListItemDescComponent,
  ListItemTrailingComponent,
} from '../../ui/primitives';

@Component({
  selector: 'nyct-character-results-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IconComponent,
    ListComponent,
    ListItemComponent,
    ListItemLeadingComponent,
    ListItemContentComponent,
    ListItemTitleComponent,
    ListItemDescComponent,
    ListItemTrailingComponent,
  ],
  template: `
    <nyct-list size="sm" class="max-h-50 overflow-auto px-2">
      @for (character of results(); track character.lodestoneId) {
        <nyct-list-item
          variant="interactive"
          size="sm"
          (click)="selected.emit(character.lodestoneId)"
        >
          <nyct-list-item-leading size="sm" class="w-8 h-8!">
            @if (character.avatar) {
              <img
                [src]="character.avatar"
                [alt]="character.name"
                class="w-8 h-8 rounded object-cover"
              />
            } @else {
              <div class="w-8 h-8 rounded bg-surface-elevated flex items-center justify-center">
                <nyct-icon name="user" size="xs" />
              </div>
            }
          </nyct-list-item-leading>
          <nyct-list-item-content class="grow">
            <nyct-list-item-title size="sm">{{ character.name }}</nyct-list-item-title>
            <nyct-list-item-desc size="sm">{{ character.world }} · {{ character.dc }}</nyct-list-item-desc>
          </nyct-list-item-content>
          <nyct-list-item-trailing class="justify-self-end">
            <nyct-icon name="chevron-right" size="xs" />
          </nyct-list-item-trailing>
        </nyct-list-item>
      }
    </nyct-list>
  `,
})
export class CharacterResultsListComponent {
  results = input.required<CharacterSearchResult[]>();
  selected = output<string>();
}
