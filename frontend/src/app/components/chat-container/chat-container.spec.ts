import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatContainer } from './chat-container';
import { ChatMessage } from '../chat-message/chat-message';

describe('ChatContainer', () => {
  let component: ChatContainer;
  let fixture: ComponentFixture<ChatContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatContainer, ChatMessage],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with sample messages', () => {
    expect(component.messages.length).toBeGreaterThan(0);
  });

  it('should add a new message', () => {
    const initialLength = component.messages.length;
    component.addMessage('Test message', 'user');
    expect(component.messages.length).toBe(initialLength + 1);
    expect(component.messages[component.messages.length - 1].text).toBe(
      'Test message'
    );
  });

  it('should assign correct sender name', () => {
    component.addMessage('User message', 'user');
    component.addMessage('AI message', 'ai');
    const lastMessage = component.messages[component.messages.length - 1];
    expect(lastMessage.senderName).toBe('Election Compass AI');
  });
});
