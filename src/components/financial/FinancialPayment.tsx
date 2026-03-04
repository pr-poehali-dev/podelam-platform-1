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

export default function FinancialPayment({
  pricing,
  balance,
  loading,
  error,
  onPayBalance,
  onPayCard,
  onBack,
}: Props) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center mx-auto mb-4">
          <Icon name="Wallet" size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Финансовое мышление PRO</h1>
        <p className="text-sm text-slate-500">Выберите тариф для получения доступа</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between mb-8">
        <span className="text-sm text-slate-600">Ваш баланс</span>
        <span className="text-lg font-bold text-slate-900">
          {balance.toLocaleString("ru-RU")} &#8381;
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-6">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <Icon name="AlertCircle" size={14} />
            {error}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {pricing.map((plan) => {
          const isPro = plan.id === "pro";
          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border p-6 transition-all ${
                isPro
                  ? "border-slate-900 bg-slate-950"
                  : "border-slate-200 bg-white"
              }`}
            >
              {isPro && (
                <div className="absolute -top-3 left-6 bg-white text-slate-950 text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
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

              <div className="flex items-baseline gap-1 mb-5">
                <span
                  className={`text-3xl font-bold ${
                    isPro ? "text-white" : "text-slate-900"
                  }`}
                >
                  {plan.price.toLocaleString("ru-RU")} &#8381;
                </span>
                <span className={`text-sm ${isPro ? "text-slate-400" : "text-slate-400"}`}>
                  / {plan.period}
                </span>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Icon
                      name="Check"
                      size={14}
                      className={isPro ? "text-white" : "text-slate-900"}
                    />
                    <span
                      className={`text-sm ${
                        isPro ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
                <Button
                  onClick={() => onPayBalance(plan.id)}
                  disabled={loading || balance < plan.price}
                  className={`w-full h-11 text-sm font-medium rounded-lg ${
                    isPro
                      ? "bg-white text-slate-950 hover:bg-slate-100"
                      : "bg-slate-950 text-white hover:bg-slate-800"
                  }`}
                >
                  {loading ? (
                    <Icon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Icon name="Wallet" size={16} />
                      Оплатить с баланса
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => onPayCard(plan.id)}
                  disabled={loading}
                  variant="outline"
                  className={`w-full h-11 text-sm font-medium rounded-lg ${
                    isPro
                      ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon name="CreditCard" size={16} />
                  Оплатить картой
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-slate-500 hover:text-slate-900"
        >
          <Icon name="ArrowLeft" size={16} className="mr-2" />
          Назад
        </Button>
        <p className="text-xs text-slate-400">
          Этот продукт не входит в подписку тренажёров. Отдельная покупка.
        </p>
      </div>
    </div>
  );
}
