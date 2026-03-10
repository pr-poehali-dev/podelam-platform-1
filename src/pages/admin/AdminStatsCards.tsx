import Icon from '@/components/ui/icon';

interface AdminStatsCardsProps {
  stats: { total_users: number; online_users: number; active_games: number } | null;
}

const AdminStatsCards = ({ stats }: AdminStatsCardsProps) => {
  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-white">{stats?.total_users ?? '—'}</div>
        <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
          <Icon name="Users" size={14} className="text-blue-400" />
          Игроков
        </div>
      </div>
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-green-400">{stats?.online_users ?? '—'}</div>
        <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
          <Icon name="Wifi" size={14} className="text-green-400" />
          Онлайн
        </div>
      </div>
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-amber-400">{stats?.active_games ?? '—'}</div>
        <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
          <Icon name="Swords" size={14} className="text-amber-400" />
          Партий
        </div>
        {(stats?.active_games ?? 0) > 0 && (
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-[10px] text-green-400 font-medium">сейчас играют</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStatsCards;