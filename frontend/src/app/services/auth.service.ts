// src/app/core/services/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, distinctUntilChanged, map, Observable, of, ReplaySubject, tap, throwError } from 'rxjs';
import { JwtService } from './jwt.service';
import { User } from '../entities/user.entity.ts';
import { Router } from '@angular/router';
import { LoginResponse, RefreshResponse,RegisterResponse } from '../entities/auth.entity';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly API_URL = 'http://localhost:3000';

    protected http = inject(HttpClient);
    protected jwtSrv = inject(JwtService);
    protected router = inject(Router);


    private _currentUser$ = new ReplaySubject<User | null>(1);
    public currentUser$ = this._currentUser$.asObservable();


    public isAuthenticated$ = this.currentUser$.pipe(
        map(user => !!user),
        distinctUntilChanged()
    );

    constructor() {
        this.initializeAuth();
    }

    private initializeAuth(): void {
        const authTokens = this.jwtSrv.getToken();

        if (!authTokens) {

            this._currentUser$.next(null);
            return;
        }


        if (!this.jwtSrv.areTokensValid()) {
            console.warn('⚠️ Refresh token scaduto, tentativo di refresh...');


            this.refresh().subscribe({
                next: () => {
                    console.log('✅ Token refreshati all\'inizializzazione');
                    const user = this.jwtSrv.getPayload<User>();
                    this._currentUser$.next(user);
                },
                error: (err) => {
                    console.error('❌ Refresh fallito all\'inizializzazione:', err);
                    this.performLogout();
                }
            });
        } else {
            const user = this.jwtSrv.getPayload<User>();
            this._currentUser$.next(user);
            console.log('✅ Utente autenticato ripristinato dal token');
        }
    }

    login(email: string, password: string): Observable<User> {
        return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, {
            email,
            password
        }).pipe(
            tap(res => {
                if (!res.success) {
                    throw new Error(res.error || 'Login fallito');
                }
            }),
            tap(res => {

                this.jwtSrv.setToken(res.data.accessToken, res.data.refreshToken);
                console.log('✅ Login effettuato con successo');
            }),
            tap(res => {

                this._currentUser$.next(res.data.user);
            }),
            map(res => res.data.user),
            catchError((error) => {
                console.error('❌ Errore durante il login:', error);
                this._currentUser$.next(null);

                const backendMessage =
                    error?.error?.message ||
                    error?.error?.error ||
                    'Errore di autenticazione';

                return throwError(() => new Error(backendMessage));
            })

        );
    }
    register(userData: {
        email: string;
        password: string;
        confirm: string;
        nome: string;
        cognome: string;
    }): Observable<RegisterResponse> {
        return this.http.post<RegisterResponse>(`${this.API_URL}/auth/register`, userData).pipe(
            tap(res => {
                if (res.success) {
                    console.log('✅ Registrazione completata');
                }
            }),
            catchError(error => {
                console.error('❌ Errore durante la registrazione:', error);

                const backendError = error?.error;

                if (backendError?.details) {
                    return throwError(() => backendError.details);
                }

                if (backendError?.error) {
                    return throwError(() => backendError.error);
                }

                return throwError(() => 'Errore di connessione');
            })
        );
    }

    refresh(): Observable<RefreshResponse> {
        const authTokens = this.jwtSrv.getToken();

        if (!authTokens) {
            console.error('❌ Nessun refresh token disponibile');
            return throwError(() => new Error('Nessun refresh token disponibile'));
        }

        return this.http.post<RefreshResponse>(`${this.API_URL}/auth/refresh`, {
            refreshToken: authTokens.refreshToken
        }).pipe(
            tap(res => {
                if (res.success) {

                    this.jwtSrv.setToken(res.data.accessToken, res.data.refreshToken);

                    const user = this.jwtSrv.getPayload<User>();
                    this._currentUser$.next(user);

                    console.log('🔄 Token refreshati con successo');
                }
            }),
            catchError(error => {
                console.error('❌ Errore durante il refresh:', error);
                this.performLogout();
                return throwError(() => error);
            })
        );
    }

    fetchUser(): Observable<User | null> {
        return this.http.get<{ success: boolean; data: User }>(`${this.API_URL}/users/profile`).pipe(
            map(res => res.data),
            tap(user => {
                this._currentUser$.next(user);
                console.log('✅ Dati utente aggiornati');
            }),
            catchError(error => {
                console.error('❌ Errore recupero utente:', error);
                this._currentUser$.next(null);
                return of(null);
            })
        );
    }
    logout(): Observable<void> {
        const authTokens = this.jwtSrv.getToken();

        if (authTokens) {

            return this.http.post<void>(`${this.API_URL}/auth/logout`, {
                refreshToken: authTokens.refreshToken
            }).pipe(
                tap(() => {
                    console.log('👋 Logout effettuato (token revocato sul server)');
                    this.performLogout();
                }),
                catchError(error => {
                    console.error('⚠️ Errore durante il logout sul server:', error);
                    // Esegui comunque il logout locale
                    this.performLogout();
                    return of(void 0);
                })
            );
        } else {

            this.performLogout();
            return of(void 0);
        }
    }

    private performLogout(): void {
        this.jwtSrv.removeToken();
        this._currentUser$.next(null);
        this.router.navigate(['/login']);
        console.log('🧹 Logout locale completato');
    }

    getCurrentUser(): User | null {
        return this.jwtSrv.getPayload<User>();
    }

    isAuthenticated(): boolean {
        return this.jwtSrv.isAuthenticated();
    }

    getCurrentUserEmail(): string | null {
        const user = this.getCurrentUser();
        return user?.email || null;
    }
    getCurrentUserFullName(): string | null {
        const user = this.getCurrentUser();
        return user ? `${user.nome} ${user.cognome}` : null;
    }
}