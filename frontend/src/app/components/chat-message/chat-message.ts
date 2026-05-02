import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  senderName: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat-message',
  imports: [CommonModule],
  templateUrl: './chat-message.html',
  styleUrl: './chat-message.scss',
})
export class ChatMessage {
  @Input() message!: Message;
}