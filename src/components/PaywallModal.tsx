import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  ToolId, TOOL_PRICE, SUB_PRICE,
  activatePaidOnce, activateSubscription,
  getBalance, payFromBalanceOnce, payFromBalanceSub,
} from "@/lib/access";

type Props = {
  toolId: ToolId;
  toolName: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function PaywallModal({ toolId, toolName, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState<"balance_once" | "balance_sub" | "demo_once" | "demo_sub" | null>(null);
  const balance = getBalance();
  const isDiaryOnly = toolId === "diary";
  const canPayOnce = !isDiaryOnly && balance >= TOOL_PRICE;
  const canPaySub = balance >= SUB_PRICE;

  const payFromBalance = async (plan: "once" | "sub") => {
    const key = plan === "once" ? "balance_once" : "balance_sub";
    setLoading(key);
    await new Promise((r) => setTimeout(r, 700));
    const ok = plan === "sub" ? payFromBalanceSub() : payFromBalanceOnce(toolId);
    setLoading(null);
    if (ok) onSuccess();
  };

  const payDemo = async (plan: "once" | "sub") => {
    const key = plan === "once" ? "demo_once" : "demo_sub";
    setLoading(key);
    await new Promise((r) => setTimeout(r, 1200));
    if (plan === "sub") activateSubscription();
    else activatePaidOnce(toolId);
    setLoading(null);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Шапка */}
        <div className="gradient-brand p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
            <Icon name="X" size={16} />
          </button>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
            <Icon name="Lock" size={22} />
          </div>
          <h2 className="text-xl font-black mb-1">Инструмент заблокирован</h2>
          <p className="text-white/80 text-sm">{toolName}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-1.5 text-sm font-semibold">
            <Icon name="Wallet" size={14} />
            Баланс: {balance} ₽
          </div>
        </div>

        <div className="p-5 space-y-3">
          {/* Разовый доступ — только если не дневник */}
          {!isDiaryOnly && (
            <div className="rounded-2xl border-2 border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-bold text-foreground text-base">Разовый доступ</div>
                  <div className="text-muted-foreground text-sm mt-0.5">1 прохождение, история сохраняется</div>
                </div>
                <div className="text-2xl font-black text-primary">{TOOL_PRICE} ₽</div>
              </div>
              {canPayOnce ? (
                <button
                  onClick={() => payFromBalance("once")}
                  disabled={!!loading}
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white font-semibold py-2.5 rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-60 text-sm"
                >
                  {loading === "balance_once" ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Wallet" size={15} />}
                  Списать с баланса — {TOOL_PRICE} ₽
                </button>
              ) : (
                <button
                  onClick={() => payDemo("once")}
                  disabled={!!loading}
                  className="w-full flex items-center justify-center gap-2 border-2 border-primary/30 hover:border-primary text-primary font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
                >
                  {loading === "demo_once" ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="CreditCard" size={15} />}
                  {balance > 0 ? `Не хватает ${TOOL_PRICE - balance} ₽ — пополнить` : "Оплатить картой"}
                </button>
              )}
            </div>
          )}

          {/* Подписка 990₽ */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-4 text-white relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">Выгодно</div>
            <div className="mb-3 pr-16">
              <div className="font-bold text-base">Полный доступ 30 дней</div>
              <div className="text-white/80 text-sm mt-0.5">Все инструменты + Дневник самоанализа</div>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {["Психоанализ", "Барьеры", "Подбор дохода", "Шаги развития", "Дневник"].map((t) => (
                  <span key={t} className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
              <div className="text-2xl font-black mt-2">{SUB_PRICE} ₽ <span className="text-base font-normal text-white/70">/ мес</span></div>
            </div>
            {canPaySub ? (
              <button
                onClick={() => payFromBalance("sub")}
                disabled={!!loading}
                className="w-full flex items-center justify-center gap-2 bg-white text-violet-700 font-bold py-2.5 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-60 text-sm"
              >
                {loading === "balance_sub" ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Wallet" size={15} />}
                Списать с баланса — {SUB_PRICE} ₽
              </button>
            ) : (
              <button
                onClick={() => payDemo("sub")}
                disabled={!!loading}
                className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
              >
                {loading === "demo_sub" ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="CreditCard" size={15} />}
                {balance > 0 ? `Не хватает ${SUB_PRICE - balance} ₽ — пополнить` : "Оплатить картой"}
              </button>
            )}
          </div>

          {isDiaryOnly && (
            <p className="text-center text-xs text-muted-foreground">
              Дневник самоанализа доступен только при подписке 990 ₽/мес
            </p>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Платёжная система в тестовом режиме
          </p>
        </div>
      </div>
    </div>
  );
}
