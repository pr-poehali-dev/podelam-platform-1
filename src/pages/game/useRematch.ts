import { useState, useRef, useEffect, useCallback } from 'react';
import API from '@/config/api';

const REMATCH_TIMEOUT_MS = 20_000;
const POLL_INTERVAL_MS = 2_000;

interface UseRematchOptions {
  isOnline: boolean;
  opponentUserId?: string;
  timeControl: string;
  playerColor: 'white' | 'black';
  opponentName: string;
  opponentRating?: number;
  opponentAvatar: string;
  myUserId: string;
  handleOfferRematch: (toUserId?: string, timeControl?: string) => Promise<{ error?: string; inviteId?: number }>;
}

export const useRematch = ({
  isOnline,
  opponentUserId,
  timeControl,
  playerColor,
  opponentName,
  opponentRating,
  opponentAvatar,
  myUserId,
  handleOfferRematch,
}: UseRematchOptions) => {
  const [rematchSent, setRematchSent] = useState(false);
  const [rematchCooldown, setRematchCooldown] = useState(false);
  const [rematchError, setRematchError] = useState<string | null>(null);
  const [rematchTimeoutLeft, setRematchTimeoutLeft] = useState<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAll = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    setRematchTimeoutLeft(null);
  }, []);

  useEffect(() => { return stopAll; }, []);

  const startPoll = useCallback((inviteId: number) => {
    stopAll();

    // Countdown для отображения оставшегося времени
    setRematchTimeoutLeft(REMATCH_TIMEOUT_MS / 1000);
    countdownRef.current = setInterval(() => {
      setRematchTimeoutLeft(prev => (prev !== null && prev > 1 ? prev - 1 : prev));
    }, 1000);

    // Жёсткий таймаут 60 сек
    timeoutRef.current = setTimeout(() => {
      stopAll();
      setRematchSent(false);
      setRematchError('Соперник не ответил на приглашение');
    }, REMATCH_TIMEOUT_MS);

    // Опрос принятия
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API.inviteGame}?action=check_accepted&invite_id=${inviteId}&user_id=${encodeURIComponent(myUserId)}`);
        const data = await res.json();
        if (data.status === 'accepted' && data.game_id) {
          stopAll();
          const newColor = playerColor === 'white' ? 'black' : 'white';
          window.location.href = `/game?time=${encodeURIComponent(timeControl)}&color=${newColor}&online_game_id=${data.game_id}&online=true&opponent_name=${encodeURIComponent(opponentName)}&opponent_rating=${opponentRating || 0}&opponent_avatar=${encodeURIComponent(opponentAvatar)}`;
        } else if (data.status === 'declined') {
          stopAll();
          setRematchSent(false);
          setRematchError('Соперник отклонил реванш');
        }
      } catch { /* ignore */ }
    }, POLL_INTERVAL_MS);
  }, [myUserId, playerColor, timeControl, opponentName, opponentRating, opponentAvatar, stopAll]);

  const offerRematch = useCallback(async () => {
    if (!isOnline) { window.location.reload(); return; }
    setRematchSent(true);
    const result = await handleOfferRematch(opponentUserId, timeControl);
    if (result.error) {
      setRematchSent(false);
      setRematchCooldown(true);
      setRematchError(result.error);
    } else if (result.inviteId) {
      startPoll(result.inviteId);
    }
  }, [isOnline, opponentUserId, timeControl, handleOfferRematch, startPoll]);

  return { rematchSent, rematchCooldown, rematchError, rematchTimeoutLeft, setRematchError, offerRematch };
};