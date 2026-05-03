import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ChatMessage } from './components/chat-message/chat-message';
import type { Message } from './components/chat-message/chat-message';
import { DialogflowService } from './services/dialogflow';
import { inject } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChatMessage, CommonModule, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly dialogflowService = inject(DialogflowService);
  protected readonly title = signal('frontend');
  
  messages: Message[] = [
    {
      id: '1',
      text: 'Welcome to Election Compass! I\'m here to help you navigate political topics and understand different perspectives.',
      sender: 'ai',
      senderName: 'Election Compass',
      timestamp: new Date(Date.now() - 5 * 60000)
    },
    {
      id: '2',
      text: 'Can you explain the key differences between the major political parties?',
      sender: 'user',
      senderName: 'You',
      timestamp: new Date(Date.now() - 3 * 60000)
    },
    {
      id: '3',
      text: 'Absolutely! The major political parties typically differ on issues such as healthcare, taxation, education, and environmental policy. Would you like me to dive deeper into any specific topic?',
      sender: 'ai',
      senderName: 'Election Compass',
      timestamp: new Date(Date.now() - 1 * 60000)
    }
  ];

  sendMessage(text: string): void {
    if (!text.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      senderName: 'You',
      timestamp: new Date()
    };
    
    this.messages.push(userMessage);
    
    // Call Dialogflow via backend proxy (auth handled server-side)
    this.dialogflowService.sendQuery(text.trim()).subscribe({
      next: (reply) => {
        const aiMessage: Message = {
          id: Date.now().toString(),
          text: reply.fulfillmentText,
          sender: 'ai',
          senderName: 'Election Compass',
          timestamp: new Date()
        };
        this.messages.push(aiMessage);
      },
      error: (err) => {
        const errorMessage: Message = {
          id: Date.now().toString(),
          text: 'Sorry, I encountered an error. Please check your configuration.',
          sender: 'ai',
          senderName: 'System',
          timestamp: new Date()
        };
        this.messages.push(errorMessage);
        console.error('Dialogflow Error:', err);
      }
    });
  }
}