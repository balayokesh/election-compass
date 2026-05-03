import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  senderName: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat-message',
  imports: [CommonModule, MatCardModule, MatIconModule, MatTooltipModule],
  templateUrl: './chat-message.html',
  styleUrl: './chat-message.scss',
})
export class ChatMessage {
  @Input() message!: Message;

  getSenderIcon(): string {
    switch (this.message.sender) {
      case 'user':
        return 'person';
      case 'ai':
        return 'smart_toy';
      case 'system':
        return 'info';
      default:
        return 'chat';
    }
  }

  getSenderColor(): string {
    switch (this.message?.sender) {
      case 'user':
        return 'primary';
      case 'ai':
        return 'accent';
      case 'system':
        return 'warn';
      default:
        return 'primary';
    }
  }
}