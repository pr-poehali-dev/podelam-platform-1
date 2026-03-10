import { useState, useRef, useCallback, useEffect } from 'react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import API from '@/config/api';

export interface ConfirmState {
  open: boolean;
  message: string;
  title?: string;
  variant?: 'danger' | 'info';
  alertOnly?: boolean;
}

export const useGameHandlers = (
  gameStatus: 'playing' | 'checkmate' | 'stalemate' | 'draw', 
  setGameStatus: (status: 'playing' | 'checkmate' | 'stalemate' | 'draw') => void,
  moveCount: number = 0,
  playerColor: 'white' | 'black' = 'white',
  setCurrentPlayer?: (player: 'white' | 'black') => void,
  onlineGameId?: number,
  onlineMoveUrl?: string,
  sendPeerMessage?: (msg: { type: string; data?: unknown }) => boolean,
  onChatMessageRef?: React.MutableRefObject<((text: string) => void) | null>,
  opponentUserId?: string
) => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showDrawOffer, setShowDrawOffer] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRematchOffer, setShowRematchOffer] = useState(false);
  const [showOpponentLeft, setShowOpponentLeft] = useState(false);
  const [opponentLeftReason, setOpponentLeftReason] = useState<'early' | 'surrender' | 'exit'>('exit');
  const [drawOffersCount, setDrawOffersCount] = useState(0);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; text: string; isOwn: boolean; time: string }>>([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [isChatBlocked, setIsChatBlocked] = useState(false);
  const [isChatBlockedByOpponent, setIsChatBlockedByOpponent] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [confirmDialog, setConfirmDialog] = useState<ConfirmState>({ open: false, message: '' });
  const pendingActionRef = useRef<(() => void) | null>(null);

  // Подключаем получение чат-сообщений от соперника через P2P
  useEffect(() => {
    if (!onChatMessageRef) return;
    onChatMessageRef.current = (text: string) => {
      const msg = {
        id: Date.now().toString(),
        text,
        isOwn: false,
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, msg]);
      setUnreadChatCount(prev => prev + 1);
      setTimeout(() => {
        if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      // Сохраняем входящее сообщение в переписку с другом
      if (opponentUserId) {
        const saved = localStorage.getItem('chessUser');
        if (saved) {
          const u = JSON.parse(saved);
          const uid = 'u_' + (u.email || u.name || 'anonymous').replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
          // Сохраняем как сообщение от соперника к нам
          fetch(API.chat, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'send', from_user_id: opponentUserId, to_user_id: uid, text })
          }).catch(() => {});
        }
      }
    };
    return () => { onChatMessageRef.current = null; };
  }, [onChatMessageRef, opponentUserId]);

  const showConfirm = useCallback((message: string, onConfirm: () => void, opts?: { title?: string; variant?: 'danger' | 'info' }) => {
    pendingActionRef.current = onConfirm;
    setConfirmDialog({ open: true, message, title: opts?.title, variant: opts?.variant || 'danger' });
  }, []);

  const showAlert = useCallback((message: string, opts?: { title?: string; variant?: 'danger' | 'info' }) => {
    pendingActionRef.current = null;
    setConfirmDialog({ open: true, message, title: opts?.title, variant: opts?.variant || 'info', alertOnly: true });
  }, []);

  const handleConfirmDialogConfirm = useCallback(() => {
    setConfirmDialog({ open: false, message: '' });
    if (pendingActionRef.current) {
      pendingActionRef.current();
      pendingActionRef.current = null;
    }
  }, []);

  const handleConfirmDialogCancel = useCallback(() => {
    setConfirmDialog({ open: false, message: '' });
    pendingActionRef.current = null;
  }, []);

  const handleMouseDown = (e: React.MouseEvent, historyRef: React.RefObject<HTMLDivElement>) => {
    if (!historyRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - historyRef.current.offsetLeft);
    setScrollLeft(historyRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent, historyRef: React.RefObject<HTMLDivElement>) => {
    if (!isDragging || !historyRef.current) return;
    e.preventDefault();
    const x = e.pageX - historyRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    historyRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleExitClick = () => {
    if (gameStatus !== 'playing') {
      navigate('/');
    } else {
      if (moveCount <= 2) {
        showConfirm(
          'Выйти из игры? Так как партия только началась (менее 3 ходов), это не повлияет на рейтинг.',
          () => {
            localStorage.removeItem('activeGame');
            navigate('/');
          },
          { title: 'Выход из игры' }
        );
      } else {
        setShowExitDialog(true);
      }
    }
  };

  const doSurrender = () => {
    if (moveCount <= 2) {
      localStorage.removeItem('activeGame');
      navigate('/');
    } else {
      if (setCurrentPlayer) setCurrentPlayer(playerColor);
      setGameStatus('checkmate');
      // Уведомляем соперника по P2P о сдаче
      if (sendPeerMessage) {
        sendPeerMessage({ type: 'resign' });
      }
      if (onlineGameId && onlineMoveUrl) {
        const saved = localStorage.getItem('chessUser');
        if (saved) {
          const uData = JSON.parse(saved);
          const rawId = uData.email || uData.name || 'anonymous';
          const userId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
          fetch(onlineMoveUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'resign', game_id: onlineGameId, user_id: userId })
          }).catch(() => {});
        }
      }
    }
    setShowExitDialog(false);
  };

  const handleSurrender = () => {
    setShowSettingsMenu(false);

    const message = moveCount <= 2
      ? 'Выйти из игры? Так как партия только началась (менее 3 ходов), это не повлияет на рейтинг.'
      : 'Вы действительно хотите сдаться? Партия будет засчитана как поражение.';

    const title = moveCount <= 2 ? 'Выход из игры' : 'Сдаться';

    showConfirm(message, doSurrender, { title });
  };

  const handleContinue = () => {
    setShowExitDialog(false);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const text = chatMessage.trim();
    const newMessage = {
      id: Date.now().toString(),
      text,
      isOwn: true,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatMessage('');

    // Отправляем через P2P, при неудаче — через сервер (эфемерно, без хранения)
    const sent = sendPeerMessage ? sendPeerMessage({ type: 'chat', data: { text } }) : false;
    if (!sent && onlineGameId && onlineMoveUrl) {
      const saved = localStorage.getItem('chessUser');
      if (saved) {
        const u = JSON.parse(saved);
        const uid = 'u_' + (u.email || u.name || 'anonymous').replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
        fetch(onlineMoveUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'chat', game_id: onlineGameId, user_id: uid, text })
        }).catch(() => {});
      }
    }

    // Сохраняем в переписку с другом (чат вне партии)
    if (opponentUserId) {
      const saved = localStorage.getItem('chessUser');
      if (saved) {
        const u = JSON.parse(saved);
        const uid = 'u_' + (u.email || u.name || 'anonymous').replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
        fetch(API.chat, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send', from_user_id: uid, to_user_id: opponentUserId, text })
        }).catch(() => {});
      }
    }

    setTimeout(() => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBlockOpponent = () => {
    setIsChatBlocked(true);
  };

  const handleUnblockOpponent = () => {
    setIsChatBlocked(false);
  };

  const handleOfferDraw = () => {
    setShowSettingsMenu(false);
    
    if (drawOffersCount >= 2) {
      showAlert('Вы уже предлагали ничью 2 раза. Больше нельзя предлагать ничью в этой партии.', { title: 'Ничья' });
      return;
    }
    
    setDrawOffersCount(drawOffersCount + 1);

    if (onlineGameId && onlineMoveUrl) {
      const saved = localStorage.getItem('chessUser');
      if (saved) {
        const uData = JSON.parse(saved);
        const rawId = uData.email || uData.name || 'anonymous';
        const userId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
        fetch(onlineMoveUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'draw_offer', game_id: onlineGameId, user_id: userId })
        }).catch(() => {});
      }
      showAlert('Предложение ничьей отправлено сопернику.', { title: 'Ничья', variant: 'info' });
    } else {
      // Оффлайн/бот — сразу показываем модал
      setTimeout(() => setShowDrawOffer(true), 500);
    }
  };

  const handleAcceptDraw = () => {
    setShowDrawOffer(false);
    setGameStatus('draw');
    if (onlineGameId && onlineMoveUrl) {
      const saved = localStorage.getItem('chessUser');
      if (saved) {
        const uData = JSON.parse(saved);
        const rawId = uData.email || uData.name || 'anonymous';
        const userId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
        fetch(onlineMoveUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'draw', game_id: onlineGameId, user_id: userId })
        }).catch(() => {});
      }
    }
  };

  const handleDeclineDraw = () => {
    setShowDrawOffer(false);
    if (onlineGameId && onlineMoveUrl) {
      const saved = localStorage.getItem('chessUser');
      if (saved) {
        const uData = JSON.parse(saved);
        const rawId = uData.email || uData.name || 'anonymous';
        const userId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
        fetch(onlineMoveUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'draw_decline', game_id: onlineGameId, user_id: userId })
        }).catch(() => {});
      }
    }
  };

  const handleNewGame = () => {
    setShowSettingsMenu(false);
    
    if (gameStatus === 'playing') {
      showConfirm(
        'Чтобы начать новую партию, необходимо завершить текущую. Сдаться и начать новую игру?',
        () => {
          setGameStatus('checkmate');
          setTimeout(() => window.location.reload(), 1500);
        },
        { title: 'Новая партия' }
      );
    } else {
      window.location.reload();
    }
  };

  const handleAcceptRematch = async () => {
    setShowRematchOffer(false);
    if (onlineGameId && onlineMoveUrl) {
      const saved = localStorage.getItem('chessUser');
      if (!saved) return;
      const uData = JSON.parse(saved);
      const rawId = uData.email || uData.name || 'anonymous';
      const userId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
      try {
        const res = await fetch(onlineMoveUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'rematch_accept', game_id: onlineGameId, user_id: userId })
        });
        const data = await res.json();
        if (data.new_game_id) {
          const myOldColor = playerColor;
          const newColor = myOldColor === 'white' ? 'black' : 'white';
          const params = new URLSearchParams(window.location.search);
          params.set('online_game_id', String(data.new_game_id));
          params.set('color', newColor);
          params.set('online', 'true');
          window.location.href = `/game?${params.toString()}`;
        }
      } catch { /* ignore */ }
    } else {
      window.location.reload();
    }
  };

  const handleDeclineRematch = (expired?: boolean) => {
    setShowRematchOffer(false);
    if (onlineGameId && onlineMoveUrl) {
      const saved = localStorage.getItem('chessUser');
      if (!saved) return;
      const uData = JSON.parse(saved);
      const rawId = uData.email || uData.name || 'anonymous';
      const userId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
      fetch(onlineMoveUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: expired ? 'rematch_expired' : 'rematch_decline', game_id: onlineGameId, user_id: userId })
      }).catch(() => {});
    }
  };

  const handleOfferRematch = async (toUserId?: string, timeControl?: string): Promise<{ error?: string; inviteId?: number }> => {
    if (!toUserId) return { error: 'Нет данных о сопернике' };
    const saved = localStorage.getItem('chessUser');
    if (!saved) return {};
    const uData = JSON.parse(saved);
    const rawId = uData.email || uData.name || 'anonymous';
    const userId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
    try {
      const res = await fetch(API.inviteGame, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          from_user_id: userId,
          to_user_id: toUserId,
          time_control: timeControl || '10+0',
          color_choice: 'random'
        })
      });
      const data = await res.json();
      if (data.invite_id) return { inviteId: data.invite_id };
      return { error: data.message || 'Реванш недоступен' };
    } catch {
      return { error: 'Ошибка сети' };
    }
  };

  const openChat = () => {
    setShowChat(true);
    setUnreadChatCount(0);
  };

  return {
    isDragging,
    showExitDialog,
    showChat,
    setShowChat,
    openChat,
    unreadChatCount,
    showSettingsMenu,
    setShowSettingsMenu,
    showDrawOffer,
    setShowDrawOffer,
    showNotifications,
    setShowNotifications,
    showRematchOffer,
    setShowRematchOffer,
    showOpponentLeft,
    setShowOpponentLeft,
    opponentLeftReason,
    chatMessage,
    setChatMessage,
    chatMessages,
    chatEndRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUpOrLeave,
    handleExitClick,
    handleSurrender,
    handleContinue,
    handleSendMessage,
    handleChatKeyPress,
    handleBlockOpponent,
    handleUnblockOpponent,
    isChatBlocked,
    isChatBlockedByOpponent,
    handleOfferDraw,
    handleAcceptDraw,
    handleDeclineDraw,
    handleNewGame,
    handleAcceptRematch,
    handleDeclineRematch,
    handleOfferRematch,
    confirmDialog,
    handleConfirmDialogConfirm,
    handleConfirmDialogCancel
  };
};