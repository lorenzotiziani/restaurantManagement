// src/app/core/interceptors/auth.interceptor.ts
import { inject } from '@angular/core';
import {
    HttpHandlerFn,
    HttpRequest,
    HttpErrorResponse,
    HttpClient
} from '@angular/common/http';
import { JwtService } from '../services/jwt.service';
import { Router } from '@angular/router';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
    const jwtService = inject(JwtService);
    const router = inject(Router);
    const http = inject(HttpClient);

    if (req.url.includes('/auth/login') ||
        req.url.includes('/auth/register')) {
        return next(req);
    }

    const authTokens = jwtService.getToken();

    if (!authTokens) {
        return next(req).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    jwtService.removeToken();
                    router.navigate(['/login'], {
                        queryParams: { reason: 'no_token' }
                    });
                }
                return throwError(() => error);
            })
        );
    }


    const clonedReq = req.clone({
        setHeaders: { Authorization: `Bearer ${authTokens.token}` }
    });


    return next(clonedReq).pipe(
        catchError((error: HttpErrorResponse) => {


            if (error.status === 401) {
                const refreshToken = authTokens.refreshToken;

                if (refreshToken && jwtService.isRefreshTokenValid()) {
                    console.log('🔄 Access token scaduto/invalido, tentativo refresh...');

                    return http.post<{ success: boolean; data: { accessToken: string; refreshToken: string } }>(
                        'http://localhost:3000/api/auth/refresh',
                        { refreshToken }
                    ).pipe(
                        switchMap((response) => {

                            console.log('✅ Token refreshati con successo');
                            jwtService.setToken(response.data.accessToken, response.data.refreshToken);


                            const retryReq = req.clone({
                                setHeaders: { Authorization: `Bearer ${response.data.accessToken}` }
                            });

                            return next(retryReq);
                        }),
                        catchError((refreshError: HttpErrorResponse) => {

                            console.error('❌ Refresh fallito, logout forzato');
                            jwtService.removeToken();
                            router.navigate(['/login'], {
                                queryParams: { reason: 'session_expired' }
                            });

                            return throwError(() => new Error('Sessione scaduta'));
                        })
                    );
                } else {
                    
                    console.warn('⚠️ Nessun refresh token valido, logout');
                    jwtService.removeToken();
                    router.navigate(['/login'], {
                        queryParams: { reason: 'no_refresh_token' }
                    });
                    return throwError(() => new Error('Autenticazione richiesta'));
                }
            }


            if (error.status === 403) {
                console.error('🚫 Accesso negato (403)');
                router.navigate(['/unauthorized']);
                return throwError(() => error);
            }


            return throwError(() => error);
        })
    );
}