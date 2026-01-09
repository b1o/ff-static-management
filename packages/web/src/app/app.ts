import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './ui/toast/toast-container.component';
import { DialogContainerComponent } from './ui/dialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent, DialogContainerComponent],
  templateUrl: './app.html',
})
export class App {}
