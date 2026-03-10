import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import API from '@/config/api';

const GAME_HISTORY_URL = API.gameHistory;

interface Game {
  id: number;
  opponent_name: string;
  opponent_type: string;
  opponent_rating: number | null;
  result: 'win' | 'loss' | 'draw';
  user_color: 'white' | 'black';
  time_control: string;
  difficulty: string | null;
  moves_count: number;
  move_history: string | null;
  move_times: string | null;
  rating_before: number;
  rating_after: number;
  rating_change: number;
  duration_seconds: number | null;
  end_reason: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  rating: number;
  games_played: number;
  wins: number;
  losses: number;
  draws: number;
}

interface PlayerProfileModalProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
  playerName: string;
  playerAvatar?: string;
  playerRating?: number;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';
  if (diffDays < 7) return `${diffDays} дн. назад`;
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
};

const getResultColor = (result: string) => {
  switch (result) {
    case 'win': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-600';
    case 'loss': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-600';
    case 'draw': return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-600';
    default: return '';
  }
};

const getResultText = (result: string) => {
  switch (result) {
    case 'win': return 'Победа';
    case 'loss': return 'Поражение';
    case 'draw': return 'Ничья';
    default: return '';
  }
};

const getEndReasonText = (reason: string) => {
  switch (reason) {
    case 'checkmate': return 'Мат';
    case 'stalemate': return 'Пат';
    case 'draw': return 'Ничья';
    case 'surrender': return 'Сдача';
    case 'timeout': return 'Время';
    default: return reason;
  }
};

const PlayerProfileModal = ({ open, onClose, userId, playerName, playerAvatar, playerRating }: PlayerProfileModalProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    setSelectedGame(null);
    fetch(`${GAME_HISTORY_URL}?user_id=${encodeURIComponent(userId)}&limit=10`)
      .then(r => r.json())
      .then(data => {
        if (data.user) setProfile(data.user);
        setGames(data.games || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, userId]);

  const winRate = profile && profile.games_played > 0
    ? Math.round((profile.wins / profile.games_played) * 100)
    : 0;

  if (selectedGame) {
    const moves = selectedGame.move_history ? selectedGame.move_history.split(',') : [];
    const times = selectedGame.move_times ? selectedGame.move_times.split(',') : [];
    const movePairs: { num: number; white: string; black?: string; whiteTime?: string; blackTime?: string }[] = [];
    for (let i = 0; i < moves.length; i += 2) {
      movePairs.push({
        num: Math.floor(i / 2) + 1,
        white: moves[i],
        black: moves[i + 1] || undefined,
        whiteTime: times[i] ? formatTime(parseInt(times[i])) : undefined,
        blackTime: times[i + 1] ? formatTime(parseInt(times[i + 1])) : undefined
      });
    }

    return (
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <DialogTitle className="sr-only">Детали партии</DialogTitle>
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedGame(null)}
              className="text-slate-600 dark:text-slate-400 -ml-2"
            >
              <Icon name="ChevronLeft" size={18} className="mr-1" />
              Назад к профилю
            </Button>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div>
                <Badge className={getResultColor(selectedGame.result)}>
                  {getResultText(selectedGame.result)}
                </Badge>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  vs {selectedGame.opponent_name}
                  {selectedGame.opponent_rating && ` (${selectedGame.opponent_rating})`}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">{formatDate(selectedGame.created_at)}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {getEndReasonText(selectedGame.end_reason)} &middot; {selectedGame.moves_count} ходов
                </div>
                <div className="flex items-center gap-1 justify-end mt-1">
                  <span className="text-xs text-slate-500">{selectedGame.rating_before}</span>
                  <Icon name="ArrowRight" size={10} className="text-slate-400" />
                  <span className="text-xs text-slate-500">{selectedGame.rating_after}</span>
                  <span className={`text-xs font-bold ${selectedGame.rating_change > 0 ? 'text-green-500' : selectedGame.rating_change < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                    ({selectedGame.rating_change > 0 ? '+' : ''}{selectedGame.rating_change})
                  </span>
                </div>
              </div>
            </div>

            {movePairs.length > 0 && (
              <div className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="grid grid-cols-[40px_1fr_1fr] text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                  <div>#</div>
                  <div>Белые</div>
                  <div>Чёрные</div>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                  {movePairs.map((mp) => (
                    <div
                      key={mp.num}
                      className="grid grid-cols-[40px_1fr_1fr] px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/30"
                    >
                      <div className="text-slate-400 text-xs font-medium">{mp.num}.</div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{mp.white}</span>
                        {mp.whiteTime && (
                          <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-1 rounded">
                            {mp.whiteTime}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {mp.black && (
                          <>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{mp.black}</span>
                            {mp.blackTime && (
                              <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-1 rounded">
                                {mp.blackTime}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogTitle className="sr-only">Профиль игрока</DialogTitle>
        <div className="space-y-5">
          <div className="flex flex-col items-center text-center pt-2">
            {playerAvatar ? (
              <img
                src={playerAvatar}
                alt={playerName}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-400 shadow-lg mb-3"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center ring-4 ring-amber-400 shadow-lg mb-3">
                <Icon name="User" size={40} className="text-slate-400" />
              </div>
            )}
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{playerName}</h2>
            {(profile?.rating || playerRating) && (
              <div className="flex items-center gap-1 mt-1">
                <Icon name="Trophy" size={16} className="text-amber-500" />
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {profile?.rating || playerRating}
                </span>
              </div>
            )}
          </div>

          {loading && (
            <div className="text-center py-6">
              <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
            </div>
          )}

          {!loading && profile && (
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-lg font-bold text-slate-900 dark:text-white">{profile.games_played}</div>
                <div className="text-[10px] text-slate-500">Партий</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">{profile.wins}</div>
                <div className="text-[10px] text-green-600 dark:text-green-400">Побед</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">{profile.losses}</div>
                <div className="text-[10px] text-red-600 dark:text-red-400">Поражений</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{winRate}%</div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400">Винрейт</div>
              </div>
            </div>
          )}

          {!loading && games.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <Icon name="History" size={14} />
                Последние партии
              </h3>
              <div className="space-y-1.5">
                {games.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => setSelectedGame(game)}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 cursor-pointer transition-colors"
                  >
                    <div className={`w-2 h-8 rounded-full flex-shrink-0 ${
                      game.result === 'win' ? 'bg-green-500' : game.result === 'loss' ? 'bg-red-500' : 'bg-gray-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                          vs {game.opponent_name}
                        </span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getResultColor(game.result)}`}>
                          {getResultText(game.result)}
                        </Badge>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {game.time_control} &middot; {game.moves_count} ходов &middot; {getEndReasonText(game.end_reason)}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-xs font-bold ${
                        game.rating_change > 0 ? 'text-green-500' : game.rating_change < 0 ? 'text-red-500' : 'text-slate-400'
                      }`}>
                        {game.rating_change > 0 ? '+' : ''}{game.rating_change}
                      </div>
                      <div className="text-[10px] text-slate-400">{formatDate(game.created_at)}</div>
                    </div>
                    <Icon name="ChevronRight" size={14} className="text-slate-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && games.length === 0 && (
            <div className="text-center py-6 text-slate-500">
              <Icon name="History" size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Нет сыгранных партий</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerProfileModal;