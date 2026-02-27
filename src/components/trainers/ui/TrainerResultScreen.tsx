import { useEffect, useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import { TrainerResult, TrainerDef } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

type Props = {
  result: TrainerResult;
  trainer: TrainerDef;
  onRestart: () => void;
  onBack: () => void;
};

/* ---------- animated counter hook ---------- */
function useCounter(target: number, duration = 1200, delay = 400) {
  const [value, setValue] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    let start: number | null = null;
    let cancelled = false;

    const timeout = setTimeout(() => {
      const step = (ts: number) => {
        if (cancelled) return;
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) {
          raf.current = requestAnimationFrame(step);
        }
      };
      raf.current = requestAnimationFrame(step);
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      cancelAnimationFrame(raf.current);
    };
  }, [target, duration, delay]);

  return value;
}

/* ---------- checkmark animation ---------- */
function AnimatedCheckmark() {
  const [drawn, setDrawn] = useState(false);
  const [glow, setGlow] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setDrawn(true), 300);
    const t2 = setTimeout(() => setGlow(true), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center mb-6">
      <div
        className={`
          w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center
          transition-all duration-700 ease-out
          ${glow ? "shadow-[0_0_30px_rgba(120,80,220,0.25)]" : ""}
        `}
      >
        <svg
          viewBox="0 0 40 40"
          className="w-10 h-10"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle
            cx="20"
            cy="20"
            r="17"
            className="stroke-primary/20"
            strokeWidth="2"
          />
          <path
            d="M12 20 L18 26 L28 14"
            className="stroke-primary"
            strokeWidth="2.5"
            strokeDasharray="30"
            strokeDashoffset={drawn ? 0 : 30}
            style={{
              transition: "stroke-dashoffset 0.6s ease-out 0.3s",
            }}
          />
        </svg>
      </div>
      {glow && (
        <div className="absolute inset-0 w-20 h-20 rounded-full bg-primary/5 animate-ping mx-auto" />
      )}
    </div>
  );
}

/* ---------- score card ---------- */
function ScoreCard({
  label,
  value,
  delay,
  colorHue,
}: {
  label: string;
  value: number;
  delay: number;
  colorHue: number;
}) {
  const animated = useCounter(value, 1000, delay);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay - 100);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`
        rounded-xl border bg-card p-4 text-center
        transition-all duration-500 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
    >
      <div
        className="text-2xl font-bold tabular-nums mb-1"
        style={{ color: `hsl(${colorHue}, 60%, 48%)` }}
      >
        {animated}
      </div>
      <div className="text-xs text-muted-foreground leading-tight">
        {label}
      </div>
    </div>
  );
}

/* ---------- stagger list item ---------- */
function StaggerItem({
  children,
  index,
  icon,
  iconColor,
}: {
  children: React.ReactNode;
  index: number;
  icon: string;
  iconColor?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800 + index * 120);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className={`
        flex items-start gap-3 transition-all duration-400 ease-out
        ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"}
      `}
    >
      <div
        className={`
          w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
          ${iconColor || "bg-primary/10"}
        `}
      >
        <Icon name={icon} className="w-3.5 h-3.5 text-primary" />
      </div>
      <span className="text-sm text-foreground/80 leading-relaxed">
        {children}
      </span>
    </div>
  );
}

/* ---------- level badge ---------- */
function LevelBadge({ level }: { level?: string }) {
  if (!level) return null;

  const config: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
    high: { label: "Высокий уровень", variant: "default" },
    medium: { label: "Средний уровень", variant: "secondary" },
    developing: { label: "Развивается", variant: "outline" },
  };

  const c = config[level] || { label: level, variant: "outline" as const };

  return (
    <Badge variant={c.variant} className="text-xs px-3 py-1">
      {c.label}
    </Badge>
  );
}

/* ---------- chart colors ---------- */
const CHART_COLORS = [
  "hsl(252, 60%, 48%)",
  "hsl(280, 50%, 52%)",
  "hsl(220, 60%, 50%)",
  "hsl(340, 50%, 52%)",
  "hsl(160, 50%, 42%)",
  "hsl(32, 60%, 50%)",
];

/* ---------- main component ---------- */
export default function TrainerResultScreen({
  result,
  trainer,
  onRestart,
  onBack,
}: Props) {
  const [sectionVisible, setSectionVisible] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setSectionVisible(1), 200),
      setTimeout(() => setSectionVisible(2), 600),
      setTimeout(() => setSectionVisible(3), 1000),
      setTimeout(() => setSectionVisible(4), 1400),
      setTimeout(() => setSectionVisible(5), 1800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  /* Prepare chart data -- exclude "total" key */
  const chartData = Object.entries(result.scores)
    .filter(([key]) => key !== "total")
    .map(([key, value]) => ({
      name: key,
      value,
    }));

  const SCORE_LABELS: Record<string, string> = {
    clarity: "Ясность",
    values: "Ценности",
    fear: "Страхи",
    awareness: "Осознанность",
    regulation: "Регуляция",
    triggers: "Триггеры",
    motivation: "Мотивация",
    resistance: "Сопротивление",
    action: "Действие",
    "self-worth": "Самоценность",
    "inner-critic": "Внутр. критик",
    boundaries: "Границы",
    beliefs: "Убеждения",
    anxiety: "Тревога",
    strategy: "Стратегия",
  };

  const COLOR_HUES: Record<string, number> = {
    clarity: 220,
    values: 252,
    fear: 0,
    awareness: 252,
    regulation: 160,
    triggers: 32,
    motivation: 160,
    resistance: 0,
    action: 220,
    "self-worth": 160,
    "inner-critic": 0,
    boundaries: 252,
    beliefs: 220,
    anxiety: 0,
    strategy: 160,
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Section 1: Checkmark + title */}
      <div
        className={`flex flex-col items-center text-center transition-all duration-600 ease-out ${
          sectionVisible >= 1
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6"
        }`}
      >
        <AnimatedCheckmark />

        <h2 className="text-2xl font-bold text-foreground mb-2 leading-tight">
          {result.title}
        </h2>

        <LevelBadge level={result.level} />

        <p className="text-muted-foreground text-sm leading-relaxed max-w-md mt-3">
          {result.summary}
        </p>
      </div>

      {/* Section 2: Score cards */}
      {chartData.length > 0 && (
        <div
          className={`transition-all duration-500 ease-out ${
            sectionVisible >= 2
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide mb-3">
            Результаты
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {chartData.map((d, i) => (
              <ScoreCard
                key={d.name}
                label={SCORE_LABELS[d.name] || d.name}
                value={d.value}
                delay={600 + i * 150}
                colorHue={COLOR_HUES[d.name] || 252}
              />
            ))}
          </div>

          {/* Bar chart */}
          <div className="mt-4 rounded-xl border bg-card p-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={chartData.map((d) => ({
                  ...d,
                  displayName: SCORE_LABELS[d.name] || d.name,
                }))}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="displayName"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {chartData.map((_, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Section 3: Insights */}
      {result.insights.length > 0 && (
        <div
          className={`transition-all duration-500 ease-out ${
            sectionVisible >= 3
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide mb-3">
            Наблюдения
          </h3>
          <div className="flex flex-col gap-2.5">
            {result.insights.map((insight, i) => (
              <StaggerItem key={i} index={i} icon="Eye">
                {insight}
              </StaggerItem>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Recommendations */}
      {result.recommendations.length > 0 && (
        <div
          className={`transition-all duration-500 ease-out ${
            sectionVisible >= 4
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide mb-3">
            Рекомендации
          </h3>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex flex-col gap-3">
              {result.recommendations.map((rec, i) => (
                <StaggerItem
                  key={i}
                  index={i}
                  icon="Lightbulb"
                  iconColor="bg-amber-50"
                >
                  {rec}
                </StaggerItem>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section 5: Next actions + buttons */}
      <div
        className={`flex flex-col gap-4 transition-all duration-500 ease-out ${
          sectionVisible >= 5
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        {result.nextActions && result.nextActions.length > 0 && (
          <div className="rounded-xl bg-gradient-to-br from-primary/5 to-accent/20 border border-primary/10 p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <Icon name="Target" className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Следующие шаги
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {result.nextActions.map((action, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-primary">
                      {i + 1}
                    </span>
                  </div>
                  <span className="text-sm text-foreground/80 leading-relaxed">
                    {action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2.5 pt-2">
          <Button
            onClick={onRestart}
            className="w-full h-12 text-base font-medium rounded-xl"
          >
            <Icon name="RotateCcw" className="w-4 h-4 mr-2" />
            Пройти снова
          </Button>
          <Button
            onClick={onBack}
            variant="outline"
            className="w-full h-12 text-base font-medium rounded-xl"
          >
            <Icon name="ArrowLeft" className="w-4 h-4 mr-2" />
            Вернуться к тренажёрам
          </Button>
        </div>

        {/* Trainer attribution */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Icon
            name={trainer.icon}
            className={`w-4 h-4 ${trainer.iconColor}`}
          />
          <span className="text-xs text-muted-foreground">
            {trainer.title}
          </span>
        </div>
      </div>
    </div>
  );
}
