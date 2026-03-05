import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { getBalance } from "@/lib/access";
import { PRO_TRAINERS } from "@/lib/proTrainerTypes";
import {
  EMPTY_LOGIC_DATA,
  type LogicSession,
} from "@/lib/logicTrainerTypes";
import { calcILMP } from "@/lib/logicTrainerFormulas";
import {
  hasProAccess,
  getLogicSessions,
  saveLogicSession,
  deleteLogicSession,
  payProFromBalance,
  createProPayment,
  incrementProSession,
  proAccessExpiresFormatted,
} from "@/lib/proTrainerAccess";
import LogicStep0Statement from "@/components/logic/LogicStep0Statement";
import LogicStep1Arguments from "@/components/logic/LogicStep1Arguments";
import LogicStep2Causation from "@/components/logic/LogicStep2Causation";
import LogicStep3Alternatives from "@/components/logic/LogicStep3Alternatives";
import LogicStep4DataCheck from "@/components/logic/LogicStep4DataCheck";
import LogicStep5Fallacies from "@/components/logic/LogicStep5Fallacies";
import LogicStep6Reassembly from "@/components/logic/LogicStep6Reassembly";
import LogicResultsView from "@/components/logic/LogicResultsView";
import LogicPayment from "@/components/logic/LogicPayment";
import LogicSessionsList from "@/components/logic/LogicSessionsList";
import LogicStepIndicator from "@/components/logic/LogicStepIndicator";
import LogicHistory from "@/components/logic/LogicHistory";

const TRAINER_ID = "logic-thinking" as const;

type View = "sessions" | "payment" | "active";
type Tab = "sessions" | "history";

export default function LogicThinking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get("plan");

  const [view, setView] = useState<View>("sessions");
  const [session, _setSession] = useState<LogicSession | null>(null);
  const sessionRef = useRef<LogicSession | null>(null);

  const setSession = (s: LogicSession | null) => {
    sessionRef.current = s;
    _setSession(s);
  };
  const [tab, setTab] = useState<Tab>("sessions");
  const [sessions, setSessions] = useState<LogicSession[]>([]);
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
    setSessions(getLogicSessions(TRAINER_ID));
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
    const s: LogicSession = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      currentStep: 0,
      data: { ...EMPTY_LOGIC_DATA },
    };
    setSession(s);
    saveLogicSession(TRAINER_ID, s);
    refreshState();
    setView("active");
  };

  const resumeSession = (s: LogicSession) => {
    if (!hasAccess && s.currentStep < 7) return;
    setSession(s);
    setView("active");
  };

  const handleDeleteSession = (id: string) => {
    deleteLogicSession(TRAINER_ID, id);
    refreshState();
  };

  const handleUpdate = (stepKey: string, stepData: unknown) => {
    const cur = sessionRef.current;
    if (!cur) return;
    const updated: LogicSession = {
      ...cur,
      data: { ...cur.data, [stepKey]: stepData },
    };
    setSession(updated);
    saveLogicSession(TRAINER_ID, updated);
  };

  const handleNext = () => {
    const cur = sessionRef.current;
    if (!cur) return;
    const nextStep = cur.currentStep + 1;

    if (nextStep > 6) {
      const results = calcILMP(cur.data);
      const completed: LogicSession = {
        ...cur,
        currentStep: 7,
        completedAt: new Date().toISOString(),
        results: results || undefined,
      };
      setSession(completed);
      saveLogicSession(TRAINER_ID, completed);
      incrementProSession(TRAINER_ID);
      refreshState();
      return;
    }

    const updated: LogicSession = { ...cur, currentStep: nextStep };
    setSession(updated);
    saveLogicSession(TRAINER_ID, updated);
  };

  const handleBack = () => {
    const cur = sessionRef.current;
    if (!cur) return;
    if (cur.currentStep === 0) {
      setSession(null);
      setView("sessions");
      return;
    }
    const updated: LogicSession = {
      ...cur,
      currentStep: cur.currentStep - 1,
    };
    setSession(updated);
    saveLogicSession(TRAINER_ID, updated);
  };

  const handleStepClick = (step: number) => {
    const cur = sessionRef.current;
    if (!cur) return;
    if (step >= cur.currentStep) return;
    const updated: LogicSession = { ...cur, currentStep: step };
    setSession(updated);
    saveLogicSession(TRAINER_ID, updated);
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
    data: session?.data || EMPTY_LOGIC_DATA,
    onUpdate: handleUpdate,
    onNext: handleNext,
    onBack: handleBack,
  };

  const renderStep = () => {
    if (!session) return null;

    if (session.currentStep >= 7 && session.results) {
      return (
        <LogicResultsView
          data={session.data}
          results={session.results}
          onRestart={handleRestart}
          onExportPDF={handleExportPDF}
          readOnly={!hasAccess}
        />
      );
    }

    switch (session.currentStep) {
      case 0: return <LogicStep0Statement {...stepProps} />;
      case 1: return <LogicStep1Arguments {...stepProps} />;
      case 2: return <LogicStep2Causation {...stepProps} />;
      case 3: return <LogicStep3Alternatives {...stepProps} />;
      case 4: return <LogicStep4DataCheck {...stepProps} />;
      case 5: return <LogicStep5Fallacies {...stepProps} />;
      case 6: return <LogicStep6Reassembly {...stepProps} />;
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
                navigate("/logic-thinking-info");
              }
            }}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm"
          >
            <Icon name="ArrowLeft" size={16} />
            <span className="hidden sm:inline">Логика мышления PRO</span>
          </button>
          {hasAccess && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                {balance.toLocaleString("ru-RU")} &#8381;
              </span>
              <span className="text-xs text-indigo-600 border border-indigo-200 rounded-full px-2.5 py-0.5">
                PRO
              </span>
            </div>
          )}
        </div>
      </nav>

      <main className="px-4 py-8 md:py-12">
        {view === "payment" && !hasAccess && (
          <LogicPayment
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
          <LogicSessionsList
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
            <LogicStepIndicator
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
                    className="bg-indigo-600 text-white hover:bg-indigo-700 h-10"
                  >
                    Продлить доступ
                  </Button>
                </div>
                <LogicHistory
                  sessions={sessions}
                  onResume={resumeSession}
                  onDelete={handleDeleteSession}
                />
              </>
            ) : (
              <div className="max-w-lg mx-auto text-center py-16">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
                  <Icon name="Lock" size={24} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Доступ ограничен</h2>
                <p className="text-sm text-slate-500 mb-6">
                  Для использования тренажёра необходимо приобрести доступ
                </p>
                <Button
                  onClick={() => setView("payment")}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 h-11 px-6"
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