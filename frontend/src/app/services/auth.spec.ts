import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth';
import { Auth, user } from '@angular/fire/auth';
import { of } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firebase Auth
vi.mock('@angular/fire/auth', () => ({
  Auth: vi.fn(),
  user: vi.fn(() => of(null)),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}));

// Re-import mocked functions for spying
import { signInWithPopup, signOut } from '@angular/fire/auth';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Auth, useValue: {} }
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call signInWithPopup when loginWithGoogle is called', async () => {
    await service.loginWithGoogle();
    expect(signInWithPopup).toHaveBeenCalled();
  });

  it('should call signOut when logout is called', async () => {
    await service.logout();
    expect(signOut).toHaveBeenCalled();
  });
});
