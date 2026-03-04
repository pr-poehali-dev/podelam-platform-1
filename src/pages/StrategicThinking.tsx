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
import StrategicPayment from "@/components/strategic/StrategicPayment";
import StrategicSessionsList from "@/components/strategic/StrategicSessionsList";
import StrategicStepIndicator from "@/components/strategic/StrategicStepIndicator";

const TRAINER_ID = "strategic-thinking" as const;

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
          <StrategicSessionsList
            trainerTitle={trainer.title}
            expiresLabel={expiresLabel}
            sessions={sessions}
            onNewSession={startNewSession}
            onResumeSession={resumeSession}
            onDeleteSession={handleDeleteSession}
          />
        )}
        {view === "active" && session && (
          <>
            <StrategicStepIndicator currentStep={session.currentStep} />
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