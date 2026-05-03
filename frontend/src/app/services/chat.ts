import { Injectable } from '@angular/core';
import { Message } from '../components/chat-message/chat-message';

@Injectable({
  providedIn: 'root',
})
export class Chat {
  private messages: Message[] = [];

  addMessage(text: string, sender: 'user' | 'ai' | 'system'): Message {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      senderName: sender === 'user' ? 'You' : 'Election Compass AI',
      timestamp: new Date(),
    };
    this.messages.push(newMessage);
    return newMessage;
  }

  getMessages(): Message[] {
    return this.messages;
  }

  clearMessages(): void {
    this.messages = [];
  }
}
