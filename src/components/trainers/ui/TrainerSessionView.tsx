import { useState, useEffect, useCallback, useRef } from "react";
import { TrainerId, TrainerSession } from "../types";
import { getTrainerDef } from "../trainerDefs";
import {
  createSession,
  getCurrentStep,
  getScenario,
  answerStep,
  skipToNext,
  completeSession,
  getProgress,
} from "../trainerEngine";
import {
  getCurrentSession,
  saveCurrentSession,
  addCompletedSession,
  clearCurrentSession,
} from "../trainerStorage";
import { startTrainerSession, sendHeartbeat, endTrainerSession } from "@/lib/trainerAccess";
import TrainerStepRenderer from "./TrainerStepRenderer";
import TrainerProgressBar from "./TrainerProgressBar";
import TrainerResultScreen from "./TrainerResultScreen";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

type Props = {
  trainerId: TrainerId;
  onComplete: (session: TrainerSession) => void;
  onExit: () => void;
};

type ViewState = "playing" | "result";

export default function TrainerSessionView({
  trainerId,
  onComplete,
  onExit,
}: Props) {
  const trainer = getTrainerDef(trainerId);
  const scenario = getScenario(trainerId);

  const [session, setSession] = useState<TrainerSession | null>(null);
  const [viewState, setViewState] = useState<ViewState>("playing");
  const [isAnimating, setIsAnimating] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const animatingRef = useRef(false);

  /* Initialize or restore session */
  useEffect(() => {
    const existing = getCurrentSession(trainerId);
    if (existing) {
      setSession(existing);
    } else {
      const fresh = createSession(trainerId);
      setSession(fresh);
      saveCurrentSession(fresh);
    }
  }, [trainerId]);

  /* Register active session on server + heartbeat every 30s */
  useEffect(() => {
    startTrainerSession(trainerId).catch(() => {});
    const interval = setInterval(() => {
      sendHeartbeat().catch(() => {});
    }, 30_000);
    return () => {
      clearInterval(interval);
      endTrainerSession();
    };
  }, [trainerId]);

  /* Transition helper */
  const transitionToStep = useCallback((nextSession: TrainerSession) => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    setIsAnimating(true);

    /* Phase 1: fade out current step (200ms) */
    setTimeout(() => {
      /* Phase 2: brief pause + update state (100ms gap) */
      setSession(nextSession);
      saveCurrentSession(nextSession);

      /* Phase 3: fade in new step (300ms, handled by isAnimating=false) */
      setTimeout(() => {
        setIsAnimating(false);
        animatingRef.current = false;
      }, 100);
    }, 200);
  }, []);

  /* Handle answer from step */
  const handleAnswer = useCallback(
    (value: string | string[] | number) => {
      if (!session) return;

      const step = getCurrentStep(session);
      if (!step) return;

      const nextSession = answerStep(session, step.id, value);

      /* Check if next step is a "result" type — just transition to it,
         actual completion happens in handleSkip when ResultStep fires onFinish */
      const nextStep = scenario?.steps[nextSession.currentStepIndex];
      if (nextStep?.type === "result") {
        transitionToStep(nextSession);
        return;
      }

      transitionToStep(nextSession);
    },
    [session, scenario, transitionToStep, onComplete]
  );

  /* Handle skip (intro, info steps) */
  const handleSkip = useCallback(() => {
    if (!session) return;

    const step = getCurrentStep(session);
    if (!step) return;

    /* For result step, triggered by ResultStep auto-finish */
    if (step.type === "result") {
      if (session.completedAt) {
        setViewState("result");
        return;
      }
      const completed = completeSession(session);
      addCompletedSession(completed);
      setSession(completed);
      setViewState("result");
      onComplete(completed);
      return;
    }

    const nextSession = skipToNext(session);

    /* Check if we landed on a result step — just transition to it */
    const nextStep = scenario?.steps[nextSession.currentStepIndex];
    if (nextStep?.type === "result") {
      transitionToStep(nextSession);
      return;
    }

    transitionToStep(nextSession);
  }, [session, scenario, transitionToStep, onComplete]);

  /* Handle exit */
  const handleExit = useCallback(() => {
    if (session && !session.completedAt) {
      saveCurrentSession(session);
    }
    onExit();
  }, [session, onExit]);

  /* Handle restart */
  const handleRestart = useCallback(() => {
    clearCurrentSession(trainerId);
    const fresh = createSession(trainerId);
    setSession(fresh);
    saveCurrentSession(fresh);
    setViewState("playing");
    setIsAnimating(false);
  }, [trainerId]);

  /* Bail if data missing */
  if (!trainer || !scenario) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Icon
          name="AlertCircle"
          className="w-10 h-10 text-muted-foreground mb-3"
        />
        <p className="text-sm text-muted-foreground">
          Тренажёр не найден
        </p>
        <Button variant="outline" onClick={onExit} className="mt-4">
          Назад
        </Button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center py-16">
        <Icon
          name="Loader2"
          className="w-6 h-6 text-primary animate-spin"
        />
      </div>
    );
  }

  const currentStep = getCurrentStep(session);
  const progress = getProgress(session);
  const totalSteps = scenario.steps.length;

  /* ---------- Result view ---------- */
  if (viewState === "result" && session.result) {
    return (
      <div className="flex flex-col min-h-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <button
            onClick={onExit}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Icon
              name="ArrowLeft"
              className="w-5 h-5 text-foreground"
            />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Icon
              name={trainer.icon}
              className={`w-4 h-4 ${trainer.iconColor} flex-shrink-0`}
            />
            <span className="text-sm font-medium text-foreground truncate">
              {trainer.title}
            </span>
          </div>
        </div>

        {/* Result content */}
        <div className="flex-1 px-4 pt-6">
          <TrainerResultScreen
            result={session.result}
            trainer={trainer}
            onRestart={handleRestart}
            onBack={onExit}
          />
        </div>
      </div>
    );
  }

  /* ---------- Playing view ---------- */
  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex flex-col gap-3 px-4 py-3 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (
                Object.keys(session.answers).length > 0 &&
                !session.completedAt
              ) {
                setShowExitConfirm(true);
              } else {
                handleExit();
              }
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Icon
              name="ArrowLeft"
              className="w-5 h-5 text-foreground"
            />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Icon
              name={trainer.icon}
              className={`w-4 h-4 ${trainer.iconColor} flex-shrink-0`}
            />
            <span className="text-sm font-medium text-foreground truncate">
              {trainer.title}
            </span>
          </div>
          <button
            onClick={() => {
              if (
                Object.keys(session.answers).length > 0 &&
                !session.completedAt
              ) {
                setShowExitConfirm(true);
              } else {
                handleExit();
              }
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Выйти
          </button>
        </div>

        {/* Progress bar */}
        {currentStep?.type !== "intro" && (
          <TrainerProgressBar
            current={session.currentStepIndex}
            total={totalSteps - 1}
            gradient={trainer.bgGradient}
          />
        )}
      </div>

      {/* Step content */}
      <div className="flex-1 px-4 py-6">
        {currentStep ? (
          <TrainerStepRenderer
            step={currentStep}
            onAnswer={handleAnswer}
            onSkip={handleSkip}
            isAnimating={isAnimating}
            trainerColor={trainer.bgGradient}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Icon
              name="CheckCircle2"
              className="w-10 h-10 text-primary mb-3"
            />
            <p className="text-sm text-muted-foreground">
              Все шаги пройдены
            </p>
          </div>
        )}
      </div>

      {/* Exit confirmation overlay */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowExitConfirm(false)}
          />

          {/* Modal */}
          <div className="relative bg-card rounded-t-2xl sm:rounded-2xl border shadow-xl w-full sm:max-w-sm p-6 animate-fade-in-up safe-bottom">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                <Icon
                  name="LogOut"
                  className="w-6 h-6 text-amber-600"
                />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Выйти из тренажёра?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ваш прогресс сохранится. Вы сможете продолжить с того
                же места в любое время.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 mt-5">
              <Button
                onClick={() => {
                  setShowExitConfirm(false);
                  handleExit();
                }}
                variant="outline"
                className="w-full h-11 rounded-xl text-sm font-medium"
              >
                <Icon name="Save" className="w-4 h-4 mr-1.5" />
                Сохранить и выйти
              </Button>
              <Button
                onClick={() => setShowExitConfirm(false)}
                className="w-full h-11 rounded-xl text-sm font-medium"
              >
                Продолжить тренировку
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}