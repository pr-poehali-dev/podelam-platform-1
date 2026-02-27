import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { getAllStats } from "@/components/trainers/trainerStorage";
import {
  TrainerStats as TrainerStatsType,
  TrainerId,
} from "@/components/trainers/types";
import { TRAINER_DEFS } from "@/components/trainers/trainerDefs";
import StatsSummaryCards from "@/components/trainers/ui/stats/StatsSummaryCards";
import StatsSessionsChart from "@/components/trainers/ui/stats/StatsSessionsChart";
import StatsTrainerDetails from "@/components/trainers/ui/stats/StatsTrainerDetails";

export default function TrainerStats() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<TrainerStatsType[]>([]);
  const [selectedTrainer, setSelectedTrainer] =
    useState<TrainerId | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) {
      navigate("/auth");
      return;
    }
    setStats(getAllStats());
    requestAnimationFrame(() => setMounted(true));
  }, [navigate]);

  const totalCompleted = stats.reduce(
    (s, t) => s + t.completedSessions,
    0
  );
  const activeTrainers = stats.filter(
    (s) => s.completedSessions > 0
  ).length;
  const overallTrend = (() => {
    const ups = stats.filter((s) => s.trend === "up").length;
    const downs = stats.filter((s) => s.trend === "down").length;
    if (ups > downs) return "\u2191";
    if (downs > ups) return "\u2193";
    return "\u2014";
  })();

  const barData = stats.map((s) => {
    const def = TRAINER_DEFS.find((d) => d.id === s.trainerId);
    const words = def?.title.split(" ") || [s.trainerId];
    return {
      name: words[0],
      sessions: s.completedSessions,
    };
  });

  return (
    <div
      className="min-h-screen font-golos"
      style={{ background: "hsl(248, 50%, 98%)" }}
    >
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
        <div
          className={`
            flex items-center gap-3 mb-8
            transition-all duration-500 ease-out
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
        >
          <button
            onClick={() => navigate("/trainers")}
            className="p-2 rounded-xl hover:bg-white/80 transition-colors"
          >
            <Icon
              name="ArrowLeft"
              size={20}
              className="text-muted-foreground"
            />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              Статистика тренажеров
            </h1>
            <p className="text-sm text-muted-foreground">
              Отслеживайте прогресс и динамику
            </p>
          </div>
        </div>

        <StatsSummaryCards
          totalCompleted={totalCompleted}
          activeTrainers={activeTrainers}
          overallTrend={overallTrend}
        />

        {totalCompleted > 0 && (
          <StatsSessionsChart barData={barData} mounted={mounted} />
        )}

        <StatsTrainerDetails
          selectedTrainer={selectedTrainer}
          onSelectTrainer={setSelectedTrainer}
          mounted={mounted}
        />

        {totalCompleted === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Icon
                name="BarChart3"
                size={28}
                className="text-muted-foreground/40"
              />
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-2">
              Пока нет данных
            </h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
              Пройдите хотя бы один тренажер, чтобы увидеть статистику
              и отследить динамику
            </p>
            <button
              onClick={() => navigate("/trainers")}
              className="
                inline-flex items-center gap-2 px-6 py-2.5 rounded-xl
                bg-primary text-primary-foreground font-medium text-sm
                hover:opacity-90 transition-opacity shadow-sm
              "
            >
              <Icon name="Dumbbell" size={16} />
              Перейти к тренажерам
            </button>
          </div>
        )}
      </div>
    </div>
  );
}