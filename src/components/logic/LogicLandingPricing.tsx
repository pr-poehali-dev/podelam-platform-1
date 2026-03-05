import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { ProTrainerPricing } from "@/lib/proTrainerTypes";
import { getProAccess } from "@/lib/proTrainerAccess";

const TRAINER_ID = "logic-thinking" as const;

interface Props {
  pricing: ProTrainerPricing[];
  access: boolean;
  onPlanClick: (planId: string) => void;
  onNavigate: () => void;
}

export default function LogicLandingPricing({ pricing, access, onPlanClick, onNavigate }: Props) {
  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="anim-in text-2xl md:text-3xl font-bold text-slate-900 mb-4 text-center">
          Тарифы
        </h2>
        <p className="anim-in anim-d1 text-sm text-slate-500 text-center mb-14 max-w-md mx-auto">
          Не входит в общую подписку — отдельный PRO-инструмент
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pricing.map((plan, i) => {
            const activeAccess = getProAccess(TRAINER_ID);
            const isActive = access && activeAccess?.planId === plan.id;
            const isPro = plan.id === "pro";

            return (
              <div
                key={plan.id}
                className={`anim-in relative rounded-xl border p-6 md:p-8 transition-all ${
                  isPro ? "border-indigo-800 bg-indigo-950" : "border-slate-200 bg-white"
                }`}
                style={{ animationDelay: `${0.2 + i * 0.15}s` }}
              >
                {isPro && (
                  <div className="absolute -top-3 left-6 bg-indigo-500 text-white text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                    Рекомендуем
                  </div>
                )}

                <h3 className={`text-lg font-bold mb-1 ${isPro ? "text-white" : "text-slate-900"}`}>
                  {plan.name}
                </h3>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-3xl font-bold ${isPro ? "text-white" : "text-slate-900"}`}>
                    {plan.price.toLocaleString("ru-RU")} &#8381;
                  </span>
                  <span className={`text-sm ${isPro ? "text-indigo-300" : "text-slate-400"}`}>
                    / {plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-3">
                      <Icon
                        name="Check"
                        size={14}
                        className={isPro ? "text-indigo-300" : "text-indigo-600"}
                      />
                      <span className={`text-sm ${isPro ? "text-indigo-200" : "text-slate-600"}`}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {isActive ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                      <Icon name="Check" size={16} className="text-indigo-500" />
                      <span className="text-sm font-medium text-indigo-500">Доступ активен</span>
                    </div>
                    <Button
                      onClick={onNavigate}
                      className={`w-full h-12 rounded-lg text-base font-medium ${
                        isPro
                          ? "bg-white text-indigo-950 hover:bg-indigo-50"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      Перейти к тренажёру
                      <Icon name="ArrowRight" size={18} className="ml-2" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => onPlanClick(plan.id)}
                    className={`w-full h-12 rounded-lg text-base font-medium ${
                      isPro
                        ? "bg-white text-indigo-950 hover:bg-indigo-50"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    Выбрать
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
