import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cityRegions } from '@/components/chess/data/cities';
import OpponentSelectStep from './game-settings/OpponentSelectStep';
import FriendAndDifficultyStep from './game-settings/FriendAndDifficultyStep';
import TimeSelectStep from './game-settings/TimeSelectStep';

import API from '@/config/api';
const INVITE_URL = API.inviteGame;
const MATCHMAKING_URL = API.matchmaking;

interface GameSettingsModalProps {
  showGameSettings: boolean;
  setShowGameSettings: (value: boolean) => void;
  onStartGame: (difficulty: 'easy' | 'medium' | 'hard' | 'master', timeControl: string, color: 'white' | 'black' | 'random') => void;
  onStartOnlineGame?: (opponentType: 'city' | 'region' | 'country', timeControl: string, color: 'white' | 'black' | 'random') => void;
  initialOpponent?: 'city' | 'region' | 'country' | 'friend' | 'computer' | null;
}

const getOpponentLabel = (type: string) => {
  switch(type) {
    case 'city': return 'Город';
    case 'region': return 'Регион';
    case 'country': return 'Страна';
    case 'friend': return 'Друг';
    case 'computer': return 'Компьютер';
    default: return type;
  }
};

const getTimeLabel = (time: string) => {
  if (time.includes('+')) {
    const [mins, inc] = time.split('+');
    if (inc === '0') return `${mins} мин`;
    return `${mins}+${inc}`;
  }
  switch(time) {
    case 'blitz': return 'Блиц 3+2';
    case 'rapid': return 'Рапид 10+5';
    case 'classic': return 'Классика 15+10';
    default: return time;
  }
};

const getDifficultyLabel = (difficulty?: string) => {
  switch(difficulty) {
    case 'easy': return 'Легкий';
    case 'medium': return 'Средний';
    case 'hard': return 'Сложный';
    case 'master': return 'Мастер';
    default: return '';
  }
};

const getUserId = () => {
  const saved = localStorage.getItem('chessUser');
  if (!saved) return '';
  const user = JSON.parse(saved);
  const rawId = user.email || user.name || 'anonymous';
  return 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);
};

export const GameSettingsModal = ({ 
  showGameSettings, 
  setShowGameSettings,
  onStartGame,
  onStartOnlineGame,
  initialOpponent
}: GameSettingsModalProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedOpponent, setSelectedOpponent] = useState<'city' | 'region' | 'country' | 'friend' | 'computer' | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'master' | null>(null);
  const [selectedColor, setSelectedColor] = useState<'white' | 'black' | 'random'>('random');
  const [userCity, setUserCity] = useState<string>('');
  const [userRegion, setUserRegion] = useState<string>('');
  const [selectedFriendId, setSelectedFriendId] = useState<string>('');
  const [selectedFriendName, setSelectedFriendName] = useState<string>('');
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteId, setInviteId] = useState<number | null>(null);
  const [inviteDeclined, setInviteDeclined] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [lastGameSettings, setLastGameSettings] = useState<{
    opponent: 'city' | 'region' | 'country' | 'friend' | 'computer';
    time: string;
    difficulty?: 'easy' | 'medium' | 'hard' | 'master';
    color?: 'white' | 'black' | 'random';
  } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('chessUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (userData.city) {
        setUserCity(userData.city);
        setUserRegion(cityRegions[userData.city] || '');
      }
    }
    
    const savedSettings = localStorage.getItem('lastGameSettings');
    if (savedSettings) {
      setLastGameSettings(JSON.parse(savedSettings));
    }

    if (showGameSettings && initialOpponent) {
      setSelectedOpponent(initialOpponent);
      setStep(2);
    } else if (showGameSettings && !initialOpponent) {
      setSelectedOpponent('country');
      setStep(2);
      const saved = localStorage.getItem('lastGameSettings');
      if (saved) {
        const s = JSON.parse(saved);
        if (s.time) setSelectedTime(s.time);
        if (s.color) setSelectedColor(s.color);
      }
    }
  }, [showGameSettings, initialOpponent]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const pollAccepted = useCallback((iid: number) => {
    const uid = getUserId();
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${INVITE_URL}?action=check_accepted&invite_id=${iid}&user_id=${encodeURIComponent(uid)}`);
        const data = await res.json();
        if (data.status === 'accepted' && data.game_id) {
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
          const gameRes = await fetch(`${MATCHMAKING_URL}?game_id=${data.game_id}`);
          const gameData = await gameRes.json();
          const g = gameData.game;
          const myColor = g.white_user_id === uid ? 'white' : 'black';
          const oppName = g.white_user_id === uid ? g.black_username : g.white_username;
          const oppRating = g.white_user_id === uid ? g.black_rating : g.white_rating;
          const oppAvatar = g.white_user_id === uid ? (g.black_avatar || '') : (g.white_avatar || '');
          setInviteSent(false);
          setInviteId(null);
          setStep(1);
          setSelectedOpponent(null);
          setSelectedTime(null);
          setSelectedDifficulty(null);
          setSelectedFriendId('');
          setSelectedFriendName('');
          setInviteDeclined(false);
          setShowGameSettings(false);
          window.location.href = `/game?time=${encodeURIComponent(g.time_control)}&color=${myColor}&online_game_id=${data.game_id}&online=true&opponent_name=${encodeURIComponent(oppName)}&opponent_rating=${oppRating}&opponent_avatar=${encodeURIComponent(oppAvatar)}`;
        } else if (data.status === 'declined') {
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
          setInviteSent(false);
          setInviteId(null);
          setInviteDeclined(true);
          setTimeout(() => setInviteDeclined(false), 3000);
        }
      } catch { /* network error */ }
    }, 2000);
  }, [navigate, setShowGameSettings]);

  if (!showGameSettings) return null;

  const resetState = () => {
    setStep(1);
    setSelectedOpponent(null);
    setSelectedTime(null);
    setSelectedDifficulty(null);
    setSelectedFriendId('');
    setSelectedFriendName('');
    setInviteSent(false);
    setInviteId(null);
    setInviteDeclined(false);
    if (pollRef.current) clearInterval(pollRef.current);
  };

  const handleClose = () => {
    if (inviteSent && inviteId) {
      const uid = getUserId();
      fetch(INVITE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline', invite_id: inviteId, user_id: uid })
      }).catch(() => {});
    }
    if (pollRef.current) clearInterval(pollRef.current);
    setShowGameSettings(false);
    resetState();
  };

  const handleBack = () => {
    if (inviteSent) {
      if (pollRef.current) clearInterval(pollRef.current);
      setInviteSent(false);
      setInviteId(null);
      return;
    }
    if (step > 1) {
      setStep(step - 1);
      if (step === 2 && selectedOpponent === 'computer') {
        setSelectedDifficulty(null);
      }
    }
  };

  const handleOpponentSelect = (type: 'city' | 'region' | 'country' | 'friend' | 'computer') => {
    setSelectedOpponent(type);
    setStep(2);
  };

  const handleFriendSelect = (friendId: string, friendName: string, _friendRating: number, _friendAvatar: string) => {
    setSelectedFriendId(friendId);
    setSelectedFriendName(friendName);
    setStep(3);
  };

  const handleDifficultySelect = (difficulty: 'easy' | 'medium' | 'hard' | 'master') => {
    setSelectedDifficulty(difficulty);
    setStep(3);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const cycleColor = () => {
    setSelectedColor(prev => {
      if (prev === 'random') return 'white';
      if (prev === 'white') return 'black';
      return 'random';
    });
  };

  const sendFriendInvite = async (timeControl: string) => {
    const uid = getUserId();
    if (!uid || !selectedFriendId) return;
    try {
      const res = await fetch(INVITE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          from_user_id: uid,
          to_user_id: selectedFriendId,
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

  const handleStartGame = () => {
    if (selectedOpponent === 'friend' && selectedTime) {
      sendFriendInvite(selectedTime);
      return;
    }
    if (selectedOpponent === 'computer' && selectedDifficulty && selectedTime) {
      const settings = {
        opponent: selectedOpponent,
        time: selectedTime,
        difficulty: selectedDifficulty,
        color: selectedColor
      };
      localStorage.setItem('lastGameSettings', JSON.stringify(settings));
      onStartGame(selectedDifficulty, selectedTime, selectedColor);
      setShowGameSettings(false);
      resetState();
    } else if (selectedOpponent && selectedTime) {
      const settings = {
        opponent: selectedOpponent,
        time: selectedTime,
        color: selectedColor
      };
      localStorage.setItem('lastGameSettings', JSON.stringify(settings));
      if ((selectedOpponent === 'city' || selectedOpponent === 'region' || selectedOpponent === 'country') && onStartOnlineGame) {
        onStartOnlineGame(selectedOpponent, selectedTime, selectedColor);
      }
      setShowGameSettings(false);
      resetState();
    }
  };

  const handleQuickStart = () => {
    if (!lastGameSettings) return;
    const color = lastGameSettings.color || 'random';
    
    if (lastGameSettings.opponent === 'computer' && lastGameSettings.difficulty) {
      onStartGame(lastGameSettings.difficulty, lastGameSettings.time, color);
      setShowGameSettings(false);
    } else if ((lastGameSettings.opponent === 'city' || lastGameSettings.opponent === 'region' || lastGameSettings.opponent === 'country') && onStartOnlineGame) {
      onStartOnlineGame(lastGameSettings.opponent, lastGameSettings.time, color);
      setShowGameSettings(false);
    }
  };

  const getStepCount = () => {
    if (selectedOpponent === 'friend' || selectedOpponent === 'computer') return 3;
    return 2;
  };

  const showTimeStep = (step === 2 && selectedOpponent !== 'friend' && selectedOpponent !== 'computer') || step === 3;
  const showFriendOrDifficulty = step === 2 && (selectedOpponent === 'friend' || selectedOpponent === 'computer');

  const getTitle = () => {
    if (inviteSent) return 'Ожидание ответа';
    if (step === 1) return 'Выбор противника';
    if (step === 2 && selectedOpponent === 'friend') return 'Выбор друга';
    if (step === 2 && selectedOpponent === 'computer') return 'Уровень сложности';
    if ((step === 2 || step === 3) && !initialOpponent && selectedOpponent === 'country') return 'Настройки партии';
    if ((step === 2 || step === 3) && selectedOpponent !== 'friend' && selectedOpponent !== 'computer') return 'Время';
    if (step === 3) return 'Время';
    return '';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-3 sm:p-4" onClick={handleClose}>
      <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 animate-scale-in max-h-[95vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="px-4 sm:px-6 py-2 sm:py-4 pb-1 sm:pb-3">
          <div className="flex items-center justify-between">
            {(step > 1 || inviteSent) && !(!initialOpponent && selectedOpponent === 'country') && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="text-gray-600 dark:text-gray-400 h-7 w-7 sm:h-10 sm:w-10"
              >
                <Icon name="ChevronLeft" size={18} />
              </Button>
            )}
            <CardTitle className="flex-1 text-center text-sm sm:text-base text-gray-900 dark:text-white">
              {getTitle()}
            </CardTitle>
            {(step > 1 || inviteSent) && !(!initialOpponent && selectedOpponent === 'country') && <div className="w-7 sm:w-10" />}
          </div>
          {!inviteSent && !(!initialOpponent && selectedOpponent === 'country') && (
            <div className="flex justify-center gap-1.5 sm:gap-2 mt-2 sm:mt-4">
              {Array.from({ length: getStepCount() }).map((_, i) => (
                <div 
                  key={i}
                  className={`h-1 sm:h-1.5 w-8 sm:w-10 rounded-full transition-colors ${
                    step >= i + 1 ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-200 dark:bg-slate-700'
                  }`} 
                />
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-4 px-4 sm:px-6 pb-3 sm:pb-5">
          {inviteSent ? (
            <div className="text-center py-6 sm:py-8 space-y-3 sm:space-y-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Icon name="Loader2" size={28} className="animate-spin text-amber-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">{selectedFriendName}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Ожидаем ответ на приглашение...</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  if (pollRef.current) clearInterval(pollRef.current);
                  if (inviteId) {
                    const uid = getUserId();
                    fetch(INVITE_URL, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'decline', invite_id: inviteId, user_id: uid })
                    }).catch(() => {});
                  }
                  setInviteSent(false);
                  setInviteId(null);
                }}
                className="text-sm"
              >
                Отменить приглашение
              </Button>
            </div>
          ) : inviteDeclined ? (
            <div className="text-center py-6 sm:py-8 space-y-3 sm:space-y-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Icon name="X" size={28} className="text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{selectedFriendName}</p>
                <p className="text-xs sm:text-sm text-red-500 mt-1">Отклонил приглашение</p>
              </div>
            </div>
          ) : (
            <>
              {step === 1 && (
                <OpponentSelectStep
                  userCity={userCity}
                  userRegion={userRegion}
                  lastGameSettings={lastGameSettings}
                  onQuickStart={handleQuickStart}
                  onSelect={handleOpponentSelect}
                  getOpponentLabel={getOpponentLabel}
                  getTimeLabel={getTimeLabel}
                  getDifficultyLabel={getDifficultyLabel}
                />
              )}

              {showFriendOrDifficulty && (
                <FriendAndDifficultyStep
                  selectedOpponent={selectedOpponent}
                  onFriendSelect={handleFriendSelect}
                  onDifficultySelect={handleDifficultySelect}
                />
              )}

              {showTimeStep && (
                <TimeSelectStep
                  selectedTime={selectedTime}
                  selectedColor={selectedColor}
                  onTimeSelect={handleTimeSelect}
                  onCycleColor={cycleColor}
                  onStartGame={handleStartGame}
                  isFriendGame={selectedOpponent === 'friend'}
                  startLabel={!initialOpponent && selectedOpponent === 'country' ? 'Начать партию' : undefined}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GameSettingsModal;