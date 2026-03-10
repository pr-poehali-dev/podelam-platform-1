import Icon from '@/components/ui/icon';

interface Props {
  onClose: () => void;
}

const levels = [
  {
    emoji: '🟢',
    label: 'Лёгкий',
    color: 'border-green-500/30 bg-green-500/10',
    titleColor: 'text-green-400',
    delay: '~1.5 сек',
    skills: [
      'Ходит случайным образом — без какой-либо стратегии',
      'Не оценивает позицию и не защищает фигуры',
      'Может оставить под бой ферзя или короля',
      'Подходит для самых начинающих игроков',
    ],
  },
  {
    emoji: '🟡',
    label: 'Средний',
    color: 'border-yellow-500/30 bg-yellow-500/10',
    titleColor: 'text-yellow-400',
    delay: '~2.5 сек',
    skills: [
      'Просчитывает позицию на 2 хода вперёд',
      'Высокий уровень случайности — часто выбирает не лучший ход',
      'Может брать незащищённые фигуры, иногда зевает материал',
      'Хорошо подходит для начинающих и любителей',
    ],
  },
  {
    emoji: '🟠',
    label: 'Сложный',
    color: 'border-orange-500/30 bg-orange-500/10',
    titleColor: 'text-orange-400',
    delay: '~2 сек',
    skills: [
      'Анализирует все доступные ходы с приоритетом захватов и шахов',
      'Просчитывает позицию на 3 хода вперёд (минимакс + альфа-бета)',
      'Небольшой шум — изредка выбирает не идеальный ход',
      'Защищает фигуры, строит угрозы, использует тактику',
      'Составит хорошую партию для опытного игрока',
    ],
  },
  {
    emoji: '🔴',
    label: 'Мастер',
    color: 'border-red-500/30 bg-red-500/10',
    titleColor: 'text-red-400',
    delay: '~1 сек',
    skills: [
      'Анализирует все ходы на глубину 4 уровней вперёд',
      'Полностью детерминированный — всегда выбирает наилучший ход',
      'Никакого шума — никогда не ошибается намеренно',
      'Приоритизирует захваты, шахи и матовые угрозы',
      'Умеет вести эндшпиль и использовать материальное преимущество',
      'Победить практически невозможно без глубокого знания шахмат',
    ],
  },
];

export const BotDifficultyModal = ({ onClose }: Props) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-slate-800 rounded-2xl border border-slate-700/50 shadow-2xl max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between p-5 border-b border-slate-700/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Icon name="Bot" size={22} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Уровни сложности бота</h2>
              <p className="text-xs text-slate-400">Навыки компьютерного соперника</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {levels.map((lvl) => (
            <div key={lvl.label} className={`rounded-xl border p-4 ${lvl.color}`}>
              <div className={`flex items-center gap-2 mb-3 font-bold text-sm ${lvl.titleColor}`}>
                <span className="text-base">{lvl.emoji}</span>
                {lvl.label}
                <span className="ml-auto text-xs font-normal text-slate-400">задержка хода: {lvl.delay}</span>
              </div>
              <ul className="space-y-1.5">
                {lvl.skills.map((skill, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300 text-xs leading-relaxed">
                    <span className={`mt-0.5 flex-shrink-0 text-[10px] ${lvl.titleColor}`}>◆</span>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="rounded-xl border border-slate-600/30 bg-slate-700/20 p-4">
            <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-400">
              <Icon name="Info" size={15} />
              Как работает алгоритм
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Бот использует алгоритм <span className="text-white font-semibold">Минимакс с отсечением альфа-бета</span> — 
              тот же принцип, что в классических шахматных движках. Он просчитывает все возможные ходы на N уровней вперёд 
              и выбирает позицию с максимальной оценкой. Чем глубже поиск — тем сильнее игра.
            </p>
          </div>
        </div>

        <div className="p-5 border-t border-slate-700/50 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-colors font-medium"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};