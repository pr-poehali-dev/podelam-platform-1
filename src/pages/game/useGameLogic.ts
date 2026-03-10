import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Board, Position, initialBoard, getInitialTime, getIncrement, CastlingRights, BoardTheme } from './gameTypes';
import { getPossibleMoves, getBestMove, isCheckmate, isStalemate, getAllLegalMoves, isInCheck, findKing } from './gameLogic';
import { usePeerConnection, PeerMessage } from './usePeerConnection';
import { queueGameResult } from '@/lib/serviceWorker';
import API from '@/config/api';
import { cachedGameHistory, invalidateGameHistory } from '@/lib/apiCache';
const FINISH_GAME_URL = API.finishGame;
const ONLINE_MOVE_URL = API.onlineMove;

function replayMoves(moves: string[]): {
  board: Board;
  boardHistory: Board[];
  currentPlayer: 'white' | 'black';
  castlingRights: CastlingRights;
  enPassantTarget: Position | null;
  capturedByWhite: {type: string; color: string}[];
  capturedByBlack: {type: string; color: string}[];
  kingInCheck: Position | null;
  status: 'playing' | 'checkmate' | 'stalemate';
} {
  let curBoard: Board = initialBoard.map(row => row.map(cell => cell ? { ...cell } : null));
  const boardHistory: Board[] = [curBoard.map(row => row.map(cell => cell ? { ...cell } : null))];
  const cr: CastlingRights = { whiteKingSide: true, whiteQueenSide: true, blackKingSide: true, blackQueenSide: true };
  let ep: Position | null = null;
  let player: 'white' | 'black' = 'white';
  const captW: {type: string; color: string}[] = [];
  const captB: {type: string; color: string}[] = [];

  for (const notation of moves) {
    const parts = notation.split('-');
    if (parts.length !== 2) continue;
    const fromCol = parts[0].charCodeAt(0) - 97;
    const fromRow = 8 - parseInt(parts[0][1]);
    const toCol = parts[1].charCodeAt(0) - 97;
    const toRow = 8 - parseInt(parts[1][1]);

    const newBoard = curBoard.map(row => row.map(cell => cell ? { ...cell } : null));
    const piece = newBoard[fromRow][fromCol];
    if (!piece) continue;

    const captured = newBoard[toRow][toCol];

    if (piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
      const isKingSide = toCol > fromCol;
      const rookFromCol = isKingSide ? 7 : 0;
      const rookToCol = isKingSide ? toCol - 1 : toCol + 1;
      newBoard[fromRow][rookToCol] = newBoard[fromRow][rookFromCol];
      newBoard[fromRow][rookFromCol] = null;
    }

    if (piece.type === 'pawn' && toCol !== fromCol && !captured) {
      const capturedRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
      const epCaptured = newBoard[capturedRow][toCol];
      if (epCaptured) {
        if (piece.color === 'white') captW.push({type: epCaptured.type, color: epCaptured.color});
        else captB.push({type: epCaptured.type, color: epCaptured.color});
      }
      newBoard[capturedRow][toCol] = null;
    }

    if (captured) {
      if (piece.color === 'white') captW.push({type: captured.type, color: captured.color});
      else captB.push({type: captured.type, color: captured.color});
    }

    const promotionRow = piece.color === 'white' ? 0 : 7;
    if (piece.type === 'pawn' && toRow === promotionRow) {
      newBoard[toRow][toCol] = { type: 'queen', color: piece.color };
    } else {
      newBoard[toRow][toCol] = piece;
    }
    newBoard[fromRow][fromCol] = null;

    if (piece.type === 'king') {
      if (piece.color === 'white') { cr.whiteKingSide = false; cr.whiteQueenSide = false; }
      else { cr.blackKingSide = false; cr.blackQueenSide = false; }
    }
    if (piece.type === 'rook') {
      if (piece.color === 'white') {
        if (fromCol === 0) cr.whiteQueenSide = false;
        if (fromCol === 7) cr.whiteKingSide = false;
      } else {
        if (fromCol === 0) cr.blackQueenSide = false;
        if (fromCol === 7) cr.blackKingSide = false;
      }
    }

    ep = null;
    if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
      ep = { row: piece.color === 'white' ? fromRow - 1 : fromRow + 1, col: fromCol };
    }

    player = piece.color === 'white' ? 'black' : 'white';
    curBoard = newBoard;
    boardHistory.push(newBoard.map(row => row.map(cell => cell ? { ...cell } : null)));
  }

  let kingInCheck: Position | null = null;
  if (isInCheck(curBoard, player)) {
    kingInCheck = findKing(curBoard, player);
  }

  let status: 'playing' | 'checkmate' | 'stalemate' = 'playing';
  if (moves.length > 0) {
    if (isCheckmate(curBoard, player, cr, ep)) status = 'checkmate';
    else if (isStalemate(curBoard, player, cr, ep)) status = 'stalemate';
  }

  return {
    board: curBoard,
    boardHistory,
    currentPlayer: player,
    castlingRights: cr,
    enPassantTarget: ep,
    capturedByWhite: captW,
    capturedByBlack: captB,
    kingInCheck,
    status
  };
}

export const useGameLogic = (
  difficulty: 'easy' | 'medium' | 'hard' | 'master',
  timeControl: string,
  playerColor: 'white' | 'black' = 'white',
  onlineGameId?: number
) => {
  const isOnlineGame = !!onlineGameId;
  const botColor = playerColor === 'white' ? 'black' : 'white';
  const loadGameState = () => {
    if (isOnlineGame) return null;
    const saved = localStorage.getItem('activeGame');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  };

  const savedState = loadGameState();

  const [board, setBoard] = useState<Board>(savedState?.board || initialBoard);
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>(savedState?.currentPlayer || 'white');
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);
  const [whiteTime, setWhiteTime] = useState(savedState?.whiteTime || getInitialTime(timeControl));
  const [blackTime, setBlackTime] = useState(savedState?.blackTime || getInitialTime(timeControl));
  const [gameStatus, setGameStatus] = useState<'playing' | 'checkmate' | 'stalemate' | 'draw'>(savedState?.gameStatus || 'playing');
  const [moveHistory, setMoveHistory] = useState<string[]>(savedState?.moveHistory || []);
  const [boardHistory, setBoardHistory] = useState<Board[]>(savedState?.boardHistory || [initialBoard]);
  const [moveTimes, setMoveTimes] = useState<string[]>(savedState?.moveTimes || []);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(savedState?.currentMoveIndex || 0);
  const [inactivityTimer, setInactivityTimer] = useState(60);
  const [opponentInactivityTimer, setOpponentInactivityTimer] = useState(60);
  const [capturedByWhite, setCapturedByWhite] = useState<{type: string; color: string}[]>(savedState?.capturedByWhite || []);
  const [capturedByBlack, setCapturedByBlack] = useState<{type: string; color: string}[]>(savedState?.capturedByBlack || []);
  const [castlingRights, setCastlingRights] = useState<CastlingRights>(savedState?.castlingRights || {
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true
  });
  const [enPassantTarget, setEnPassantTarget] = useState<Position | null>(savedState?.enPassantTarget || null);
  const [kingInCheckPosition, setKingInCheckPosition] = useState<Position | null>(null);
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);
  const [showPossibleMoves, setShowPossibleMoves] = useState<boolean>(
    savedState?.showPossibleMoves !== undefined ? savedState.showPossibleMoves : true
  );
  const [theme, setTheme] = useState<'light' | 'dark'>(
    savedState?.theme || (localStorage.getItem('chessTheme') as 'light' | 'dark') || 'dark'
  );
  const [boardTheme, setBoardTheme] = useState<BoardTheme>(
    savedState?.boardTheme || (localStorage.getItem('chessBoardTheme') as BoardTheme) || 'wood'
  );
  const [endReason, setEndReason] = useState<string | null>(null);
  const [rematchOfferedBy, setRematchOfferedBy] = useState<string | null>(null);
  const [rematchStatus, setRematchStatus] = useState<string | null>(null);
  const [rematchGameId, setRematchGameId] = useState<number | null>(null);
  const [drawOfferedBy, setDrawOfferedBy] = useState<string | null>(null);
  const [ratingChange, setRatingChange] = useState<number | null>(null);
  const [newRating, setNewRating] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number | null>(() => {
    const saved = localStorage.getItem('chessUser');
    return saved ? JSON.parse(saved).rating || null : null;
  });
  const [onlineReady, setOnlineReady] = useState(!isOnlineGame);
  const onlineReadyRef = useRef(!isOnlineGame);
  const [connectionLost, setConnectionLost] = useState(false);
  const [connectionRestored, setConnectionRestored] = useState(false);
  const [opponentReconnecting, setOpponentReconnecting] = useState(false);
  const [opponentUserId, setOpponentUserId] = useState<string>('');
  const pollFailCountRef = useRef(0);

  const historyRef = useRef<HTMLDivElement>(null);
  const onChatMessageRef = useRef<((text: string) => void) | null>(null);
  const hasPlayedWarning = useRef(false);
  const gameFinished = useRef(false);
  const gameStartTime = useRef(savedState?.gameStartTime || Date.now());
  const serverMoveCountRef = useRef(0);
  const serverMoveNumberRef = useRef(0);
  const pendingMoveRef = useRef<string | null>(null);
  const gameEndProcessedRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const myUserId = useMemo(() => {
    const saved = localStorage.getItem('chessUser');
    if (!saved) return '';
    const userData = JSON.parse(saved);
    const rawId = userData.email || userData.name || 'anonymous';
    return 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
  }, []);

  const handleP2PMessage = useCallback((msg: PeerMessage) => {
    if (msg.type === 'move' && msg.data) {
      const moveData = msg.data as { move: string; whiteTime: number; blackTime: number; gameStatus: string; winnerId?: string };
      const allMoves = [...moveHistory, moveData.move];
      const result = replayMoves(allMoves);

      if (allMoves.length > 0) {
        const lastNotation = allMoves[allMoves.length - 1];
        const parts = lastNotation.split('-');
        if (parts.length === 2) {
          const fromCol = parts[0].charCodeAt(0) - 97;
          const fromRow = 8 - parseInt(parts[0][1]);
          const toCol = parts[1].charCodeAt(0) - 97;
          const toRow = 8 - parseInt(parts[1][1]);
          setLastMove({ from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } });
        }
      }

      setBoard(result.board);
      setBoardHistory(result.boardHistory);
      setMoveHistory(allMoves);
      setCurrentMoveIndex(result.boardHistory.length - 1);
      setCurrentPlayer(result.currentPlayer);
      setCastlingRights(result.castlingRights);
      setEnPassantTarget(result.enPassantTarget);
      setCapturedByWhite(result.capturedByWhite);
      setCapturedByBlack(result.capturedByBlack);
      setKingInCheckPosition(result.kingInCheck);
      setSelectedSquare(null);
      setPossibleMoves([]);
      setWhiteTime(moveData.whiteTime);
      setBlackTime(moveData.blackTime);

      if (moveData.gameStatus === 'checkmate') setGameStatus('checkmate');
      else if (moveData.gameStatus === 'stalemate') setGameStatus('stalemate');

      pendingMoveRef.current = null;
      playMoveSound();
    } else if (msg.type === 'resign') {
      setGameStatus('checkmate');
      setEndReason('resign');
      setCurrentPlayer(playerColor === 'white' ? 'black' : 'white');
      gameEndProcessedRef.current = true;
    } else if (msg.type === 'draw') {
      setGameStatus('draw');
      setEndReason('draw');
      gameEndProcessedRef.current = true;
    } else if (msg.type === 'time_sync' && msg.data) {
      const sync = msg.data as { whiteTime: number; blackTime: number };
      setWhiteTime(sync.whiteTime);
      setBlackTime(sync.blackTime);
    } else if (msg.type === 'chat' && msg.data) {
      const chatData = msg.data as { text: string };
      if (onChatMessageRef.current) onChatMessageRef.current(chatData.text);
    }
  }, [moveHistory, playerColor]);

  const { p2pConnected, p2pAttempted, latency: p2pLatency, quality: p2pQuality, sendPeerMessage, processSignals } = usePeerConnection({
    gameId: onlineGameId || 0,
    userId: myUserId,
    isWhite: playerColor === 'white',
    onMessage: handleP2PMessage,
    enabled: isOnlineGame && !!(onlineGameId) && !!myUserId,
  });

  const displayBoard = useMemo(() => {
    return boardHistory[currentMoveIndex] || initialBoard;
  }, [boardHistory, currentMoveIndex]);

  useEffect(() => {
    const saved = localStorage.getItem('chessUser');
    if (!saved) return;
    const userData = JSON.parse(saved);
    const rawId = userData.email || userData.name || 'anonymous';
    const userId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
    cachedGameHistory(userId)
      .then(data => {
        if (data.user?.rating) {
          setUserRating(data.user.rating);
        }
      })
      .catch(() => {});
  }, []);

  const playWarningSound = () => {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  useEffect(() => {
    const initAudio = () => {
      if (!audioCtxRef.current) {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AC();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    };
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });
    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, []);

  const playMoveSound = useCallback(() => {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 440;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch { /* audio not available */ }
  }, []);

  useEffect(() => {
    if (gameStatus !== 'playing') return;
    const updateInterval = currentPlayer === 'white' && whiteTime <= 10
      ? 100
      : currentPlayer === 'black' && blackTime <= 10
      ? 100
      : 1000;
    const timer = setInterval(() => {
      if (currentPlayer === 'white') {
        setWhiteTime(prev => {
          if (prev <= 0) { setGameStatus('checkmate'); return 0; }
          const decrement = prev <= 10 ? 0.1 : 1;
          return Math.max(0, prev - decrement);
        });
      } else {
        setBlackTime(prev => {
          if (prev <= 0) { setGameStatus('checkmate'); return 0; }
          const decrement = prev <= 10 ? 0.1 : 1;
          return Math.max(0, prev - decrement);
        });
      }
    }, updateInterval);
    return () => clearInterval(timer);
  }, [currentPlayer, gameStatus, whiteTime, blackTime]);

  const hasPlayedOpponentWarning = useRef(false);
  const inactivitySyncRef = useRef<number>(0);

  const sendInactivityTimeout = useCallback((losingPlayer: 'white' | 'black') => {
    if (!isOnlineGame || !onlineGameId) return;
    const saved = localStorage.getItem('chessUser');
    if (!saved) return;
    const uData = JSON.parse(saved);
    const rawId = uData.email || uData.name || 'anonymous';
    const userId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
    fetch(ONLINE_MOVE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'timeout', game_id: onlineGameId, user_id: userId, loser_color: losingPlayer })
    }).catch(() => {});
  }, [isOnlineGame, onlineGameId]);

  useEffect(() => {
    if (gameStatus !== 'playing') return;
    const isMyTurn = currentPlayer === playerColor;

    if (isMyTurn) {
      setInactivityTimer(60);
      hasPlayedWarning.current = false;
    } else if (isOnlineGame) {
      setOpponentInactivityTimer(Math.max(0, 60 - (inactivitySyncRef.current || 0)));
      hasPlayedOpponentWarning.current = false;
    }

    const inactivityInterval = setInterval(() => {
      if (isMyTurn) {
        setInactivityTimer(prev => {
          if (prev === 20 && !hasPlayedWarning.current) {
            playWarningSound();
            hasPlayedWarning.current = true;
          }
          if (prev <= 1) {
            if (isOnlineGame) {
              sendInactivityTimeout(currentPlayer);
            }
            setGameStatus('checkmate');
            return 0;
          }
          return prev - 1;
        });
      } else if (isOnlineGame) {
        setOpponentInactivityTimer(prev => {
          if (prev === 20 && !hasPlayedOpponentWarning.current) {
            playWarningSound();
            hasPlayedOpponentWarning.current = true;
          }
          if (prev <= 1) {
            sendInactivityTimeout(currentPlayer);
            setGameStatus('checkmate');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(inactivityInterval);
  }, [currentPlayer, gameStatus, isOnlineGame, playerColor]);

  useEffect(() => {
    if (isOnlineGame) return;
    if (currentPlayer === botColor && gameStatus === 'playing') {
      setCurrentMoveIndex(boardHistory.length - 1);
      const delay = difficulty === 'easy' ? 1500 : difficulty === 'medium' ? 2500 : difficulty === 'hard' ? 2000 : 1000;
      const timer = setTimeout(() => makeComputerMove(), delay);
      return () => {
        clearTimeout(timer);
        if (workerRef.current) { workerRef.current.terminate(); workerRef.current = null; }
      };
    }
  }, [currentPlayer, gameStatus]);

  useEffect(() => {
    if (isOnlineGame) return;
    if (gameStatus === 'playing') {
      const gameState = {
        board, currentPlayer, whiteTime, blackTime, gameStatus,
        moveHistory, boardHistory, currentMoveIndex,
        gameStartTime: gameStartTime.current,
        difficulty, timeControl, capturedByWhite, capturedByBlack,
        castlingRights, enPassantTarget, showPossibleMoves,
        theme, boardTheme, moveTimes
      };
      localStorage.setItem('activeGame', JSON.stringify(gameState));
    } else {
      localStorage.removeItem('activeGame');
    }
  }, [board, currentPlayer, whiteTime, blackTime, gameStatus, moveHistory, boardHistory, currentMoveIndex, difficulty, timeControl, capturedByWhite, capturedByBlack, castlingRights, enPassantTarget, showPossibleMoves, theme, boardTheme, moveTimes, isOnlineGame]);

  const sendMoveToServer = useCallback(async (move: string, gameStatusVal: string, winnerId?: string) => {
    if (!isOnlineGame || !onlineGameId) return;
    const saved = localStorage.getItem('chessUser');
    if (!saved) return;
    const uData = JSON.parse(saved);
    const rawId = uData.email || uData.name || 'anonymous';
    const userId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
    try {
      const res = await fetch(ONLINE_MOVE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'move',
          game_id: onlineGameId,
          user_id: userId,
          move,
          board_state: '',
          game_status: gameStatusVal,
          winner_id: winnerId || '',
          move_number: serverMoveNumberRef.current
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.move_number !== undefined) {
          serverMoveNumberRef.current = data.move_number;
        }
      } else {
        console.warn('Move rejected/conflict:', res.status, '— resetting to server state');
        pendingMoveRef.current = null;
        serverMoveCountRef.current = 0;
      }
    } catch(e) {
      console.error('sendMove error', e);
      pendingMoveRef.current = null;
      serverMoveCountRef.current = 0;
    }
  }, [isOnlineGame, onlineGameId]);

  const applyServerState = useCallback((serverMoves: string[], wTime: number, bTime: number, serverStatus: string, moveNumber?: number, winner?: string, endReason?: string, secondsSinceMove?: number) => {
    if (gameEndProcessedRef.current) return;
    if (pendingMoveRef.current && serverMoves.length < serverMoveCountRef.current) return;
    if (pendingMoveRef.current && serverMoves.length === serverMoveCountRef.current && serverStatus !== 'finished') return;
    const prevCount = serverMoveCountRef.current;
    const movesChanged = serverMoves.length !== prevCount;
    serverMoveCountRef.current = serverMoves.length;

    if (moveNumber !== undefined) {
      serverMoveNumberRef.current = moveNumber;
    }

    const opponentMoved = serverMoves.length > prevCount && prevCount > 0;

    if (movesChanged || serverStatus === 'finished') {
      const result = replayMoves(serverMoves);

      if (opponentMoved && serverMoves.length > 0) {
        const lastNotation = serverMoves[serverMoves.length - 1];
        const parts = lastNotation.split('-');
        if (parts.length === 2) {
          const fromCol = parts[0].charCodeAt(0) - 97;
          const fromRow = 8 - parseInt(parts[0][1]);
          const toCol = parts[1].charCodeAt(0) - 97;
          const toRow = 8 - parseInt(parts[1][1]);
          setLastMove({ from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } });
        }
      }

      setBoard(result.board);
      setBoardHistory(result.boardHistory);
      setMoveHistory(serverMoves);
      setCurrentMoveIndex(result.boardHistory.length - 1);
      setCurrentPlayer(result.currentPlayer);
      setCastlingRights(result.castlingRights);
      setEnPassantTarget(result.enPassantTarget);
      setCapturedByWhite(result.capturedByWhite);
      setCapturedByBlack(result.capturedByBlack);
      setKingInCheckPosition(result.kingInCheck);
      setSelectedSquare(null);
      setPossibleMoves([]);

      if (serverStatus === 'finished' || result.status !== 'playing') {
        if (result.status === 'checkmate') setGameStatus('checkmate');
        else if (result.status === 'stalemate') setGameStatus('stalemate');
        else if (serverStatus === 'finished') {
          if (endReason === 'draw' || endReason === 'stalemate') setGameStatus('draw');
          else setGameStatus('checkmate');
        }

        if (serverStatus === 'finished') {
          if (endReason) setEndReason(endReason);

          if (winner) {
            const saved = localStorage.getItem('chessUser');
            if (saved) {
              const uData = JSON.parse(saved);
              const rawId = uData.email || uData.name || 'anonymous';
              const myId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
              if (winner === myId) {
                setCurrentPlayer(playerColor === 'white' ? 'black' : 'white');
              } else {
                setCurrentPlayer(playerColor);
              }
            }
          }
        }

        gameEndProcessedRef.current = true;
      }

      if (secondsSinceMove !== undefined) {
        inactivitySyncRef.current = secondsSinceMove;
        const remaining = Math.max(0, 60 - secondsSinceMove);
        if (result.currentPlayer === playerColor) {
          setInactivityTimer(remaining);
          setOpponentReconnecting(false);
        } else {
          // Если соперник долго не ходит — показываем баннер "переподключается"
          // и даём ему увеличенный лимит (90 сек)
          const extendedRemaining = Math.max(0, 90 - secondsSinceMove);
          setOpponentInactivityTimer(extendedRemaining);
          if (secondsSinceMove > 10 && secondsSinceMove < 80) {
            setOpponentReconnecting(true);
          } else {
            setOpponentReconnecting(false);
          }
        }
      }

      pendingMoveRef.current = null;

      if (opponentMoved && result.currentPlayer === playerColor) {
        playMoveSound();
      }

      setTimeout(() => {
        if (historyRef.current) {
          historyRef.current.scrollLeft = historyRef.current.scrollWidth;
        }
      }, 10);
    } else {
      if (secondsSinceMove !== undefined) {
        inactivitySyncRef.current = secondsSinceMove;
      }
    }

    setWhiteTime(wTime);
    setBlackTime(bTime);
  }, [playerColor, playMoveSound]);

  // Отправляем reconnect при старте — сбрасываем таймер бездействия на сервере
  useEffect(() => {
    if (!isOnlineGame || !onlineGameId || !myUserId) return;
    fetch(ONLINE_MOVE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reconnect', game_id: onlineGameId, user_id: myUserId })
    }).catch(() => {});
  }, [isOnlineGame, onlineGameId, myUserId]);

  useEffect(() => {
    if (!isOnlineGame || !onlineGameId) return;
    let active = true;

    const poll = async () => {
      try {
        let url = `${ONLINE_MOVE_URL}?game_id=${onlineGameId}`;
        if (myUserId) url += `&user_id=${encodeURIComponent(myUserId)}`;
        const res = await fetch(url);
        if (!res.ok) {
          pollFailCountRef.current++;
          if (pollFailCountRef.current >= 4) setConnectionLost(true);
          return;
        }
        const data = await res.json();
        if (!active || !data.game) return;

        if (pollFailCountRef.current >= 4) {
          setConnectionRestored(true);
          setTimeout(() => setConnectionRestored(false), 3000);
        }
        pollFailCountRef.current = 0;
        setConnectionLost(false);

        if (data.signals && data.signals.length > 0) {
          const chatSignals = data.signals.filter((s: { type: string }) => s.type === 'chat');
          const rtcSignals = data.signals.filter((s: { type: string }) => s.type !== 'chat');
          for (const s of chatSignals) {
            try {
              const payload = JSON.parse(s.data);
              if (payload.text && onChatMessageRef.current) onChatMessageRef.current(payload.text);
            } catch { /* ignore */ }
          }
          if (rtcSignals.length > 0) processSignals(rtcSignals);
        }

        if (!p2pConnected) {
          const serverMoves: string[] = data.game.move_history
            ? data.game.move_history.split(',').filter(Boolean)
            : [];

          if (data.game.seconds_since_move !== undefined) {
            inactivitySyncRef.current = data.game.seconds_since_move;
          }

          applyServerState(
            serverMoves,
            data.game.white_time ?? getInitialTime(timeControl),
            data.game.black_time ?? getInitialTime(timeControl),
            data.game.status,
            data.game.move_number,
            data.game.winner,
            data.game.end_reason,
            data.game.seconds_since_move
          );
        }

        if (data.game.rematch_offered_by) setRematchOfferedBy(data.game.rematch_offered_by);
        if (data.game.rematch_status) setRematchStatus(data.game.rematch_status);
        if (data.game.rematch_game_id) setRematchGameId(data.game.rematch_game_id);
        setDrawOfferedBy(data.game.draw_offered_by || null);

        // Определяем ID соперника для синхронизации чата
        if (data.game.white_user_id && data.game.black_user_id && myUserId) {
          const oppId = playerColor === 'white' ? data.game.black_user_id : data.game.white_user_id;
          if (oppId) setOpponentUserId(oppId);
        }

        if (!onlineReadyRef.current) {
          onlineReadyRef.current = true;
          setOnlineReady(true);
        }
      } catch (e) {
        console.error('poll error', e);
        pollFailCountRef.current++;
        if (pollFailCountRef.current >= 4) setConnectionLost(true);
      }
    };

    poll();

    // P2P установлен → редкий poll только для рематча
    // P2P ещё не установлен (сигналинг) → частый poll 1.5s
    const interval = p2pConnected ? 30000 : 1500;

    const intervalId = setInterval(() => {
      if (!active) return;
      poll();
    }, interval);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [isOnlineGame, onlineGameId, timeControl, applyServerState, myUserId, p2pConnected, processSignals]);



  const submitGameResult = useCallback(async (status: 'checkmate' | 'stalemate' | 'draw', currentPlayerAtEnd: string) => {
    if (gameFinished.current) return;
    gameFinished.current = true;
    const savedUser = localStorage.getItem('chessUser');
    if (!savedUser) return;
    const userData = JSON.parse(savedUser);
    const rawId = userData.email || userData.name || 'anonymous';
    const userId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
    let result: 'win' | 'loss' | 'draw';
    if (status === 'draw' || status === 'stalemate') {
      result = 'draw';
    } else {
      result = currentPlayerAtEnd === playerColor ? 'loss' : 'win';
    }
    const durationSeconds = Math.floor((Date.now() - gameStartTime.current) / 1000);
    try {
      const res = await fetch(FINISH_GAME_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          username: userData.name || 'Player',
          avatar: userData.avatar || '',
          result,
          opponent_name: 'bot',
          opponent_type: 'bot',
          user_color: playerColor,
          time_control: timeControl,
          difficulty,
          moves_count: moveHistory.length,
          move_history: moveHistory.join(','),
          move_times: moveTimes.join(','),
          duration_seconds: durationSeconds,
          end_reason: status
        })
      });
      const data = await res.json();
      invalidateGameHistory();
      if (data.rating_change !== undefined) {
        setRatingChange(data.rating_change);
        setNewRating(data.rating_after);
        const updatedUser = { ...userData, rating: data.rating_after };
        localStorage.setItem('chessUser', JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error('Failed to submit game result:', e);
      queueGameResult(FINISH_GAME_URL, {
        user_id: userId,
        username: userData.name || 'Player',
        avatar: userData.avatar || '',
        result,
        opponent_name: 'bot',
        opponent_type: 'bot',
        user_color: playerColor,
        time_control: timeControl,
        difficulty,
        moves_count: moveHistory.length,
        move_history: moveHistory.join(','),
        move_times: moveTimes.join(','),
        duration_seconds: durationSeconds,
        end_reason: status
      });
    }
  }, [playerColor, timeControl, difficulty, moveHistory, moveTimes]);

  useEffect(() => {
    if (gameStatus !== 'playing' && !gameFinished.current && moveHistory.length > 2) {
      submitGameResult(gameStatus as 'checkmate' | 'stalemate' | 'draw', currentPlayer);
    }
  }, [gameStatus]);

  const makeMove = (from: Position, to: Position) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[from.row][from.col];
    if (!piece) return;

    const capturedPiece = newBoard[to.row][to.col];
    const newCastlingRights = { ...castlingRights };
    let newEnPassantTarget: Position | null = null;

    if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
      const isKingSide = to.col > from.col;
      const rookFromCol = isKingSide ? 7 : 0;
      const rookToCol = isKingSide ? to.col - 1 : to.col + 1;
      newBoard[from.row][rookToCol] = newBoard[from.row][rookFromCol];
      newBoard[from.row][rookFromCol] = null;
    }

    if (piece.type === 'pawn' && enPassantTarget && to.row === enPassantTarget.row && to.col === enPassantTarget.col) {
      const capturedRow = piece.color === 'white' ? to.row + 1 : to.row - 1;
      const enPassantCaptured = newBoard[capturedRow][to.col];
      if (enPassantCaptured) {
        if (piece.color === 'white') {
          setCapturedByWhite(prev => [...prev, {type: enPassantCaptured.type, color: enPassantCaptured.color}]);
        } else {
          setCapturedByBlack(prev => [...prev, {type: enPassantCaptured.type, color: enPassantCaptured.color}]);
        }
      }
      newBoard[capturedRow][to.col] = null;
    }

    if (capturedPiece) {
      if (piece.color === 'white') {
        setCapturedByWhite(prev => [...prev, {type: capturedPiece.type, color: capturedPiece.color}]);
      } else {
        setCapturedByBlack(prev => [...prev, {type: capturedPiece.type, color: capturedPiece.color}]);
      }
    }

    const promotionRow = piece.color === 'white' ? 0 : 7;
    if (piece.type === 'pawn' && to.row === promotionRow) {
      newBoard[to.row][to.col] = { type: 'queen', color: piece.color };
    } else {
      newBoard[to.row][to.col] = piece;
    }
    newBoard[from.row][from.col] = null;

    if (piece.type === 'king') {
      if (piece.color === 'white') { newCastlingRights.whiteKingSide = false; newCastlingRights.whiteQueenSide = false; }
      else { newCastlingRights.blackKingSide = false; newCastlingRights.blackQueenSide = false; }
    }
    if (piece.type === 'rook') {
      if (piece.color === 'white') {
        if (from.col === 0) newCastlingRights.whiteQueenSide = false;
        if (from.col === 7) newCastlingRights.whiteKingSide = false;
      } else {
        if (from.col === 0) newCastlingRights.blackQueenSide = false;
        if (from.col === 7) newCastlingRights.blackKingSide = false;
      }
    }

    if (piece.type === 'pawn' && Math.abs(to.row - from.row) === 2) {
      newEnPassantTarget = { row: piece.color === 'white' ? from.row - 1 : from.row + 1, col: from.col };
    }

    setCastlingRights(newCastlingRights);
    setEnPassantTarget(newEnPassantTarget);

    const moveNotation = `${String.fromCharCode(97 + from.col)}${8 - from.row}-${String.fromCharCode(97 + to.col)}${8 - to.row}`;
    const newMoveHistory = [...moveHistory, moveNotation];
    const newBoardHistory = [...boardHistory, newBoard];
    const timeAfterMove = currentPlayer === 'white' ? Math.round(whiteTime) : Math.round(blackTime);
    const newMoveTimes = [...moveTimes, String(timeAfterMove)];

    setMoveHistory(newMoveHistory);
    setBoardHistory(newBoardHistory);
    setMoveTimes(newMoveTimes);

    setLastMove({ from, to });
    setBoard(newBoard);
    setCurrentMoveIndex(newBoardHistory.length - 1);
    setSelectedSquare(null);
    setPossibleMoves([]);

    const increment = getIncrement(timeControl);
    if (currentPlayer === 'white' && increment > 0) {
      setWhiteTime(prev => prev + increment);
    } else if (currentPlayer === 'black' && increment > 0) {
      setBlackTime(prev => prev + increment);
    }

    const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
    setCurrentPlayer(nextPlayer);

    setTimeout(() => {
      if (historyRef.current) {
        historyRef.current.scrollLeft = historyRef.current.scrollWidth;
      }
    }, 10);

    if (isInCheck(newBoard, nextPlayer)) {
      const kingPos = findKing(newBoard, nextPlayer);
      setKingInCheckPosition(kingPos);
    } else {
      setKingInCheckPosition(null);
    }

    let finalGameStatus = 'playing';
    let winnerId = '';

    if (isCheckmate(newBoard, nextPlayer, newCastlingRights, newEnPassantTarget)) {
      setGameStatus('checkmate');
      finalGameStatus = 'checkmate';
      const saved = localStorage.getItem('chessUser');
      if (saved) {
        const uData = JSON.parse(saved);
        const rawId = uData.email || uData.name || 'anonymous';
        winnerId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
      }
    } else if (isStalemate(newBoard, nextPlayer, newCastlingRights, newEnPassantTarget)) {
      setGameStatus('stalemate');
      finalGameStatus = 'stalemate';
    }

    if (isOnlineGame && piece?.color === playerColor) {
      pendingMoveRef.current = moveNotation;
      serverMoveCountRef.current = newMoveHistory.length;

      if (p2pConnected) {
        sendPeerMessage({
          type: 'move',
          data: {
            move: moveNotation,
            whiteTime: currentPlayer === 'white' ? whiteTime + getIncrement(timeControl) : whiteTime,
            blackTime: currentPlayer === 'black' ? blackTime + getIncrement(timeControl) : blackTime,
            gameStatus: finalGameStatus,
            winnerId
          }
        });
        pendingMoveRef.current = null;
        if (finalGameStatus !== 'playing') {
          sendMoveToServer(moveNotation, finalGameStatus, winnerId);
        }
      } else {
        sendMoveToServer(moveNotation, finalGameStatus, winnerId);
      }
    }
  };

  const workerRef = useRef<Worker | null>(null);

  const makeComputerMove = () => {
    const moves = getAllLegalMoves(board, botColor, castlingRights, enPassantTarget);
    if (moves.length === 0) {
      if (isCheckmate(board, botColor, castlingRights, enPassantTarget)) {
        setGameStatus('checkmate');
      } else {
        setGameStatus('stalemate');
      }
      return;
    }

    if (difficulty === 'easy') {
      const easyMove = moves[Math.floor(Math.random() * moves.length)];
      makeMove(easyMove.from, easyMove.to);
      return;
    }

    const workerMoves = moves;
    const workerDiff = difficulty as 'medium' | 'hard' | 'master';

    if (workerRef.current) workerRef.current.terminate();
    const worker = new Worker(new URL('./chessWorker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;
    worker.postMessage({ board, moves: workerMoves, difficulty: workerDiff, botColor });
    worker.onmessage = (e) => {
      const selectedMove = e.data as { from: { row: number; col: number }; to: { row: number; col: number } };
      makeMove(selectedMove.from, selectedMove.to);
      worker.terminate();
      workerRef.current = null;
    };
    worker.onerror = () => {
      const fallback = getBestMove(board, workerMoves, workerDiff, botColor);
      makeMove(fallback.from, fallback.to);
      worker.terminate();
      workerRef.current = null;
    };
  };

  const handleSquareClick = (row: number, col: number) => {
    if (!onlineReady && isOnlineGame) return;
    if (gameStatus !== 'playing') return;
    if (isOnlineGame && pendingMoveRef.current) return;

    if (currentMoveIndex < boardHistory.length - 1) {
      setCurrentMoveIndex(boardHistory.length - 1);
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    const piece = board[row][col];
    const isMyTurn = currentPlayer === playerColor;

    if (!isMyTurn) {
      // Во время хода соперника — только выбор/снятие своей фигуры
      if (piece && piece.color === playerColor) {
        setSelectedSquare({ row, col });
        setPossibleMoves(getPossibleMoves(board, { row, col }, castlingRights, enPassantTarget));
      } else {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
      return;
    }

    if (selectedSquare) {
      const isValidTarget = possibleMoves.some(m => m.row === row && m.col === col);
      if (isValidTarget) {
        makeMove(selectedSquare, { row, col });
      } else if (piece && piece.color === playerColor) {
        setSelectedSquare({ row, col });
        setPossibleMoves(getPossibleMoves(board, { row, col }, castlingRights, enPassantTarget));
      } else {
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    } else if (piece && piece.color === playerColor) {
      setSelectedSquare({ row, col });
      setPossibleMoves(getPossibleMoves(board, { row, col }, castlingRights, enPassantTarget));
    }
  };

  const isSquareSelected = (row: number, col: number): boolean => {
    return selectedSquare?.row === row && selectedSquare?.col === col;
  };

  const isSquarePossibleMove = (row: number, col: number): boolean => {
    return possibleMoves.some(m => m.row === row && m.col === col);
  };

  const handlePreviousMove = () => {
    if (currentMoveIndex > 0) {
      setCurrentMoveIndex(currentMoveIndex - 1);
    }
  };

  const handleNextMove = () => {
    if (currentMoveIndex < boardHistory.length - 1) {
      setCurrentMoveIndex(currentMoveIndex + 1);
    }
  };

  return {
    board,
    displayBoard,
    selectedSquare,
    currentPlayer,
    possibleMoves,
    whiteTime,
    blackTime,
    gameStatus,
    setGameStatus,
    moveHistory,
    boardHistory,
    currentMoveIndex,
    inactivityTimer,
    opponentInactivityTimer,
    capturedByWhite,
    capturedByBlack,
    kingInCheckPosition,
    lastMove,
    endReason,
    rematchOfferedBy,
    rematchStatus,
    rematchGameId,
    drawOfferedBy,
    setDrawOfferedBy,
    setCurrentPlayer,
    showPossibleMoves,
    setShowPossibleMoves,
    theme,
    setTheme,
    boardTheme,
    setBoardTheme,
    ratingChange,
    newRating,
    userRating,
    connectionLost,
    connectionRestored,
    opponentReconnecting,
    opponentUserId,
    p2pConnected,
    p2pLatency,
    p2pQuality,
    sendPeerMessage,
    onChatMessageRef,
    historyRef,
    handleSquareClick,
    isSquareSelected,
    isSquarePossibleMove,
    handlePreviousMove,
    handleNextMove
  };
};