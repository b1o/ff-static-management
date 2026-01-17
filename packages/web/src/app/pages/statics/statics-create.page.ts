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

interface StaticCreateModel {
  name: string;
}

@Component({
  selector: 'nyct-statics-create-page',
  imports: [HlmCardImports, HlmLabelImports, HlmInputImports, HlmButtonImports, Field],
  providers: [provideIcons({ lucideCheck, lucideChevronDown })],
  host: {
    class: 'contents',
  },
  template: `
    <section class="w-full max-w-sm" hlmCard>
      <div hlmCardHeader>
        <h3 hlmCardTitle>Create Static</h3>
      </div>

      <div hlmCardContent>
        <form>
          <div class="flex flex-col gap-6">
            <div class="grid gap-2">
              <label hlmLabel for="name">Static Name</label>
              <input
                type="text"
                id="name"
                placeholder="Static Name"
                [field]="staticCreateForm.name"
                hlmInput
              />
            </div>
          </div>
        </form>
      </div>

      <div hlmCardFooter class="flex justify-end gap-2">
        <button type="button" hlmBtn (click)="goBack()">Cancel</button>
        <button hlmBtn class="bg-primary" (click)="createStatic()" variant="outline" type="submit">Create</button>
      </div>
    </section>
  `,
})
export class StaticsCreatePage {
  protected store = inject(StaticsStore);
  private router = inject(Router);

  protected staticCreateModel = signal<StaticCreateModel>({
    name: '',
  });

  protected staticCreateForm = form<StaticCreateModel>(this.staticCreateModel, (model) => {
    required(model.name, { message: 'Static name is required' });
    minLength(model.name, 3, { message: 'Static name must be at least 3 characters' });
  });

  createStatic() {
    console.log('Creating static with name:', this.staticCreateForm.name());
  }

  goBack() {
    this.router.navigate(['/statics']);
  }
}
