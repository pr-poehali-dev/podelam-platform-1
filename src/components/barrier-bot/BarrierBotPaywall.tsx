import { useState } from "react";
import Icon from "@/components/ui/icon";
import { getBalance, payFromBalanceOnce, TOOL_PRICE } from "@/lib/access";
import BalanceTopUpModal from "@/components/BalanceTopUpModal";

type Props = {
  onPay: () => void;
};

export default function BarrierBotPaywall({ onPay }: Props) {
  const [balance, setBalance] = useState(getBalance);
  const [loading, setLoading] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const canPay = balance >= TOOL_PRICE;

  const handleBalancePay = async () => {
    setLoading(true);
    const ok = await payFromBalanceOnce("barrier-bot");
    setLoading(false);
    if (ok) onPay();
  };

  return (
    <>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-6 text-white text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
              <Icon name="ShieldAlert" size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-bold mb-1">Барьеры, тревоги и стресс</h2>
            <p className="text-rose-100 text-sm">Найди точку срыва и научись её удерживать</p>
            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-1.5 text-sm font-semibold">
              <Icon name="Wallet" size={13} />
              Баланс: {balance} ₽
            </div>
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
              <span className="text-3xl font-bold text-gray-900">{TOOL_PRICE} ₽</span>
              <span className="text-gray-500 text-sm ml-1">одноразово</span>
            </div>

            {canPay ? (
              <button
                onClick={handleBalancePay}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-60"
              >
                {loading ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Wallet" size={15} />}
                Списать с баланса — {TOOL_PRICE} ₽
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => setShowTopUp(true)}
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
                >
                  Пополнить баланс и начать
                </button>
                <p className="text-center text-xs text-gray-400">
                  {balance > 0 ? `Не хватает ${TOOL_PRICE - balance} ₽` : `Нужно ${TOOL_PRICE} ₽ на балансе`}
                </p>
              </div>
            )}

            <p className="text-center text-xs text-gray-400 mt-3">Коучинговая сессия · ~15–20 минут</p>
          </div>
        </div>
      </div>
      {showTopUp && (
        <BalanceTopUpModal
          onClose={() => setShowTopUp(false)}
          onSuccess={() => setBalance(getBalance())}
        />
      )}
    </>
  );
}