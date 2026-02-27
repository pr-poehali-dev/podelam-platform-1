import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

function SummaryCard({
  icon,
  iconClass,
  label,
  value,
  delay,
}: {
  icon: string;
  iconClass: string;
  label: string;
  value: string | number;
  delay: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`
        bg-card rounded-2xl p-4 border border-border/50 shadow-sm
        transition-all duration-500 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Icon name={icon} size={16} className={iconClass} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-bold text-foreground tabular-nums">
        {value}
      </div>
    </div>
  );
}

type Props = {
  totalCompleted: number;
  activeTrainers: number;
  overallTrend: string;
};

export default function StatsSummaryCards({
  totalCompleted,
  activeTrainers,
  overallTrend,
}: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      <SummaryCard
        icon="CheckCircle"
        iconClass="text-emerald-500"
        label="Пройдено"
        value={totalCompleted}
        delay={100}
      />
      <SummaryCard
        icon="Dumbbell"
        iconClass="text-primary"
        label="Активных"
        value={activeTrainers}
        delay={200}
      />
      <SummaryCard
        icon="Target"
        iconClass="text-amber-500"
        label="Всего тренажёров"
        value={5}
        delay={300}
      />
      <SummaryCard
        icon="TrendingUp"
        iconClass="text-indigo-500"
        label="Общий тренд"
        value={overallTrend}
        delay={400}
      />
    </div>
  );
}
