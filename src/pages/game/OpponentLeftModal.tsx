interface OpponentLeftModalProps {
  showModal: boolean;
  onClose: () => void;
  isEarlyExit: boolean;
  isSurrender: boolean;
}

export const OpponentLeftModal = ({ showModal, onClose, isEarlyExit, isSurrender }: OpponentLeftModalProps) => {
  if (!showModal) return null;

  const getTitle = () => {
    if (isSurrender) return 'Соперник сдался';
    if (isEarlyExit) return 'Соперник покинул партию';
    return 'Соперник покинул игру';
  };

  const getMessage = () => {
    if (isSurrender) {
      return 'Ваш соперник сдался. Победа засчитана вам!';
    }
    if (isEarlyExit) {
      return 'Соперник вышел из партии в начале игры (менее 3 ходов). Рейтинг не изменился.';
    }
    return 'Ваш соперник покинул игру. Победа засчитана вам!';
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-stone-900 rounded-xl border border-stone-700 p-6 md:p-8 max-w-md w-full shadow-2xl animate-scale-in">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">{isSurrender ? '🏆' : '🚪'}</div>
          <h2 className="text-2xl font-bold text-stone-100 mb-3">{getTitle()}</h2>
          <p className="text-stone-300 text-lg">
            {getMessage()}
          </p>
          {!isEarlyExit && (
            <div className="mt-4 p-3 bg-green-900/30 border border-green-700/50 rounded-lg">
              <p className="text-green-400 font-semibold">Вы победили!</p>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Понятно
        </button>
      </div>
    </div>
  );
};
