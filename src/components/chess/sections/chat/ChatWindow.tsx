import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { Chat, Message, CHAT_URL } from './ChatTypes';
import API from '@/config/api';

const INVITE_URL = API.inviteGame;

const TIME_OPTIONS = [
  { label: '1 мин', value: '1+0', cat: 'Пуля' },
  { label: '3 мин', value: '3+0', cat: 'Блиц' },
  { label: '3+2', value: '3+2', cat: 'Блиц' },
  { label: '5 мин', value: '5+0', cat: 'Блиц' },
  { label: '5+5', value: '5+5', cat: 'Блиц' },
  { label: '10 мин', value: '10+0', cat: 'Рапид' },
  { label: '15+10', value: '15+10', cat: 'Рапид' },
  { label: '30 мин', value: '30+0', cat: 'Рапид' },
];

const getTimeLabel = (time: string) => {
  const found = TIME_OPTIONS.find(t => t.value === time);
  if (found) return found.label;
  if (time.includes('+')) {
    const [m, i] = time.split('+');
    return i === '0' ? `${m} мин` : `${m}+${i}`;
  }
  return time;
};

interface ChatWindowProps {
  selectedChat: Chat;
  onBack: () => void;
  getInitials: (name: string) => string;
}

const getUserId = () => {
  const saved = localStorage.getItem('chessUser');
  if (!saved) return '';
  const user = JSON.parse(saved);
  const rawId = user.email || user.name || 'anonymous';
  return 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
};

export const ChatWindow = ({
  selectedChat,
  onBack,
  getInitials
}: ChatWindowProps) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGameSetup, setShowGameSetup] = useState(false);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteId, setInviteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const pollInviteRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);

  const emojis = [
    '😊', '😂', '❤️', '👍', '👏', '🔥', '💯', '🎉',
    '😎', '🤔', '😅', '🙌', '👌', '✨', '⚡', '💪',
    '🎯', '🏆', '🎲', '♟️', '👑', '⭐', '💎', '🚀'
  ];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const chatCacheKey = useCallback(() => {
    const uid = getUserId();
    const ids = [uid, selectedChat.participantId].sort().join('_');
    return `chat_msgs_${ids}`;
  }, [selectedChat.participantId]);

  useEffect(() => {
    const now = Date.now();
    const TTL = 30 * 24 * 60 * 60 * 1000;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('chat_msgs_')) {
        try {
          const d = JSON.parse(localStorage.getItem(key) || '{}');
          if (d.ts && now - d.ts > TTL) localStorage.removeItem(key);
        } catch { localStorage.removeItem(key!); }
      }
    }
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem(chatCacheKey());
    if (cached) {
      try {
        const d = JSON.parse(cached);
        if (d.messages) setMessages(d.messages);
      } catch { /* cache parse error */ }
    }
  }, [chatCacheKey]);

  const loadMessages = useCallback(async () => {
    const uid = getUserId();
    if (!uid) return;
    try {
      const res = await fetch(`${CHAT_URL}?action=messages&user_id=${encodeURIComponent(uid)}&partner_id=${encodeURIComponent(selectedChat.participantId)}`);
      const data = await res.json();
      const msgs: Message[] = (data.messages || []).map((m: { id: number; sender_id: string; text: string; created_at: string; sender_name: string; is_own: boolean }) => ({
        id: String(m.id),
        senderId: m.sender_id,
        senderName: m.sender_name,
        text: m.text,
        timestamp: m.created_at,
        isOwn: m.is_own
      }));
      setMessages(msgs);
      try { localStorage.setItem(chatCacheKey(), JSON.stringify({ messages: msgs, ts: Date.now() })); } catch { /* cache write error */ }
    } catch { /* network error */ }
    setLoading(false);
  }, [selectedChat.participantId, chatCacheKey]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (isFirstLoad.current && messages.length > 0) {
      isFirstLoad.current = false;
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
    } else if (!isFirstLoad.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (pollInviteRef.current) clearInterval(pollInviteRef.current);
    };
  }, []);

  const pollAccepted = useCallback((iid: number) => {
    const uid = getUserId();
    if (pollInviteRef.current) clearInterval(pollInviteRef.current);
    pollInviteRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${INVITE_URL}?action=check_accepted&invite_id=${iid}&user_id=${encodeURIComponent(uid)}`);
        const data = await res.json();
        if (data.status === 'accepted' && data.game_id) {
          if (pollInviteRef.current) clearInterval(pollInviteRef.current);
          setInviteSent(false);
          setInviteId(null);
          const gameRes = await fetch(`${API.matchmaking}?game_id=${data.game_id}`);
          const gameData = await gameRes.json();
          const g = gameData.game;
          const myColor = g.white_user_id === uid ? 'white' : 'black';
          const oppName = g.white_user_id === uid ? g.black_username : g.white_username;
          const oppRating = g.white_user_id === uid ? g.black_rating : g.white_rating;
          const oppAvatar = g.white_user_id === uid ? (g.black_avatar || '') : (g.white_avatar || '');
          window.location.href = `/game?time=${encodeURIComponent(g.time_control)}&color=${myColor}&online_game_id=${data.game_id}&online=true&opponent_name=${encodeURIComponent(oppName)}&opponent_rating=${oppRating}&opponent_avatar=${encodeURIComponent(oppAvatar)}`;
        } else if (data.status === 'declined') {
          if (pollInviteRef.current) clearInterval(pollInviteRef.current);
          setInviteSent(false);
          setInviteId(null);
        }
      } catch { /* network error */ }
    }, 3000);
  }, [navigate]);

  const getLastGameSettings = () => {
    const saved = localStorage.getItem('lastGameSettings');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return { time: '10+0', color: 'random' };
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    const uid = getUserId();
    const text = messageText.trim();
    setMessageText('');

    const tempMsg: Message = {
      id: 'temp_' + Date.now(),
      senderId: uid,
      senderName: 'Вы',
      text,
      timestamp: new Date().toISOString(),
      isOwn: true
    };
    setMessages(prev => {
      const updated = [...prev, tempMsg];
      try { localStorage.setItem(chatCacheKey(), JSON.stringify({ messages: updated, ts: Date.now() })); } catch { /* cache write */ }
      return updated;
    });

    try {
      await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          user_id: uid,
          receiver_id: selectedChat.participantId,
          text
        })
      });
    } catch { /* network error */ }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageText(messageText + emoji);
    setShowEmojiPicker(false);
  };

  const sendGameInvite = async (timeControl: string) => {
    localStorage.setItem('lastGameSettings', JSON.stringify({ time: timeControl, color: 'random' }));

    const uid = getUserId();
    const inviteText = `♟️ Приглашение на партию: ${getTimeLabel(timeControl)}`;

    try {
      await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          user_id: uid,
          receiver_id: selectedChat.participantId,
          text: inviteText
        })
      });
    } catch { /* ignore */ }

    setShowGameSetup(false);

    const friendUid = selectedChat.participantId;
    if (!uid || !friendUid) return;

    try {
      const res = await fetch(INVITE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          from_user_id: uid,
          to_user_id: friendUid,
          time_control: timeControl,
          color_choice: 'random'
        })
      });
      const data = await res.json();
      if (data.invite_id) {
        setInviteSent(true);
        setInviteId(data.invite_id);
        pollAccepted(data.invite_id);
      }
    } catch { /* network error */ }
  };

  const handleQuickInvite = () => {
    const settings = getLastGameSettings();
    sendGameInvite(settings.time);
  };

  const handleBlock = () => {
    if (!confirm(`Вы действительно хотите заблокировать ${selectedChat.participantName}?`)) return;
    const blockedUsers = JSON.parse(localStorage.getItem('blockedUsers') || '[]');
    blockedUsers.push(selectedChat.participantId);
    localStorage.setItem('blockedUsers', JSON.stringify(blockedUsers));
    setShowBlockMenu(false);
    onBack();
  };

  const lastSettings = getLastGameSettings();

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-5rem)] sm:h-[calc(100vh-6rem)] max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-t-xl">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button onClick={onBack} variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
            <Icon name="ChevronLeft" size={20} />
          </Button>
          <div className="relative flex-shrink-0">
            <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
              {selectedChat.participantAvatar ? (
                <AvatarImage src={selectedChat.participantAvatar} alt={selectedChat.participantName} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xs sm:text-sm">
                  {getInitials(selectedChat.participantName)}
                </AvatarFallback>
              )}
            </Avatar>
            {selectedChat.participantStatus && (
              <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                selectedChat.participantStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
              {selectedChat.participantName}
            </div>
            <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
              Рейтинг: {selectedChat.participantRating}
            </div>
          </div>
        </div>
        <div className="relative flex-shrink-0">
          <Button onClick={() => setShowBlockMenu(!showBlockMenu)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
            <Icon name="MoreVertical" size={18} />
          </Button>
          {showBlockMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowBlockMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden animate-scale-in">
                <button onClick={handleBlock} className="px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 whitespace-nowrap">
                  <Icon name="Ban" size={14} /> Заблокировать
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 bg-slate-50 dark:bg-slate-800/30 border-x border-slate-200 dark:border-white/10 space-y-2.5">
        {loading ? (
          <div className="text-center py-8 text-gray-400">
            <Icon name="Loader2" size={28} className="animate-spin mx-auto mb-2" />
            <p className="text-sm">Загрузка...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Icon name="MessageCircle" className="mx-auto mb-3 opacity-40" size={36} />
            <p className="text-sm">Начните разговор</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-3 py-2 ${
                message.isOwn ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-bl-md'
              }`}>
                <div className="text-sm break-words">{message.text}</div>
                <div className={`text-[10px] mt-0.5 ${message.isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white dark:bg-slate-900/80 border border-t-0 border-slate-200 dark:border-white/10 rounded-b-xl px-3 sm:px-4 py-2.5 sm:py-3 space-y-2">
        {inviteSent ? (
          <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/30">
            <Icon name="Loader2" size={16} className="animate-spin text-amber-500" />
            <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">Ожидание ответа...</span>
            <button onClick={() => { setInviteSent(false); setInviteId(null); if (pollInviteRef.current) clearInterval(pollInviteRef.current); }} className="text-xs text-gray-500 hover:text-gray-700 ml-auto">
              Отмена
            </button>
          </div>
        ) : (
          <div className="flex gap-1.5 sm:gap-2">
            <Button onClick={handleQuickInvite} className="bg-green-600 hover:bg-green-700 text-white border-0 flex-1 text-xs sm:text-sm h-8 sm:h-9">
              <Icon name="Swords" size={15} className="mr-1" />
              Играть {getTimeLabel(lastSettings.time)}
            </Button>
            <Button onClick={() => { setShowGameSetup(!showGameSetup); setShowEmojiPicker(false); }} variant="outline" className="border-blue-300 dark:border-blue-500/40 text-blue-600 dark:text-blue-400 flex-1 text-xs sm:text-sm h-8 sm:h-9">
              <Icon name="Settings" size={15} className="mr-1" />
              Режим
            </Button>
          </div>
        )}

        {showGameSetup && (
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/10 animate-scale-in">
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">Контроль времени:</p>
            <div className="grid grid-cols-4 gap-1">
              {TIME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => sendGameInvite(opt.value)}
                  className="px-1.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-500/30 transition-colors text-center"
                >
                  <div>{opt.label}</div>
                  <div className="text-[8px] sm:text-[9px] text-gray-400">{opt.cat}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {showEmojiPicker && (
          <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 shadow-lg animate-scale-in">
            <div className="grid grid-cols-8 gap-1">
              {emojis.map((emoji, index) => (
                <button key={index} onClick={() => handleEmojiSelect(emoji)} className="text-xl sm:text-2xl hover:bg-slate-100 dark:hover:bg-slate-700 rounded p-0.5 sm:p-1 transition-colors">
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-1.5 sm:gap-2">
          <Button onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowGameSetup(false); }} variant="ghost" size="sm" className="h-9 w-9 p-0 flex-shrink-0">
            <Icon name="Smile" size={18} />
          </Button>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Сообщение..."
            className="flex-1 min-w-0 px-3 py-2 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          />
          <Button onClick={handleSendMessage} disabled={!messageText.trim()} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border-0 h-9 w-9 p-0 flex-shrink-0 rounded-full">
            <Icon name="Send" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;