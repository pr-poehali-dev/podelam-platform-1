import { useState } from 'react';
import Icon from '@/components/ui/icon';

const noSpinnerStyle = `
  .mm-no-spinner::-webkit-outer-spin-button,
  .mm-no-spinner::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .mm-no-spinner {
    -moz-appearance: textfield;
  }
  .mm-inline-num {
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
  .mm-inline-num:hover, .mm-inline-num:focus {
    background: rgba(251,191,36,0.28);
    outline: none;
  }
`;

export interface MatchmakingSettings {
  mm_stage_duration: { value: string; description: string };
  mm_heartbeat_timeout: { value: string; description: string };
  mm_dead_record_ttl: { value: string; description: string };
  mm_rating_range: { value: string; description: string };
  mm_poll_interval: { value: string; description: string };
}

interface Props {
  settings: MatchmakingSettings;
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
    className="mm-inline-num mm-no-spinner"
    style={{ width: `${Math.max(48, value.length * 12 + 24)}px` }}
  />
);

export const MatchmakingSettingsModal = ({ settings, onSave, onClose }: Props) => {
  const [stageDuration, setStageDuration] = useState(settings.mm_stage_duration.value);
  const [heartbeatTimeout, setHeartbeatTimeout] = useState(settings.mm_heartbeat_timeout.value);
  const [deadRecordTtl, setDeadRecordTtl] = useState(settings.mm_dead_record_ttl.value);
  const [ratingRange, setRatingRange] = useState(settings.mm_rating_range.value);
  const [pollInterval, setPollInterval] = useState(settings.mm_poll_interval.value);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      mm_stage_duration: { value: stageDuration },
      mm_heartbeat_timeout: { value: heartbeatTimeout },
      mm_dead_record_ttl: { value: deadRecordTtl },
      mm_rating_range: { value: ratingRange },
      mm_poll_interval: { value: pollInterval },
    });
    setSaving(false);
  };

  const sections = [
    {
      icon: 'Search',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      title: 'Как работает поиск — 4 стадии',
      content: (
        <div className="text-slate-300 text-sm leading-relaxed space-y-2">
          <p>
            Когда игрок нажимает «Начать партию», система начинает искать соперника поэтапно — сначала по узкому кругу, потом всё шире. Каждая стадия длится{' '}
            <InlineInput value={stageDuration} onChange={setStageDuration} min={1} max={60} />{' '}
            секунд, после чего поиск расширяется.
          </p>
          <div className="mt-3 space-y-2">
            <div className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500/30 text-blue-300 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">1</span>
              <div>
                <span className="text-white font-medium">Свой город</span>
                <span className="text-slate-400"> — ищем соперника в том же городе. Самый приоритетный вариант.</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-500/30 text-purple-300 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">2</span>
              <div>
                <span className="text-white font-medium">Свой регион</span>
                <span className="text-slate-400"> — расширяем поиск до региона, если в городе никого нет.</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/30 text-amber-300 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">3</span>
              <div>
                <span className="text-white font-medium">Похожий рейтинг ±{ratingRange}</span>
                <span className="text-slate-400"> — ищем любого игрока по всей России с близким рейтингом.</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-full bg-green-500/30 text-green-300 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">4</span>
              <div>
                <span className="text-white font-medium">Любой онлайн</span>
                <span className="text-slate-400"> — берём любого игрока с тем же контролем времени. Поиск продолжается бессрочно до нахождения или отмены.</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: 'Target',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      title: 'Допустимая разница в рейтинге (стадия 3)',
      content: (
        <p className="text-slate-300 text-sm leading-relaxed">
          На третьей стадии система ищет соперника в диапазоне ±{' '}
          <InlineInput value={ratingRange} onChange={setRatingRange} min={0} max={1000} />{' '}
          очков от рейтинга игрока. Например, при рейтинге 1200 будут рассматриваться игроки от{' '}
          <span className="text-amber-300 font-semibold">{Math.max(0, Number(ratingRange) ? 1200 - Number(ratingRange) : 1150)}</span> до{' '}
          <span className="text-amber-300 font-semibold">{Number(ratingRange) ? 1200 + Number(ratingRange) : 1250}</span> очков.
          Среди найденных выбирается тот, чей рейтинг ближе всего.
        </p>
      )
    },
    {
      icon: 'Clock',
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
      title: 'Активность игрока — пульс',
      content: (
        <p className="text-slate-300 text-sm leading-relaxed">
          Пока игрок находится в поиске, его устройство каждые{' '}
          <InlineInput value={pollInterval} onChange={setPollInterval} min={1} max={30} />{' '}
          секунд отправляет сигнал «я здесь». Если сигнал не поступал более{' '}
          <InlineInput value={heartbeatTimeout} onChange={setHeartbeatTimeout} min={5} max={60} />{' '}
          секунд — игрок считается недоступным и не попадает в результаты поиска. Это защищает от ситуации, когда человек закрыл браузер, но формально ещё числится в очереди.
        </p>
      )
    },
    {
      icon: 'Trash2',
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
      title: 'Очистка устаревших записей',
      content: (
        <p className="text-slate-300 text-sm leading-relaxed">
          Записи в очереди, от которых не было сигнала более{' '}
          <InlineInput value={deadRecordTtl} onChange={setDeadRecordTtl} min={5} max={120} />{' '}
          секунд, автоматически удаляются. Это держит очередь чистой и не позволяет «призракам» — игрокам, которые давно ушли — мешать поиску.
        </p>
      )
    },
    {
      icon: 'Zap',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      title: 'Приоритет при выборе из нескольких кандидатов',
      content: (
        <p className="text-slate-300 text-sm leading-relaxed">
          Если на любой стадии найдено сразу несколько подходящих соперников — выбирается тот, у кого рейтинг <span className="text-white font-semibold">ближе всего</span> к рейтингу ищущего игрока. Это обеспечивает наиболее равные партии при любых условиях.
        </p>
      )
    },
    {
      icon: 'Bot',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
      title: 'Если соперник не найден',
      content: (
        <p className="text-slate-300 text-sm leading-relaxed">
          Если после всех стадий живой соперник так и не нашёлся, игроку предлагается сыграть с ботом. Рейтинг бота подбирается случайно в диапазоне ±30 очков от рейтинга игрока, чтобы партия была хоть немного близкой по уровню.
        </p>
      )
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <style>{noSpinnerStyle}</style>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-slate-800 rounded-2xl border border-slate-700/50 shadow-2xl max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between p-5 border-b border-slate-700/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Icon name="Users" size={22} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Подбор соперников</h2>
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
