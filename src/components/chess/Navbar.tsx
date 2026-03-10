import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { onBadge, emitBadge } from '@/lib/badgeEvents';
import API from '@/config/api';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  isAuthenticated: boolean;
  setShowGameSettings: (value: boolean) => void;
  setShowAuthModal: (value: boolean) => void;
  stats: {
    games: number;
    wins: number;
    rating: number;
    tournaments: number;
  };
}

const Badge = ({ count }: { count: number }) => {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
      {count > 99 ? '99+' : count}
    </span>
  );
};

const Dot = () => (
  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white dark:border-slate-900" />
);

const Navbar = ({ 
  activeSection, 
  setActiveSection, 
  isDarkMode, 
  setIsDarkMode, 
  isAuthenticated,
  setShowGameSettings,
  setShowAuthModal,
  stats 
}: NavbarProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));
    if (window.matchMedia('(display-mode: standalone)').matches) setIsInstalled(true);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      (deferredPrompt as BeforeInstallPromptEvent).prompt();
      const { outcome } = await (deferredPrompt as BeforeInstallPromptEvent).userChoice;
      if (outcome === 'accepted') setIsInstalled(true);
      setDeferredPrompt(null);
    } else {
      const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
      const isIOS = /iPhone|iPad/i.test(navigator.userAgent);
      if (isIOS) {
        alert('Чтобы установить приложение: нажми кнопку «Поделиться» (□↑) внизу Safari, затем «На экран Домой».');
      } else if (isMobile) {
        alert('Чтобы установить: откройте меню браузера (⋮) и выберите «Добавить на главный экран».');
      } else {
        alert('Чтобы установить ярлык: в адресной строке браузера нажмите на иконку установки (⊕) или откройте меню и выберите «Установить приложение».');
      }
    }
  }, [deferredPrompt]);
  const [hasActiveGame, setHasActiveGame] = useState(false);
  const [activeGameUrl, setActiveGameUrl] = useState('');
  const [activeGameLabel, setActiveGameLabel] = useState('');
  const [pendingFriendsCount, setPendingFriendsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkActiveGame = () => {
      const savedBot = localStorage.getItem('activeGame');
      if (savedBot) {
        try {
          const gameState = JSON.parse(savedBot);
          if (gameState.gameStatus === 'playing') {
            setHasActiveGame(true);
            const params = new URLSearchParams();
            if (gameState.difficulty) params.set('difficulty', gameState.difficulty);
            if (gameState.timeControl) params.set('time', gameState.timeControl);
            if (gameState.playerColor) params.set('color', gameState.playerColor);
            if (gameState.opponentName) params.set('opponent_name', encodeURIComponent(gameState.opponentName));
            if (gameState.opponentAvatar) params.set('opponent_avatar', encodeURIComponent(gameState.opponentAvatar));
            setActiveGameUrl(`/game?${params.toString()}`);
            const label = gameState.opponentName && gameState.opponentType !== 'bot'
              ? `Игра vs ${gameState.opponentName}`
              : 'Вернуться к игре';
            setActiveGameLabel(label);
            return;
          }
        } catch { /* ignore */ }
      }

      const savedOnline = localStorage.getItem('activeOnlineGame');
      if (savedOnline) {
        try {
          const onlineState = JSON.parse(savedOnline);
          setHasActiveGame(true);
          setActiveGameUrl(onlineState.url);
          setActiveGameLabel(onlineState.opponentName ? `Игра vs ${onlineState.opponentName}` : 'Вернуться к игре');
          return;
        } catch { /* ignore */ }
      }

      setHasActiveGame(false);
      setActiveGameUrl('');
      setActiveGameLabel('');
    };

    checkActiveGame();
    const interval = setInterval(checkActiveGame, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setPendingFriendsCount(0);
      setUnreadMessagesCount(0);
      return;
    }
    return onBadge((detail) => {
      if (detail.friends !== undefined) setPendingFriendsCount(detail.friends);
      if (detail.messages !== undefined) setUnreadMessagesCount(detail.messages);
    });
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUnread = async () => {
      const saved = localStorage.getItem('chessUser');
      if (!saved) return;
      const u = JSON.parse(saved);
      const uid = 'u_' + (u.email || u.name || 'anonymous').replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
      try {
        const res = await fetch(`${API.chat}?action=conversations&user_id=${encodeURIComponent(uid)}`);
        const data = await res.json();
        const total = (data.conversations || []).reduce((sum: number, c: { unread: number }) => sum + (c.unread || 0), 0);
        emitBadge({ messages: total });
      } catch { /* ignore */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const friendsTotalBadge = pendingFriendsCount + unreadMessagesCount;
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        menuBtnRef.current && !menuBtnRef.current.contains(target)
      ) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showMenu]);

  const handleReturnToGame = () => {
    if (activeGameUrl) {
      window.location.href = activeGameUrl;
    } else {
      navigate('/game');
    }
  };

  return (
    <nav className="border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 backdrop-blur-lg sticky top-0 z-50 animate-fade-in h-[53px] sm:h-[70px]">
      <div className="container mx-auto px-3 sm:px-4 h-full">
        <div className="flex items-center justify-between gap-2 h-full">
          <button 
            onClick={() => setActiveSection('home')}
            className="relative flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <div className="flex-shrink-0 w-[83px] h-[83px] sm:w-[110px] sm:h-[110px]">
              <img
                src="https://cdn.poehali.dev/projects/44b012df-8579-4e50-a646-a3ff586bd941/bucket/82c99961-b454-4287-b988-1e4c6af37144.png"
                alt="Лига Шахмат"
                className="hidden dark:block w-full h-full object-contain"
              />
              <img
                src="https://cdn.poehali.dev/projects/44b012df-8579-4e50-a646-a3ff586bd941/bucket/1aaab56e-153d-441a-9b6c-d026cf31f655.png"
                alt="Лига Шахмат"
                className="block dark:hidden w-full h-full object-contain"
              />
            </div>
            <h1 className="hidden min-[360px]:block text-lg sm:text-2xl font-bold tracking-wide text-slate-900 dark:text-white whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Лига Шахмат
            </h1>
          </button>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-500/30">
                <Icon name="TrendingUp" size={18} className="text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Мой рейтинг:</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.rating}</span>
              </div>
            )}


            {hasActiveGame && location.pathname !== '/game' && (
              <button
                onClick={handleReturnToGame}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition-colors animate-pulse flex-shrink-0"
                title={activeGameLabel || 'Вернуться к игре'}
              >
                <Icon name="Gamepad2" size={18} className="text-white" />
                <span className="text-white text-xs sm:text-sm font-medium hidden sm:inline max-w-[120px] truncate">{activeGameLabel || 'К игре'}</span>
              </button>
            )}

            {!isInstalled && (
              <button
                onClick={handleInstall}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                title="Установить приложение"
              >
                <Icon name="Download" size={22} className="text-slate-600 dark:text-slate-300" />
              </button>
            )}

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              {isDarkMode ? (
                <Icon name="Moon" size={22} className="text-blue-400" />
              ) : (
                <Icon name="Sun" size={22} className="text-yellow-500" />
              )}
            </button>

            {isAuthenticated && (
              <div className="relative">
                <button
                  ref={menuBtnRef}
                  onClick={() => setShowMenu(!showMenu)}
                  className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-700 dark:text-slate-300"
                >
                  <Icon name="Menu" size={24} />
                  {friendsTotalBadge > 0 && <Dot />}
                </button>

                {showMenu && (
                    <div ref={menuRef} className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden z-[100] animate-scale-in">
                      <button
                        onClick={() => {
                          setActiveSection('profile');
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 text-slate-700 dark:text-slate-300"
                      >
                        <Icon name="User" size={20} />
                        <span>Профиль</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveSection('friends');
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-white/10"
                      >
                        <div className="relative">
                          <Icon name="Users" size={20} />
                          {friendsTotalBadge > 0 && <Dot />}
                        </div>
                        <span className="flex-1">Друзья</span>
                        {friendsTotalBadge > 0 && <Badge count={friendsTotalBadge} />}
                      </button>
                      <button
                        onClick={() => {
                          setActiveSection('notifications');
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-white/10"
                      >
                        <Icon name="Bell" size={20} />
                        <span>Уведомления</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveSection('history');
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-white/10"
                      >
                        <Icon name="History" size={20} />
                        <span>История</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveSection('chat');
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-white/10"
                      >
                        <div className="relative">
                          <Icon name="MessageCircle" size={20} />
                          {unreadMessagesCount > 0 && <Dot />}
                        </div>
                        <span className="flex-1">Сообщения</span>
                        <Badge count={unreadMessagesCount} />
                      </button>
                    </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;