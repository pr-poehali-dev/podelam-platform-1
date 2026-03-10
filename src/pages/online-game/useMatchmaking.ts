import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cityRegions } from '@/components/chess/data/cities';
import API from '@/config/api';

const MATCHMAKING_URL = API.matchmaking;
const POLL_INTERVAL = 3000;
const STAGE_DURATION = 5000;
const FINAL_STAGE_DURATION = 5000;

export type SearchStage = 'city' | 'region' | 'rating' | 'any';
export type SearchStatus = 'searching' | 'no_opponents' | 'found' | 'starting';

export interface OpponentData {
  name: string;
  rating: number;
  avatar: string;
  isBotGame: boolean;
}

const STAGE_ORDER: SearchStage[] = ['city', 'region', 'rating', 'any'];

const useMatchmaking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const opponentType = searchParams.get('opponent') as 'city' | 'region' | 'country' | null;
  const timeControl = searchParams.get('time') || 'rapid';
  const colorParam = searchParams.get('color') || 'random';

  const [searchStatus, setSearchStatus] = useState<SearchStatus>('searching');
  const [searchStage, setSearchStage] = useState<SearchStage>('city');
  const [opponent, setOpponent] = useState<OpponentData | null>(null);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [gameId, setGameId] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [searchTime, setSearchTime] = useState(0);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortedRef = useRef(false);
  const matchFoundRef = useRef(false);
  const currentStageRef = useRef<SearchStage>('city');

  const getUserData = useCallback(() => {
    const savedUser = localStorage.getItem('chessUser');
    if (!savedUser) return null;
    const userData = JSON.parse(savedUser);
    const rawId = userData.email || userData.name || 'anonymous';
    const userId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
    const city = userData.city || '';
    const region = city ? (cityRegions[city] || '') : '';
    return { ...userData, id: userId, city, region };
  }, []);

  const cleanup = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (searchTimerRef.current) { clearInterval(searchTimerRef.current); searchTimerRef.current = null; }
    if (stageTimerRef.current) { clearTimeout(stageTimerRef.current); stageTimerRef.current = null; }
  }, []);

  const cancelSearch = useCallback(async () => {
    abortedRef.current = true;
    cleanup();
    const user = getUserData();
    if (user) {
      fetch(MATCHMAKING_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      }).catch(() => {});
    }
    navigate('/');
  }, [cleanup, getUserData, navigate]);

  const handleMatchFound = useCallback((data: { opponent_name: string; opponent_rating: number; opponent_avatar?: string; player_color: 'white' | 'black'; game_id: number }, isBotGame = false) => {
    matchFoundRef.current = true;
    cleanup();
    setOpponent({
      name: data.opponent_name,
      rating: data.opponent_rating,
      avatar: data.opponent_avatar || '',
      isBotGame
    });
    setPlayerColor(data.player_color);
    setGameId(data.game_id);
    setSearchStatus('found');
    setTimeout(() => {
      if (!abortedRef.current) setSearchStatus('starting');
    }, 4000);
  }, [cleanup]);

  const checkActiveGame = useCallback(async (userId: string) => {
    if (abortedRef.current || matchFoundRef.current) return;
    try {
      const res = await fetch(`${MATCHMAKING_URL}?user_id=${encodeURIComponent(userId)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.active_game && !matchFoundRef.current) {
        handleMatchFound({
          opponent_name: data.active_game.opponent_name,
          opponent_rating: data.active_game.opponent_rating,
          opponent_avatar: data.active_game.opponent_avatar,
          player_color: data.active_game.player_color,
          game_id: data.active_game.game_id
        }, data.active_game.is_bot_game);
      }
    } catch {
      // Network error
    }
  }, [handleMatchFound]);

  const doSearch = useCallback(async (user: { id: string; name?: string; avatar?: string; rating?: number; city?: string; region?: string }, stage: SearchStage) => {
    if (abortedRef.current || matchFoundRef.current) return;

    try {
      const res = await fetch(MATCHMAKING_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search',
          user_id: user.id,
          username: user.name || 'Player',
          avatar: user.avatar || '',
          rating: user.rating || 1200,
          opponent_type: opponentType || 'country',
          time_control: timeControl,
          city: user.city || '',
          region: user.region || '',
          search_stage: stage
        })
      });
      if (!res.ok) return;
      const data = await res.json();

      if (abortedRef.current || matchFoundRef.current) return;

      if (data.status === 'matched') {
        handleMatchFound(data);
      } else {
        // Второй игрок: проверяем, не создана ли уже игра для нас
        await checkActiveGame(user.id);
      }
    } catch {
      // Network error, will retry on next poll
    }
  }, [opponentType, timeControl, handleMatchFound, checkActiveGame]);

  const advanceToNextStage = useCallback((user: { id: string; name?: string; avatar?: string; rating?: number; city?: string; region?: string }) => {
    if (abortedRef.current || matchFoundRef.current) return;

    const currentIdx = STAGE_ORDER.indexOf(currentStageRef.current);
    if (currentIdx >= STAGE_ORDER.length - 1) {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      setSearchStatus('no_opponents');
      return;
    }

    const nextStage = STAGE_ORDER[currentIdx + 1];
    currentStageRef.current = nextStage;
    setSearchStage(nextStage);

    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }

    doSearch(user, nextStage);
    pollRef.current = setInterval(() => doSearch(user, nextStage), POLL_INTERVAL);

    const duration = nextStage === 'any' ? FINAL_STAGE_DURATION : STAGE_DURATION;
    stageTimerRef.current = setTimeout(() => advanceToNextStage(user), duration);
  }, [doSearch]);

  const getInitialStage = useCallback((): SearchStage => {
    if (opponentType === 'city') return 'city';
    if (opponentType === 'region') return 'region';
    return 'rating';
  }, [opponentType]);

  useEffect(() => {
    const user = getUserData();
    if (!user) {
      setTimeout(() => navigate('/'), 0);
      return;
    }

    abortedRef.current = false;
    matchFoundRef.current = false;

    const initialStage = getInitialStage();
    currentStageRef.current = initialStage;
    setSearchStage(initialStage);
    setSearchStatus('searching');

    searchTimerRef.current = setInterval(() => {
      setSearchTime(prev => prev + 1);
    }, 1000);

    doSearch(user, initialStage);
    pollRef.current = setInterval(() => doSearch(user, initialStage), POLL_INTERVAL);

    stageTimerRef.current = setTimeout(() => advanceToNextStage(user), STAGE_DURATION);

    return () => {
      cleanup();
      if (!matchFoundRef.current) {
        const u = getUserData();
        if (u) {
          fetch(MATCHMAKING_URL, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: u.id })
          }).catch(() => {});
        }
      }
    };
  }, [opponentType, timeControl]);

  const handlePlayBot = useCallback(async () => {
    const user = getUserData();
    if (!user) return;

    const res = await fetch(MATCHMAKING_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'play_bot',
        user_id: user.id,
        username: user.name || 'Player',
        avatar: user.avatar || '',
        rating: user.rating || 1200,
        opponent_type: opponentType || 'country',
        time_control: timeControl
      })
    });
    const data = await res.json();

    if (data.status === 'bot_game') {
      handleMatchFound(data, true);
    }
  }, [getUserData, opponentType, timeControl, handleMatchFound]);

  const handleContinueSearch = useCallback(() => {
    abortedRef.current = false;
    matchFoundRef.current = false;
    const user = getUserData();
    if (!user) return;

    const initialStage = getInitialStage();
    currentStageRef.current = initialStage;
    setSearchStage(initialStage);
    setSearchStatus('searching');
    setSearchTime(0);

    doSearch(user, initialStage);
    pollRef.current = setInterval(() => doSearch(user, initialStage), POLL_INTERVAL);

    stageTimerRef.current = setTimeout(() => advanceToNextStage(user), STAGE_DURATION);
  }, [getUserData, getInitialStage, doSearch, advanceToNextStage, cleanup]);

  useEffect(() => {
    if (searchStatus === 'starting') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            const isBotGame = opponent?.isBotGame;
            if (isBotGame) {
              navigate(`/game?difficulty=medium&time=${encodeURIComponent(timeControl)}&color=${playerColor}&online_game_id=${gameId}&bot_game=true&opponent_name=${encodeURIComponent(opponent?.name || '')}`);
            } else {
              navigate(`/game?time=${encodeURIComponent(timeControl)}&color=${playerColor}&online_game_id=${gameId}&online=true&opponent_name=${encodeURIComponent(opponent?.name || '')}&opponent_rating=${opponent?.rating || 0}&opponent_avatar=${encodeURIComponent(opponent?.avatar || '')}`);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [searchStatus, navigate, timeControl, opponent, playerColor, gameId]);

  return {
    searchStatus,
    searchStage,
    opponent,
    playerColor,
    gameId,
    countdown,
    searchTime,
    opponentType,
    timeControl,
    cancelSearch,
    handlePlayBot,
    handleContinueSearch
  };
};

export default useMatchmaking;