import { useState } from "react";
import Icon from "@/components/ui/icon";
import { ToolId, TOOL_PRICE, SUB_PRICE, activatePaidOnce, activateSubscription, hasSubscription } from "@/lib/access";

type Props = {
  toolId: ToolId;
  toolName: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function PaywallModal({ toolId, toolName, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState<"once" | "sub" | null>(null);

  const isDiaryOnly = toolId === "diary";

  const pay = async (plan: "once" | "sub") => {
    setLoading(plan);
    // Симуляция оплаты (задержка 1.2 сек)
    await new Promise((r) => setTimeout(r, 1200));
    if (plan === "sub") {
      activateSubscription();
    } else {
      activatePaidOnce(toolId);
    }
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
        </div>

        <div className="p-6 space-y-3">
          {/* Разовый доступ — только если не дневник */}
          {!isDiaryOnly && (
            <button
              onClick={() => pay("once")}
              disabled={!!loading}
              className="w-full bg-white border-2 border-primary/30 hover:border-primary rounded-2xl p-4 text-left transition-all group relative overflow-hidden disabled:opacity-60"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-foreground text-base">Разовый доступ</div>
                  <div className="text-muted-foreground text-sm mt-0.5">Один сеанс, история сохраняется</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-primary">{TOOL_PRICE} ₽</div>
                  {loading === "once" && (
                    <Icon name="Loader2" size={16} className="animate-spin text-primary ml-auto mt-1" />
                  )}
                </div>
              </div>
            </button>
          )}

          {/* Подписка 990₽ */}
          <button
            onClick={() => pay("sub")}
            disabled={!!loading}
            className="w-full gradient-brand text-white rounded-2xl p-4 text-left transition-all relative overflow-hidden disabled:opacity-60"
          >
            <div className="absolute top-3 right-3 bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">Выгодно</div>
            <div className="flex items-center justify-between pr-16">
              <div>
                <div className="font-bold text-base">Полный доступ 30 дней</div>
                <div className="text-white/80 text-sm mt-0.5">Все инструменты + Дневник самоанализа</div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {["Психологический анализ", "Барьеры", "Подбор дохода", "Шаги развития", "Дневник"].map((t) => (
                    <span key={t} className="text-[11px] bg-white/20 text-white px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <div className="text-2xl font-black">{SUB_PRICE} ₽</div>
                <div className="text-white/70 text-xs">/ мес</div>
                {loading === "sub" && (
                  <Icon name="Loader2" size={16} className="animate-spin text-white ml-auto mt-1" />
                )}
              </div>
            </div>
          </button>

          {isDiaryOnly && (
            <p className="text-center text-xs text-muted-foreground pt-1">
              Дневник самоанализа доступен только при подписке 990 ₽/мес
            </p>
          )}

          <p className="text-center text-xs text-muted-foreground pt-1">
            Оплата симулируется в демо-режиме. После реальной интеграции подключится эквайринг.
          </p>
        </div>
      </div>
    </div>
  );
}
