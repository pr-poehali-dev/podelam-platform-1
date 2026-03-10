import { useState } from "react";
import Icon from "@/components/ui/icon";
import { BoardTheme, boardThemes } from "./gameTypes";
import type { P2PQuality } from "./usePeerConnection";
import { shareContent } from "@/lib/share";

interface GameHeaderProps {
  showSettingsMenu: boolean;
  setShowSettingsMenu: (value: boolean) => void;
  setShowChat: (value: boolean) => void;
  unreadChatCount?: number;
  handleExitClick: () => void;
  handleOfferDraw: () => void;
  handleSurrender: () => void;
  handleNewGame: () => void;
  setShowNotifications: (value: boolean) => void;
  showPossibleMoves?: boolean;
  setShowPossibleMoves?: (value: boolean) => void;
  theme?: "light" | "dark";
  setTheme?: (value: "light" | "dark") => void;
  boardTheme?: BoardTheme;
  setBoardTheme?: (value: BoardTheme) => void;
  gameStatus?: "playing" | "checkmate" | "stalemate" | "draw";
  currentPlayer?: "white" | "black";
  playerColor?: "white" | "black";
  setShowRematchOffer?: (value: boolean) => void;
  onOfferRematch?: () => void;
  rematchSent?: boolean;
  rematchCooldown?: boolean;
  rematchTimeoutLeft?: number | null;
  isOnline?: boolean;
  p2pConnected?: boolean;
  p2pQuality?: P2PQuality;
  p2pLatency?: number | null;
  connectionLost?: boolean;
}

export const GameHeader = ({
  theme,
}: GameHeaderProps) => {
  return (
    <header
      className={`backdrop-blur-sm border-b px-4 py-1 flex items-center justify-center flex-shrink-0 ${
        theme === "light"
          ? "bg-white/80 border-slate-300"
          : "bg-stone-900/80 border-stone-700/50"
      }`}
    >
      <h1
        className={`text-xs sm:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r tracking-wide ${
          theme === "light"
            ? "from-amber-600 via-yellow-500 to-amber-600"
            : "from-amber-200 via-yellow-400 to-amber-200"
        }`}
        style={{ fontFamily: "Montserrat, sans-serif", letterSpacing: "0.08em" }}
      >
        Лига Шахмат
      </h1>
    </header>
  );
};

const P2PIndicator = ({ isOnline, p2pConnected, p2pQuality, p2pLatency, connectionLost, theme }: {
  isOnline?: boolean; p2pConnected?: boolean; p2pQuality?: P2PQuality; p2pLatency?: number | null; connectionLost?: boolean; theme?: "light" | "dark";
}) => {
  if (!isOnline) return null;

  const getConfig = () => {
    if (connectionLost) return { color: 'text-red-500', bars: 0, label: 'Нет связи', bg: theme === 'light' ? 'bg-red-50 border-red-200' : 'bg-red-950/40 border-red-800/50' };
    if (!p2pConnected) return { color: theme === 'light' ? 'text-amber-600' : 'text-amber-400', bars: 1, label: 'Сервер', bg: theme === 'light' ? 'bg-amber-50 border-amber-200' : 'bg-amber-950/40 border-amber-800/50' };
    if (p2pQuality === 'excellent') return { color: 'text-emerald-500', bars: 3, label: p2pLatency ? `${p2pLatency}ms` : 'P2P', bg: theme === 'light' ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-950/40 border-emerald-800/50' };
    if (p2pQuality === 'good') return { color: theme === 'light' ? 'text-green-600' : 'text-green-400', bars: 2, label: p2pLatency ? `${p2pLatency}ms` : 'P2P', bg: theme === 'light' ? 'bg-green-50 border-green-200' : 'bg-green-950/40 border-green-800/50' };
    return { color: theme === 'light' ? 'text-orange-600' : 'text-orange-400', bars: 1, label: p2pLatency ? `${p2pLatency}ms` : 'P2P', bg: theme === 'light' ? 'bg-orange-50 border-orange-200' : 'bg-orange-950/40 border-orange-800/50' };
  };

  const { color, bars, bg } = getConfig();
  const barH = [8, 13, 18];

  return (
    <div className={`flex items-center justify-center w-[32px] h-[32px] sm:w-[38px] sm:h-[38px] rounded-lg border flex-shrink-0 ${bg} ${color}`} title={`Соединение: ${p2pConnected ? 'P2P прямое' : connectionLost ? 'потеряно' : 'через сервер'}${p2pLatency ? ` (${p2pLatency}ms)` : ''}`}>
      <div className="flex items-end gap-[3px]" style={{ height: '18px' }}>
        {barH.map((h, i) => (
          <div key={i} className={`w-[4px] rounded-sm transition-all duration-300 ${i < bars ? (connectionLost ? 'bg-red-500' : 'bg-current') : (theme === 'light' ? 'bg-slate-300' : 'bg-stone-600')}`} style={{ height: `${h}px` }} />
        ))}
      </div>
    </div>
  );
};

export const GameControls = ({
  showSettingsMenu,
  setShowSettingsMenu,
  setShowChat,
  unreadChatCount = 0,
  handleExitClick,
  handleOfferDraw,
  handleSurrender,
  handleNewGame,
  setShowNotifications,
  showPossibleMoves,
  setShowPossibleMoves,
  theme,
  setTheme,
  boardTheme,
  setBoardTheme,
  gameStatus,
  currentPlayer,
  playerColor,
  setShowRematchOffer,
  onOfferRematch,
  rematchSent,
  rematchCooldown,
  rematchTimeoutLeft,
  isOnline,
  p2pConnected,
  p2pQuality,
  p2pLatency,
  connectionLost,
}: GameHeaderProps) => {
  const isGameOver = gameStatus && gameStatus !== "playing";
  const themeKeys: BoardTheme[] = ["classic", "flat", "wood"];
  const [shareOk, setShareOk] = useState(false);

  const handleShareResult = async () => {
    const resultText = gameStatus === 'checkmate'
      ? (currentPlayer === playerColor ? 'Поражение' : 'Победа')
      : 'Ничья';
    const ok = await shareContent({
      title: 'Лига Шахмат — Результат партии',
      text: `${resultText} в Лиге Шахмат!`,
    });
    if (ok) { setShareOk(true); setTimeout(() => setShareOk(false), 2000); }
  };
  const resultLabel = isGameOver
    ? gameStatus === "checkmate"
      ? currentPlayer !== playerColor ? "🏆 Победа" : "😞 Поражение"
      : "🤝 Ничья"
    : null;

  const resultColor = isGameOver
    ? gameStatus === "checkmate"
      ? currentPlayer !== playerColor
        ? "bg-green-600/90 border-green-700 text-white"
        : "bg-red-600/90 border-red-700 text-white"
      : "bg-stone-600/90 border-stone-500 text-white"
    : "";

  const btnCls = `border rounded-lg transition-colors w-[32px] h-[32px] sm:w-[38px] sm:h-[38px] flex items-center justify-center flex-shrink-0 ${
    theme === "light"
      ? "bg-white/80 hover:bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900"
      : "bg-stone-800/50 hover:bg-stone-700/50 border-stone-700/30 text-stone-300 hover:text-stone-100"
  }`;

  return (
    <div className="w-full md:w-auto">
      <div className="flex items-center gap-1 sm:gap-1.5 h-[32px] sm:h-[38px]">
        <button onClick={handleExitClick} className={btnCls} title="Выход из игры">
          <div className="rotate-180"><Icon name="LogOut" size={16} /></div>
        </button>
        <button onClick={() => setShowChat(true)} className={`${btnCls} relative`} title="Чат">
          <Icon name="MessageCircle" size={16} />
          {unreadChatCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-0.5 leading-none">
              {unreadChatCount > 9 ? '9+' : unreadChatCount}
            </span>
          )}
        </button>
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            className={btnCls}
            title="Опции"
          >
            <Icon name="Settings" size={16} />
          </button>
          {showSettingsMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowSettingsMenu(false)}
              />
              <div
                className={`absolute left-0 mt-2 w-64 rounded-lg shadow-xl border z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-y-auto ${
                  theme === "light"
                    ? "bg-white border-slate-300"
                    : "bg-stone-800 border-stone-700/50"
                }`}
                style={{ maxHeight: 'min(80vh, calc(100dvh - 120px))', maxWidth: 'calc(100vw - 16px)' }}
              >
                <button
                  onClick={() => {
                    if (setTheme) {
                      const newTheme = theme === "dark" ? "light" : "dark";
                      setTheme(newTheme);
                      localStorage.setItem("chessTheme", newTheme);
                    }
                  }}
                  className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between ${
                    theme === "light"
                      ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                      : "text-stone-300 hover:text-stone-100 hover:bg-stone-700/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon name={theme === "dark" ? "Moon" : "Sun"} size={20} />
                    <span>
                      {theme === "dark" ? "Темная тема" : "Светлая тема"}
                    </span>
                  </div>
                  <div
                    className={`w-10 h-5 rounded-full transition-colors ${theme === "light" ? "bg-amber-500" : "bg-stone-600"} relative`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${theme === "light" ? "translate-x-5" : "translate-x-0.5"}`}
                    />
                  </div>
                </button>
                <button
                  onClick={() => {
                    if (setShowPossibleMoves) {
                      setShowPossibleMoves(!showPossibleMoves);
                    }
                  }}
                  className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between border-t ${
                    theme === "light"
                      ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200"
                      : "text-stone-300 hover:text-stone-100 hover:bg-stone-700/50 border-stone-700/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon name="Eye" size={20} />
                    <span>Показывать ходы</span>
                  </div>
                  <div
                    className={`w-10 h-5 rounded-full transition-colors ${showPossibleMoves ? "bg-green-600" : "bg-stone-600"} relative`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${showPossibleMoves ? "translate-x-5" : "translate-x-0.5"}`}
                    />
                  </div>
                </button>
                <div
                  className={`px-4 py-3 border-t ${
                    theme === "light"
                      ? "border-slate-200"
                      : "border-stone-700/50"
                  }`}
                >
                  <div
                    className={`flex items-center gap-3 mb-2 ${
                      theme === "light" ? "text-slate-700" : "text-stone-300"
                    }`}
                  >
                    <Icon name="LayoutGrid" size={20} />
                    <span>Доска</span>
                  </div>
                  <div className="flex gap-1.5">
                    {themeKeys.map((key) => {
                      const cfg = boardThemes[key];
                      const isActive = boardTheme === key;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            if (setBoardTheme) {
                              setBoardTheme(key);
                              localStorage.setItem("chessBoardTheme", key);
                            }
                          }}
                          className={`flex-1 rounded-md overflow-hidden border-2 transition-all ${
                            isActive
                              ? "border-amber-400 scale-105"
                              : theme === "light"
                                ? "border-slate-300"
                                : "border-stone-600"
                          }`}
                          title={cfg.name}
                        >
                          <div className="grid grid-cols-4 aspect-square">
                            {Array.from({ length: 16 }).map((_, i) => {
                              const r = Math.floor(i / 4);
                              const c = i % 4;
                              const isL = (r + c) % 2 === 0;
                              return (
                                <div
                                  key={i}
                                  style={{
                                    backgroundColor: isL
                                      ? cfg.lightSquare
                                      : cfg.darkSquare,
                                  }}
                                />
                              );
                            })}
                          </div>
                          <div
                            className={`text-[9px] text-center py-0.5 ${
                              theme === "light"
                                ? "text-slate-600 bg-slate-50"
                                : "text-stone-400 bg-stone-700/50"
                            }`}
                          >
                            {cfg.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {!isGameOver && (
                  <>
                    <button
                      onClick={handleOfferDraw}
                      className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 border-t ${
                        theme === "light"
                          ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200"
                          : "text-stone-300 hover:text-stone-100 hover:bg-stone-700/50 border-stone-700/50"
                      }`}
                    >
                      <Icon name="Handshake" size={20} />
                      <span>Предложить ничью</span>
                    </button>
                    <button
                      onClick={handleSurrender}
                      className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 ${
                        theme === "light"
                          ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                          : "text-stone-300 hover:text-stone-100 hover:bg-stone-700/50"
                      }`}
                    >
                      <Icon name="Flag" size={20} />
                      <span>Сдаться</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setShowSettingsMenu(false);
                    setShowNotifications(true);
                  }}
                  className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 border-t ${
                    theme === "light"
                      ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200"
                      : "text-stone-300 hover:text-stone-100 hover:bg-stone-700/50 border-stone-700/50"
                  }`}
                >
                  <Icon name="Bell" size={20} />
                  <span>Уведомления</span>
                </button>
                <button
                  onClick={handleNewGame}
                  className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 border-t ${
                    theme === "light"
                      ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200"
                      : "text-stone-300 hover:text-stone-100 hover:bg-stone-700/50 border-stone-700/50"
                  }`}
                >
                  <Icon name="Plus" size={20} />
                  <span>Новая партия</span>
                </button>
                <div className="md:hidden pb-[env(safe-area-inset-bottom,8px)]" />
              </div>
            </>
          )}
        </div>
        <P2PIndicator isOnline={isOnline} p2pConnected={p2pConnected} p2pQuality={p2pQuality} p2pLatency={p2pLatency} connectionLost={connectionLost} theme={theme} />
        {isGameOver && (
          <div className={`flex items-center gap-1 px-1.5 sm:px-2 h-full rounded-lg border text-[9px] sm:text-[11px] font-bold flex-shrink-0 whitespace-nowrap ${resultColor}`}>
            {resultLabel}
          </div>
        )}
        {isGameOver && (
          <>
            <div className="relative flex-shrink-0">
              <button onClick={handleShareResult} className={btnCls} title="Поделиться">
                {shareOk ? (
                  <Icon name="Check" size={15} className="text-green-400" />
                ) : (
                  <img
                    src="https://cdn.poehali.dev/projects/44b012df-8579-4e50-a646-a3ff586bd941/bucket/fda3fc12-14e8-4207-b40a-00c3b8683b37.png"
                    alt="Поделиться"
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70"
                    style={{ filter: theme === 'light' ? 'invert(0.4)' : 'invert(0.7)' }}
                  />
                )}
              </button>
              {shareOk && (
                <div className="absolute -bottom-8 right-0 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap z-50">
                  Скопировано!
                </div>
              )}
            </div>
            <button
              onClick={() => {
                if (rematchSent || rematchCooldown) return;
                if (onOfferRematch) { onOfferRematch(); }
                else if (setShowRematchOffer) { setTimeout(() => { setShowRematchOffer(true); }, 500); }
              }}
              disabled={rematchSent || rematchCooldown}
              className={`border rounded-lg transition-colors flex items-center gap-1.5 px-2 sm:px-3 h-[32px] sm:h-[38px] flex-shrink-0 text-[11px] sm:text-xs font-semibold ${
                rematchSent
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-400 cursor-not-allowed"
                  : rematchCooldown
                  ? "bg-stone-600/50 border-stone-600 text-stone-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 border-green-700 text-white"
              }`}
              title={rematchCooldown ? "Недоступно" : rematchSent ? "Ожидание ответа..." : "Реванш"}
            >
              <Icon name={rematchSent ? "Loader2" : "RotateCcw"} size={14} className={rematchSent ? "animate-spin" : ""} />
              <span className="hidden sm:inline whitespace-nowrap">
                {rematchSent
                  ? `Ожидание${rematchTimeoutLeft ? ` (${rematchTimeoutLeft}с)` : "..."}`
                  : "Реванш"}
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};