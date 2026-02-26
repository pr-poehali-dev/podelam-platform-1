import { useState } from "react";
import Icon from "@/components/ui/icon";
import { getBalance, TOOL_PRICE, SUB_PRICE, SUB_DAYS } from "@/lib/access";

const YOOKASSA_URL = "https://functions.poehali.dev/1b07c03c-bee7-4b25-aeee-836e7331e044";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

function getUserData() {
  try {
    const u = JSON.parse(localStorage.getItem("pdd_user") || "{}");
    return { email: u.email || "", name: u.name || "" };
  } catch {
    return { email: "", name: "" };
  }
}

export default function BalanceTopUpModal({ onClose, onSuccess }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const presets = [
    {
      amount: TOOL_PRICE,
      label: "Разовый доступ",
      desc: "1 инструмент · 1 прохождение",
      icon: "Zap",
      color: "border-violet-200 bg-violet-50/80 hover:border-violet-400",
      activeColor: "border-violet-500 bg-violet-50 ring-2 ring-violet-400",
      badge: null,
    },
    {
      amount: SUB_PRICE,
      label: `Подписка ${SUB_DAYS} дней`,
      desc: "Все инструменты + Дневник",
      icon: "Crown",
      color: "border-amber-200 bg-amber-50/80 hover:border-amber-400",
      activeColor: "border-amber-500 bg-amber-50 ring-2 ring-amber-400",
      badge: "Выгодно",
    },
  ] as const;

  const finalAmount = selected === -1 ? parseInt(customAmount) || 0 : selected || 0;

  const handlePay = async () => {
    if (finalAmount < 1) return;

    const { email, name } = getUserData();
    if (!email) {
      setError("Войдите в аккаунт, чтобы пополнить баланс");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(YOOKASSA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          user_email: email,
          user_name: name,
          amount: finalAmount,
          return_url: window.location.origin,
        }),
      });

      const data = await res.json();

      if (data.confirmation_url) {
        window.ym?.(107022183, 'reachGoal', 'payment_initiated', { amount: finalAmount });
        window.location.href = data.confirmation_url;
      } else {
        setError(data.error || "Не удалось создать платёж. Попробуйте позже.");
        setLoading(false);
      }
    } catch {
      setError("Ошибка соединения. Проверьте интернет и попробуйте снова.");
      setLoading(false);
    }
  };

  const balance = getBalance();

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-black/40 p-4 pt-16 sm:pt-4" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 px-5 pt-5 pb-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Icon name="Wallet" size={18} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-base leading-tight">Пополнить баланс</div>
                <div className="text-violet-200 text-xs">Текущий: {balance} ₽</div>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <Icon name="X" size={16} className="text-white" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-2.5">
          {presets.map((opt) => (
            <button
              key={opt.amount}
              onClick={() => { setSelected(opt.amount); setCustomAmount(""); setError(""); }}
              className={`w-full rounded-2xl border-2 p-3.5 text-left transition-all ${selected === opt.amount ? opt.activeColor : opt.color}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selected === opt.amount ? "bg-violet-100" : "bg-white"}`}>
                    <Icon name={opt.icon as "Zap"} size={16} className={selected === opt.amount ? "text-violet-600" : "text-gray-500"} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 text-sm flex items-center gap-1.5 flex-wrap">
                      {opt.label}
                      {opt.badge && (
                        <span className="text-[10px] bg-amber-400 text-white px-1.5 py-0.5 rounded-full font-bold leading-none">{opt.badge}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">{opt.desc}</div>
                  </div>
                </div>
                <div className="font-black text-lg text-gray-900 shrink-0">{opt.amount} ₽</div>
              </div>
            </button>
          ))}

          <button
            onClick={() => { setSelected(-1); setError(""); }}
            className={`w-full rounded-2xl border-2 p-3.5 text-left transition-all ${
              selected === -1
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-400"
                : "border-blue-200 bg-blue-50/80 hover:border-blue-400"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selected === -1 ? "bg-blue-100" : "bg-white"}`}>
                <Icon name="PenLine" size={16} className={selected === -1 ? "text-blue-600" : "text-gray-500"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm">Своя сумма</div>
                {selected === -1 ? (
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="100000"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Введите сумму"
                      className="w-full bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-400"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-sm font-bold text-gray-500 shrink-0">₽</span>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 mt-0.5">Любая сумма от 1₽</div>
                )}
              </div>
            </div>
          </button>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              <Icon name="AlertCircle" size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="pt-1.5">
            <button
              onClick={handlePay}
              disabled={finalAmount < 1 || loading}
              className="w-full gradient-brand text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 text-[15px] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={17} className="animate-spin" />
                  Переходим к оплате...
                </>
              ) : (
                <>
                  <Icon name="CreditCard" size={17} />
                  Оплатить{finalAmount > 0 ? ` ${finalAmount} ₽` : ""}
                </>
              )}
            </button>
            <div className="flex items-center justify-center gap-1.5 mt-3 pb-1">
              <Icon name="Shield" size={12} className="text-muted-foreground" />
              <p className="text-center text-[11px] text-muted-foreground">Безопасная оплата через ЮКассу</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}