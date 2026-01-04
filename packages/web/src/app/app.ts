import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { api } from './api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('web');

  constructor() {
    this.test();
  }

  async test() {
    const res = await api.health.get();
    console.log(res);
  }
}
