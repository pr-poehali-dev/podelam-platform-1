import Icon from "@/components/ui/icon";

interface ResultsPaywallProps {
  payLoading: boolean;
  payError: string;
  onPayClick: () => void;
}

export default function ResultsPaywall({ payLoading, payError, onPayClick }: ResultsPaywallProps) {
  return (
    <div className="bg-white rounded-2xl border-2 border-violet-200 overflow-hidden">
      {/* Заблюренный превью */}
      <div className="relative">
        <div className="p-5 blur-[3px] pointer-events-none select-none opacity-60">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
              <Icon name="Lock" size={16} className="text-violet-400" />
            </div>
            <h2 className="font-bold text-foreground">Полная картина твоего состояния</h2>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
            <div className="h-4 bg-gray-200 rounded w-full mt-3" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-violet-600 text-white rounded-xl px-4 py-2 text-sm font-bold shadow-lg flex items-center gap-2">
            <Icon name="Lock" size={14} />
            Скрыто
          </div>
        </div>
      </div>

      {/* Оффер */}
      <div className="p-5 border-t border-violet-100 bg-violet-50/50">
        <p className="text-xs text-violet-500 font-semibold uppercase tracking-wide mb-2">Это только базовый уровень</p>
        <h3 className="text-lg font-black text-foreground mb-1">Мы ещё не показали главное</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Самые важные скрытые параметры — где ты теряешь энергию, какие установки блокируют рост и какие конкретные инструменты тебе подходят.
        </p>

        <div className="space-y-2 mb-5">
          {[
            "Что с тобой происходит на глубоком уровне",
            "Где именно ты теряешь ресурс и почему",
            "Какие конкретные действия подходят твоему профилю",
            "Персональные тренажёры под твои задачи",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <Icon name="CheckCircle" size={15} className="text-violet-600 shrink-0" />
              <span className="text-sm text-foreground">{item}</span>
            </div>
          ))}
        </div>

        {payError && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-3 border border-red-100">
            {payError}
          </div>
        )}

        <button
          onClick={onPayClick}
          disabled={payLoading}
          className="w-full gradient-brand text-white font-black py-4 rounded-2xl text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md"
        >
          {payLoading ? (
            <><Icon name="Loader2" size={18} className="animate-spin" /> Обработка...</>
          ) : (
            <><Icon name="Unlock" size={18} /> Получить полный разбор за 290 ₽</>
          )}
        </button>
        <p className="text-center text-xs text-muted-foreground mt-2">Разовый платёж · Доступ навсегда</p>
      </div>
    </div>
  );
}
