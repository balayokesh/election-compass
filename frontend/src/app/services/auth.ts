import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  user, 
  User 
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly auth = inject(Auth);
  
  /** Observable of the current user. Returns null if not logged in. */
  readonly user$: Observable<User | null> = user(this.auth);

  /**
   * Logs in the user using a Google Auth popup.
   * Accessibility Note: Popups are generally better for screen readers than redirects 
   * as they maintain the original page context.
   */
  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(this.auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /** Logs the current user out. */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }
}
