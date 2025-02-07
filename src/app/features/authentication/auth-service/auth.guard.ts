import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {

    // Check if user is logged in and token is not expired
    if (this.authService.isLoggedIn() && !this.authService.isTokenExpired()) {
      return true;
    } else {
      // Redirect to login (or any auth page) if not logged in or token expired
      return this.router.createUrlTree(['/auth/login']);
    }
  }
}
