import {
  Directive,
  inject,
  effect,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { StaticsStore } from '../features/statics/statics.store';

/**
 * Base class for permission directives.
 * Handles the common logic of showing/hiding content based on a permission check.
 */
abstract class BasePermissionDirective {
  protected store = inject(StaticsStore);
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private hasView = false;

  protected abstract checkPermission(): boolean;

  constructor() {
    effect(() => {
      const hasPermission = this.checkPermission();

      if (hasPermission && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!hasPermission && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }
}

/**
 * Renders content only if the current user is a leader of the selected static.
 *
 * @example
 * ```html
 * <button *nyctIfLeader>Delete Static</button>
 * ```
 */
@Directive({
  selector: '[nyctIfLeader]',
})
export class IfLeaderDirective extends BasePermissionDirective {
  protected checkPermission(): boolean {
    return this.store.isLeader();
  }
}

/**
 * Renders content only if the current user can manage the selected static.
 * (Either a leader OR has canManage permission)
 *
 * @example
 * ```html
 * <button *nyctIfCanManage>Edit Members</button>
 * ```
 */
@Directive({
  selector: '[nyctIfCanManage]',
})
export class IfCanManageDirective extends BasePermissionDirective {
  protected checkPermission(): boolean {
    return this.store.canManage();
  }
}
