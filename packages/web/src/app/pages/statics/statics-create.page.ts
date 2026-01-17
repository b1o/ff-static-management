import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Field, form, minLength, required } from '@angular/forms/signals';
import { StaticsStore } from '../../features/statics/statics.store';
import { HlmCardImports } from '@spartan/card';
import { HlmFieldImports } from '@spartan/field';
import { provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideChevronDown } from '@ng-icons/lucide';
import { HlmLabelImports } from '@spartan/label';
import { HlmInputImports } from '@spartan/input';
import { HlmButtonImports } from '@spartan/button';
import { HlmDialogImports } from '@spartan/dialog';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';

interface StaticCreateModel {
  name: string;
}

@Component({
  selector: 'nyct-statics-create-page',
  imports: [
    HlmCardImports,
    HlmLabelImports,
    HlmInputImports,
    HlmButtonImports,
    Field,
    HlmDialogImports,
  ],
  host: {
    class: 'flex flex-col gap-4',
  },
  providers: [provideIcons({ lucideCheck, lucideChevronDown })],
  template: `
    <hlm-dialog-header>Create Static</hlm-dialog-header>
    <div class="flex flex-col gap-6">
      <div class="grid gap-2">
        <input
          type="text"
          id="name"
          placeholder="Static Name"
          [field]="staticCreateForm.name"
          hlmInput
        />
      </div>
    </div>
    <hlm-dialog-footer>
      <button type="button" variant="destructive" size="sm" hlmBtn (click)="goBack()">
        Cancel
      </button>
      <button
        hlmBtn
        class="bg-primary"
        (click)="createStatic()"
        size="sm"
        variant="outline"
        type="submit"
      >
        Create
      </button>
    </hlm-dialog-footer>
  `,
})
export class StaticsCreatePage {
  protected store = inject(StaticsStore);
  private router = inject(Router);
  private readonly dialogRef = inject<BrnDialogRef<any>>(BrnDialogRef);
  private readonly dialogContext = injectBrnDialogContext<{}>();

  protected staticCreateModel = signal<StaticCreateModel>({
    name: '',
  });

  protected staticCreateForm = form<StaticCreateModel>(this.staticCreateModel, (model) => {
    required(model.name, { message: 'Static name is required' });
    minLength(model.name, 3, { message: 'Static name must be at least 3 characters' });
  });

  async createStatic() {
    console.log('Creating static with name:', this.staticCreateForm.name());
    const res = await this.store.createStatic(this.staticCreateForm.name().value());
    this.dialogRef.close(res);
    if (res) {
      this.router.navigate(['/statics', res.id]);
    }
  }

  goBack() {
    this.router.navigate(['/statics']);
  }
}
