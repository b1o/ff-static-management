import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StaticsStore } from '../../features/statics/statics.store';
import {
  ButtonComponent,
  CardComponent,
  CardHeaderComponent,
  CardContentComponent,
  CardFooterComponent,
  IconComponent,
  AlertComponent,
} from '../../ui/primitives';

@Component({
  selector: 'nyct-statics-create-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardContentComponent,
    CardFooterComponent,
    IconComponent,
    AlertComponent,
  ],
  template: `
    <div class="p-6 max-w-xl mx-auto">
      <!-- Back link -->
      <button
        type="button"
        (click)="goBack()"
        class="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <nyct-icon name="chevron-left" size="sm" />
        Back to Statics
      </button>

      <nyct-card>
        <nyct-card-header class="p-6 border-b border-border">
          <h1 class="text-xl font-semibold text-text-primary">Create New Static</h1>
          <p class="mt-1 text-sm text-text-secondary">
            Create a new static group for your team
          </p>
        </nyct-card-header>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <nyct-card-content class="p-6">
            @if (store.error()) {
              <nyct-alert variant="error" class="mb-4">
                {{ store.error() }}
              </nyct-alert>
            }

            <div class="space-y-4">
              <div>
                <label
                  for="name"
                  class="block text-sm font-medium text-text-primary mb-1.5"
                >
                  Static Name
                </label>
                <input
                  id="name"
                  type="text"
                  formControlName="name"
                  placeholder="Enter static name"
                  [class]="inputClasses()"
                  [attr.aria-invalid]="isNameInvalid()"
                  [attr.aria-describedby]="isNameInvalid() ? 'name-error' : null"
                />
                @if (isNameInvalid()) {
                  <p id="name-error" class="mt-1.5 text-sm text-pastel-rose">
                    @if (form.controls.name.errors?.['required']) {
                      Static name is required
                    } @else if (form.controls.name.errors?.['minlength']) {
                      Static name must be at least 2 characters
                    } @else if (form.controls.name.errors?.['maxlength']) {
                      Static name must be less than 50 characters
                    }
                  </p>
                }
              </div>
            </div>
          </nyct-card-content>

          <nyct-card-footer class="p-6 border-t border-border flex justify-end gap-3">
            <nyct-button
              type="button"
              variant="secondary"
              (click)="goBack()"
              [disabled]="submitting()"
            >
              Cancel
            </nyct-button>
            <nyct-button
              type="submit"
              [disabled]="form.invalid || submitting()"
            >
              @if (submitting()) {
                Creating...
              } @else {
                Create Static
              }
            </nyct-button>
          </nyct-card-footer>
        </form>
      </nyct-card>
    </div>
  `,
})
export class StaticsCreatePage {
  protected store = inject(StaticsStore);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  protected form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
  });

  protected submitting = signal(false);

  async onSubmit() {
    if (this.form.invalid || this.submitting()) return;

    this.submitting.set(true);
    const result = await this.store.createStatic(this.form.value.name!);
    this.submitting.set(false);

    if (result) {
      this.router.navigate(['/statics', result.id]);
    }
  }

  goBack() {
    this.router.navigate(['/statics']);
  }

  isNameInvalid(): boolean {
    const control = this.form.controls.name;
    return control.invalid && control.touched;
  }

  inputClasses(): string {
    const base =
      'w-full h-10 px-4 text-sm rounded-lg bg-surface-elevated border text-text-primary placeholder:text-text-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed';
    const variant = this.isNameInvalid()
      ? 'border-pastel-rose hover:border-pastel-rose focus:ring-pastel-rose'
      : 'border-border hover:border-dark-500 focus:ring-primary-500 focus:border-primary-500';
    return `${base} ${variant}`;
  }
}
