import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { ProTrainerPricing } from "@/lib/proTrainerTypes";
import { getProAccess } from "@/lib/proTrainerAccess";

const TRAINER_ID = "financial-thinking" as const;

interface Props {
  pricing: ProTrainerPricing[];
  access: boolean;
  onPlanClick: (planId: string) => void;
  onNavigate: () => void;
}

export default function FinancialLandingPricing({ pricing, access, onPlanClick, onNavigate }: Props) {
  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="anim-in text-2xl md:text-3xl font-bold text-slate-900 mb-4 text-center">
          Тарифы
        </h2>
        <p className="anim-in anim-d1 text-sm text-slate-500 text-center mb-14 max-w-md mx-auto">
          Выберите подходящий формат доступа
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pricing.map((plan, i) => {
            const activeAccess = getProAccess(TRAINER_ID);
            const isActive = access && activeAccess?.planId === plan.id;
            const isPro = plan.id === "pro";

            return (
              <PricingCard
                key={plan.id}
                plan={plan}
                isPro={isPro}
                isActive={isActive}
                delay={0.2 + i * 0.15}
                onSelect={() => onPlanClick(plan.id)}
                onNavigate={onNavigate}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  plan,
  isPro,
  isActive,
  delay,
  onSelect,
  onNavigate,
}: {
  plan: ProTrainerPricing;
  isPro: boolean;
  isActive: boolean;
  delay: number;
  onSelect: () => void;
  onNavigate: () => void;
}) {
  return (
    <div
      className={`anim-in relative rounded-xl border p-6 md:p-8 transition-all ${
        isPro
          ? "border-emerald-800 bg-emerald-950"
          : "border-slate-200 bg-white"
      }`}
      style={{ animationDelay: `${delay}s` }}
    >
      {isPro && (
        <div className="absolute -top-3 left-6 bg-white text-emerald-950 text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
          Рекомендуем
        </div>
      )}

      <h3
        className={`text-lg font-bold mb-1 ${
          isPro ? "text-white" : "text-slate-900"
        }`}
      >
        {plan.name}
      </h3>

      <div className="flex items-baseline gap-1 mb-6">
        <span
          className={`text-3xl font-bold ${
            isPro ? "text-white" : "text-slate-900"
          }`}
        >
          {plan.price.toLocaleString("ru-RU")} &#8381;
        </span>
        <span
          className={`text-sm ${isPro ? "text-emerald-400/60" : "text-slate-400"}`}
        >
          / {plan.period}
        </span>
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((f, fi) => (
          <li key={fi} className="flex items-center gap-3">
            <Icon
              name="Check"
              size={14}
              className={isPro ? "text-white" : "text-slate-900"}
            />
            <span
              className={`text-sm ${
                isPro ? "text-emerald-300" : "text-slate-600"
              }`}
            >
              {f}
            </span>
          </li>
        ))}
      </ul>

      {isActive ? (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Icon name="Check" size={16} className="text-emerald-500" />
            <span className="text-sm font-medium text-emerald-500">
              Доступ активен
            </span>
          </div>
          <Button
            onClick={onNavigate}
            className={`w-full h-12 rounded-lg text-base font-medium ${
              isPro
                ? "bg-white text-emerald-950 hover:bg-emerald-50"
                : "bg-emerald-950 text-white hover:bg-emerald-800"
            }`}
          >
            Перейти к тренажёру
            <Icon name="ArrowRight" size={18} />
          </Button>
        </div>
      ) : (
        <Button
          onClick={onSelect}
          className={`w-full h-12 rounded-lg text-base font-medium ${
            isPro
              ? "bg-white text-emerald-950 hover:bg-emerald-50"
              : "bg-emerald-950 text-white hover:bg-emerald-800"
          }`}
        >
          Выбрать
        </Button>
      )}
    </div>
  );
}