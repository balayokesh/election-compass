import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatMessage } from './components/chat-message/chat-message';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChatMessage],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
  currentMessage = { 
    id: '1', 
    text: 'Hello!', 
    sender: 'ai' as const, 
    senderName: 'Assistant', 
    timestamp: new Date() 
  };
}