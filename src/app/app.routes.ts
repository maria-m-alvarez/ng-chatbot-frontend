import { Routes } from '@angular/router';
import { PageCompanyComponent } from './pages/page-company-chatbot/page-company.component';

export const routes: Routes = [
    { path: '', component: PageCompanyComponent },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];
