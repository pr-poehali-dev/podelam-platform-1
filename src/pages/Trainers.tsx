import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TrainerId, TrainerSession } from "@/components/trainers/types";
import TrainerCatalog from "@/components/trainers/ui/TrainerCatalog";
import TrainerSessionView from "@/components/trainers/ui/TrainerSessionView";
import TrainerPaywallModal from "@/components/trainers/ui/TrainerPaywallModal";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  hasTrainerAccess,
  checkDeviceBlocked,
  syncTrainerSubscription,
  isBasicUnbound,
  bindBasicPlan,
  getSessionLimitInfo,
} from "@/lib/trainerAccess";

const VALID_IDS: TrainerId[] = [
  "conscious-choice",
  "emotions-in-action",
  "anti-procrastination",
  "self-esteem",
  "money-anxiety",
];

const TRAINER_NAMES: Record<string, string> = {
  "conscious-choice": "Осознанный выбор",
  "emotions-in-action": "Эмоции в действии",
  "anti-procrastination": "Антипрокрастинация",
  "self-esteem": "Самооценка",
  "money-anxiety": "Деньги без тревоги",
};

function isValidTrainerId(v: string | null): v is TrainerId {
  return !!v && VALID_IDS.includes(v as TrainerId);
}

export default function Trainers() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramId = searchParams.get("id");
  const [activeTrainer, setActiveTrainer] = useState<TrainerId | null>(
    isValidTrainerId(paramId) ? paramId : null
  );
  const [paywallTrainer, setPaywallTrainer] = useState<TrainerId | null>(null);
  const [deviceBlocked, setDeviceBlocked] = useState<string | null>(null);
  const [bindConfirm, setBindConfirm] = useState<TrainerId | null>(null);
  const [sessionLimit, setSessionLimit] = useState<{ trainerId: TrainerId; used: number; limit: number } | null>(null);

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) {
      navigate("/auth");
      return;
    }
    syncTrainerSubscription().catch(() => {});
  }, [navigate]);

  useEffect(() => {
    if (isValidTrainerId(paramId)) {
      setActiveTrainer(paramId);
    } else if (!paramId) {
      setActiveTrainer(null);
    }
  }, [paramId]);

  const handleSelectTrainer = async (id: TrainerId) => {
    if (!hasTrainerAccess(id)) {
      setPaywallTrainer(id);
      return;
    }

    if (isBasicUnbound()) {
      setBindConfirm(id);
      return;
    }

    const limitInfo = getSessionLimitInfo(id);
    if (limitInfo.limited) {
      setSessionLimit({ trainerId: id, used: limitInfo.used, limit: limitInfo.limit });
      return;
    }

    const { blocked, trainerId } = await checkDeviceBlocked();
    if (blocked) {
      setDeviceBlocked(trainerId || id);
      return;
    }

    setActiveTrainer(id);
    navigate(`/trainers?id=${id}`, { replace: true });
  };

  const confirmBind = async () => {
    if (!bindConfirm) return;
    await bindBasicPlan(bindConfirm);
    setBindConfirm(null);

    const { blocked, trainerId } = await checkDeviceBlocked();
    if (blocked) {
      setDeviceBlocked(trainerId || bindConfirm);
      return;
    }

    setActiveTrainer(bindConfirm);
    navigate(`/trainers?id=${bindConfirm}`, { replace: true });
  };

  const handlePaywallSuccess = () => {
    const id = paywallTrainer;
    setPaywallTrainer(null);
    if (id) {
      setActiveTrainer(id);
      navigate(`/trainers?id=${id}`, { replace: true });
    }
  };

  const handleExit = () => {
    setActiveTrainer(null);
    navigate("/trainers", { replace: true });
  };

  const handleComplete = (_session: TrainerSession) => {};

  useEffect(() => {
    if (activeTrainer && !hasTrainerAccess(activeTrainer)) {
      setPaywallTrainer(activeTrainer);
      setActiveTrainer(null);
      navigate("/trainers", { replace: true });
    }
  }, [activeTrainer, navigate]);

  if (activeTrainer && hasTrainerAccess(activeTrainer)) {
    return (
      <div
        className="min-h-screen font-golos"
        style={{ background: "hsl(248, 50%, 98%)" }}
      >
        <TrainerSessionView
          trainerId={activeTrainer}
          onComplete={handleComplete}
          onExit={handleExit}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-golos"
      style={{ background: "hsl(248, 50%, 98%)" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/cabinet?tab=tools")}
            className="p-2 rounded-xl hover:bg-white/80 transition-colors"
          >
            <Icon
              name="ArrowLeft"
              size={20}
              className="text-muted-foreground"
            />
          </button>
          <span className="text-sm text-muted-foreground">
            Назад в кабинет
          </span>
        </div>

        <TrainerCatalog onSelectTrainer={handleSelectTrainer} />

        <div className="mt-10 text-center">
          <button
            onClick={() => navigate("/trainers/stats")}
            className="
              inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
              text-sm font-medium text-muted-foreground
              border border-border/60 bg-white/60
              hover:bg-white hover:border-border hover:text-foreground
              transition-all duration-200
            "
          >
            <Icon name="BarChart3" size={16} />
            Посмотреть статистику
          </button>
        </div>
      </div>

      {paywallTrainer && (
        <TrainerPaywallModal
          trainerId={paywallTrainer}
          onClose={() => setPaywallTrainer(null)}
          onSuccess={handlePaywallSuccess}
        />
      )}

      {sessionLimit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border shadow-xl max-w-sm w-full p-6 text-center animate-scale-in">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Icon name="Lock" size={28} className="text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Лимит сессий исчерпан
            </h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              На базовом тарифе доступно {sessionLimit.limit} сессии в месяц. Вы уже прошли {sessionLimit.used} из {sessionLimit.limit}.
            </p>
            <div className="rounded-xl border bg-violet-50/50 p-4 mb-5">
              <p className="text-xs font-semibold text-foreground mb-2">Безлимитный доступ:</p>
              <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Продвинутый — все тренажёры, 3 мес</span>
                  <span className="font-bold text-foreground">2 490 ₽</span>
                </div>
                <div className="flex justify-between">
                  <span>Годовой — все тренажёры, 1 год</span>
                  <span className="font-bold text-foreground">6 990 ₽</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setSessionLimit(null)}
                variant="outline"
                className="flex-1 rounded-xl"
              >
                Закрыть
              </Button>
              <Button
                onClick={() => {
                  setSessionLimit(null);
                  setPaywallTrainer(sessionLimit.trainerId);
                }}
                className="flex-1 rounded-xl gradient-brand text-white border-0"
              >
                Сменить тариф
              </Button>
            </div>
          </div>
        </div>
      )}

      {bindConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border shadow-xl max-w-sm w-full p-6 text-center animate-scale-in">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-violet-50 flex items-center justify-center">
              <Icon name="Lock" size={28} className="text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Выбор тренажёра
            </h3>
            <p className="text-sm text-muted-foreground mb-1">
              На базовом тарифе доступен 1 тренажёр. Вы выбираете:
            </p>
            <p className="text-base font-bold text-foreground mb-4">
              «{TRAINER_NAMES[bindConfirm] || bindConfirm}»
            </p>
            <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
              После подтверждения этот тренажёр будет закреплён за вами на весь период подписки. Изменить выбор нельзя.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => setBindConfirm(null)}
                variant="outline"
                className="flex-1 rounded-xl"
              >
                Отмена
              </Button>
              <Button
                onClick={confirmBind}
                className="flex-1 rounded-xl gradient-brand text-white border-0"
              >
                Подтвердить
              </Button>
            </div>
          </div>
        </div>
      )}

      {deviceBlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border shadow-xl max-w-sm w-full p-6 text-center animate-scale-in">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Icon name="Monitor" size={28} className="text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Сессия активна на другом устройстве
            </h3>
            <p className="text-sm text-muted-foreground mb-1">
              Сейчас идёт прохождение тренажёра
            </p>
            <p className="text-sm font-medium text-foreground mb-5">
              «{TRAINER_NAMES[deviceBlocked] || deviceBlocked}»
            </p>
            <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
              Завершите сессию на другом устройстве или подождите ~2 минуты — блокировка снимется автоматически.
            </p>
            <Button
              onClick={() => setDeviceBlocked(null)}
              variant="outline"
              className="w-full rounded-xl"
            >
              Понятно
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}