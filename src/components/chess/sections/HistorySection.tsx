import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { cachedGameHistory } from '@/lib/apiCache';
import { shareContent } from '@/lib/share';

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

interface HistorySectionProps {
  onOpenChat?: (opponentName: string, opponentRating: number, gameId: string) => void;
}

export const HistorySection = ({ onOpenChat }: HistorySectionProps) => {
  const [games, setGames] = useState<Game[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareOk, setShareOk] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const savedUser = localStorage.getItem('chessUser');
    if (!savedUser) {
      setLoading(false);
      return;
    }
    const userData = JSON.parse(savedUser);
    const rawId = userData.email || userData.name || 'anonymous';
    const userId = 'u_' + rawId.replace(/[^a-zA-Z0-9@._-]/g, '').substring(0, 60);

    try {
      const data = await cachedGameHistory(userId);
      if (data.user) setUserProfile(data.user);
      setGames(data.games || []);
    } catch (e) {
      console.error('Failed to fetch history:', e);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дня назад`;
    
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-500/30 text-green-700 dark:text-green-400';
      case 'loss': return 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-400';
      case 'draw': return 'bg-gray-100 dark:bg-gray-900/20 border-gray-300 dark:border-gray-500/30 text-gray-700 dark:text-gray-400';
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

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'win': return 'TrendingUp';
      case 'loss': return 'TrendingDown';
      case 'draw': return 'Minus';
      default: return 'Circle';
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

  const stats = userProfile ? {
    total: userProfile.games_played,
    wins: userProfile.wins,
    losses: userProfile.losses,
    draws: userProfile.draws,
    rating: userProfile.rating
  } : {
    total: games.length,
    wins: games.filter(g => g.result === 'win').length,
    losses: games.filter(g => g.result === 'loss').length,
    draws: games.filter(g => g.result === 'draw').length,
    rating: null
  };

  if (selectedGame) {
    const moves = selectedGame.move_history ? selectedGame.move_history.split(',') : [];
    const times = selectedGame.move_times ? selectedGame.move_times.split(',') : [];
    const movePairs: { num: number; white: string; black?: string; whiteTime?: string; blackTime?: string }[] = [];
    for (let i = 0; i < moves.length; i += 2) {
      movePairs.push({
        num: Math.floor(i / 2) + 1,
        white: moves[i],
        black: moves[i + 1] || undefined,
        whiteTime: times[i] ? formatDuration(parseInt(times[i])) : undefined,
        blackTime: times[i + 1] ? formatDuration(parseInt(times[i + 1])) : undefined
      });
    }

    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Icon name="ChevronLeft" className="text-blue-600 dark:text-blue-400" size={24} />
                Просмотр партии
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Button
                    onClick={async () => {
                      const res = getResultText(selectedGame.result);
                      const ok = await shareContent({
                        title: 'Лига Шахмат — Партия',
                        text: `${res} против ${selectedGame.opponent_name} (${selectedGame.rating_change > 0 ? '+' : ''}${selectedGame.rating_change}). ${selectedGame.moves_count} ходов.`,
                      });
                      if (ok) { setShareOk(true); setTimeout(() => setShareOk(false), 2000); }
                    }}
                    variant="outline"
                    className="border-slate-200 dark:border-white/20 active:scale-95"
                  >
                    {shareOk ? (
                      <Icon name="Check" size={20} className="text-green-500 mr-2" />
                    ) : (
                      <img
                        src="https://cdn.poehali.dev/projects/44b012df-8579-4e50-a646-a3ff586bd941/bucket/fda3fc12-14e8-4207-b40a-00c3b8683b37.png"
                        alt="Поделиться"
                        className="w-5 h-5 dark:invert mr-2"
                      />
                    )}
                    <span className="hidden sm:inline">{shareOk ? 'Скопировано!' : 'Поделиться'}</span>
                  </Button>
                  {shareOk && (
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-[10px] sm:text-xs px-2 py-1 rounded-md whitespace-nowrap z-50 animate-fade-in sm:hidden">
                      Ссылка скопирована!
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => setSelectedGame(null)}
                  variant="outline"
                  className="border-slate-200 dark:border-white/20"
                >
                  <Icon name="X" size={18} className="mr-2" />
                  Закрыть
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-500/30">
                <div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <Badge className={getResultColor(selectedGame.result)}>
                      <Icon name={getResultIcon(selectedGame.result)} size={14} className="mr-1" />
                      {getResultText(selectedGame.result)}
                    </Badge>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(selectedGame.created_at)}</span>
                    {selectedGame.duration_seconds && (
                      <span className="text-sm text-gray-500 dark:text-gray-500">
                        {formatDuration(selectedGame.duration_seconds)}
                      </span>
                    )}
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white break-words">
                    {selectedGame.user_color === 'white' ? 'Вы' : selectedGame.opponent_name} vs {selectedGame.user_color === 'black' ? 'Вы' : selectedGame.opponent_name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedGame.time_control}
                    {selectedGame.difficulty && ` (${selectedGame.difficulty})`}
                    {' '} {getEndReasonText(selectedGame.end_reason)}
                    {' '} {selectedGame.moves_count} ходов
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Рейтинг:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{selectedGame.rating_before}</span>
                    <Icon name="ArrowRight" size={14} className="text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{selectedGame.rating_after}</span>
                    <span className={`text-sm font-bold ${selectedGame.rating_change > 0 ? 'text-green-500' : selectedGame.rating_change < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                      ({selectedGame.rating_change > 0 ? '+' : ''}{selectedGame.rating_change})
                    </span>
                  </div>
                </div>
              </div>

              {movePairs.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Icon name="List" size={20} className="text-blue-600 dark:text-blue-400" />
                    Ходы партии
                  </h3>
                  <div className="max-h-96 overflow-y-auto space-y-2 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-lg border border-slate-200 dark:border-white/10">
                    {movePairs.map((mp, index) => (
                      <div
                        key={index}
                        className="flex gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700/50"
                      >
                        <div className="w-8 text-sm font-bold text-gray-600 dark:text-gray-400">{mp.num}.</div>
                        <div className="flex-1 flex gap-4">
                          <div className="flex-1 flex items-center gap-1.5">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{mp.white}</span>
                            {mp.whiteTime && (
                              <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-slate-700 px-1 rounded">{mp.whiteTime}</span>
                            )}
                          </div>
                          {mp.black && (
                            <div className="flex-1 flex items-center gap-1.5">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{mp.black}</span>
                              {mp.blackTime && (
                                <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-slate-700 px-1 rounded">{mp.blackTime}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400 animate-pulse">Загрузка истории...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-gray-900 dark:text-white">
            <Icon name="History" className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={22} />
            <span>История партий</span>
            {stats.rating && (
              <Badge variant="outline" className="ml-auto border-amber-400/50 text-amber-500 text-xs">
                <Icon name="Trophy" size={12} className="mr-1" />
                {stats.rating}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6">
            <div className="p-3 sm:p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/10">
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Всего партий</div>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30">
              <div className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-400">{stats.wins}</div>
              <div className="text-xs sm:text-sm text-green-600 dark:text-green-400">Побед</div>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30">
              <div className="text-xl sm:text-2xl font-bold text-red-700 dark:text-red-400">{stats.losses}</div>
              <div className="text-xs sm:text-sm text-red-600 dark:text-red-400">Поражений</div>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-500/30">
              <div className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-400">{stats.draws}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Ничьих</div>
            </div>
          </div>

          <div className="space-y-3">
            {games.length === 0 ? (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                <Icon name="History" className="mx-auto mb-4" size={48} />
                <p>История партий пуста</p>
                <p className="text-sm">Сыгранные партии будут отображаться здесь</p>
              </div>
            ) : (
              games.map((game) => (
                <div
                  key={game.id}
                  onClick={() => setSelectedGame(game)}
                  className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all cursor-pointer"
                >
                  <div className="flex-shrink-0">
                    <Badge className={`${getResultColor(game.result)} text-xs`}>
                      <Icon name={getResultIcon(game.result)} size={12} className="mr-1" />
                      <span className="hidden sm:inline">{getResultText(game.result)}</span>
                      <span className="sm:hidden">{game.result === 'win' ? 'W' : game.result === 'loss' ? 'L' : 'D'}</span>
                    </Badge>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {game.opponent_name}
                      {game.difficulty && <span className="text-xs text-gray-500 ml-1">({game.difficulty})</span>}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {game.time_control} {game.moves_count} ходов {formatDate(game.created_at)}
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <div className={`text-sm font-bold ${game.rating_change > 0 ? 'text-green-500' : game.rating_change < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                      {game.rating_change > 0 ? '+' : ''}{game.rating_change}
                    </div>
                    <div className="text-xs text-gray-400">{game.rating_after}</div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const res = getResultText(game.result);
                      shareContent({
                        title: 'Лига Шахмат — Партия',
                        text: `${res} против ${game.opponent_name} (${game.rating_change > 0 ? '+' : ''}${game.rating_change})`,
                      });
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Поделиться"
                  >
                    <Icon name="CornerUpRight" size={14} />
                  </button>

                  {onOpenChat && game.opponent_type !== 'bot' && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenChat(game.opponent_name, game.opponent_rating || 0, String(game.id));
                      }}
                      variant="outline"
                      size="sm"
                      className="border-blue-400/50 text-blue-600 dark:text-blue-400 hidden sm:flex"
                    >
                      <Icon name="MessageCircle" size={16} />
                    </Button>
                  )}

                  <Icon name="ChevronRight" size={16} className="text-gray-400 flex-shrink-0" />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HistorySection;