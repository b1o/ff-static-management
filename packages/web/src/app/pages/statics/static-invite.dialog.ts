import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA, DialogContentComponent } from '../../ui/dialog';
import {
  ButtonComponent,
  IconComponent,
  InputComponent,
  BadgeComponent,
} from '../../ui/primitives';
import { StaticsService } from '../../features/statics/statics.service';
import { ToastService } from '../../core/services/toast.service';
import type { InviteCode } from '@ff-static/api/types';
import { API_URL } from '../../core/api/api';

/** Data passed to the dialog when opening */
export interface StaticInviteDialogData {
  staticId: string;
  staticName: string;
}

/** Configuration for creating a new invite */
interface InviteConfig {
  expiresAt: Date | null;
  maxUses: number | null;
}

/** Generated invite result */
interface GeneratedInvite {
  inviteCode: string;
  inviteLink: string;
}

type DialogView = 'list' | 'create' | 'result';

@Component({
  selector: 'nyct-static-invite-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    DialogContentComponent,
    ButtonComponent,
    IconComponent,
    InputComponent,
    BadgeComponent,
  ],
  template: `
    <nyct-dialog-content>
      @switch (view()) { @case ('list') {
      <!-- Existing Invites List -->
      <div class="flex items-start gap-4 mb-6">
        <div class="shrink-0 p-2 rounded-full bg-primary-500/10">
          <nyct-icon name="external-link" size="md" class="text-primary-400" />
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-lg font-semibold text-text-primary">Invite Links</h2>
          <p class="mt-1 text-sm text-text-secondary">
            Manage invite links for "{{ data.staticName }}"
          </p>
        </div>
      </div>

      @if (loading()) {
      <div class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
      } @else if (existingInvites().length === 0) {
      <div class="text-center py-8">
        <nyct-icon name="external-link" size="lg" class="text-text-muted mx-auto mb-3" />
        <p class="text-sm text-text-secondary">No invite links yet</p>
      </div>
      } @else {
      <ul class="space-y-2 max-h-64 overflow-y-auto mb-4">
        @for (invite of existingInvites(); track invite.id) {
        <li class="p-3 rounded-lg bg-surface border border-border">
          <div class="flex items-center justify-between gap-2">
            <code class="text-sm font-mono text-text-primary truncate">
              {{ invite.code }}
            </code>
            <div class="flex items-center gap-2 shrink-0">
              @if (isExpired(invite)) {
              <nyct-badge variant="error" size="sm">Expired</nyct-badge>
              } @else if (isMaxedOut(invite)) {
              <nyct-badge variant="warning" size="sm">Max used</nyct-badge>
              } @else {
              <nyct-badge variant="success" size="sm">Active</nyct-badge>
              }
              <nyct-button
                size="sm"
                variant="icon"
                (click)="deleteInvite(invite)"
                title="Delete invite"
              >
                <nyct-icon name="trash" size="sm" />
              </nyct-button>
              <nyct-button
                size="sm"
                variant="icon"
                title="Copy link"
                (click)="copyInviteLink(invite)"
              >
                <nyct-icon name="copy" size="sm" />
              </nyct-button>
            </div>
          </div>
          <div class="mt-2 flex items-center gap-4 text-xs text-text-muted">
            <span>Uses: {{ invite.uses }}{{ invite.maxUses ? '/' + invite.maxUses : '' }}</span>
            @if (invite.expiresAt) {
            <span>Expires: {{ formatDate(invite.expiresAt) }}</span>
            }
          </div>
        </li>
        }
      </ul>
      }

      <div class="flex justify-end gap-3 pt-4 border-t border-border">
        <nyct-button variant="secondary" size="sm" (click)="close()"> Close </nyct-button>
        <nyct-button variant="primary" size="sm" (click)="showCreateView()">
          <nyct-icon name="plus" size="sm" class="mr-1" />
          Create New
        </nyct-button>
      </div>
      } @case ('create') {
      <!-- Create New Invite Form -->
      <div class="flex items-start gap-4 mb-6">
        <div class="shrink-0 p-2 rounded-full bg-primary-500/10">
          <nyct-icon name="plus" size="md" class="text-primary-400" />
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-lg font-semibold text-text-primary">Create Invite Link</h2>
          <p class="mt-1 text-sm text-text-secondary">
            Configure optional settings for the new invite
          </p>
        </div>
      </div>

      <div class="space-y-4">
        <div>
          <label for="expires-at" class="block text-sm font-medium text-text-primary mb-2">
            Expiration Date
            <span class="text-text-muted font-normal">(optional)</span>
          </label>
          <input
            id="expires-at"
            type="datetime-local"
            [min]="minDateTime()"
            [(ngModel)]="expiresAtInput"
            class="w-full h-10 px-4 text-sm rounded-lg bg-surface-elevated border border-border text-text-primary placeholder:text-text-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-dark-500"
          />
        </div>

        <div>
          <label for="max-uses" class="block text-sm font-medium text-text-primary mb-2">
            Maximum Uses
            <span class="text-text-muted font-normal">(optional)</span>
          </label>
          <nyct-input
            id="max-uses"
            type="number"
            placeholder="Unlimited"
            [(value)]="maxUsesInput"
          />
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-6">
        <nyct-button variant="secondary" size="sm" (click)="showListView()"> Back </nyct-button>
        <nyct-button
          variant="primary"
          size="sm"
          [disabled]="generating()"
          (click)="generateInvite()"
        >
          @if (generating()) { Generating... } @else { Generate Link }
        </nyct-button>
      </div>
      } @case ('result') {
      <!-- Generated Invite Result -->
      <div class="flex items-start gap-4 mb-6">
        <div class="shrink-0 p-2 rounded-full bg-pastel-mint/10">
          <nyct-icon name="check" size="md" class="text-pastel-mint" />
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-lg font-semibold text-text-primary">Invite Link Created</h2>
          <p class="mt-1 text-sm text-text-secondary">
            Share this link to invite others to the static
          </p>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-text-primary mb-2"> Invite Link </label>
        <div class="flex gap-2">
          <input
            type="text"
            readonly
            [value]="generatedInvite()?.inviteLink"
            class="flex-1 h-10 px-4 text-sm rounded-lg bg-surface border border-border text-text-primary font-mono"
          />
          <nyct-button
            variant="secondary"
            size="sm"
            [title]="copied() ? 'Copied!' : 'Copy to clipboard'"
            (click)="copyGeneratedLink()"
          >
            <nyct-icon [name]="copied() ? 'check' : 'copy'" size="sm" />
          </nyct-button>
        </div>
      </div>

      @if (expiresAtInput() || maxUsesInput()) {
      <div class="mt-4 p-3 rounded-lg bg-surface text-sm text-text-secondary">
        @if (expiresAtInput()) {
        <p>Expires: {{ formatExpirationInput() }}</p>
        } @if (maxUsesInput()) {
        <p>Max uses: {{ maxUsesInput() }}</p>
        }
      </div>
      }

      <div class="flex justify-end gap-3 pt-6">
        <nyct-button variant="secondary" size="sm" (click)="createAnother()">
          Create Another
        </nyct-button>
        <nyct-button variant="primary" size="sm" (click)="close()"> Done </nyct-button>
      </div>
      } }
    </nyct-dialog-content>
  `,
})
export class StaticInviteDialogComponent implements OnInit {
  private readonly dialogRef = inject(DialogRef);
  protected readonly data = inject<StaticInviteDialogData>(DIALOG_DATA);
  private readonly staticsService = inject(StaticsService);
  private readonly toastService = inject(ToastService);

  // View state
  protected readonly view = signal<DialogView>('list');
  protected readonly loading = signal(true);
  protected readonly generating = signal(false);
  protected readonly copied = signal(false);

  // Data
  protected readonly existingInvites = signal<InviteCode[]>([]);
  protected readonly generatedInvite = signal<GeneratedInvite | null>(null);

  // Form inputs
  protected readonly expiresAtInput = signal('');
  protected readonly maxUsesInput = signal('');

  protected readonly minDateTime = computed(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  async ngOnInit(): Promise<void> {
    await this.loadInvites();
  }

  private async loadInvites(): Promise<void> {
    this.loading.set(true);
    const result = await this.staticsService.getInviteCodes(this.data.staticId);
    if (result.success) {
      this.existingInvites.set(result.data);
    }
    this.loading.set(false);
  }

  protected showListView(): void {
    this.view.set('list');
  }

  protected showCreateView(): void {
    this.resetForm();
    this.view.set('create');
  }

  protected async generateInvite(): Promise<void> {
    this.generating.set(true);

    const expiresAt = this.expiresAtInput() ? new Date(this.expiresAtInput()) : null;
    const maxUses = this.maxUsesInput() ? parseInt(this.maxUsesInput(), 10) : null;

    const result = await this.staticsService.generateInviteLink(
      this.data.staticId,
      expiresAt,
      maxUses
    );

    this.generating.set(false);

    if (result.success) {
      const code = result.data.inviteCode.code;
      this.generatedInvite.set({
        inviteCode: code,
        inviteLink: `${API_URL}/statics/invite/${code}`,
      });
      this.toastService.success('Invite link generated successfully');
      this.view.set('result');

      // Refresh the list for when user goes back
      await this.loadInvites();
    }
  }

  protected createAnother(): void {
    this.resetForm();
    this.generatedInvite.set(null);
    this.view.set('create');
  }

  protected close(): void {
    this.dialogRef.close();
  }

  protected async copyInviteLink(invite: InviteCode): Promise<void> {
    const link = `${API_URL}/statics/invite/${invite.code}`;
    await this.copyToClipboard(link);
  }

  protected async copyGeneratedLink(): Promise<void> {
    const invite = this.generatedInvite();
    if (invite) {
      await this.copyToClipboard(invite.inviteLink);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }

  private async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.toastService.success('Copied to clipboard');
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.toastService.success('Copied to clipboard');
    }
  }

  protected isExpired(invite: InviteCode): boolean {
    if (!invite.expiresAt) return false;
    return new Date(invite.expiresAt) < new Date();
  }

  protected isMaxedOut(invite: InviteCode): boolean {
    if (!invite.maxUses) return false;
    return invite.uses >= invite.maxUses;
  }

  protected formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  protected formatExpirationInput(): string {
    if (!this.expiresAtInput()) return '';
    const date = new Date(this.expiresAtInput());
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  private resetForm(): void {
    this.expiresAtInput.set('');
    this.maxUsesInput.set('');
  }

  protected async deleteInvite(invite: InviteCode): Promise<void> {
    const result = await this.staticsService.deleteInvite(this.data.staticId, invite.code);
    if (result.success) {
      this.toastService.success('Invite deleted successfully');
      await this.loadInvites();
    }
  }
}
