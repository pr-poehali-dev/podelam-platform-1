import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TrainerId, TrainerSession } from "@/components/trainers/types";
import TrainerCatalog from "@/components/trainers/ui/TrainerCatalog";
import TrainerSessionView from "@/components/trainers/ui/TrainerSessionView";
import TrainerPaywallModal from "@/components/trainers/ui/TrainerPaywallModal";
import Icon from "@/components/ui/icon";
import { hasTrainerAccess } from "@/lib/trainerAccess";

const VALID_IDS: TrainerId[] = [
  "conscious-choice",
  "emotions-in-action",
  "anti-procrastination",
  "self-esteem",
  "money-anxiety",
];

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

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) {
      navigate("/auth");
    }
  }, [navigate]);

  useEffect(() => {
    if (isValidTrainerId(paramId)) {
      setActiveTrainer(paramId);
    } else if (!paramId) {
      setActiveTrainer(null);
    }
  }, [paramId]);

  const handleSelectTrainer = (id: TrainerId) => {
    if (hasTrainerAccess(id)) {
      setActiveTrainer(id);
      navigate(`/trainers?id=${id}`, { replace: true });
    } else {
      setPaywallTrainer(id);
    }
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
    </div>
  );
}