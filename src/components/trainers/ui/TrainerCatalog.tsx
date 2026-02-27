import { useState, useMemo } from "react";
import { TrainerId } from "../types";
import { TRAINER_DEFS } from "../trainerDefs";
import { getStats, getCurrentSession } from "../trainerStorage";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import TrainerCard from "./TrainerCard";
import {
  TrainerPlanId,
  TRAINER_PLANS,
  getTrainerSubscription,
  hasTrainerAccess,
  payTrainerPlanFromBalance,
  createTrainerPayment,
  trainerSubExpiresFormatted,
  getSessionLimitInfo,
} from "@/lib/trainerAccess";
import { getBalance } from "@/lib/access";
import BalanceTopUpModal from "@/components/BalanceTopUpModal";

type Props = {
  onSelectTrainer: (trainerId: TrainerId) => void;
};

const PRICING_PLANS = [
  {
    id: "basic",
    name: "Базовый",
    price: 990,
    period: "мес",
    description: "Один тренажёр на выбор",
    trainers: "Осознанный выбор, Антипрокрастинация или Деньги без тревоги",
    features: [
      "1 тренажёр на выбор",
      "До 4 сессий в месяц",
      "Базовая аналитика",
      "Сохранение результатов",
    ],
    accent: false,
  },
  {
    id: "advanced",
    name: "Продвинутый",
    price: 2490,
    period: "3 мес",
    description: "Все тренажёры · полная аналитика",
    trainers: "Все 5 тренажёров включены",
    features: [
      "Все 5 тренажёров",
      "Неограниченные сессии",
      "Индексы EMI, AI, IVO, FSI",
      "Аналитика паттернов",
      "Трекер прогресса и динамика",
      "Сравнение периодов",
    ],
    accent: true,
  },
  {
    id: "yearly",
    name: "Годовой",
    price: 6990,
    period: "год",
    description: "Максимальная глубина проработки",
    trainers: "Все 5 тренажёров + эксклюзивные функции",
    features: [
      "Все 5 тренажёров",
      "Неограниченные сессии",
      "Годовая динамика EMI, AI, IVO, FSI",
      "Тепловая карта эмоций",
      "Анализ денежных и поведенческих импульсов",
      "Глубокая проработка паттернов",
      "Приоритетная поддержка",
    ],
    accent: false,
  },
];

export default function TrainerCatalog({ onSelectTrainer }: Props) {
  const [search, setSearch] = useState("");
  const [planLoading, setPlanLoading] = useState<TrainerPlanId | null>(null);
  const [planError, setPlanError] = useState("");
  const [showTopUp, setShowTopUp] = useState(false);
  const [balance, setBalance] = useState(getBalance);
  const [, forceUpdate] = useState(0);

  const sub = getTrainerSubscription();
  const subExpires = trainerSubExpiresFormatted();
  const refreshBalance = () => {
    setBalance(getBalance());
    forceUpdate((n) => n + 1);
  };

  const handleBuyPlan = async (planId: TrainerPlanId) => {
    setPlanLoading(planId);
    setPlanError("");
    const plan = TRAINER_PLANS.find((p) => p.id === planId);
    if (!plan) return;

    if (balance >= plan.price) {
      const ok = await payTrainerPlanFromBalance(planId);
      setPlanLoading(null);
      if (ok) {
        refreshBalance();
      } else {
        setPlanError("Недостаточно средств");
      }
    } else {
      const url = await createTrainerPayment(planId);
      if (url) {
        window.location.href = url;
      } else {
        setPlanError("Не удалось создать платёж");
        setPlanLoading(null);
      }
    }
  };

  const trainersWithMeta = useMemo(() => {
    return TRAINER_DEFS.map((def) => ({
      def,
      stats: getStats(def.id),
      activeSession: getCurrentSession(def.id),
    }));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return trainersWithMeta;
    const q = search.toLowerCase().trim();
    return trainersWithMeta.filter(
      ({ def }) =>
        def.title.toLowerCase().includes(q) ||
        def.subtitle.toLowerCase().includes(q) ||
        def.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [search, trainersWithMeta]);

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
            <Icon name="Dumbbell" className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              Тренажёры
            </h1>
            <p className="text-sm text-muted-foreground">
              Психологические инструменты для ежедневной практики
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Icon
            name="Search"
            className="w-4 h-4 text-muted-foreground/50"
          />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по названию или тегу..."
          className="
            w-full h-10 pl-10 pr-4 rounded-xl
            border border-border bg-card text-sm
            placeholder:text-muted-foreground/50
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40
            transition-all duration-200
          "
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
          >
            <Icon
              name="X"
              className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"
            />
          </button>
        )}
      </div>

      {/* Cards grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(({ def, stats, activeSession }, idx) => (
            <TrainerCard
              key={def.id}
              trainer={def}
              stats={stats.completedSessions > 0 ? stats : undefined}
              hasActiveSession={!!activeSession}
              onStart={() => onSelectTrainer(def.id)}
              onContinue={
                activeSession
                  ? () => onSelectTrainer(def.id)
                  : undefined
              }
              animationDelay={idx * 100}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Icon
              name="SearchX"
              className="w-6 h-6 text-muted-foreground"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Ничего не найдено по запросу &laquo;{search}&raquo;
          </p>
          <button
            onClick={() => setSearch("")}
            className="text-sm text-primary mt-2 hover:underline"
          >
            Сбросить поиск
          </button>
        </div>
      )}

      {/* Stats teaser */}
      {trainersWithMeta.some((t) => t.stats.completedSessions > 0) && (
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <Icon
              name="BarChart3"
              className="w-5 h-5 text-primary"
            />
            <h2 className="font-semibold text-foreground">
              Ваша статистика
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {trainersWithMeta
              .filter((t) => t.stats.completedSessions > 0)
              .map(({ def, stats }) => (
                <div
                  key={def.id}
                  className="flex flex-col items-center text-center p-3 rounded-xl bg-muted/50"
                >
                  <Icon
                    name={def.icon}
                    className={`w-5 h-5 ${def.iconColor} mb-1.5`}
                  />
                  <span className="text-lg font-bold text-foreground tabular-nums">
                    {stats.completedSessions}
                  </span>
                  <span className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                    {def.title.length > 16
                      ? def.title.slice(0, 14) + "..."
                      : def.title}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {sub && (() => {
        const boundTrainer = sub.trainerId as TrainerId | undefined;
        const limitInfo = boundTrainer ? getSessionLimitInfo(boundTrainer) : null;
        const limitExhausted = limitInfo?.limited && !sub.allTrainers;

        return limitExhausted ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Icon name="AlertTriangle" className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-foreground text-sm">
                Лимит исчерпан — {limitInfo!.used} из {limitInfo!.limit} сессий использовано
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Тренажёр: {TRAINER_DEFS.find((d) => d.id === sub.trainerId)?.title || "выбранный"}
                {subExpires && ` · до ${subExpires}`}
              </div>
              <div className="text-xs text-primary mt-1 font-medium">
                Оформите Продвинутый или Годовой тариф для безлимитного доступа
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <Icon name="CheckCircle" className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-foreground text-sm">
                Тариф «{TRAINER_PLANS.find((p) => p.id === sub.planId)?.name}» активен
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {sub.allTrainers
                  ? "Все тренажёры доступны"
                  : `Тренажёр: ${TRAINER_DEFS.find((d) => d.id === sub.trainerId)?.title || "выбранный"}`}
                {subExpires && ` · до ${subExpires}`}
                {limitInfo && !sub.allTrainers && ` · ${limitInfo.used} из ${limitInfo.limit} сессий`}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Pricing section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <Icon name="CreditCard" className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">
            Тарифы
          </h2>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">
          {sub ? "Вы можете обновить тариф" : "Выберите подходящий план для работы с тренажёрами"}
        </p>

        {planError && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            <Icon name="AlertCircle" size={16} className="shrink-0" />
            {planError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRICING_PLANS.map((plan) => {
            const isCurrentPlan = sub?.planId === plan.id;
            const realPlan = TRAINER_PLANS.find((p) => p.id === plan.id);
            const canAfford = realPlan ? balance >= realPlan.price : false;
            return (
              <div
                key={plan.id}
                className={`
                  relative flex flex-col rounded-2xl border p-5 transition-all duration-200
                  ${
                    isCurrentPlan
                      ? "border-emerald-300 bg-emerald-50/30 shadow-sm"
                      : plan.accent
                      ? "border-primary bg-primary/[0.02] shadow-md shadow-primary/5"
                      : "bg-card hover:shadow-sm"
                  }
                `}
              >
                {plan.accent && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold gradient-brand text-white shadow-sm">
                      Популярный
                    </span>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500 text-white shadow-sm">
                      Ваш тариф
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="font-bold text-lg text-foreground">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {plan.description}
                  </p>
                  <p className="text-[11px] text-primary/70 mt-1 leading-snug">
                    {plan.trainers}
                  </p>
                </div>

                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-foreground tabular-nums">
                    {plan.price.toLocaleString("ru-RU")}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    /{plan.period}
                  </span>
                </div>

                <ul className="flex flex-col gap-2 mb-5 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <Icon
                        name="Check"
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          isCurrentPlan
                            ? "text-emerald-500"
                            : plan.accent
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan && plan.id === "basic" && (() => {
                  const bt = sub?.trainerId as TrainerId | undefined;
                  const li = bt ? getSessionLimitInfo(bt) : null;
                  return li?.limited;
                })() ? (
                  <Button
                    onClick={() => handleBuyPlan(plan.id as TrainerPlanId)}
                    disabled={!!planLoading}
                    className="w-full h-10 rounded-xl text-sm font-medium gradient-brand text-white border-0"
                  >
                    {planLoading === plan.id ? (
                      <><Icon name="Loader2" size={16} className="animate-spin mr-1.5" />Активируем...</>
                    ) : (
                      <><Icon name="RefreshCw" size={16} className="mr-1.5" />Продлить за {plan.price.toLocaleString("ru-RU")} ₽</>
                    )}
                  </Button>
                ) : isCurrentPlan ? (
                  <Button
                    variant="outline"
                    disabled
                    className="w-full h-10 rounded-xl text-sm font-medium border-emerald-300 text-emerald-600"
                  >
                    <Icon name="Check" size={16} className="mr-1.5" />
                    Активен
                  </Button>
                ) : (
                  <Button
                    variant={plan.accent ? "default" : "outline"}
                    disabled={!!planLoading}
                    onClick={() => handleBuyPlan(plan.id as TrainerPlanId)}
                    className={`w-full h-10 rounded-xl text-sm font-medium ${
                      plan.accent
                        ? "gradient-brand text-white border-0 shadow-sm hover:shadow-md"
                        : ""
                    } transition-all duration-200`}
                  >
                    {planLoading === plan.id ? (
                      <>
                        <Icon name="Loader2" size={16} className="animate-spin mr-1.5" />
                        {canAfford ? "Активируем..." : "Переход к оплате..."}
                      </>
                    ) : canAfford ? (
                      <>
                        <Icon name="Wallet" size={16} className="mr-1.5" />
                        Списать {plan.price.toLocaleString("ru-RU")} ₽
                      </>
                    ) : (
                      <>
                        <Icon name="CreditCard" size={16} className="mr-1.5" />
                        Оплатить {plan.price.toLocaleString("ru-RU")} ₽
                      </>
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Icon name="Wallet" size={12} />
            Баланс: {balance} ₽
          </span>
          <button
            onClick={() => setShowTopUp(true)}
            className="text-primary hover:underline flex items-center gap-1"
          >
            <Icon name="Plus" size={12} />
            Пополнить
          </button>
        </div>
      </div>

      {showTopUp && (
        <BalanceTopUpModal
          onClose={() => { setShowTopUp(false); refreshBalance(); }}
          onSuccess={() => { setShowTopUp(false); refreshBalance(); }}
        />
      )}
    </div>
  );
}