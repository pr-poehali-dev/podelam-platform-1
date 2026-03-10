import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const timeCategories = [
  {
    name: 'Пуля',
    icon: 'Rocket',
    options: [
      { label: '1 мин', value: '1+0' },
      { label: '1+1', value: '1+1' },
      { label: '2+1', value: '2+1' },
    ]
  },
  {
    name: 'Блиц',
    icon: 'Zap',
    options: [
      { label: '3 мин', value: '3+0' },
      { label: '3+2', value: '3+2' },
      { label: '5 мин', value: '5+0' },
      { label: '5+5', value: '5+5' },
      { label: '5+2', value: '5+2' },
    ]
  },
  {
    name: 'Рапид',
    icon: 'Timer',
    options: [
      { label: '10 мин', value: '10+0' },
      { label: '15+10', value: '15+10' },
      { label: '30 мин', value: '30+0' },
      { label: '10+5', value: '10+5' },
      { label: '20 мин', value: '20+0' },
      { label: '60 мин', value: '60+0' },
    ]
  }
];

interface TimeSelectStepProps {
  selectedTime: string | null;
  selectedColor: 'white' | 'black' | 'random';
  onTimeSelect: (time: string) => void;
  onCycleColor: () => void;
  onStartGame: () => void;
  isFriendGame?: boolean;
  startLabel?: string;
}

const getColorLabel = (color: 'white' | 'black' | 'random') => {
  switch (color) {
    case 'white': return 'Белые';
    case 'black': return 'Черные';
    case 'random': return 'Случайный';
  }
};

const getColorIcon = (color: 'white' | 'black' | 'random') => {
  switch (color) {
    case 'white': return '♔';
    case 'black': return '♚';
    case 'random': return '🎲';
  }
};

const TimeSelectStep = ({
  selectedTime,
  selectedColor,
  onTimeSelect,
  onCycleColor,
  onStartGame,
  isFriendGame,
  startLabel,
}: TimeSelectStepProps) => {
  return (
    <div className="space-y-1.5 sm:space-y-3">
      <div className="space-y-1.5 sm:space-y-3">
        {timeCategories.map((category) => (
          <div key={category.name}>
            <div className="flex items-center gap-1.5 mb-1 sm:mb-2">
              <Icon name={category.icon} size={14} className="text-slate-600 dark:text-slate-400" />
              <span className="text-[11px] sm:text-sm font-medium text-slate-600 dark:text-slate-400">{category.name}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {category.options.map((option) => (
                <Button
                  key={option.value}
                  className={`h-8 sm:h-10 text-[11px] sm:text-sm font-medium border px-1 sm:px-3 rounded-md sm:rounded-lg ${
                    selectedTime === option.value
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-500 text-blue-700 dark:text-blue-300'
                      : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white'
                  }`}
                  onClick={() => onTimeSelect(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div 
        className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 sm:p-3 border border-slate-200 dark:border-white/10 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
        onClick={onCycleColor}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-lg sm:text-2xl">{getColorIcon(selectedColor)}</span>
            <div>
              <span className="text-[11px] sm:text-sm font-medium text-slate-900 dark:text-white">Цвет фигур</span>
              <div className="text-[9px] sm:text-xs text-slate-500 dark:text-gray-400">Нажмите для смены</div>
            </div>
          </div>
          <span className="text-[11px] sm:text-sm font-semibold text-slate-900 dark:text-white">{getColorLabel(selectedColor)}</span>
        </div>
      </div>

      <Button 
        className="w-full bg-green-600 hover:bg-green-700 border-0 text-white h-9 sm:h-12 text-xs sm:text-base font-semibold"
        onClick={onStartGame}
        disabled={!selectedTime}
      >
        <Icon name={isFriendGame ? "Swords" : "Play"} className="mr-1.5 sm:mr-2" size={16} />
        {startLabel ?? (isFriendGame ? 'Пригласить на игру' : 'Начать игру')}
      </Button>
    </div>
  );
};

export default TimeSelectStep;