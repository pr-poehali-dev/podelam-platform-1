import { useState } from 'react';
import Icon from '@/components/ui/icon';
import type { RatingSettings } from '@/pages/Admin';

const noSpinnerStyle = `
  .no-spinner::-webkit-outer-spin-button,
  .no-spinner::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .no-spinner {
    -moz-appearance: textfield;
  }
  .inline-num {
    display: inline-block;
    background: rgba(251,191,36,0.15);
    border: 1px solid rgba(251,191,36,0.4);
    border-radius: 6px;
    padding: 1px 6px;
    color: #fbbf24;
    font-weight: 700;
    font-size: 0.95em;
    min-width: 48px;
    text-align: center;
    vertical-align: middle;
    cursor: pointer;
    transition: background 0.15s;
  }
  .inline-num:hover, .inline-num:focus {
    background: rgba(251,191,36,0.28);
    outline: none;
  }
`;

interface Props {
  settings: RatingSettings;
  onSave: (updated: Record<string, { value: string }>) => Promise<void>;
  onClose: () => void;
}

interface InlineInputProps {
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
}

const InlineInput = ({ value, onChange, min, max }: InlineInputProps) => (
  <input
    type="number"
    value={value}
    min={min}
    max={max}
    onChange={(e) => onChange(e.target.value)}
    className="inline-num no-spinner"
    style={{ width: `${Math.max(48, value.length * 12 + 24)}px` }}
  />
);

export const RatingSettingsModal = ({ settings, onSave, onClose }: Props) => {
  const [winPoints, setWinPoints] = useState(settings.win_points.value);
  const [lossPoints, setLossPoints] = useState(settings.loss_points.value);
  const [drawPoints, setDrawPoints] = useState(settings.draw_points.value);
  const [dailyDecay, setDailyDecay] = useState(settings.daily_decay.value);
  const [initialRating, setInitialRating] = useState(settings.initial_rating.value);
  const [minRating, setMinRating] = useState(settings.min_rating.value);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      win_points: { value: winPoints },
      loss_points: { value: lossPoints },
      draw_points: { value: drawPoints },
      daily_decay: { value: dailyDecay },
      initial_rating: { value: initialRating },
      min_rating: { value: minRating },
      rating_principles: { value: settings.rating_principles?.value || '' }
    });
    setSaving(false);
  };

  const sections = [
    {
      icon: 'UserPlus',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      title: 'Новый игрок',
      content: (
        <p className="text-slate-300 text-sm leading-relaxed">
          Каждый новый игрок начинает с рейтинга{' '}
          <InlineInput value={initialRating} onChange={setInitialRating} min={0} max={9999} />{' '}
          очков. Это стартовая точка — нейтральный уровень, с которого игрок может расти вверх или опускаться вниз в зависимости от результатов.
        </p>
      )
    },
    {
      icon: 'Trophy',
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
      title: 'Победа',
      content: (
        <p className="text-slate-300 text-sm leading-relaxed">
          За каждую выигранную партию игрок получает{' '}
          <InlineInput value={winPoints} onChange={setWinPoints} min={0} max={999} />{' '}
          очков к рейтингу. Очки начисляются сразу после завершения игры — при победе матом, превышении времени соперника или его сдаче.
        </p>
      )
    },
    {
      icon: 'Handshake',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10 border-yellow-500/20',
      title: 'Ничья',
      content: (
        <p className="text-slate-300 text-sm leading-relaxed">
          За партию, завершившуюся вничью (пат, соглашение сторон), начисляется{' '}
          <InlineInput value={drawPoints} onChange={setDrawPoints} min={0} max={999} />{' '}
          {Number(drawPoints) > 0
            ? 'очков. Ничья поощряется — это всё равно результат.'
            : 'очков. Ничья не даёт и не снимает очки — нейтральный исход.'}
        </p>
      )
    },
    {
      icon: 'TrendingDown',
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
      title: 'Поражение',
      content: (
        <p className="text-slate-300 text-sm leading-relaxed">
          За проигранную партию с рейтинга снимается{' '}
          <InlineInput value={lossPoints} onChange={setLossPoints} min={0} max={999} />{' '}
          очков. Рейтинг не может упасть ниже минимума (см. ниже), поэтому новые игроки защищены от ухода в минус.
        </p>
      )
    },
    {
      icon: 'Calendar',
      color: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/20',
      title: 'Ежедневное снижение (за неактивность)',
      content: (
        <p className="text-slate-300 text-sm leading-relaxed">
          Если игрок не играет, каждый день его рейтинг автоматически снижается на{' '}
          <InlineInput value={dailyDecay} onChange={setDailyDecay} min={0} max={999} />{' '}
          {Number(dailyDecay) === 0
            ? 'очков — то есть снижение отключено. Рейтинг хранится бессрочно.'
            : 'очков. Это стимулирует игроков поддерживать активность и не позволяет набранному рейтингу "устаревать".'}
        </p>
      )
    },
    {
      icon: 'ShieldAlert',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      title: 'Минимальный рейтинг',
      content: (
        <p className="text-slate-300 text-sm leading-relaxed">
          Рейтинг игрока не может опуститься ниже{' '}
          <InlineInput value={minRating} onChange={setMinRating} min={0} max={9999} />{' '}
          очков — ни за поражения, ни за ежедневное снижение. Это защитный порог, чтобы игрок не уходил в отрицательные значения.
        </p>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <style>{noSpinnerStyle}</style>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-slate-800 rounded-2xl border border-slate-700/50 shadow-2xl max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between p-5 border-b border-slate-700/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Icon name="Trophy" size={22} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Принципы рейтинга</h2>
              <p className="text-xs text-slate-400">Жёлтые числа можно редактировать прямо в тексте</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {sections.map((s) => (
            <div key={s.title} className={`rounded-xl border p-4 ${s.bg}`}>
              <div className={`flex items-center gap-2 mb-2 font-semibold text-sm ${s.color}`}>
                <Icon name={s.icon} size={15} />
                {s.title}
              </div>
              {s.content}
            </div>
          ))}

          <div className="rounded-xl border border-slate-500/30 bg-slate-600/20 p-4">
            <div className="flex items-center gap-2 mb-2 font-semibold text-sm text-slate-300">
              <Icon name="Wifi" size={15} />
              Когда рейтинг начисляется
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Рейтинг меняется <span className="text-white font-semibold">только в онлайн-играх</span> — когда игрок находит соперника через поиск или матчмейкинг. Партии в режимах <span className="text-slate-400">«Играть с другом»</span> и <span className="text-slate-400">«Играть с компьютером»</span> на рейтинг не влияют — они считаются тренировочными.
            </p>
          </div>

          <div className="rounded-xl border border-slate-600/30 bg-slate-700/20 p-4">
            <div className="flex items-center gap-2 mb-2 font-semibold text-sm text-slate-400">
              <Icon name="Info" size={15} />
              Итоговая формула за один день активного игрока
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Победа: <span className="text-green-400 font-bold">+{winPoints}</span> &nbsp;|&nbsp;
              Поражение: <span className="text-red-400 font-bold">−{lossPoints}</span> &nbsp;|&nbsp;
              Ничья: <span className="text-yellow-400 font-bold">{Number(drawPoints) >= 0 ? '+' : ''}{drawPoints}</span> &nbsp;|&nbsp;
              Без игр в день: <span className="text-orange-400 font-bold">−{dailyDecay}</span>
            </p>
          </div>
        </div>

        <div className="p-5 border-t border-slate-700/50 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-colors font-medium"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-amber-500 text-black hover:bg-amber-400 transition-colors font-bold disabled:opacity-50"
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
};