import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { ProTrainerPricing } from "@/lib/proTrainerTypes";

interface Props {
  pricing: ProTrainerPricing[];
  balance: number;
  loading: boolean;
  error: string;
  onPayBalance: (planId: string) => void;
  onPayCard: (planId: string) => void;
  onBack: () => void;
}

export default function LogicPayment({
  pricing,
  balance,
  loading,
  error,
  onPayBalance,
  onPayCard,
  onBack,
}: Props) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
        <Icon name="Lightbulb" size={28} className="text-white" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Логика мышления PRO</h1>
      <p className="text-sm text-slate-500 mb-8">Выберите тариф для доступа к тренажёру</p>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between mb-6 text-left">
        <span className="text-sm text-slate-500">{balance.toLocaleString("ru-RU")} &#8381; на балансе</span>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-6 text-left">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <Icon name="AlertCircle" size={14} />
            {error}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
        {pricing.map((plan) => {
          const isPro = plan.id === "pro";
          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border p-6 ${
                isPro ? "bg-indigo-950 border-indigo-800" : "bg-white border-slate-200"
              }`}
            >
              {isPro && (
                <div className="absolute -top-3 left-5 bg-indigo-500 text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                  Рекомендуем
                </div>
              )}

              <h3 className={`text-base font-bold mb-1 ${isPro ? "text-white" : "text-slate-900"}`}>
                {plan.name}
              </h3>

              <div className="flex items-baseline gap-1 mb-5">
                <span className={`text-3xl font-bold ${isPro ? "text-white" : "text-slate-900"}`}>
                  {plan.price.toLocaleString("ru-RU")} &#8381;
                </span>
                <span className={`text-sm ${isPro ? "text-indigo-300" : "text-slate-400"}`}>
                  / {plan.period}
                </span>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Icon name="Check" size={14} className={isPro ? "text-indigo-300" : "text-indigo-600"} />
                    <span className={`text-sm ${isPro ? "text-indigo-200" : "text-slate-600"}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
                {isPro ? (
                  <>
                    <Button
                      onClick={() => onPayCard(plan.id)}
                      disabled={loading}
                      className="w-full h-11 text-sm font-medium bg-white text-indigo-950 hover:bg-indigo-100 disabled:bg-white/70 disabled:text-indigo-950/50"
                    >
                      {loading ? (
                        <Icon name="Loader2" size={16} className="animate-spin" />
                      ) : (
                        <>
                          <Icon name="CreditCard" size={16} className="mr-1.5" />
                          Картой
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => onPayBalance(plan.id)}
                      disabled={loading || balance < plan.price}
                      variant="outline"
                      className="w-full h-11 text-sm font-medium border-indigo-500 text-white hover:bg-indigo-800 disabled:border-indigo-700 disabled:text-indigo-400 disabled:opacity-100"
                    >
                      <Icon name="Wallet" size={16} className="mr-1.5" />
                      С баланса
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => onPayCard(plan.id)}
                      disabled={loading}
                      className="w-full h-11 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      {loading ? (
                        <Icon name="Loader2" size={16} className="animate-spin" />
                      ) : (
                        <>
                          <Icon name="CreditCard" size={16} className="mr-1.5" />
                          Картой
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => onPayBalance(plan.id)}
                      disabled={loading || balance < plan.price}
                      variant="outline"
                      className="w-full h-11 text-sm font-medium border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      <Icon name="Wallet" size={16} className="mr-1.5" />
                      С баланса
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Button
        variant="ghost"
        onClick={onBack}
        className="text-slate-500 hover:text-slate-900"
      >
        <Icon name="ArrowLeft" size={16} className="mr-2" />
        Назад
      </Button>
    </div>
  );
}