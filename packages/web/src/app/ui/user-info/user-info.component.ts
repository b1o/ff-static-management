import { Component, input } from '@angular/core';

export interface UserInfoComponentProps {
  collapsed: boolean;
  info?: {
    name: string;
    subtitle?: string;
    avatarUrl?: string;
  };
}

@Component({
  selector: 'nyct-user-info',
  template: `
    <div class="flex items-center gap-3">
      <!-- Avatar -->
      <div
        class="shrink-0 w-10 h-10 rounded-full bg-primary-600
               flex items-center justify-center text-text-primary font-medium"
      >
        @if (info()?.avatarUrl) {
        <img
          [src]="info()?.avatarUrl"
          alt="User Avatar"
          class="w-10 h-10 rounded-full object-cover"
        />
        } @else {

        <span class="text-lg">
          {{ info()?.name?.charAt(0)?.toUpperCase() }}
        </span>
        }
      </div>

      @if (!collapsed()) {
      <div class="overflow-hidden">
        <p class="text-sm font-medium text-text-primary truncate">{{ info()?.name }}</p>
        <p class="text-xs text-text-muted truncate">{{ info()?.subtitle }}</p>
      </div>
      }
    </div>
  `,
})
export class UserInfoComponent {
  collapsed = input(false);
  info = input<UserInfoComponentProps['info']>();
}
