import { useEffect, useState } from "react";
import { TrainerDef, TrainerStats } from "../types";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { hasTrainerAccess } from "@/lib/trainerAccess";

type Props = {
  trainer: TrainerDef;
  stats?: TrainerStats;
  onStart: () => void;
  onContinue?: () => void;
  hasActiveSession?: boolean;
  animationDelay?: number;
};

function formatDate(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") {
    return (
      <span className="inline-flex items-center gap-0.5 text-emerald-600">
        <Icon name="TrendingUp" className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">рост</span>
      </span>
    );
  }
  if (trend === "down") {
    return (
      <span className="inline-flex items-center gap-0.5 text-rose-500">
        <Icon name="TrendingDown" className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">снижение</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-muted-foreground">
      <Icon name="Minus" className="w-3.5 h-3.5" />
      <span className="text-xs font-medium">стабильно</span>
    </span>
  );
}

export default function TrainerCard({
  trainer,
  stats,
  onStart,
  onContinue,
  hasActiveSession,
  animationDelay = 0,
}: Props) {
  const [visible, setVisible] = useState(false);
  const hasAccess = hasTrainerAccess(trainer.id);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), animationDelay);
    return () => clearTimeout(t);
  }, [animationDelay]);

  return (
    <div
      className={`
        group relative flex flex-col rounded-2xl border bg-card overflow-hidden
        shadow-sm hover:shadow-md
        transition-all duration-300 ease-out
        hover:scale-[1.02]
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
      `}
    >
      {/* Gradient header */}
      <div
        className={`
          relative h-28 bg-gradient-to-br ${trainer.bgGradient}
          flex items-center justify-center overflow-hidden
        `}
      >
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />

        <div className="relative z-10 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon name={trainer.icon} className="w-8 h-8 text-white" />
        </div>

        {/* Active session pulse */}
        {hasActiveSession && (
          <div className="absolute top-3 right-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Title + subtitle */}
        <div>
          <h3 className="font-bold text-lg text-foreground leading-tight">
            {trainer.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {trainer.subtitle}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {trainer.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {trainer.tags.map((tag) => (
            <span
              key={tag}
              className={`
                inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium
                ${trainer.color} ${trainer.iconColor}
              `}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stats row */}
        {stats && stats.completedSessions > 0 && (
          <div className="flex items-center gap-3 py-2 border-t border-b border-border/50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon name="BarChart3" className="w-3.5 h-3.5" />
              <span>
                {stats.completedSessions}{" "}
                {stats.completedSessions === 1
                  ? "сессия"
                  : stats.completedSessions < 5
                  ? "сессии"
                  : "сессий"}
              </span>
            </div>
            <TrendIcon trend={stats.trend} />
            {stats.lastSessionDate && (
              <span className="text-xs text-muted-foreground/60 ml-auto">
                {formatDate(stats.lastSessionDate)}
              </span>
            )}
          </div>
        )}

        {/* Active session badge */}
        {hasActiveSession && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-xs font-medium text-primary">
              В процессе
            </span>
          </div>
        )}

        {/* Footer: meta info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-1">
          <span className="inline-flex items-center gap-1">
            <Icon name="Clock" className="w-3.5 h-3.5" />
            {trainer.estimatedMinutes} мин
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon name="ListChecks" className="w-3.5 h-3.5" />
            {trainer.stepsCount} шагов
          </span>
        </div>

        {/* Action button */}
        <div className="pt-1">
          {hasActiveSession && onContinue && hasAccess ? (
            <Button
              onClick={onContinue}
              className={`w-full h-10 rounded-xl text-sm font-medium bg-gradient-to-r ${trainer.bgGradient} text-white border-0 shadow-sm hover:shadow-md transition-shadow duration-200`}
            >
              <Icon name="Play" className="w-4 h-4 mr-1.5" />
              Продолжить
            </Button>
          ) : hasAccess ? (
            <Button
              onClick={onStart}
              variant="outline"
              className="w-full h-10 rounded-xl text-sm font-medium hover:bg-primary/5 transition-colors duration-200"
            >
              <Icon name="Sparkles" className="w-4 h-4 mr-1.5" />
              Начать тренировку
            </Button>
          ) : (
            <Button
              onClick={onStart}
              variant="outline"
              className="w-full h-10 rounded-xl text-sm font-medium hover:bg-primary/5 transition-colors duration-200"
            >
              <Icon name="Lock" className="w-4 h-4 mr-1.5" />
              Оформить доступ
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}