import Icon from "@/components/ui/icon";

type Props = {
  onPay: () => void;
};

export default function BarrierBotPaywall({ onPay }: Props) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-6 text-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Icon name="ShieldAlert" size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold mb-1">Барьеры, тревоги и стресс</h2>
          <p className="text-rose-100 text-sm">Найди точку срыва и научись её удерживать</p>
        </div>
        <div className="p-6">
          <ul className="space-y-3 mb-6">
            {[
              "Восстановишь прошлый провал по шагам",
              "Увидишь, где именно тревога сломила движение",
              "Поймёшь свой психологический профиль",
              "Пересчитаешь сценарий с опорой на силы",
              "Получишь визуальный график X–Y",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                <Icon name="CheckCircle" size={16} className="text-rose-500 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <div className="text-center mb-4">
            <span className="text-3xl font-bold text-gray-900">290 ₽</span>
            <span className="text-gray-500 text-sm ml-1">одноразово</span>
          </div>
          <button
            onClick={onPay}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            Начать анализ — 290 ₽
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">Коучинговая сессия · ~15–20 минут</p>
        </div>
      </div>
    </div>
  );
}
