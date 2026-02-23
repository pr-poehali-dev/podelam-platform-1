import { useState } from "react";
import Icon from "@/components/ui/icon";
import { topUpBalance, getBalance, TOOL_PRICE, SUB_PRICE, SUB_DAYS } from "@/lib/access";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function BalanceTopUpModal({ onClose, onSuccess }: Props) {
  const [selected, setSelected] = useState<290 | 990 | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const options = [
    {
      amount: TOOL_PRICE as 290,
      label: "Разовый доступ",
      desc: "Открывает 1 инструмент на 1 прохождение",
      icon: "Zap",
      color: "border-violet-200 bg-violet-50 hover:border-violet-400",
      activeColor: "border-violet-500 bg-violet-50 ring-2 ring-violet-400",
      badge: null,
    },
    {
      amount: SUB_PRICE as 990,
      label: `Подписка на ${SUB_DAYS} дней`,
      desc: "Все инструменты + Дневник самоанализа",
      icon: "Crown",
      color: "border-amber-200 bg-amber-50 hover:border-amber-400",
      activeColor: "border-amber-500 bg-amber-50 ring-2 ring-amber-400",
      badge: "Выгодно",
    },
  ] as const;

  const handleTopUp = () => {
    if (!selected) return;
    setLoading(true);
    setTimeout(() => {
      topUpBalance(selected);
      setLoading(false);
      setDone(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1400);
    }, 900);
  };

  const balance = getBalance();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-up overflow-hidden">
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 px-6 pt-6 pb-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <Icon name="Wallet" size={20} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-lg">Пополнить баланс</div>
                <div className="text-violet-200 text-sm">Текущий: {balance} ₽</div>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <Icon name="X" size={16} className="text-white" />
            </button>
          </div>
          <p className="text-violet-100 text-sm">Выберите сумму пополнения — средства спишутся при открытии инструмента</p>
        </div>

        <div className="p-5 space-y-3">
          {options.map((opt) => (
            <button
              key={opt.amount}
              onClick={() => setSelected(opt.amount)}
              className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${selected === opt.amount ? opt.activeColor : opt.color}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${selected === opt.amount ? "bg-violet-100" : "bg-white"}`}>
                    <Icon name={opt.icon as "Zap"} size={18} className={selected === opt.amount ? "text-violet-600" : "text-gray-500"} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                      {opt.label}
                      {opt.badge && (
                        <span className="text-xs bg-amber-400 text-white px-2 py-0.5 rounded-full font-bold">{opt.badge}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div className="font-black text-xl text-gray-900">{opt.amount} ₽</div>
                </div>
              </div>
            </button>
          ))}

          <div className="pt-2">
            {done ? (
              <div className="flex items-center justify-center gap-2 py-3.5 bg-green-100 text-green-700 font-semibold rounded-2xl text-sm">
                <Icon name="CheckCircle" size={18} />
                Баланс пополнен на {selected} ₽!
              </div>
            ) : (
              <button
                onClick={handleTopUp}
                disabled={!selected || loading}
                className="w-full gradient-brand text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 text-[15px] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={17} className="animate-spin" />
                    Зачисляем...
                  </>
                ) : (
                  <>
                    <Icon name="Plus" size={17} />
                    Пополнить {selected ? `на ${selected} ₽` : ""}
                  </>
                )}
              </button>
            )}
            <p className="text-center text-xs text-muted-foreground mt-3">Платёжная система в тестовом режиме — деньги зачисляются мгновенно</p>
          </div>
        </div>
      </div>
    </div>
  );
}
