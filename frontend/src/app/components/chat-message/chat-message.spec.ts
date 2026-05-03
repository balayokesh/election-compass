import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatMessage } from './chat-message';

describe('ChatMessage', () => {
  let component: ChatMessage;
  let fixture: ComponentFixture<ChatMessage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatMessage],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatMessage);
    component = fixture.componentInstance;
    component.message = {
      id: 'test-1',
      text: 'Test message',
      sender: 'ai',
      senderName: 'Election Compass',
      timestamp: new Date(),
    };
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
