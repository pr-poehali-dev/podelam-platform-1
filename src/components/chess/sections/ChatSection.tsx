import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Chat, ChatSectionProps, CHAT_URL } from './chat/ChatTypes';
import { ChatListItem } from './chat/ChatListItem';
import { ChatWindow } from './chat/ChatWindow';
import API from '@/config/api';
import { emitBadge } from '@/lib/badgeEvents';

const FRIENDS_URL = API.friends;

const getUserId = () => {
  const saved = localStorage.getItem('chessUser');
  if (!saved) return '';
  const user = JSON.parse(saved);
  const rawId = user.email || user.name || 'anonymous';
  return 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
};

export const ChatSection = ({
  initialChatId,
  initialParticipantName,
  initialParticipantRating
}: ChatSectionProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    const uid = getUserId();
    if (!uid) { setLoading(false); return; }

    try {
      const convRes = await fetch(`${CHAT_URL}?action=conversations&user_id=${encodeURIComponent(uid)}`);
      const convData = await convRes.json();
      const conversations = convData.conversations || [];

      let friends: { id: string; username: string; avatar: string; rating: number; city: string; status: string }[] = [];
      const friendsCacheKey = `friends_list_${uid}`;
      const friendsCached = sessionStorage.getItem(friendsCacheKey);
      if (friendsCached) {
        try { const d = JSON.parse(friendsCached); if (Date.now() - d.ts < 30000) friends = d.data; } catch { /* ignore */ }
      }
      if (!friends.length) {
        const friendsRes = await fetch(`${FRIENDS_URL}?action=list&user_id=${encodeURIComponent(uid)}`);
        const friendsData = await friendsRes.json();
        friends = friendsData.friends || [];
        try { sessionStorage.setItem(friendsCacheKey, JSON.stringify({ data: friends, ts: Date.now() })); } catch { /* ignore */ }
      }

      const convPartnerIds = new Set(conversations.map((c: { partner_id: string }) => c.partner_id));

      const chatList: Chat[] = conversations.map((c: {
        partner_id: string;
        username: string;
        avatar: string;
        rating: number;
        city: string;
        status: string;
        last_message: string;
        last_message_time: string;
        unread: number;
        last_message_is_own: boolean;
      }) => ({
        id: c.partner_id,
        participantId: c.partner_id,
        participantName: c.username,
        participantAvatar: c.avatar || undefined,
        participantRating: c.rating,
        participantCity: c.city,
        participantStatus: c.status as 'online' | 'offline',
        lastMessage: c.last_message,
        lastMessageTime: c.last_message_time,
        lastMessageIsOwn: c.last_message_is_own,
        unreadCount: c.unread,
        messages: []
      }));

      for (const f of friends) {
        if (!convPartnerIds.has(f.id)) {
          chatList.push({
            id: f.id,
            participantId: f.id,
            participantName: f.username,
            participantAvatar: f.avatar || undefined,
            participantRating: f.rating,
            participantCity: f.city,
            participantStatus: f.status as 'online' | 'offline',
            unreadCount: 0,
            messages: []
          });
        }
      }

      setChats(chatList);
      const totalUnread = chatList.reduce((sum: number, c: Chat) => sum + (c.unreadCount || 0), 0);
      emitBadge({ messages: totalUnread });

      if (initialChatId && initialParticipantName) {
        const existing = chatList.find(c => c.participantId === initialChatId);
        if (existing) {
          setSelectedChat(existing);
        } else {
          const newChat: Chat = {
            id: initialChatId,
            participantId: initialChatId,
            participantName: initialParticipantName,
            participantRating: initialParticipantRating || 1200,
            unreadCount: 0,
            messages: []
          };
          setChats([newChat, ...chatList]);
          setSelectedChat(newChat);
        }
      }
    } catch { /* network error */ }
    setLoading(false);
  }, [initialChatId, initialParticipantName, initialParticipantRating]);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(() => {
      loadConversations();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  const formatChatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дн. назад`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return parts[0][0] + parts[1][0];
    return name.substring(0, 2).toUpperCase();
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat({ ...chat, unreadCount: 0 });
    const newTotal = chats.reduce((sum, c) => sum + (c.id === chat.id ? 0 : (c.unreadCount || 0)), 0);
    emitBadge({ messages: newTotal });
  };

  const handleBack = () => {
    setSelectedChat(null);
    loadConversations();
  };

  if (selectedChat) {
    return (
      <ChatWindow
        selectedChat={selectedChat}
        onBack={handleBack}
        getInitials={getInitials}
      />
    );
  }

  return (
    <div className="animate-fade-in flex flex-col" style={{ maxHeight: 'calc(100vh - 120px)' }}>
      <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10 flex flex-col flex-1 min-h-0">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Icon name="MessageCircle" className="text-blue-600 dark:text-blue-400" size={24} />
            Сообщения
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 overflow-y-auto">
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-gray-400">
                <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-2" />
                <p className="text-sm">Загрузка...</p>
              </div>
            ) : chats.length === 0 ? (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                <Icon name="MessageCircle" className="mx-auto mb-4 opacity-40" size={48} />
                <p className="font-medium">Нет сообщений</p>
                <p className="text-sm mt-1">Добавьте друзей и начните общение</p>
              </div>
            ) : (
              chats.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  onSelect={handleChatSelect}
                  formatChatTime={formatChatTime}
                  getInitials={getInitials}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatSection;