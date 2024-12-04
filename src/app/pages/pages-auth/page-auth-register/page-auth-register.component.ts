import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../features/authentication/auth-service/auth.service';
import { CommonModule } from '@angular/common';
import { PageAuthMainComponent } from '../page-auth-main/page-auth-main.component';

@Component({
  selector: 'app-page-auth-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './page-auth-register.component.html',
  styleUrls: ['./page-auth-register.component.scss']
})
export class PageAuthRegisterComponent extends PageAuthMainComponent {
  registerForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    super();
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }


  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Por favor, preencha o formulário corretamente.';
      return;
    }

    const { email, password } = this.registerForm.value;

    const registerMethod = this.simulate
      ? this.authService.simulateRegister(email, password)
      : this.authService.register(email, password);

    registerMethod.subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Ocorreu um erro no registro. Tente novamente.';
      }
    });
  }


  simulateRegister(): void {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Por favor, preencha o formulário corretamente.';
      return;
    }

    const { email, password } = this.registerForm.value;

    this.authService.simulateRegister(email, password).subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Ocorreu um erro na simulação de registro. Tente novamente.';
      }
    });
  }
}
