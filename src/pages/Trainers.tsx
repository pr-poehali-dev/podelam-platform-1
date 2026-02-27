import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TrainerId, TrainerSession } from "@/components/trainers/types";
import TrainerCatalog from "@/components/trainers/ui/TrainerCatalog";
import TrainerSessionView from "@/components/trainers/ui/TrainerSessionView";
import Icon from "@/components/ui/icon";

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

  /* Auth guard */
  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) {
      navigate("/auth");
    }
  }, [navigate]);

  /* Sync URL param -> state */
  useEffect(() => {
    if (isValidTrainerId(paramId)) {
      setActiveTrainer(paramId);
    } else if (!paramId) {
      setActiveTrainer(null);
    }
  }, [paramId]);

  const handleSelectTrainer = (id: TrainerId) => {
    setActiveTrainer(id);
    navigate(`/trainers?id=${id}`, { replace: true });
  };

  const handleExit = () => {
    setActiveTrainer(null);
    navigate("/trainers", { replace: true });
  };

  const handleComplete = (_session: TrainerSession) => {
    /* Session is already persisted by TrainerSessionView.
       Could show a toast, redirect, etc. For now, stay on result screen. */
  };

  /* ————— Session mode ————— */
  if (activeTrainer) {
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

  /* ————— Catalog mode ————— */
  return (
    <div
      className="min-h-screen font-golos"
      style={{ background: "hsl(248, 50%, 98%)" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        {/* Back to cabinet */}
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

        {/* Footer link to stats */}
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
    </div>
  );
}
