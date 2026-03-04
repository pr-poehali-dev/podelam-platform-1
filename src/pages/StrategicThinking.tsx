import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { getBalance } from "@/lib/access";
import {
  PRO_TRAINERS,
  EMPTY_STRATEGIC_DATA,
  StrategicSession,
} from "@/lib/proTrainerTypes";
import { calcOSI } from "@/lib/proTrainerFormulas";
import {
  hasProAccess,
  getSavedSessions,
  saveSession,
  deleteSession,
  payProFromBalance,
  createProPayment,
  incrementProSession,
  proAccessExpiresFormatted,
} from "@/lib/proTrainerAccess";
import Step0Session from "@/components/strategic/Step0Session";
import Step1Factors from "@/components/strategic/Step1Factors";
import Step2PivotFactors from "@/components/strategic/Step2PivotFactors";
import Step3Scenarios from "@/components/strategic/Step3Scenarios";
import Step4Risks from "@/components/strategic/Step4Risks";
import Step5StressTest from "@/components/strategic/Step5StressTest";
import Step6Flexibility from "@/components/strategic/Step6Flexibility";
import StrategicResults from "@/components/strategic/StrategicResults";

const TRAINER_ID = "strategic-thinking" as const;
const TOTAL_STEPS = 7;

const STEP_TITLES = [
  "Сессия",
  "Факторы",
  "Узлы",
  "Сценарии",
  "Риски",
  "Стресс",
  "Гибкость",
  "Результат",
];

type View = "sessions" | "payment" | "active";

export default function StrategicThinking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get("plan");

  const [view, setView] = useState<View>("sessions");
  const [session, setSession] = useState<StrategicSession | null>(null);
  const [sessions, setSessions] = useState<StrategicSession[]>([]);
  const [balance, setBalance] = useState(0);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [expiresLabel, setExpiresLabel] = useState<string | null>(null);

  const trainer = PRO_TRAINERS.find((t) => t.id === TRAINER_ID)!;

  const refreshState = useCallback(() => {
    const access = hasProAccess(TRAINER_ID);
    setHasAccess(access);
    setExpiresLabel(proAccessExpiresFormatted(TRAINER_ID));
    setBalance(getBalance());
    setSessions(getSavedSessions(TRAINER_ID));
  }, []);

  useEffect(() => {
    const user = localStorage.getItem("pdd_user");
    if (!user) {
      navigate("/auth");
      return;
    }
    refreshState();

    const handler = () => refreshState();
    window.addEventListener("pdd_balance_change", handler);
    return () => window.removeEventListener("pdd_balance_change", handler);
  }, [navigate, refreshState]);

  useEffect(() => {
    if (!hasAccess && planParam) {
      setView("payment");
    } else if (hasAccess && !session) {
      setView("sessions");
    }
  }, [hasAccess, planParam, session]);

  const startNewSession = () => {
    const s: StrategicSession = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      currentStep: 0,
      data: { ...EMPTY_STRATEGIC_DATA },
    };
    setSession(s);
    saveSession(TRAINER_ID, s);
    refreshState();
    setView("active");
  };

  const resumeSession = (s: StrategicSession) => {
    setSession(s);
    setView("active");
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(TRAINER_ID, id);
    refreshState();
  };

  const handleUpdate = (stepKey: string, stepData: unknown) => {
    if (!session) return;
    const updated: StrategicSession = {
      ...session,
      data: { ...session.data, [stepKey]: stepData },
    };
    setSession(updated);
    saveSession(TRAINER_ID, updated);
  };

  const handleNext = () => {
    if (!session) return;
    const nextStep = session.currentStep + 1;

    if (nextStep > 6) {
      const results = calcOSI(session.data);
      const completed: StrategicSession = {
        ...session,
        currentStep: 7,
        completedAt: new Date().toISOString(),
        results: results || undefined,
      };
      setSession(completed);
      saveSession(TRAINER_ID, completed);
      incrementProSession(TRAINER_ID);
      refreshState();
      return;
    }

    const updated: StrategicSession = { ...session, currentStep: nextStep };
    setSession(updated);
    saveSession(TRAINER_ID, updated);
  };

  const handleBack = () => {
    if (!session) return;
    if (session.currentStep === 0) {
      setSession(null);
      setView("sessions");
      return;
    }
    const updated: StrategicSession = {
      ...session,
      currentStep: session.currentStep - 1,
    };
    setSession(updated);
    saveSession(TRAINER_ID, updated);
  };

  const handleRestart = () => {
    startNewSession();
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handlePayBalance = async (planId: string) => {
    setPayLoading(true);
    setPayError("");
    const ok = await payProFromBalance(TRAINER_ID, planId);
    setPayLoading(false);
    if (ok) {
      refreshState();
      setView("sessions");
    } else {
      setPayError("Недостаточно средств на балансе");
    }
  };

  const handlePayCard = async (planId: string) => {
    setPayLoading(true);
    setPayError("");
    const url = await createProPayment(TRAINER_ID, planId);
    setPayLoading(false);
    if (url) {
      window.location.href = url;
    } else {
      setPayError("Не удалось создать платёж. Попробуйте позже.");
    }
  };

  const stepProps = {
    data: session?.data || EMPTY_STRATEGIC_DATA,
    onUpdate: handleUpdate,
    onNext: handleNext,
    onBack: handleBack,
  };

  const renderStep = () => {
    if (!session) return null;

    if (session.currentStep >= 7 && session.results) {
      return (
        <StrategicResults
          data={session.data}
          results={session.results}
          onRestart={handleRestart}
          onExportPDF={handleExportPDF}
        />
      );
    }

    switch (session.currentStep) {
      case 0: return <Step0Session {...stepProps} />;
      case 1: return <Step1Factors {...stepProps} />;
      case 2: return <Step2PivotFactors {...stepProps} />;
      case 3: return <Step3Scenarios {...stepProps} />;
      case 4: return <Step4Risks {...stepProps} />;
      case 5: return <Step5StressTest {...stepProps} />;
      case 6: return <Step6Flexibility {...stepProps} />;
      default: return null;
    }
  };

  const renderStepIndicator = () => {
    if (!session) return null;
    const current = session.currentStep;

    return (
      <div className="mb-10">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-0 overflow-x-auto px-2">
            {STEP_TITLES.map((title, i) => {
              const isActive = i === current;
              const isDone = i < current;
              const isResult = i === 7;

              return (
                <div key={i} className="flex items-center">
                  {i > 0 && (
                    <div
                      className={`w-4 sm:w-8 h-px ${
                        isDone ? "bg-slate-900" : "bg-slate-200"
                      }`}
                    />
                  )}
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                        isActive
                          ? "bg-slate-950 text-white ring-4 ring-slate-200"
                          : isDone
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {isDone ? (
                        <Icon name="Check" size={12} />
                      ) : isResult ? (
                        <Icon name="Star" size={12} />
                      ) : (
                        i
                      )}
                    </div>
                    <span
                      className={`text-[10px] hidden sm:block ${
                        isActive ? "text-slate-900 font-medium" : "text-slate-400"
                      }`}
                    >
                      {title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderPayment = () => (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center mx-auto mb-4">
          <Icon name="Brain" size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{trainer.title}</h1>
        <p className="text-sm text-slate-500">Выберите тариф для получения доступа</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between mb-8">
        <span className="text-sm text-slate-600">Ваш баланс</span>
        <span className="text-lg font-bold text-slate-900">{balance.toLocaleString("ru-RU")} &#8381;</span>
      </div>

      {payError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-6">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <Icon name="AlertCircle" size={14} />
            {payError}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {trainer.pricing.map((plan) => {
          const isHighlighted = planParam === plan.id || (!planParam && plan.id === "pro");
          const isPro = plan.id === "pro";

          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border p-6 transition-all ${
                isHighlighted
                  ? isPro
                    ? "border-slate-900 bg-slate-950"
                    : "border-slate-900 bg-white"
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
                  isHighlighted && isPro ? "text-white" : "text-slate-900"
                }`}
              >
                {plan.name}
              </h3>

              <div className="flex items-baseline gap-1 mb-5">
                <span
                  className={`text-3xl font-bold ${
                    isHighlighted && isPro ? "text-white" : "text-slate-900"
                  }`}
                >
                  {plan.price.toLocaleString("ru-RU")} &#8381;
                </span>
                <span
                  className={`text-sm ${
                    isHighlighted && isPro ? "text-slate-400" : "text-slate-400"
                  }`}
                >
                  / {plan.period}
                </span>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Icon
                      name="Check"
                      size={14}
                      className={isHighlighted && isPro ? "text-white" : "text-slate-900"}
                    />
                    <span
                      className={`text-sm ${
                        isHighlighted && isPro ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
                <Button
                  onClick={() => handlePayBalance(plan.id)}
                  disabled={payLoading || balance < plan.price}
                  className={`w-full h-11 text-sm font-medium rounded-lg ${
                    isHighlighted && isPro
                      ? "bg-white text-slate-950 hover:bg-slate-100"
                      : "bg-slate-950 text-white hover:bg-slate-800"
                  }`}
                >
                  {payLoading ? (
                    <Icon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Icon name="Wallet" size={16} />
                      Оплатить с баланса
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handlePayCard(plan.id)}
                  disabled={payLoading}
                  variant="outline"
                  className={`w-full h-11 text-sm font-medium rounded-lg ${
                    isHighlighted && isPro
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

      <p className="text-xs text-slate-400 text-center">
        Этот продукт не входит в подписку тренажёров. Отдельная покупка.
      </p>
    </div>
  );

  const renderSessions = () => (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900 mb-1">{trainer.title}</h1>
          {expiresLabel && (
            <p className="text-xs text-slate-500">Доступ до {expiresLabel}</p>
          )}
        </div>
        <Button
          onClick={startNewSession}
          className="bg-slate-950 text-white hover:bg-slate-800 h-10"
        >
          <Icon name="Plus" size={16} />
          Новая стратегия
        </Button>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Icon name="Brain" size={24} className="text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-2">Нет сессий</h3>
          <p className="text-sm text-slate-500 mb-6">
            Начните первую стратегическую сессию
          </p>
          <Button
            onClick={startNewSession}
            className="bg-slate-950 text-white hover:bg-slate-800"
          >
            Начать
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const isCompleted = s.currentStep >= 7;
            const stepLabel = isCompleted
              ? "Завершено"
              : `Этап ${s.currentStep} из 6`;
            const dateLabel = new Date(s.createdAt).toLocaleDateString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={s.id}
                className="rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-all cursor-pointer group"
                onClick={() => resumeSession(s)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">
                        {s.data.step0?.name || "Без названия"}
                      </h3>
                      {isCompleted && s.results && (
                        <span className="text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded-full">
                          {s.results.osi}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{dateLabel}</span>
                      <span
                        className={`${
                          isCompleted ? "text-emerald-600" : "text-slate-500"
                        }`}
                      >
                        {stepLabel}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(s.id);
                      }}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                    >
                      <Icon name="Trash2" size={14} />
                    </button>
                    <Icon
                      name={isCompleted ? "Eye" : "ArrowRight"}
                      size={16}
                      className="text-slate-400"
                    />
                  </div>
                </div>
                {!isCompleted && (
                  <div className="mt-3">
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-900 rounded-full transition-all"
                        style={{ width: `${(s.currentStep / TOTAL_STEPS) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => {
              if (session && view === "active") {
                setSession(null);
                setView("sessions");
              } else {
                navigate("/strategic-thinking-pro");
              }
            }}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm"
          >
            <Icon name="ArrowLeft" size={16} />
            <span>{session && view === "active" ? "К сессиям" : "Назад"}</span>
          </button>
          {hasAccess && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                {balance.toLocaleString("ru-RU")} &#8381;
              </span>
              <span className="text-xs text-emerald-600 border border-emerald-200 rounded-full px-2.5 py-0.5">
                PRO
              </span>
            </div>
          )}
        </div>
      </nav>

      <main className="px-4 py-8 md:py-12">
        {view === "payment" && !hasAccess && renderPayment()}
        {view === "sessions" && hasAccess && renderSessions()}
        {view === "active" && session && (
          <>
            {renderStepIndicator()}
            {renderStep()}
          </>
        )}
        {!hasAccess && view !== "payment" && (
          <div className="max-w-lg mx-auto text-center py-16">
            <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center mx-auto mb-4">
              <Icon name="Lock" size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Доступ ограничен</h2>
            <p className="text-sm text-slate-500 mb-6">
              Для использования тренажёра необходимо приобрести доступ
            </p>
            <Button
              onClick={() => setView("payment")}
              className="bg-slate-950 text-white hover:bg-slate-800 h-11 px-6"
            >
              Выбрать тариф
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}