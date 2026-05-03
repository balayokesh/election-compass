import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessage, Message } from '../chat-message/chat-message';

@Component({
  selector: 'app-chat-container',
  standalone: true,
  imports: [CommonModule, ChatMessage],
  templateUrl: './chat-container.html',
  styleUrl: './chat-container.scss',
})
export class ChatContainer implements OnInit {
  messages: Message[] = [];

  ngOnInit(): void {
    // Initialize with sample messages for demo purposes
    this.messages = [
      {
        id: '1',
        text: 'Hello! How can I assist you today?',
        sender: 'ai',
        senderName: 'Election Compass AI',
        timestamp: new Date(Date.now() - 300000),
      },
      {
        id: '2',
        text: 'I want to know more about the candidates.',
        sender: 'user',
        senderName: 'You',
        timestamp: new Date(Date.now() - 180000),
      },
      {
        id: '3',
        text: 'Sure! Let me provide you with some information.',
        sender: 'ai',
        senderName: 'Election Compass AI',
        timestamp: new Date(),
      },
    ];
  }

  addMessage(text: string, sender: 'user' | 'ai' | 'system'): void {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      senderName: sender === 'user' ? 'You' : 'Election Compass AI',
      timestamp: new Date(),
    };
    this.messages.push(newMessage);
  }

  trackByMessageId(index: number, message: Message): string {
    return message.id;
  }
}
