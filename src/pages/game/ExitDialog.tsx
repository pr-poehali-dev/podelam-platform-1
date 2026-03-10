interface ExitDialogProps {
  onContinue: () => void;
  onSurrender: () => void;
}

export const ExitDialog = ({ onContinue, onSurrender }: ExitDialogProps) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-stone-900 rounded-xl border border-stone-700 p-6 md:p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-stone-100 mb-2">Выход из игры</h2>
          <p className="text-stone-400">
            Вы уверены, что хотите сдаться и выйти из игры? Это будет засчитано как поражение.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onContinue}
            className="flex-1 px-6 py-3 bg-stone-700 hover:bg-stone-600 text-stone-100 rounded-lg font-medium transition-colors"
          >
            Продолжить игру
          </button>
          <button
            onClick={onSurrender}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Сдаться
          </button>
        </div>
      </div>
    </div>
  );
};
