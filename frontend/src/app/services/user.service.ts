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
  protected router = inject(Router);
  protected jwtService = inject(JwtService);

  
}