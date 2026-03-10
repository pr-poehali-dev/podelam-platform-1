import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface NoMatchScreenProps {
  onPlayBot: () => void;
  onContinueSearch: () => void;
  onCancel: () => void;
}

const NoMatchScreen = ({
  onPlayBot,
  onContinueSearch,
  onCancel
}: NoMatchScreenProps) => {
  return (
    <div className="text-center space-y-6 animate-fade-in">
      <div className="flex justify-center">
        <Icon name="UserX" size={64} className="text-amber-400" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-stone-100 mb-2">Соперников нет</h2>
        <p className="text-stone-400">
          Сейчас нет онлайн-игроков
        </p>
        <p className="text-sm text-stone-500 mt-2">
          Вы можете сыграть с нашим ботом или продолжить ожидание
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          onClick={onPlayBot}
          className="bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold"
        >
          <Icon name="Bot" size={20} className="mr-2" />
          Сыграть с ботом
        </Button>
        <Button
          onClick={onContinueSearch}
          variant="outline"
          className="border-stone-600 text-stone-300 hover:bg-stone-800"
        >
          <Icon name="Search" size={20} className="mr-2" />
          Продолжить поиск
        </Button>
        <Button
          onClick={onCancel}
          variant="ghost"
          className="text-stone-500 hover:text-stone-300"
        >
          Вернуться
        </Button>
      </div>
    </div>
  );
};

export default NoMatchScreen;
