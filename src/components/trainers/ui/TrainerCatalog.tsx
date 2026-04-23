import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TrainerId } from "../types";
import { TRAINER_DEFS } from "../trainerDefs";
import { getStats, getCurrentSession } from "../trainerStorage";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import TrainerCard from "./TrainerCard";

// Маппинг: психологический сегмент → рекомендованные тренажёры с причиной
const SEGMENT_TRAINER_TIPS: Record<string, { id: string; why: string; priority: number }[]> = {
  creative: [
    { id: "anti-procrastination", why: "Снимет блок «ещё не готов» и запустит тебя в действие", priority: 1 },
    { id: "conscious-choice", why: "Поможет выбрать одну идею и довести её до конца", priority: 2 },
  ],
  help_people: [
    { id: "self-esteem", why: "Восстановит внутренний баланс после помощи другим", priority: 1 },
    { id: "money-anxiety", why: "Снимет тревогу вокруг денег и цены своей работы", priority: 2 },
  ],
  analytics: [
    { id: "conscious-choice", why: "Даст алгоритм выхода из аналитического паралича", priority: 1 },
    { id: "anti-procrastination", why: "Разрушит паттерн «ещё немного данных — тогда начну»", priority: 2 },
  ],
  business: [
    { id: "conscious-choice", why: "Поможет выбрать один проект из множества идей", priority: 1 },
    { id: "money-anxiety", why: "Проработает денежные установки предпринимателя", priority: 2 },
  ],
  education: [
    { id: "self-esteem", why: "Даст внутреннюю опору для запуска своего продукта", priority: 1 },
    { id: "anti-procrastination", why: "Разобьёт запуск курса на первый маленький шаг", priority: 2 },
  ],
  communication: [
    { id: "emotions-in-action", why: "Научит управлять энергией после интенсивного общения", priority: 1 },
    { id: "self-esteem", why: "Обеспечит внутреннюю опору для публичности", priority: 2 },
  ],
  management: [
    { id: "conscious-choice", why: "Создаст систему принятия решений вместо хаоса", priority: 1 },
    { id: "emotions-in-action", why: "Снизит накопленное напряжение от контроля", priority: 2 },
  ],
  practical: [
    { id: "self-esteem", why: "Поможет ценить себя и брать достойную цену", priority: 1 },
    { id: "anti-procrastination", why: "Запустит действие через 15-минутный первый шаг", priority: 2 },
  ],
  research: [
    { id: "conscious-choice", why: "Переведёт знания в конкретные действия", priority: 1 },
    { id: "money-anxiety", why: "Научит монетизировать свою экспертизу", priority: 2 },
  ],
  freedom: [
    { id: "conscious-choice", why: "Даст ясность при слишком большом выборе", priority: 1 },
    { id: "money-anxiety", why: "Стабилизирует финансовый фон при нестабильном доходе", priority: 2 },
  ],
};

function getPersonalizedTrainers(): { id: string; why: string }[] {
  try {
    const u = JSON.parse(localStorage.getItem("pdd_user") || "{}");
    const saved = localStorage.getItem(`psych_result_${u.email}`);
    if (!saved) return [];
    const psych = JSON.parse(saved);
    const topSeg = psych?.topSeg;
    if (!topSeg || !SEGMENT_TRAINER_TIPS[topSeg]) return [];
    return SEGMENT_TRAINER_TIPS[topSeg].sort((a, b) => a.priority - b.priority);
  } catch {
    return [];
  }
}

function getUserFirstName(): string {
  try {
    const u = JSON.parse(localStorage.getItem("pdd_user") || "{}");
    const name = u.name || "";
    return name.split(" ")[0] || "";
  } catch {
    return "";
  }
}
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
import {
  getSavedSessions,
  getFinancialSessions,
  getLogicSessions,
} from "@/lib/proTrainerAccess";

type Props = {
  onSelectTrainer: (trainerId: TrainerId) => void;
};

const PRICING_PLANS = [
  {
    id: "basic",
    name: "Базовый",
    price: 990,
    period: "мес",
    description: "Один тренажер на выбор",
    trainers: "Осознанный выбор, Антипрокрастинация или Деньги без тревоги",
    features: [
      "1 тренажер на выбор",
      "Пакет из 4 сессий",
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
    description: "Все тренажеры · полная аналитика",
    trainers: "Все 5 тренажеров включены",
    features: [
      "Все 5 тренажеров",
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
    trainers: "Все 5 тренажеров + эксклюзивные функции",
    features: [
      "Все 5 тренажеров",
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
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [planLoading, setPlanLoading] = useState<TrainerPlanId | null>(null);
  const [planError, setPlanError] = useState("");
  const [showTopUp, setShowTopUp] = useState(false);
  const [balance, setBalance] = useState(getBalance);
  const [, forceUpdate] = useState(0);

  const personalizedTrainers = useMemo(() => getPersonalizedTrainers(), []);
  const firstName = useMemo(() => getUserFirstName(), []);

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
              Тренажеры
            </h1>
            <p className="text-sm text-muted-foreground">
              Психологические инструменты для ежедневной практики
            </p>
          </div>
        </div>
      </div>

      {/* Персональные рекомендации — показываем если есть профиль */}
      {personalizedTrainers.length > 0 && !search.trim() && (
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-4 border border-violet-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <Icon name="Sparkles" size={14} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">
                {firstName ? `${firstName}, твои тренажёры` : "Твои тренажёры"}
              </p>
              <p className="text-xs text-muted-foreground">Подобраны под твой профиль</p>
            </div>
          </div>
          <div className="space-y-2">
            {personalizedTrainers.map(({ id, why }) => {
              const def = TRAINER_DEFS.find((d) => d.id === id);
              if (!def) return null;
              return (
                <div key={id} className="bg-white rounded-xl p-3 border border-white shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${def.bgGradient} flex items-center justify-center shrink-0`}>
                      <Icon name={def.icon as "Compass"} size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-sm leading-tight">{def.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{why}</p>
                    </div>
                    <button
                      onClick={() => {
                        try { window.ym?.(107022183, "reachGoal", "personal_trainer_click", { trainer: id }); } catch { /* ignore */ }
                        onSelectTrainer(id as TrainerId);
                      }}
                      className="shrink-0 text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 transition-colors px-3 py-1.5 rounded-lg"
                    >
                      Начать
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Триггер действия — если нет профиля, предлагаем пройти тест */}
      {personalizedTrainers.length === 0 && !search.trim() && (
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Icon name="Lightbulb" size={16} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-amber-900 text-sm">Получи персональные рекомендации</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">Пройди тест — и мы подберём тренажёры именно под твой профиль</p>
          </div>
          <button
            onClick={() => navigate("/psych-bot")}
            className="shrink-0 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 transition-colors px-3 py-1.5 rounded-lg"
          >
            Пройти
          </button>
        </div>
      )}

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

          {!search.trim() && (
            <div className="relative flex flex-col rounded-2xl border border-dashed border-border/80 bg-card/60 overflow-hidden opacity-80">
              <div className="relative h-28 bg-gradient-to-br from-slate-400 to-gray-500 flex items-center justify-center overflow-hidden">
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />
                <div className="relative z-10 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Icon name="ShieldOff" className="w-8 h-8 text-white" />
                </div>
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 text-slate-600 shadow-sm">
                    Скоро
                  </span>
                </div>
              </div>
              <div className="flex flex-col flex-1 p-4 gap-3">
                <div>
                  <h3 className="font-bold text-lg text-foreground leading-tight">
                    Границы и Нет
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Навык отказывать
                  </p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  Научитесь говорить «нет» без чувства вины. Прокачивает уверенность и самоуважение.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["границы", "отказ", "уверенность", "самоуважение"].map((tag) => (
                    <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-auto pt-3">
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center justify-center">
                    <Icon name="Hammer" size={15} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-500">В разработке</span>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                Пакет исчерпан — {limitInfo!.used} из {limitInfo!.limit} сессий использовано
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Тренажер: {TRAINER_DEFS.find((d) => d.id === sub.trainerId)?.title || "выбранный"}
              </div>
              <div className="text-xs text-primary mt-1 font-medium">
                Купите новый пакет или оформите Продвинутый / Годовой для безлимита
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
                  ? `Все тренажеры доступны${subExpires ? ` · до ${subExpires}` : ""}`
                  : `Тренажер: ${TRAINER_DEFS.find((d) => d.id === sub.trainerId)?.title || "выбранный"}`}
                {limitInfo && !sub.allTrainers && ` · Осталось ${limitInfo.limit - limitInfo.used} из ${limitInfo.limit} сессий`}
              </div>
            </div>
          </div>
        );
      })()}

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
          <button
            onClick={() => navigate("/trainers/stats")}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground border border-border/60 bg-white/60 hover:bg-white hover:border-border hover:text-foreground transition-all duration-200"
          >
            <Icon name="BarChart3" size={16} />
            Посмотреть статистику
          </button>
        </div>
      )}

      {/* Pricing section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <Icon name="CreditCard" className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">
            Тарифы
          </h2>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">
          {sub ? "Вы можете обновить тариф" : "Выберите подходящий план для работы с тренажерами"}
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

      {/* PRO trainers */}
      {!search.trim() && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Icon name="Crown" className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground leading-tight">PRO-тренажёры</h2>
              <p className="text-xs text-muted-foreground">Продвинутые инструменты для глубокой работы</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Стратегическое мышление */}
            <div
              onClick={() => navigate("/strategic-thinking-info")}
              className="group relative rounded-2xl border border-amber-200/80 bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/5" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -translate-y-8 translate-x-8" />
              <div className="relative p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                    <Icon name="Brain" className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">PRO</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Стратегическое мышление</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-3">
                    7 этапов глубокого анализа: системные факторы, сценарное моделирование, стресс-тест стратегии. Индекс ОСИ.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {["стратегия", "сценарии", "риски", "ОСИ", "7 этапов"].map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-slate-300">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-amber-400 font-semibold">от 3 590 ₽</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400 text-xs">отдельно от подписки</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Финансовое мышление */}
            <div
              onClick={() => navigate("/financial-thinking-info")}
              className="group relative rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-900 to-emerald-950 overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/5" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-8 translate-x-8" />
              <div className="relative p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                    <Icon name="TrendingUp" className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">PRO</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Финансовое мышление</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-3">
                    Анализ денежных потоков, стресс-тесты, моделирование целей. Индекс финансового мышления IFMP.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {["финансы", "стресс-тест", "цели", "IFMP", "7 этапов"].map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-slate-300">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-emerald-400 font-semibold">от 2 990 ₽</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400 text-xs">отдельно от подписки</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Логика мышления */}
            <div
              onClick={() => navigate("/logic-thinking-info")}
              className="group relative rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-900 to-indigo-950 overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-violet-500/5" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-8 translate-x-8" />
              <div className="relative p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                    <Icon name="Lightbulb" className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">PRO</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">NEW</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Логика мышления</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-3">
                    Анализ аргументов, причинно-следственные связи, когнитивные искажения. Индекс логики мышления ILMP.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {["логика", "аргументы", "искажения", "ILMP", "7 этапов"].map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-slate-300">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-indigo-400 font-semibold">от 2 590 ₽</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400 text-xs">отдельно от подписки</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Симулятор сценариев */}
            <div
              onClick={() => navigate("/pro/simulator")}
              className="group relative rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-900 to-purple-950 overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl -translate-y-8 translate-x-8" />
              <div className="relative p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20">
                    <Icon name="Zap" className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">PRO</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Симулятор сценариев</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-3">
                    Просчитай любой жизненный сценарий: ипотека, бизнес, переезд, работа, авто. Универсальное ядро для принятия взвешенных решений.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {["ипотека", "бизнес", "переезд", "работа", "авто"].map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-slate-300">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-violet-400 font-semibold">490 ₽ / 7 дней</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400 text-xs">отдельно от подписки</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRO history */}
      {!search.trim() && (() => {
        const strategicCompleted = getSavedSessions("strategic-thinking").filter(s => s.completedAt && s.results);
        const financialCompleted = getFinancialSessions("financial-thinking").filter(s => s.completedAt && s.results);
        const logicCompleted = getLogicSessions("logic-thinking").filter(s => s.completedAt && s.results);
        const allCompleted = [
          ...strategicCompleted.map(s => ({ ...s, trainerId: "strategic-thinking" as const, trainerName: "Стратегическое мышление", indexName: "ОСИ", indexValue: s.results!.osi, color: "amber" })),
          ...financialCompleted.map(s => ({ ...s, trainerId: "financial-thinking" as const, trainerName: "Финансовое мышление", indexName: "IFMP", indexValue: (s.results as unknown as { ifmp: number })?.ifmp ?? 0, color: "emerald" })),
          ...logicCompleted.map(s => ({ ...s, trainerId: "logic-thinking" as const, trainerName: "Логика мышления", indexName: "ILMP", indexValue: (s.results as unknown as { ilmp: number })?.ilmp ?? 0, color: "indigo" })),
        ].sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

        if (allCompleted.length === 0) return null;

        const colorMap: Record<string, { bg: string; text: string; border: string; icon: string }> = {
          amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "Brain" },
          emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "TrendingUp" },
          indigo: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", icon: "Lightbulb" },
        };

        const fmtDate = (d: string) => new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Icon name="History" className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground leading-tight">Мои PRO-результаты</h2>
                <p className="text-xs text-muted-foreground">Завершённые сессии PRO-тренажёров</p>
              </div>
            </div>
            <div className="space-y-2">
              {allCompleted.slice(0, 10).map((s) => {
                const c = colorMap[s.color];
                const d = s.data as Record<string, Record<string, string> | null>;
                const title = s.trainerId === "logic-thinking"
                  ? (d?.step0?.statement || "Без названия")
                  : (d?.step0?.situation || "Без названия");
                return (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/${s.trainerId}`)}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${c.border} ${c.bg} cursor-pointer hover:shadow-sm transition-all`}
                  >
                    <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
                      <Icon name={c.icon} size={18} className={c.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">{title}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-muted-foreground">{s.trainerName}</span>
                        <span className="text-[11px] text-muted-foreground">·</span>
                        <span className="text-[11px] text-muted-foreground">{fmtDate(s.completedAt!)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-sm font-bold ${c.text}`}>{s.indexName} {s.indexValue}</span>
                      <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {showTopUp && (
        <BalanceTopUpModal
          onClose={() => { setShowTopUp(false); refreshBalance(); }}
          onSuccess={() => { setShowTopUp(false); refreshBalance(); }}
        />
      )}
    </div>
  );
}