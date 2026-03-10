export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

export interface Chat {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  participantRating: number;
  participantCity?: string;
  participantStatus?: 'online' | 'offline';
  lastMessage?: string;
  lastMessageTime?: string;
  lastMessageIsOwn?: boolean;
  unreadCount: number;
  messages: Message[];
}

export interface ChatSectionProps {
  initialChatId?: string;
  initialParticipantName?: string;
  initialParticipantRating?: number;
}

import API from '@/config/api';
export const CHAT_URL = API.chat;