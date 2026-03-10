import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { FriendProfile, FriendGame, getInitials } from './FriendTypes';

const getResultColor = (result: string) => {
  if (result === 'win') return 'text-green-600 dark:text-green-400';
  if (result === 'loss') return 'text-red-600 dark:text-red-400';
  return 'text-gray-600 dark:text-gray-400';
};

const getResultText = (result: string) => {
  if (result === 'win') return 'Победа';
  if (result === 'loss') return 'Поражение';
  return 'Ничья';
};

const getEndReasonText = (reason: string) => {
  const map: Record<string, string> = { checkmate: 'Мат', stalemate: 'Пат', draw: 'Ничья', surrender: 'Сдача', timeout: 'Время' };
  return map[reason] || reason;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diff === 0) return 'Сегодня';
  if (diff === 1) return 'Вчера';
  if (diff < 7) return `${diff} дн. назад`;
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
};

interface FriendProfileViewProps {
  selectedFriend: FriendProfile;
  friendGames: FriendGame[];
  loadingGames: boolean;
  onBack: () => void;
}

export const FriendProfileView = ({ selectedFriend, friendGames, loadingGames, onBack }: FriendProfileViewProps) => {
  return (
    <div className="space-y-4 animate-fade-in max-w-2xl mx-auto w-full overflow-hidden">
      <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/10">
        <CardContent className="p-3 sm:p-4 md:p-6">
          <Button onClick={onBack} variant="ghost" className="mb-3 sm:mb-4 text-blue-600 dark:text-blue-400 -ml-2">
            <Icon name="ChevronLeft" size={18} className="mr-1" /> Назад к друзьям
          </Button>
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Avatar className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
              {selectedFriend.avatar ? <AvatarImage src={selectedFriend.avatar} /> : (
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg sm:text-xl">{getInitials(selectedFriend.username)}</AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{selectedFriend.username}</h2>
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span className="flex items-center gap-1"><Icon name="Trophy" size={14} className="text-amber-500" />{selectedFriend.rating}</span>
                {selectedFriend.city && <span className="flex items-center gap-1 truncate"><Icon name="MapPin" size={14} className="flex-shrink-0" />{selectedFriend.city}</span>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-4 sm:mb-6">
            <div className="text-center p-2 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30">
              <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{selectedFriend.games_played}</div>
              <div className="text-[9px] sm:text-[10px] text-gray-500">Игр</div>
            </div>
            <div className="text-center p-2 sm:p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">{selectedFriend.wins}</div>
              <div className="text-[9px] sm:text-[10px] text-gray-500">Побед</div>
            </div>
            <div className="text-center p-2 sm:p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
              <div className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">{selectedFriend.losses}</div>
              <div className="text-[9px] sm:text-[10px] text-gray-500">Пораж.</div>
            </div>
            <div className="text-center p-2 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-900/20">
              <div className="text-base sm:text-lg font-bold text-gray-600 dark:text-gray-400">{selectedFriend.draws}</div>
              <div className="text-[9px] sm:text-[10px] text-gray-500">Ничьих</div>
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Icon name="History" size={18} className="text-blue-600 dark:text-blue-400" /> История игр
          </h3>
          {loadingGames ? (
            <div className="text-center py-8 text-gray-400"><Icon name="Loader2" size={24} className="animate-spin mx-auto mb-2" />Загрузка...</div>
          ) : friendGames.length === 0 ? (
            <div className="text-center py-8 text-gray-400"><Icon name="Gamepad2" size={32} className="mx-auto mb-2 opacity-40" /><p className="text-sm">Нет сыгранных партий</p></div>
          ) : (
            <div className="space-y-2">
              {friendGames.map((game) => (
                <div key={game.id} className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-800/30 gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span className={`text-xs sm:text-sm font-semibold ${getResultColor(game.result)}`}>{getResultText(game.result)}</span>
                      <span className="text-[11px] sm:text-xs text-gray-500 truncate">vs {game.opponent_name}</span>
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">{game.time_control} · {getEndReasonText(game.end_reason)} · {game.moves_count} ходов</div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-1">
                    <div className={`text-xs sm:text-sm font-bold ${game.rating_change > 0 ? 'text-green-500' : game.rating_change < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                      {game.rating_change > 0 ? '+' : ''}{game.rating_change}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-gray-500">{formatDate(game.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FriendProfileView;