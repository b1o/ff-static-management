import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideHome,
  lucideFolder,
  lucideSettings,
  lucideMenu,
  lucideChevronRight,
  lucideChevronDown,
  lucideChevronLeft,
  lucideX,
  lucidePlus,
  lucideMinus,
  lucideCheck,
  lucideTrash2,
  lucidePencil,
  lucideSearch,
  lucideUser,
  lucideUsers,
  lucideLogOut,
  lucideUpload,
  lucideDownload,
  lucideCopy,
  lucideExternalLink,
  lucideInfo,
  lucideTriangleAlert,
  lucideCircleAlert,
  lucideCircleCheck,
  lucideMoon,
  lucideSun,
  lucideSparkles,
} from '@ng-icons/lucide';
import { cn } from '../../utils/utils';

export type IconName =
  | 'home'
  | 'folder'
  | 'cog'
  | 'menu'
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-left'
  | 'x'
  | 'plus'
  | 'minus'
  | 'check'
  | 'trash'
  | 'pencil'
  | 'search'
  | 'user'
  | 'users'
  | 'logout'
  | 'upload'
  | 'download'
  | 'copy'
  | 'external-link'
  | 'info'
  | 'warning'
  | 'error'
  | 'success'
  | 'discord'
  | 'moon'
  | 'sun'
  | 'sparkles';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizeStyles: Record<IconSize, string> = {
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
  xl: 'size-8',
};

// Map custom icon names to lucide icon names
const iconNameMap: Record<IconName, string> = {
  home: 'lucideHome',
  folder: 'lucideFolder',
  cog: 'lucideSettings',
  menu: 'lucideMenu',
  'chevron-right': 'lucideChevronRight',
  'chevron-down': 'lucideChevronDown',
  'chevron-left': 'lucideChevronLeft',
  x: 'lucideX',
  plus: 'lucidePlus',
  minus: 'lucideMinus',
  check: 'lucideCheck',
  trash: 'lucideTrash2',
  pencil: 'lucidePencil',
  search: 'lucideSearch',
  user: 'lucideUser',
  users: 'lucideUsers',
  logout: 'lucideLogOut',
  upload: 'lucideUpload',
  download: 'lucideDownload',
  copy: 'lucideCopy',
  'external-link': 'lucideExternalLink',
  info: 'lucideInfo',
  warning: 'lucideTriangleAlert',
  error: 'lucideCircleAlert',
  success: 'lucideCircleCheck',
  discord: 'discord', // Custom icon
  moon: 'lucideMoon',
  sun: 'lucideSun',
  sparkles: 'lucideSparkles',
};

// Custom Discord icon SVG (not available in lucide)
const discordSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`;

@Component({
  selector: 'nyct-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
  providers: [
    provideIcons({
      lucideHome,
      lucideFolder,
      lucideSettings,
      lucideMenu,
      lucideChevronRight,
      lucideChevronDown,
      lucideChevronLeft,
      lucideX,
      lucidePlus,
      lucideMinus,
      lucideCheck,
      lucideTrash2,
      lucidePencil,
      lucideSearch,
      lucideUser,
      lucideUsers,
      lucideLogOut,
      lucideUpload,
      lucideDownload,
      lucideCopy,
      lucideExternalLink,
      lucideInfo,
      lucideTriangleAlert,
      lucideCircleAlert,
      lucideCircleCheck,
      lucideMoon,
      lucideSun,
      lucideSparkles,
    }),
  ],
  template: `
    @if (isDiscord()) {
      <span [class]="classes()" [innerHTML]="discordIcon()" aria-hidden="true"></span>
    } @else {
      <ng-icon [name]="lucideIconName()" [class]="classes()" />
    }
  `,
})
export class IconComponent {
  private sanitizer: DomSanitizer;

  name = input.required<IconName>();
  size = input<IconSize>('md');
  class = input<string>('');

  constructor(sanitizer: DomSanitizer) {
    this.sanitizer = sanitizer;
  }

  isDiscord = computed(() => this.name() === 'discord');
  lucideIconName = computed(() => iconNameMap[this.name()]);
  classes = computed(() => cn(sizeStyles[this.size()], this.class()));

  discordIcon = computed((): SafeHtml => {
    return this.sanitizer.bypassSecurityTrustHtml(discordSvg);
  });
}
