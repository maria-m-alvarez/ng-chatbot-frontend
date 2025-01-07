import { Routes } from '@angular/router';
import { Constants } from './core/constants';
import { PageChatbotComponent } from './pages/pages-chatbot/page-chatbot/page-chatbot.component';
import { PageAuthLoginComponent } from './pages/pages-auth/page-auth-login/page-auth-login.component';
import { PageAuthMainComponent } from './pages/pages-auth/page-auth-main/page-auth-main.component';
import { PageAuthRegisterComponent } from './pages/pages-auth/page-auth-register/page-auth-register.component';

export const routes: Routes = [
    { path: '', redirectTo: 'auth/login', pathMatch: 'full' }, // Redirect to login
  {
    path: 'auth',
    component: PageAuthMainComponent,
    children: [
      { path: '', redirectTo: Constants.ROUTES.AUTH_LOGIN, pathMatch: 'full' },
      { path: Constants.ROUTES.AUTH_LOGIN, component: PageAuthLoginComponent },
      { path: Constants.ROUTES.AUTH_REGISTER, component: PageAuthRegisterComponent }
    ]
  },
  {
    path: 'chatbot',
    component: PageChatbotComponent,
    children: [
      { path: '', redirectTo: 'chat', pathMatch: 'full' },
      { path: 'chat', component: PageChatbotComponent },
    ]
  },
  { path: Constants.ROUTES.CHATOBOT, component: PageChatbotComponent },
  { path: '**', redirectTo: Constants.ROUTES.AUTH_LOGIN, pathMatch: 'full' } // Wildcard route
];
