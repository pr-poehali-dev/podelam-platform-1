import { useState } from 'react';
import Icon from '@/components/ui/icon';
import API from '@/config/api';

const ADMIN_STATS_URL = API.adminStats;

interface AdminWipeSectionProps {
  adminEmail: string;
  onWipeComplete: () => void;
}

const AdminWipeSection = ({ adminEmail, onWipeComplete }: AdminWipeSectionProps) => {
  const [wipeStep, setWipeStep] = useState(0);
  const [wiping, setWiping] = useState(false);

  const handleWipe = async () => {
    if (wipeStep === 0) {
      setWipeStep(1);
      return;
    }
    if (wipeStep === 1) {
      setWipeStep(2);
      return;
    }
    setWiping(true);
    try {
      await fetch(ADMIN_STATS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'wipe_all', admin_email: adminEmail })
      });
      await onWipeComplete();
    } catch { /* ignore */ }
    setWiping(false);
    setWipeStep(0);
  };

  return (
    <div className="mt-6 pt-6 border-t border-slate-700/50">
      {wipeStep === 0 && (
        <button
          onClick={handleWipe}
          className="w-full flex items-center gap-4 p-4 rounded-xl bg-red-900/20 border border-red-800/40 hover:bg-red-900/40 hover:border-red-700 transition-all text-left group"
        >
          <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <Icon name="Trash2" size={24} className="text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-red-300 font-medium group-hover:text-red-200 transition-colors">
              Очистить все данные
            </div>
            <div className="text-sm text-slate-500 mt-0.5">
              Удалить всех игроков, партии, историю. Всем нужна новая регистрация.
            </div>
          </div>
        </button>
      )}

      {wipeStep === 1 && (
        <div className="p-4 rounded-xl bg-red-900/30 border border-red-700/50 space-y-3">
          <div className="flex items-center gap-2 text-red-300">
            <Icon name="AlertTriangle" size={20} />
            <span className="font-bold">Удалить все аккаунты и партии?</span>
          </div>
          <p className="text-sm text-slate-400">Все игроки потеряют аккаунты, рейтинг и историю. Действие необратимо.</p>
          <div className="flex gap-2">
            <button onClick={() => setWipeStep(0)} className="flex-1 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium text-sm transition-colors">
              Отмена
            </button>
            <button onClick={handleWipe} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors">
              Да, удалить всё
            </button>
          </div>
        </div>
      )}

      {wipeStep === 2 && (
        <div className="p-4 rounded-xl bg-red-900/40 border border-red-600/60 space-y-3">
          <div className="flex items-center gap-2 text-red-200">
            <Icon name="Skull" size={20} />
            <span className="font-bold">Точно грохнуть базу? Последний шанс!</span>
          </div>
          <p className="text-sm text-red-300/80">Это действие НЕЛЬЗЯ отменить. Вся база игроков будет стёрта.</p>
          <div className="flex gap-2">
            <button onClick={() => setWipeStep(0)} className="flex-1 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium text-sm transition-colors">
              Нет, отменить
            </button>
            <button onClick={handleWipe} disabled={wiping} className="flex-1 py-2.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-sm transition-colors disabled:opacity-50">
              {wiping ? 'Удаляю...' : 'ГРОХНУТЬ ВСЁ'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWipeSection;
