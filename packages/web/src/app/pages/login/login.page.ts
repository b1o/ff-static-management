import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { ButtonComponent, IconComponent } from '../../ui/primitives';

@Component({
  selector: 'nyct-login',
  templateUrl: './login.page.html',
  imports: [ButtonComponent, IconComponent],
  styles: `
    .animate-slow-spin {
      animation: slow-spin 20s linear infinite;
    }

    .animate-gradient {
      background-size: 200% 200%;
      animation: gradient-shift 3s ease infinite;
    }

    .delay-1000 {
      animation-delay: 1s;
    }

    @keyframes slow-spin {
      from {
        transform: translate(-50%, -50%) rotate(0deg);
      }
      to {
        transform: translate(-50%, -50%) rotate(360deg);
      }
    }

    @keyframes gradient-shift {
      0%,
      100% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
    }
  `,
})
export class LoginPage {
  protected auth = inject(AuthService);

  constructor() {}
}
