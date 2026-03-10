import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Friend, PendingRequest, getInitials } from './FriendTypes';

interface FriendListPanelProps {
  friends: Friend[];
  pendingRequests: PendingRequest[];
  loading: boolean;
  onAcceptRequest: (friendId: string) => void;
  onRejectRequest: (friendId: string) => void;
  onRemoveFriend: (friendId: string) => void;
  onOpenProfile: (friend: Friend) => void;
  onOpenChat?: (friendName: string, friendRating: number, friendId: string) => void;
}

export const FriendListPanel = ({
  friends,
  pendingRequests,
  loading,
  onAcceptRequest,
  onRejectRequest,
  onRemoveFriend,
  onOpenProfile,
  onOpenChat,
}: FriendListPanelProps) => {
  return (
    <>
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Icon name="UserCheck" size={16} className="text-amber-500" />
            Входящие заявки
            <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] px-1.5 py-0">{pendingRequests.length}</Badge>
          </h3>
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div key={req.id} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-500/20">
                <Avatar className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0">
                  {req.avatar ? <AvatarImage src={req.avatar} /> : (
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold text-xs sm:text-sm">{getInitials(req.username)}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white truncate block">{req.username}</span>
                  <div className="text-[11px] sm:text-xs text-gray-500 flex items-center gap-2">
                    <span className="flex items-center gap-1"><Icon name="Trophy" size={11} className="text-amber-500" />{req.rating}</span>
                    {req.city && <span className="truncate">{req.city}</span>}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button onClick={() => onAcceptRequest(req.id)} size="sm" className="bg-green-600 hover:bg-green-700 text-white border-0 h-8 w-8 p-0" title="Принять">
                    <Icon name="Check" size={16} />
                  </Button>
                  <Button onClick={() => onRejectRequest(req.id)} size="sm" variant="ghost" className="text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0" title="Отклонить">
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Icon name="Users" size={20} className="text-blue-600 dark:text-blue-400" />
            Мои друзья
            {friends.length > 0 && <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({friends.length})</span>}
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400"><Icon name="Loader2" size={32} className="animate-spin mx-auto mb-2" /><p className="text-sm">Загрузка...</p></div>
        ) : friends.length === 0 ? (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">
            <Icon name="Users" className="mx-auto mb-3 opacity-40" size={44} />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Пока нет друзей</p>
            <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">Добавьте друзей по ID или отправьте им ссылку</p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div
                key={friend.id}
                onClick={() => onOpenProfile(friend)}
                className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all group cursor-pointer"
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="w-10 h-10 sm:w-11 sm:h-11">
                    {friend.avatar ? <AvatarImage src={friend.avatar} alt={friend.username} /> : (
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xs sm:text-sm">{getInitials(friend.username)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white truncate">{friend.username}</span>
                    <Badge variant={friend.status === 'online' ? 'default' : 'secondary'} className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 flex-shrink-0 ${
                      friend.status === 'online' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}>
                      {friend.status === 'online' ? 'Онлайн' : 'Оффлайн'}
                    </Badge>
                  </div>
                  <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1"><Icon name="Trophy" size={11} className="text-amber-500" />{friend.rating}</span>
                    {friend.city && <span className="flex items-center gap-1 truncate"><Icon name="MapPin" size={11} className="flex-shrink-0" />{friend.city}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                  {onOpenChat && (
                    <Button onClick={(e) => { e.stopPropagation(); onOpenChat(friend.username, friend.rating, friend.id); }} variant="ghost" size="sm"
                      className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-8 w-8 p-0" title="Написать">
                      <Icon name="MessageCircle" size={16} />
                    </Button>
                  )}
                  <Button onClick={(e) => { e.stopPropagation(); onRemoveFriend(friend.id); }} variant="ghost" size="sm"
                    className="text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity" title="Удалить из друзей">
                    <Icon name="UserMinus" size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default FriendListPanel;