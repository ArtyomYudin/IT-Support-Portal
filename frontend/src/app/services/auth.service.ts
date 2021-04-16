import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';

import { AuthUser } from '@models/auth-user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  public currentUser$: Observable<AuthUser>;

  private currentUserSubject$: BehaviorSubject<AuthUser>;

  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) {
    this.currentUserSubject$ = new BehaviorSubject<AuthUser>(JSON.parse(localStorage.getItem('IT-Support-Portal')));
    this.currentUser$ = this.currentUserSubject$.asObservable();
  }

  // public get currentUserValue(): AuthUser {
  //   return this.currentUserSubject.value;
  // }

  public login(email: string, password: string): any {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/plain',
      }),
    };

    return this.http.post<AuthUser>('https://ito.center-inform.ru:3443/api/auth', { email, password }, httpOptions).pipe(
      map(authUser => {
        if (authUser && authUser.token) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('IT-Support-Portal', JSON.stringify(authUser));
          this.currentUserSubject$.next(authUser);
        }
        return authUser;
      }),
      catchError(err => {
        console.log('Handling error locally and rethrowing it...', err);
        return throwError(err);
      }),
    );
  }

  public logout(): void {
    // remove user from local storage to log user out
    localStorage.removeItem('ngMonitoring');
    this.currentUserSubject$.next(null);
  }

  public isAuthenticated(): boolean {
    if (localStorage.getItem('ngMonitoring')) {
      //  const token = JSON.parse(localStorage.getItem('ngMonitoring')).token;
      // console.log(this.jwtHelper);
      return !this.jwtHelper.isTokenExpired();
    }
    return false;
  }
}
