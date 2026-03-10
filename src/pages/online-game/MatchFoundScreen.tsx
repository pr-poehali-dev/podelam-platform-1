import Icon from '@/components/ui/icon';
import type { OpponentData } from './useMatchmaking';

const BOT_AVATAR = 'https://cdn.poehali.dev/projects/44b012df-8579-4e50-a646-a3ff586bd941/files/5a37bc71-a83e-4a96-b899-abd4e284ef6e.jpg';

interface MatchFoundScreenProps {
  opponent: OpponentData;
  playerColor: 'white' | 'black';
  countdown: number;
  isStarting: boolean;
  getTimeLabel: (time: string | null) => string;
  timeControl: string;
}

const MatchFoundScreen = ({
  opponent,
  playerColor,
  countdown,
  isStarting,
  getTimeLabel,
  timeControl
}: MatchFoundScreenProps) => {
  if (isStarting) {
    return (
      <div className="text-center space-y-6 animate-fade-in">
        <div className="flex justify-center">
          <div className="text-8xl font-bold text-amber-400 animate-pulse">
            {countdown}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-stone-100 mb-2">Начинаем игру...</h2>
          <p className="text-stone-400">Подготовьтесь к партии</p>
        </div>

        <div className="flex items-center justify-center gap-8 p-6 rounded-lg bg-stone-800/50 border border-stone-700">
          <div className="text-center">
            <div className="text-4xl mb-2">{playerColor === 'white' ? '♔' : '♚'}</div>
            <div className="text-sm font-semibold text-stone-200">Вы</div>
            <div className="text-xs text-stone-400">{playerColor === 'white' ? 'Белые' : 'Чёрные'}</div>
          </div>

          <div className="text-3xl text-amber-400">VS</div>

          <div className="text-center">
            {opponent.isBotGame ? (
              <img src={BOT_AVATAR} alt={opponent.name} className="w-12 h-12 rounded-full mx-auto mb-2 object-cover" />
            ) : opponent.avatar ? (
              <img src={opponent.avatar} alt={opponent.name} className="w-12 h-12 rounded-full mx-auto mb-2 object-cover" />
            ) : (
              <div className="text-4xl mb-2">{playerColor === 'white' ? '♚' : '♔'}</div>
            )}
            <div className="text-sm font-semibold text-stone-200">{opponent.name}</div>
            <div className="text-xs text-stone-400">{playerColor === 'white' ? 'Чёрные' : 'Белые'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6 animate-fade-in">
      <div className="flex justify-center">
        <Icon name="CheckCircle" size={64} className="text-green-400" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-stone-100 mb-4">
          {opponent.isBotGame ? 'Играем с ботом!' : 'Соперник найден!'}
        </h2>

        <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-stone-800/50 border border-stone-700">
          {opponent.isBotGame ? (
            <img src={BOT_AVATAR} alt={opponent.name} className="w-24 h-24 rounded-full ring-4 ring-amber-400 object-cover" />
          ) : opponent.avatar ? (
            <img src={opponent.avatar} alt={opponent.name} className="w-24 h-24 rounded-full ring-4 ring-amber-400 object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full ring-4 ring-amber-400 bg-stone-700 flex items-center justify-center">
              <Icon name="User" size={40} className="text-stone-400" />
            </div>
          )}
          <div>
            <div className="text-xl font-bold text-stone-100">{opponent.name}</div>
            <div className="text-lg font-bold text-amber-400 mt-2">
              Рейтинг: {opponent.rating}
            </div>
          </div>
        </div>

        <p className="text-sm text-stone-400 mt-4">
          {getTimeLabel(timeControl)}
        </p>
      </div>
    </div>
  );
};

export default MatchFoundScreen;
