import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { getBalance } from "@/lib/access";
import { PRO_TRAINERS } from "@/lib/proTrainerTypes";
import {
  EMPTY_FINANCIAL_DATA,
  type FinancialSession,
} from "@/lib/financialTrainerTypes";
import { calcIFMP } from "@/lib/financialTrainerFormulas";
import {
  hasProAccess,
  getFinancialSessions,
  saveFinancialSession,
  deleteFinancialSession,
  payProFromBalance,
  createProPayment,
  incrementProSession,
  proAccessExpiresFormatted,
} from "@/lib/proTrainerAccess";
import FinStep0Initial from "@/components/financial/FinStep0Initial";
import FinStep1Expenses from "@/components/financial/FinStep1Expenses";
import FinStep2Stability from "@/components/financial/FinStep2Stability";
import FinStep3StressTest from "@/components/financial/FinStep3StressTest";
import FinStep4Goals from "@/components/financial/FinStep4Goals";
import FinStep5Decisions from "@/components/financial/FinStep5Decisions";
import FinStep6Behavior from "@/components/financial/FinStep6Behavior";
import FinancialResultsView from "@/components/financial/FinancialResultsView";
import FinancialPayment from "@/components/financial/FinancialPayment";
import FinancialSessionsList from "@/components/financial/FinancialSessionsList";
import FinancialStepIndicator from "@/components/financial/FinancialStepIndicator";
import FinancialHistory from "@/components/financial/FinancialHistory";

const TRAINER_ID = "financial-thinking" as const;

type View = "sessions" | "payment" | "active";
type Tab = "sessions" | "history";

export default function FinancialThinking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get("plan");

  const [view, setView] = useState<View>("sessions");
  const [session, _setSession] = useState<FinancialSession | null>(null);
  const sessionRef = useRef<FinancialSession | null>(null);

  const setSession = (s: FinancialSession | null) => {
    sessionRef.current = s;
    _setSession(s);
  };
  const [tab, setTab] = useState<Tab>("sessions");
  const [sessions, setSessions] = useState<FinancialSession[]>([]);
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
    setSessions(getFinancialSessions(TRAINER_ID));
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
    const s: FinancialSession = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      currentStep: 0,
      data: { ...EMPTY_FINANCIAL_DATA },
    };
    setSession(s);
    saveFinancialSession(TRAINER_ID, s);
    refreshState();
    setView("active");
  };

  const resumeSession = (s: FinancialSession) => {
    if (!hasAccess && s.currentStep < 7) return;
    setSession(s);
    setView("active");
  };

  const handleDeleteSession = (id: string) => {
    deleteFinancialSession(TRAINER_ID, id);
    refreshState();
  };

  const handleUpdate = (stepKey: string, stepData: unknown) => {
    const cur = sessionRef.current;
    if (!cur) return;
    const updated: FinancialSession = {
      ...cur,
      data: { ...cur.data, [stepKey]: stepData },
    };
    setSession(updated);
    saveFinancialSession(TRAINER_ID, updated);
  };

  const handleNext = () => {
    const cur = sessionRef.current;
    if (!cur) return;
    const nextStep = cur.currentStep + 1;

    if (nextStep > 6) {
      const results = calcIFMP(cur.data);
      const completed: FinancialSession = {
        ...cur,
        currentStep: 7,
        completedAt: new Date().toISOString(),
        results: results || undefined,
      };
      setSession(completed);
      saveFinancialSession(TRAINER_ID, completed);
      incrementProSession(TRAINER_ID);
      refreshState();
      return;
    }

    const updated: FinancialSession = { ...cur, currentStep: nextStep };
    setSession(updated);
    saveFinancialSession(TRAINER_ID, updated);
  };

  const handleBack = () => {
    const cur = sessionRef.current;
    if (!cur) return;
    if (cur.currentStep === 0) {
      setSession(null);
      setView("sessions");
      return;
    }
    const updated: FinancialSession = {
      ...cur,
      currentStep: cur.currentStep - 1,
    };
    setSession(updated);
    saveFinancialSession(TRAINER_ID, updated);
  };

  const handleStepClick = (step: number) => {
    const cur = sessionRef.current;
    if (!cur) return;
    if (step >= cur.currentStep) return;
    const updated: FinancialSession = { ...cur, currentStep: step };
    setSession(updated);
    saveFinancialSession(TRAINER_ID, updated);
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
    data: session?.data || EMPTY_FINANCIAL_DATA,
    onUpdate: handleUpdate,
    onNext: handleNext,
    onBack: handleBack,
  };

  const renderStep = () => {
    if (!session) return null;

    if (session.currentStep >= 7 && session.results) {
      return (
        <FinancialResultsView
          data={session.data}
          results={session.results}
          onRestart={handleRestart}
          onExportPDF={handleExportPDF}
          readOnly={!hasAccess}
        />
      );
    }

    switch (session.currentStep) {
      case 0: return <FinStep0Initial {...stepProps} />;
      case 1: return <FinStep1Expenses {...stepProps} />;
      case 2: return <FinStep2Stability {...stepProps} />;
      case 3: return <FinStep3StressTest {...stepProps} />;
      case 4: return <FinStep4Goals {...stepProps} />;
      case 5: return <FinStep5Decisions {...stepProps} />;
      case 6: return <FinStep6Behavior {...stepProps} />;
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
                navigate("/financial-thinking-info");
              }
            }}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm"
          >
            <Icon name="ArrowLeft" size={16} />
            <span>{session && view === "active" ? (hasAccess ? "К сессиям" : "К истории") : "Финансовое мышление PRO"}</span>
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
          <FinancialPayment
            pricing={trainer.pricing}
            balance={balance}
            loading={payLoading}
            error={payError}
            onPayBalance={handlePayBalance}
            onPayCard={handlePayCard}
            onBack={() => setView("sessions")}
          />
        )}
        {view === "sessions" && hasAccess && (
          <FinancialSessionsList
            sessions={sessions}
            hasAccess={hasAccess}
            expiresLabel={expiresLabel}
            onNewSession={startNewSession}
            onResume={resumeSession}
            onDelete={handleDeleteSession}
            onShowPayment={() => setView("payment")}
            tab={tab}
            onTabChange={setTab}
          />
        )}
        {view === "active" && session && (
          <>
            <FinancialStepIndicator
              currentStep={session.currentStep}
              totalSteps={7}
              onStepClick={handleStepClick}
            />
            {renderStep()}
          </>
        )}
        {!hasAccess && view !== "payment" && view !== "active" && (
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
                <FinancialHistory
                  sessions={sessions}
                  onResume={resumeSession}
                  onDelete={handleDeleteSession}
                />
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