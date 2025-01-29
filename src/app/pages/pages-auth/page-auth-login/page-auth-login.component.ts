import { Component, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../features/authentication/auth-service/auth.service';
import { CommonModule } from '@angular/common';
import { PageAuthMainComponent } from '../page-auth-main/page-auth-main.component';
import { environment } from '../../../../environments/environment'; // Import environment
import { TranslatePipe } from '../../../core/pipes/translate-pipe.pipe';

@Component({
  selector: 'app-page-auth-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, TranslatePipe],
  templateUrl: './page-auth-login.component.html',
  styleUrls: ['./page-auth-login.component.scss']
})
export class PageAuthLoginComponent extends PageAuthMainComponent {
  @Input() loginForm: FormGroup;
  errorMessage: string | null = null;
  allowUserRegistration: boolean = environment.allowUserRegistration; // Expose environment variable
  allowSimulatedLogin: boolean = environment.allowSimulatedLogin; // Expose environment variable

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    super();
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, preencha o formulário corretamente.';
      return;
    }

    const { email, password } = this.loginForm.value;

    const loginMethod = this.simulate
      ? this.authService.simulateLogin(email, password)
      : this.authService.login(email, password);

    loginMethod.subscribe({
      next: () => {
        this.router.navigate(['/chatbot']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Ocorreu um erro no login. Tente novamente.';
      }
    });
  }

  simulateLogin(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, preencha o formulário corretamente.';
      return;
    }

    const { email, password } = this.loginForm.value;

    this.authService.simulateLogin(email, password).subscribe({
      next: () => {
        this.router.navigate(['/chatbot']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Ocorreu um erro na simulação de login. Tente novamente.';
      }
    });
  }
}
