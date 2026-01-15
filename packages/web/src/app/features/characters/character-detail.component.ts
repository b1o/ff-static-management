import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { CharacterProfile } from '@ff-static/api/types';
import {
  CardComponent,
  CardContentComponent,
  ButtonComponent,
  IconComponent,
} from '../../ui/primitives';

@Component({
  selector: 'nyct-character-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, CardContentComponent, ButtonComponent, IconComponent],
  template: `
    <nyct-card>
      <nyct-card-content>
        @if (showBack()) {
        <nyct-button variant="ghost" size="sm" class="mb-4 -ml-2" (click)="back.emit()">
          <nyct-icon name="chevron-left" size="sm" />
          Back to results
        </nyct-button>
        }
        <div class="min-w-0 flex flex-col justify-center p-1 pb-2.5">
          @if (profile().title) {
          <p class="text-xs text-text-muted leading-tight">{{ profile().title }}</p>
          }
          <h2 class="text-base font-semibold text-text-primary leading-tight">
            {{ profile().name }}
          </h2>
          <p class="text-sm text-text-secondary">{{ profile().world }} · {{ profile().dc }}</p>
        </div>

        <div class="flex gap-4">
          @if (profile().portrait) {
          <img
            [src]="profile().portrait"
            [alt]="profile().name + ' portrait'"
            class="w-28 rounded-lg object-cover grow"
          />
          } @else if (profile().avatar) {
          <img
            [src]="profile().avatar"
            [alt]="profile().name"
            class="w-14 h-14 rounded-lg object-cover grow"
          />
          }

          <dl class="grid grid-rows-6 grid-cols-2 gap-x-2 gap-y-1 text-sm">
            @if (profile().race || profile().clan) {
            <div>
              <dt class="text-text-muted text-xs">Race</dt>
              <dd class="text-text-primary">
                {{ profile().race }}{{ profile().clan ? ' · ' + profile().clan : '' }}
              </dd>
            </div>
            } @if (profile().gender) {
            <div>
              <dt class="text-text-muted text-xs">Gender</dt>
              <dd class="text-text-primary">{{ profile().gender }}</dd>
            </div>
            } @if (profile().nameday) {
            <div>
              <dt class="text-text-muted text-xs">Nameday</dt>
              <dd class="text-text-primary">{{ profile().nameday }}</dd>
            </div>
            } @if (profile().guardian) {
            <div>
              <dt class="text-text-muted text-xs">Guardian</dt>
              <dd class="text-text-primary">{{ profile().guardian }}</dd>
            </div>
            } @if (profile().cityState) {
            <div>
              <dt class="text-text-muted text-xs">City-state</dt>
              <dd class="text-text-primary">{{ profile().cityState }}</dd>
            </div>
            } @if (profile().grandCompany) {
            <div>
              <dt class="text-text-muted text-xs">Grand Company</dt>
              <dd class="text-text-primary">{{ profile().grandCompany }}</dd>
            </div>
            } @if (profile().freeCompany) {
            <div class="col-span-2">
              <dt class="text-text-muted text-xs">Free Company</dt>
              <dd class="text-text-primary">{{ profile().freeCompany }}</dd>
            </div>
            }
          </dl>
        </div>
      </nyct-card-content>
    </nyct-card>
  `,
})
export class CharacterDetailComponent {
  profile = input.required<CharacterProfile>();
  showBack = input<boolean>(true);
  back = output<void>();
}
