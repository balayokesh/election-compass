import { TestBed, ComponentFixture } from '@angular/core/testing';
import { App } from './app';
import { AuthService } from './services/auth';
import { DialogflowService } from './services/dialogflow';
import { of } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('App Component', () => {
  let fixture: ComponentFixture<App>;
  let component: App;
  let mockAuthService: any;
  let mockDialogflowService: any;

  beforeEach(async () => {
    mockAuthService = {
      user$: of(null), // Default to logged out
      loginWithGoogle: vi.fn(),
      logout: vi.fn()
    };

    mockDialogflowService = {
      sendQuery: vi.fn(() => of({ queryResult: { fulfillmentText: 'Response' } }))
    };

    await TestBed.configureTestingModule({
      imports: [App, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: DialogflowService, useValue: mockDialogflowService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should show login screen when user is not authenticated', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.login-container')).toBeTruthy();
    expect(compiled.querySelector('.chat-main')).toBeFalsy();
  });

  it('should show chat interface when user is authenticated', () => {
    // Mock authenticated user
    mockAuthService.user$ = of({ displayName: 'John Doe' });
    
    // Create new fixture to pick up new observable state
    fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.chat-main')).toBeTruthy();
    expect(compiled.querySelector('.login-container')).toBeFalsy();
    expect(compiled.querySelector('.app-subtitle')?.textContent).toContain('Welcome, John Doe');
  });

  it('should call login when login button is clicked', () => {
    const loginButton = fixture.nativeElement.querySelector('.google-login-button');
    loginButton.click();
    expect(mockAuthService.loginWithGoogle).toHaveBeenCalled();
  });
});
