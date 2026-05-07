import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { getBalance, payFromBalanceOnce, TOOL_PRICE } from "@/lib/access";
import BalanceTopUpModal from "@/components/BalanceTopUpModal";
import { PROFILE_TEXTS } from "./barrierBotEngine";

const OFFER_KEY = "pdd_barrier_offer_expires";
const OFFER_DURATION = 24 * 60 * 60 * 1000;

function useOfferTimer() {
  const [secondsLeft, setSecondsLeft] = useState(0);
  useEffect(() => {
    let expires = Number(localStorage.getItem(OFFER_KEY));
    if (!expires || expires < Date.now()) {
      expires = Date.now() + OFFER_DURATION;
      localStorage.setItem(OFFER_KEY, String(expires));
    }
    const tick = () => setSecondsLeft(Math.max(0, Math.floor((expires - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(secondsLeft / 3600)).padStart(2, "0");
  const m = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0");
  const s = String(secondsLeft % 60).padStart(2, "0");
  return { h, m, s, expired: secondsLeft === 0 };
}

type Props = { onPay: () => void };

export default function BarrierBotPaywall({ onPay }: Props) {
  const [balance, setBalance] = useState(getBalance);
  const [loading, setLoading] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [payError, setPayError] = useState("");
  const { h, m, s, expired } = useOfferTimer();
  const canPay = balance >= TOOL_PRICE;

  const handlePay = async () => {
    setPayError("");
    if (canPay) {
      setLoading(true);
      const ok = await payFromBalanceOnce("barrier-bot");
      setLoading(false);
      if (ok) onPay();
      else setPayError("Ошибка списания. Попробуйте ещё раз.");
    } else {
      setShowTopUp(true);
    }
  };

  const profiles = Object.values(PROFILE_TEXTS);
  const firstProfile = profiles[0];

  return (
    <>
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="max-w-sm w-full bg-white rounded-2xl border-2 border-rose-200 overflow-hidden shadow-lg shadow-rose-100/50">

          {/* Шапка */}
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 px-6 py-5 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Icon name="ShieldAlert" size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black leading-tight">Барьеры, тревоги и стресс</h2>
                <p className="text-rose-100 text-xs">Найди точку срыва и преодолей её</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2 text-sm">
              <Icon name="Wallet" size={14} />
              <span className="font-semibold">Баланс: {balance} ₽</span>
            </div>
          </div>

          {/* Таймер */}
          {!expired && (
            <div className="bg-amber-50 border-b border-amber-100 px-5 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="Clock" size={14} className="text-amber-500 shrink-0" />
                <span className="text-xs font-semibold text-amber-700">Цена 290 ₽ действует ещё:</span>
              </div>
              <div className="flex items-center gap-1 font-black text-amber-700 tabular-nums text-sm">
                <span className="bg-amber-100 rounded-md px-1.5 py-0.5">{h}</span>
                <span>:</span>
                <span className="bg-amber-100 rounded-md px-1.5 py-0.5">{m}</span>
                <span>:</span>
                <span className="bg-amber-100 rounded-md px-1.5 py-0.5">{s}</span>
              </div>
            </div>
          )}

          <div className="p-5">
            {/* Крючок — превью профилей */}
            <p className="text-xs text-rose-500 font-bold uppercase tracking-wide mb-2">Что ты узнаешь про себя</p>
            <div className="rounded-xl border border-rose-100 overflow-hidden mb-4">
              <div className="bg-rose-50 px-4 py-2 flex items-center gap-2 border-b border-rose-100">
                <Icon name="Brain" size={14} className="text-rose-500" />
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wide">Твой психологический профиль</span>
              </div>
              {/* Первый профиль — виден */}
              <div className="px-4 py-3 bg-white flex items-start gap-3">
                <Icon name="CheckCircle" size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-foreground">{firstProfile.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{firstProfile.desc}</p>
                </div>
              </div>
              {/* Остальные — заблюрены */}
              <div className="relative">
                <div className="px-4 py-3 space-y-3 blur-[4px] select-none pointer-events-none bg-white border-t border-border/40">
                  {profiles.slice(1).map((p, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Icon name="CheckCircle" size={16} className="text-rose-300 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-foreground">{p.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 border border-rose-200 rounded-full px-4 py-1.5 flex items-center gap-1.5 shadow-sm">
                    <Icon name="Lock" size={13} className="text-rose-500" />
                    <span className="text-xs font-bold text-rose-600">Определяется в ходе сессии</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Чекбоксы */}
            <div className="space-y-2 mb-5">
              {[
                "Восстановишь прошлый провал по шагам",
                "Увидишь точку, где тревога сломила движение",
                "Пересчитаешь сценарий с опорой на свои силы",
                "Получишь персональный график X–Y",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Icon name="CheckCircle" size={15} className="text-rose-500 shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>

            {/* Цена с якорением */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-muted-foreground line-through text-sm">590 ₽</span>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">−50%</span>
              <span className="text-foreground font-black text-xl">290 ₽</span>
            </div>

            {payError && (
              <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-3 border border-red-100">
                {payError}
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black py-4 rounded-2xl text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md"
            >
              {loading ? (
                <><Icon name="Loader2" size={18} className="animate-spin" /> Обработка...</>
              ) : canPay ? (
                <><Icon name="Unlock" size={18} /> Начать сессию</>
              ) : (
                <><Icon name="Plus" size={18} /> Пополнить баланс и начать</>
              )}
            </button>

            {!canPay && balance > 0 && (
              <p className="text-center text-xs text-muted-foreground mt-2">Не хватает {TOOL_PRICE - balance} ₽</p>
            )}
            <p className="text-center text-xs text-muted-foreground mt-2">Разовый платёж · Коучинговая сессия ~15–20 минут</p>
          </div>
        </div>
      </div>

      {showTopUp && (
        <BalanceTopUpModal
          onClose={() => setShowTopUp(false)}
          onSuccess={() => {
            setBalance(getBalance());
            setShowTopUp(false);
            setTimeout(async () => {
              if (getBalance() >= TOOL_PRICE) {
                const ok = await payFromBalanceOnce("barrier-bot");
                if (ok) onPay();
              }
            }, 300);
          }}
        />
      )}
    </>
  );
}
