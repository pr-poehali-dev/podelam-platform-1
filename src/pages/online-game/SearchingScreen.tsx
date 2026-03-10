import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import type { SearchStage } from './useMatchmaking';

interface SearchingScreenProps {
  opponentType: string | null;
  timeControl: string;
  searchTime: number;
  searchStage: SearchStage;
  onCancel: () => void;
  getTimeLabel: (time: string | null) => string;
  getOpponentTypeLabel: (type: string | null) => string;
}

const STAGE_LABELS: Record<SearchStage, string> = {
  city: 'в вашем городе',
  region: 'в вашем регионе',
  rating: 'с рейтингом ±50',
  any: 'любого соперника онлайн'
};

const STAGE_ORDER: SearchStage[] = ['city', 'region', 'rating', 'any'];

const SearchingScreen = ({
  opponentType,
  timeControl,
  searchTime,
  searchStage,
  onCancel,
  getTimeLabel,
}: SearchingScreenProps) => {
  const startStageIdx = opponentType === 'city' ? 0 : opponentType === 'region' ? 1 : 2;
  const stages = STAGE_ORDER.slice(startStageIdx);
  const currentIdx = stages.indexOf(searchStage);

  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon name="Search" size={32} className="text-amber-400" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-stone-100 mb-2">
          Поиск соперника
        </h2>
        <p className="text-stone-300 text-lg">
          Ищем {STAGE_LABELS[searchStage]}
        </p>
        <p className="text-sm text-stone-500 mt-2">
          Контроль времени: {getTimeLabel(timeControl)}
        </p>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {stages.map((stage, idx) => (
          <div key={stage} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full transition-colors ${
              idx < currentIdx ? 'bg-amber-500' :
              idx === currentIdx ? 'bg-amber-400 animate-pulse' :
              'bg-stone-600'
            }`} />
            {idx < stages.length - 1 && (
              <div className={`w-6 h-0.5 ${idx < currentIdx ? 'bg-amber-500/50' : 'bg-stone-700'}`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-stone-500 px-2">
        {stages.map((stage) => (
          <span key={stage} className={stage === searchStage ? 'text-amber-400' : ''}>
            {stage === 'city' ? 'Город' : stage === 'region' ? 'Регион' : stage === 'rating' ? '±50' : 'Все'}
          </span>
        ))}
      </div>

      <p className="text-xs text-stone-600">
        Поиск: {searchTime} сек
      </p>

      <Button
        onClick={onCancel}
        variant="outline"
        className="border-stone-600 text-stone-300 hover:bg-stone-800"
      >
        Отменить поиск
      </Button>
    </div>
  );
};

export default SearchingScreen;
