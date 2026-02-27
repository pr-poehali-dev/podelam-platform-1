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

function EMIGauge({ value, delay = 500, label = "EMI" }: { value: number; delay?: number; label?: string }) {
  const animated = useCounter(value, 1500, delay);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay - 200);
    return () => clearTimeout(t);
  }, [delay]);

  const radius = 60;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const arc = circumference * 0.75;
  const offset = arc - (arc * animated) / 100;

  const getColor = (v: number) => {
    if (v >= 86) return "hsl(160, 60%, 42%)";
    if (v >= 71) return "hsl(160, 50%, 48%)";
    if (v >= 51) return "hsl(40, 70%, 50%)";
    if (v >= 31) return "hsl(25, 70%, 50%)";
    return "hsl(0, 60%, 50%)";
  };

  return (
    <div
      className={`relative flex flex-col items-center transition-all duration-700 ease-out ${
        visible ? "opacity-100 scale-100" : "opacity-0 scale-90"
      }`}
    >
      <svg
        width={radius * 2 + stroke * 2}
        height={radius * 2 + stroke * 2 - 30}
        viewBox={`0 0 ${radius * 2 + stroke * 2} ${radius * 2 + stroke * 2 - 30}`}
      >
        <circle
          cx={radius + stroke}
          cy={radius + stroke}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
          strokeDasharray={`${arc} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(135, ${radius + stroke}, ${radius + stroke})`}
        />
        <circle
          cx={radius + stroke}
          cy={radius + stroke}
          r={radius}
          fill="none"
          stroke={getColor(animated)}
          strokeWidth={stroke}
          strokeDasharray={`${arc} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(135, ${radius + stroke}, ${radius + stroke})`}
          style={{ transition: "stroke-dashoffset 0.1s ease-out, stroke 0.3s" }}
        />
      </svg>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center">
        <div
          className="text-3xl font-bold tabular-nums"
          style={{ color: getColor(animated) }}
        >
          {animated}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function IndexCard({
  label,
  value,
  maxValue,
  icon,
  color,
  delay,
  description,
}: {
  label: string;
  value: number;
  maxValue: number;
  icon: string;
  color: string;
  delay: number;
  description: string;
}) {
  const animated = useCounter(value, 1000, delay);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay - 100);
    return () => clearTimeout(t);
  }, [delay]);

  const pct = Math.round((value / maxValue) * 100);

  return (
    <div
      className={`
        rounded-xl border bg-card p-3.5
        transition-all duration-500 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon name={icon} className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground truncate">{label}</div>
        </div>
        <div className="text-lg font-bold tabular-nums" style={{ color }}>
          {animated}
        </div>
      </div>
      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: visible ? `${pct}%` : "0%",
            backgroundColor: color,
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
      <div className="text-xs text-muted-foreground/70 mt-1.5 leading-tight">
        {description}
      </div>
    </div>
  );
}

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

function LevelBadge({ level }: { level?: string }) {
  if (!level) return null;

  const config: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
    excellent: { label: "Высокий уровень осознанности", variant: "default" },
    high: { label: "Зрелая саморегуляция", variant: "default" },
    medium: { label: "Средний уровень", variant: "secondary" },
    developing: { label: "Развивается", variant: "outline" },
    beginning: { label: "Начальный уровень", variant: "outline" },
  };

  const c = config[level] || { label: level, variant: "outline" as const };

  return (
    <Badge variant={c.variant} className="text-xs px-3 py-1">
      {c.label}
    </Badge>
  );
}

const CHART_COLORS = [
  "hsl(252, 60%, 48%)",
  "hsl(280, 50%, 52%)",
  "hsl(220, 60%, 50%)",
  "hsl(340, 50%, 52%)",
  "hsl(160, 50%, 42%)",
  "hsl(32, 60%, 50%)",
];

const hasGaugeIndex = (trainerId: string) =>
  trainerId === "emotions-in-action" || trainerId === "anti-procrastination";

const getGaugeKey = (trainerId: string) =>
  trainerId === "emotions-in-action" ? "EMI" : "AI";

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

  const isGauge = hasGaugeIndex(trainer.id);
  const gaugeKey = getGaugeKey(trainer.id);
  const isEMI = trainer.id === "emotions-in-action";
  const isAP = trainer.id === "anti-procrastination";

  const chartData = Object.entries(result.scores)
    .filter(([key]) => key !== "total" && key !== "EMI" && key !== "AI")
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
    EA: "Осознанность",
    SR: "Саморегуляция",
    IP: "Импульсивность",
    EMI: "Эмоц. зрелость",
    RI: "Снижение сопр.",
    SI: "Индекс запуска",
    PI: "Прокрастинация",
    DI: "Дисциплина",
    AI: "Индекс действия",
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
    EA: 252,
    SR: 160,
    IP: 25,
    EMI: 220,
    RI: 160,
    SI: 220,
    PI: 0,
    DI: 252,
    AI: 32,
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div
        className={`flex flex-col items-center text-center transition-all duration-600 ease-out ${
          sectionVisible >= 1
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6"
        }`}
      >
        {isGauge ? (
          <EMIGauge value={result.scores[gaugeKey] || 0} delay={500} label={gaugeKey} />
        ) : (
          <AnimatedCheckmark />
        )}

        <h2 className="text-2xl font-bold text-foreground mb-2 leading-tight">
          {result.title}
        </h2>

        <LevelBadge level={result.level} />

        <p className="text-muted-foreground text-sm leading-relaxed max-w-md mt-3">
          {result.summary}
        </p>
      </div>

      {isEMI && (
        <div
          className={`transition-all duration-600 ease-out ${
            sectionVisible >= 2
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Индексы
          </h3>
          <div className="grid grid-cols-1 gap-2.5">
            <IndexCard
              label="Эмоциональная осознанность (EA)"
              value={result.scores["EA"] || 0}
              maxValue={30}
              icon="Eye"
              color="hsl(252, 60%, 52%)"
              delay={700}
              description="Распознавание эмоций, телесных сигналов и мыслей"
            />
            <IndexCard
              label="Саморегуляция (SR)"
              value={result.scores["SR"] || 0}
              maxValue={30}
              icon="Shield"
              color="hsl(160, 55%, 42%)"
              delay={900}
              description="Выбор стратегии и составление плана действий"
            />
            <IndexCard
              label="Импульсивность (IP)"
              value={result.scores["IP"] || 0}
              maxValue={10}
              icon="Zap"
              color="hsl(25, 70%, 50%)"
              delay={1100}
              description="Чем ниже — тем лучше. Уровень автоматических реакций"
            />
          </div>
        </div>
      )}

      {isAP && (
        <div
          className={`transition-all duration-600 ease-out ${
            sectionVisible >= 2
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Индексы
          </h3>
          <div className="grid grid-cols-1 gap-2.5">
            <IndexCard
              label="Индекс запуска (SI)"
              value={result.scores["SI"] || 0}
              maxValue={100}
              icon="Rocket"
              color="hsl(220, 60%, 52%)"
              delay={700}
              description="Способность начать и довести шаг до результата"
            />
            <IndexCard
              label="Снижение сопротивления (RI)"
              value={result.scores["RI"] || 0}
              maxValue={10}
              icon="TrendingDown"
              color="hsl(160, 55%, 42%)"
              delay={900}
              description="Чем выше — тем больше сопротивление снизилось"
            />
            <IndexCard
              label="Индекс прокрастинации (PI)"
              value={result.scores["PI"] || 0}
              maxValue={70}
              icon="Clock"
              color="hsl(0, 60%, 50%)"
              delay={1100}
              description="Чем ниже — тем лучше. Риск откладывания"
            />
            <IndexCard
              label="Дисциплина (DI)"
              value={result.scores["DI"] || 0}
              maxValue={100}
              icon="Target"
              color="hsl(252, 60%, 52%)"
              delay={1300}
              description="Процент выполненных шагов"
            />
          </div>
        </div>
      )}

      {!isGauge && (
        <div
          className={`transition-all duration-600 ease-out ${
            sectionVisible >= 2
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Показатели
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {Object.entries(result.scores)
              .filter(([key]) => key !== "total")
              .map(([key, value], idx) => (
                <ScoreCard
                  key={key}
                  label={SCORE_LABELS[key] || key}
                  value={value}
                  delay={600 + idx * 150}
                  colorHue={COLOR_HUES[key] || 252}
                />
              ))}
          </div>
        </div>
      )}

      {chartData.length > 1 && (
        <div
          className={`transition-all duration-600 ease-out ${
            sectionVisible >= 3
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Распределение
          </h3>
          <div className="rounded-xl border bg-card p-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={chartData.map((d) => ({
                  ...d,
                  name: SCORE_LABELS[d.name] || d.name,
                }))}
                margin={{ top: 4, right: 4, bottom: 4, left: -20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {result.insights.length > 0 && (
        <div
          className={`transition-all duration-600 ease-out ${
            sectionVisible >= 3
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Наблюдения
          </h3>
          <div className="flex flex-col gap-2.5 rounded-xl border bg-card p-4">
            {result.insights.map((insight, idx) => (
              <StaggerItem key={idx} index={idx} icon="Lightbulb">
                {insight}
              </StaggerItem>
            ))}
          </div>
        </div>
      )}

      {result.recommendations.length > 0 && (
        <div
          className={`transition-all duration-600 ease-out ${
            sectionVisible >= 4
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Рекомендации
          </h3>
          <div className="flex flex-col gap-2.5 rounded-xl border bg-card p-4">
            {result.recommendations.map((rec, idx) => (
              <StaggerItem
                key={idx}
                index={idx}
                icon="ArrowRight"
                iconColor="bg-emerald-50"
              >
                {rec}
              </StaggerItem>
            ))}
          </div>
        </div>
      )}

      {result.nextActions && result.nextActions.length > 0 && (
        <div
          className={`transition-all duration-600 ease-out ${
            sectionVisible >= 5
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Следующие шаги
          </h3>
          <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
            {result.nextActions.map((action, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                  {idx + 1}
                </div>
                <span className="text-sm text-foreground/80">{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className={`flex flex-col gap-3 pt-2 transition-all duration-600 ease-out ${
          sectionVisible >= 5
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6"
        }`}
      >
        <Button onClick={onRestart} className="w-full h-12 text-base font-medium rounded-xl">
          <Icon name="RotateCcw" className="w-4 h-4 mr-2" />
          Пройти ещё раз
        </Button>
        <Button
          variant="outline"
          onClick={onBack}
          className="w-full h-11 rounded-xl"
        >
          К тренажёрам
        </Button>
      </div>
    </div>
  );
}