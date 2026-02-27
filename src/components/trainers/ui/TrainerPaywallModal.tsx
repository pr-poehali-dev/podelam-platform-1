import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { TrainerId } from "../types";
import { getTrainerDef } from "../trainerDefs";
import { getBalance } from "@/lib/access";
import {
  TrainerPlanId,
  TRAINER_PLANS,
  payTrainerPlanFromBalance,
  createTrainerPayment,
} from "@/lib/trainerAccess";
import BalanceTopUpModal from "@/components/BalanceTopUpModal";

type Props = {
  trainerId: TrainerId;
  onClose: () => void;
  onSuccess: () => void;
};

export default function TrainerPaywallModal({
  trainerId,
  onClose,
  onSuccess,
}: Props) {
  const trainer = getTrainerDef(trainerId);
  const [selectedPlan, setSelectedPlan] = useState<TrainerPlanId>("advanced");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTopUp, setShowTopUp] = useState(false);
  const [balance, setBalance] = useState(getBalance);

  const refreshBalance = () => setBalance(getBalance());

  const plan = TRAINER_PLANS.find((p) => p.id === selectedPlan)!;
  const canPayFromBalance = balance >= plan.price;

  const handlePayFromBalance = async () => {
    setLoading(true);
    setError("");
    const ok = await payTrainerPlanFromBalance(
      selectedPlan,
      selectedPlan === "basic" ? trainerId : undefined
    );
    setLoading(false);
    if (ok) {
      onSuccess();
    } else {
      setError("Недостаточно средств на балансе");
      refreshBalance();
    }
  };

  const handlePayYookassa = async () => {
    setLoading(true);
    setError("");
    const url = await createTrainerPayment(
      selectedPlan,
      selectedPlan === "basic" ? trainerId : undefined
    );
    if (url) {
      window.location.href = url;
    } else {
      setError("Не удалось создать платёж. Попробуйте позже.");
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      >
        <div
          className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="gradient-brand p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Icon name="X" size={16} />
            </button>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
              <Icon name="Lock" size={22} />
            </div>
            <h2 className="text-xl font-black mb-1">
              Оформите доступ к тренажёрам
            </h2>
            {trainer && (
              <p className="text-white/80 text-sm">
                Вы хотите запустить: {trainer.title}
              </p>
            )}
            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-1.5 text-sm font-semibold">
              <Icon name="Wallet" size={14} />
              Баланс: {balance} ₽
            </div>
          </div>

          <div className="p-5 space-y-3">
            {TRAINER_PLANS.map((p) => {
              const isSelected = selectedPlan === p.id;
              const isPopular = p.id === "advanced";
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPlan(p.id);
                    setError("");
                  }}
                  className={`
                    w-full rounded-2xl border-2 p-4 text-left transition-all relative
                    ${
                      isSelected
                        ? isPopular
                          ? "border-violet-500 bg-violet-50 ring-2 ring-violet-400"
                          : "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : "border-gray-100 hover:border-gray-200 bg-white"
                    }
                  `}
                >
                  {isPopular && (
                    <span className="absolute -top-2.5 right-3 text-[10px] bg-violet-600 text-white px-2 py-0.5 rounded-full font-bold">
                      Популярный
                    </span>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-foreground text-sm flex items-center gap-2">
                        {p.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {p.description}
                      </div>
                      {p.id === "basic" && trainer && (
                        <div className="text-[11px] text-primary/70 mt-1">
                          Тренажёр: {trainer.title}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-black text-foreground">
                        {p.price.toLocaleString("ru-RU")} ₽
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        /{p.period}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                <Icon name="AlertCircle" size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="pt-1 space-y-2.5">
              {canPayFromBalance ? (
                <Button
                  onClick={handlePayFromBalance}
                  disabled={loading}
                  className="w-full h-12 rounded-2xl gradient-brand text-white font-bold text-[15px] border-0 hover:opacity-90"
                >
                  {loading ? (
                    <>
                      <Icon
                        name="Loader2"
                        size={17}
                        className="animate-spin mr-2"
                      />
                      Активируем...
                    </>
                  ) : (
                    <>
                      <Icon name="Wallet" size={17} className="mr-2" />
                      Списать с баланса —{" "}
                      {plan.price.toLocaleString("ru-RU")} ₽
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handlePayYookassa}
                  disabled={loading}
                  className="w-full h-12 rounded-2xl gradient-brand text-white font-bold text-[15px] border-0 hover:opacity-90"
                >
                  {loading ? (
                    <>
                      <Icon
                        name="Loader2"
                        size={17}
                        className="animate-spin mr-2"
                      />
                      Переходим к оплате...
                    </>
                  ) : (
                    <>
                      <Icon name="CreditCard" size={17} className="mr-2" />
                      Оплатить {plan.price.toLocaleString("ru-RU")} ₽
                    </>
                  )}
                </Button>
              )}

              {!canPayFromBalance && balance > 0 && (
                <p className="text-center text-xs text-muted-foreground">
                  На балансе {balance} ₽ — не хватает{" "}
                  {(plan.price - balance).toLocaleString("ru-RU")} ₽
                </p>
              )}

              <button
                onClick={() => setShowTopUp(true)}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-primary hover:underline py-1"
              >
                <Icon name="Plus" size={14} />
                Пополнить баланс
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 pt-1 pb-1">
              <Icon
                name="Shield"
                size={12}
                className="text-muted-foreground"
              />
              <p className="text-center text-[11px] text-muted-foreground">
                Безопасная оплата через ЮКассу
              </p>
            </div>
          </div>
        </div>
      </div>

      {showTopUp && (
        <BalanceTopUpModal
          onClose={() => {
            setShowTopUp(false);
            refreshBalance();
          }}
          onSuccess={() => {
            setShowTopUp(false);
            refreshBalance();
          }}
        />
      )}
    </>
  );
}
