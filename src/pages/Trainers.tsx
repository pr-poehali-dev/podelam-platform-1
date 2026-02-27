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

    const { blocked, trainerId } = await checkDeviceBlocked();
    if (blocked) {
      setDeviceBlocked(trainerId || id);
      return;
    }

    setActiveTrainer(id);
    navigate(`/trainers?id=${id}`, { replace: true });
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
