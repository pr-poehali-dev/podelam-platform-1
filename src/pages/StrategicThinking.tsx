import { useState, useEffect, useCallback, useRef } from "react";
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
import StrategicPayment from "@/components/strategic/StrategicPayment";
import StrategicSessionsList from "@/components/strategic/StrategicSessionsList";
import StrategicStepIndicator from "@/components/strategic/StrategicStepIndicator";
import StrategicHistory from "@/components/strategic/StrategicHistory";

const TRAINER_ID = "strategic-thinking" as const;

type View = "sessions" | "payment" | "active";
type Tab = "sessions" | "history";

export default function StrategicThinking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get("plan");

  const [view, setView] = useState<View>("sessions");
  const [session, _setSession] = useState<StrategicSession | null>(null);
  const sessionRef = useRef<StrategicSession | null>(null);

  const setSession = (s: StrategicSession | null) => {
    sessionRef.current = s;
    _setSession(s);
  };
  const [tab, setTab] = useState<Tab>("sessions");
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
    if (!hasAccess && s.currentStep < 7) return;
    setSession(s);
    setView("active");
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(TRAINER_ID, id);
    refreshState();
  };

  const handleUpdate = (stepKey: string, stepData: unknown) => {
    const cur = sessionRef.current;
    if (!cur) return;
    const updated: StrategicSession = {
      ...cur,
      data: { ...cur.data, [stepKey]: stepData },
    };
    setSession(updated);
    saveSession(TRAINER_ID, updated);
  };

  const handleNext = () => {
    const cur = sessionRef.current;
    if (!cur) return;
    const nextStep = cur.currentStep + 1;

    if (nextStep > 6) {
      const results = calcOSI(cur.data);
      const completed: StrategicSession = {
        ...cur,
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

    const updated: StrategicSession = { ...cur, currentStep: nextStep };
    setSession(updated);
    saveSession(TRAINER_ID, updated);
  };

  const handleBack = () => {
    const cur = sessionRef.current;
    if (!cur) return;
    if (cur.currentStep === 0) {
      setSession(null);
      setView("sessions");
      return;
    }
    const updated: StrategicSession = {
      ...cur,
      currentStep: cur.currentStep - 1,
    };
    setSession(updated);
    saveSession(TRAINER_ID, updated);
  };

  const handleStepClick = (step: number) => {
    const cur = sessionRef.current;
    if (!cur) return;
    if (step >= cur.currentStep) return;
    const updated: StrategicSession = { ...cur, currentStep: step };
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
                navigate("/strategic-thinking-info");
              }
            }}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm"
          >
            <Icon name="ArrowLeft" size={16} />
            <span>{session && view === "active" ? (hasAccess ? "К сессиям" : "К истории") : "Назад"}</span>
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
        {view === "payment" && !hasAccess && (
          <StrategicPayment
            trainerTitle={trainer.title}
            pricing={trainer.pricing}
            balance={balance}
            payLoading={payLoading}
            payError={payError}
            highlightPlanId={planParam}
            onPayBalance={handlePayBalance}
            onPayCard={handlePayCard}
          />
        )}
        {view === "sessions" && hasAccess && (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
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

            {sessions.some((s) => s.completedAt && s.results) && (
              <div className="flex gap-1 mb-6 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setTab("sessions")}
                  className={`flex-1 text-sm py-2 px-4 rounded-md transition-all ${
                    tab === "sessions"
                      ? "bg-white text-slate-900 font-medium shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon name="List" size={14} className="inline mr-1.5 -mt-0.5" />
                  Сессии
                </button>
                <button
                  onClick={() => setTab("history")}
                  className={`flex-1 text-sm py-2 px-4 rounded-md transition-all ${
                    tab === "history"
                      ? "bg-white text-slate-900 font-medium shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon name="BarChart3" size={14} className="inline mr-1.5 -mt-0.5" />
                  История
                </button>
              </div>
            )}

            {tab === "sessions" && (
              <StrategicSessionsList
                trainerTitle={trainer.title}
                expiresLabel={expiresLabel}
                sessions={sessions}
                onNewSession={startNewSession}
                onResumeSession={resumeSession}
                onDeleteSession={handleDeleteSession}
                hideHeader
              />
            )}
            {tab === "history" && (
              <StrategicHistory sessions={sessions} onViewSession={resumeSession} />
            )}
          </div>
        )}
        {view === "active" && session && (
          <>
            <StrategicStepIndicator currentStep={session.currentStep} onStepClick={handleStepClick} />
            {renderStep()}
          </>
        )}
        {!hasAccess && view !== "payment" && (
          <div className="max-w-3xl mx-auto">
            {sessions.some((s) => s.completedAt && s.results) ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 mb-1">{trainer.title}</h1>
                    <p className="text-xs text-slate-500">Доступ истёк</p>
                  </div>
                  <Button
                    onClick={() => setView("payment")}
                    className="bg-slate-950 text-white hover:bg-slate-800 h-10"
                  >
                    Продлить доступ
                  </Button>
                </div>
                <StrategicHistory sessions={sessions} onViewSession={resumeSession} />
              </>
            ) : (
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
          </div>
        )}
      </main>
    </div>
  );
}