import Icon from '@/components/ui/icon';

interface ChatMessage {
  id: string;
  text: string;
  isOwn: boolean;
  time: string;
}

interface GameChatModalProps {
  opponentName: string;
  opponentIcon: string;
  opponentInfo?: string;
  chatMessages: ChatMessage[];
  chatMessage: string;
  onChatMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onChatKeyPress: (e: React.KeyboardEvent) => void;
  onBlock: () => void;
  onUnblock?: () => void;
  isBlocked?: boolean;
  isBlockedByOpponent?: boolean;
  onClose: () => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
  theme?: 'light' | 'dark';
}

export const GameChatModal = ({
  opponentName,
  opponentIcon,
  opponentInfo,
  chatMessages,
  chatMessage,
  onChatMessageChange,
  onSendMessage,
  onChatKeyPress,
  onBlock,
  onUnblock,
  isBlocked = false,
  isBlockedByOpponent = false,
  onClose,
  chatEndRef,
  theme = 'dark'
}: GameChatModalProps) => {
  const chatDisabled = isBlocked || isBlockedByOpponent;
  const isLight = theme === 'light';

  return (
    <>
      <div
        className={`fixed inset-0 z-50 md:bg-black/50 md:backdrop-blur-sm ${
          isLight ? 'bg-black/30' : 'bg-black/50'
        }`}
        onClick={onClose}
      />

      <div className={`fixed z-50 
        inset-x-0 bottom-0 max-h-[90vh] rounded-t-2xl
        md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl md:w-full md:max-w-lg md:max-h-[80vh]
        flex flex-col shadow-2xl border animate-in slide-in-from-bottom md:slide-in-from-bottom-0 md:fade-in duration-200 ${
          isLight
            ? 'bg-white border-slate-200'
            : 'bg-stone-900 border-stone-700'
        }`}
      >
        <div className="md:hidden w-10 h-1 rounded-full mx-auto mt-2 mb-1 flex-shrink-0" style={{ backgroundColor: isLight ? '#cbd5e1' : '#57534e' }} />

        <div className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${
          isLight ? 'border-slate-200' : 'border-stone-700'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-2xl flex-shrink-0">{opponentIcon}</div>
            <div className="min-w-0">
              <h2 className={`text-base font-bold truncate ${isLight ? 'text-slate-900' : 'text-stone-100'}`}>
                {opponentName}
              </h2>
              {opponentInfo && (
                <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-stone-400'}`}>{opponentInfo}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isBlocked ? (
              <button
                onClick={onUnblock}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  isLight
                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                    : 'bg-green-900/30 text-green-400 border-green-700/50 hover:bg-green-900/50'
                }`}
                title="Разблокировать чат"
              >
                <Icon name="ShieldCheck" size={16} />
                <span className="hidden sm:inline">Разблокировать</span>
              </button>
            ) : (
              <button
                onClick={onBlock}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  isLight
                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                    : 'bg-red-900/20 text-red-400 border-red-700/40 hover:bg-red-900/40'
                }`}
                title="Заблокировать чат"
              >
                <Icon name="ShieldBan" size={16} />
                <span className="hidden sm:inline">Заблокировать</span>
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isLight
                  ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                  : 'hover:bg-stone-800 text-stone-400 hover:text-stone-100'
              }`}
            >
              <Icon name="X" size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] md:min-h-[300px]">
          {chatMessages.length === 0 ? (
            <div className={`text-center py-8 ${isLight ? 'text-slate-400' : 'text-stone-400'}`}>
              <Icon name="MessageCircle" size={40} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Чат с соперником</p>
              <p className="text-xs mt-1 opacity-70">Игра продолжается в фоновом режиме</p>
            </div>
          ) : (
            <>
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
                      message.isOwn
                        ? isLight
                          ? 'bg-amber-500 text-white'
                          : 'bg-amber-600 text-white'
                        : isLight
                          ? 'bg-slate-100 text-slate-900 border border-slate-200'
                          : 'bg-stone-800 text-stone-100 border border-stone-700'
                    }`}
                  >
                    <div className="text-sm break-words">{message.text}</div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        message.isOwn
                          ? 'text-amber-100/80'
                          : isLight ? 'text-slate-400' : 'text-stone-500'
                      }`}
                    >
                      {message.time}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {chatDisabled && (
          <div className={`px-4 py-3 text-center text-sm border-t ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-500'
              : 'bg-stone-800/50 border-stone-700 text-stone-400'
          }`}>
            <div className="flex items-center justify-center gap-2">
              <Icon name="ShieldBan" size={16} />
              {isBlocked
                ? 'Вы заблокировали чат с соперником'
                : 'Соперник заблокировал чат'}
            </div>
            {isBlocked && onUnblock && (
              <button
                onClick={onUnblock}
                className={`mt-2 text-xs underline transition-colors ${
                  isLight ? 'text-amber-600 hover:text-amber-700' : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                Разблокировать
              </button>
            )}
          </div>
        )}

        {!chatDisabled && (
          <div className={`p-3 border-t flex-shrink-0 ${
            isLight ? 'border-slate-200' : 'border-stone-700'
          }`} style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => onChatMessageChange(e.target.value)}
                onKeyPress={onChatKeyPress}
                placeholder="Написать сообщение..."
                className={`flex-1 px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    : 'bg-stone-800 border-stone-700 text-stone-100 placeholder-stone-500'
                }`}
              />
              <button
                onClick={onSendMessage}
                disabled={!chatMessage.trim()}
                className={`px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-1.5 ${
                  isLight
                    ? 'bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 disabled:bg-stone-700 disabled:text-stone-500 text-white'
                }`}
              >
                <Icon name="Send" size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
