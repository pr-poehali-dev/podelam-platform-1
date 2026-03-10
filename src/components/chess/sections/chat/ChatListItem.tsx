import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { Chat } from './ChatTypes';

interface ChatListItemProps {
  chat: Chat;
  onSelect: (chat: Chat) => void;
  formatChatTime: (dateString: string) => string;
  getInitials: (name: string) => string;
}

export const ChatListItem = ({ chat, onSelect, formatChatTime, getInitials }: ChatListItemProps) => {
  return (
    <div
      onClick={() => onSelect(chat)}
      className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all cursor-pointer"
    >
      <div className="relative flex-shrink-0">
        <Avatar className="w-11 h-11 sm:w-12 sm:h-12">
          {chat.participantAvatar ? (
            <AvatarImage src={chat.participantAvatar} alt={chat.participantName} />
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
              {getInitials(chat.participantName)}
            </AvatarFallback>
          )}
        </Avatar>
        {chat.participantStatus && (
          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
            chat.participantStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'
          }`} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">{chat.participantName}</span>
          {chat.lastMessageTime && (
            <span className="text-[11px] text-gray-500 dark:text-gray-500 flex-shrink-0">
              {formatChatTime(chat.lastMessageTime)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {chat.lastMessage
              ? (chat.lastMessageIsOwn ? `Вы: ${chat.lastMessage}` : chat.lastMessage)
              : 'Нет сообщений'
            }
          </span>
          {chat.unreadCount > 0 && (
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] font-bold">{chat.unreadCount}</span>
            </div>
          )}
        </div>
      </div>

      <Icon name="ChevronRight" size={18} className="text-gray-400 flex-shrink-0" />
    </div>
  );
};

export default ChatListItem;
