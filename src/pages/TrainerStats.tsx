import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  getAllStats,
  getSessions,
} from "@/components/trainers/trainerStorage";
import {
  TrainerStats as TrainerStatsType,
  TrainerId,
} from "@/components/trainers/types";
import { TRAINER_DEFS } from "@/components/trainers/trainerDefs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

/* ——— small helpers ——— */

function formatDateShort(iso?: string): string {
  if (!iso) return "не начат";
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function pluralSessions(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} сессия`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
    return `${n} сессии`;
  return `${n} сессий`;
}

/* ——— summary card ——— */

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

/* ——— trainer detail row ——— */

function TrainerDetailRow({
  trainerId,
  isSelected,
  onToggle,
  delay,
}: {
  trainerId: TrainerId;
  isSelected: boolean;
  onToggle: () => void;
  delay: number;
}) {
  const def = TRAINER_DEFS.find((d) => d.id === trainerId);
  const stats = useMemo(() => {
    const all = getAllStats();
    return all.find((s) => s.trainerId === trainerId);
  }, [trainerId]);

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!def) return null;

  return (
    <button
      onClick={onToggle}
      className={`
        w-full text-left rounded-2xl p-4 border shadow-sm bg-card
        transition-all duration-300 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
        ${
          isSelected
            ? "border-primary shadow-md ring-1 ring-primary/10"
            : "border-border/50 hover:border-border hover:shadow-md"
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl ${def.color} flex items-center justify-center flex-shrink-0`}
          >
            <Icon name={def.icon} size={20} className={def.iconColor} />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-foreground text-sm truncate">
              {def.title}
            </div>
            <div className="text-xs text-muted-foreground">
              {pluralSessions(stats?.completedSessions || 0)}
              {" \u00B7 "}
              {formatDateShort(stats?.lastSessionDate)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          {stats?.trend === "up" && (
            <Icon
              name="TrendingUp"
              size={16}
              className="text-emerald-500"
            />
          )}
          {stats?.trend === "down" && (
            <Icon
              name="TrendingDown"
              size={16}
              className="text-rose-500"
            />
          )}
          <Icon
            name={isSelected ? "ChevronUp" : "ChevronDown"}
            size={16}
            className="text-muted-foreground"
          />
        </div>
      </div>
    </button>
  );
}

/* ——— main page ——— */

export default function TrainerStats() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<TrainerStatsType[]>([]);
  const [selectedTrainer, setSelectedTrainer] =
    useState<TrainerId | null>(null);
  const [mounted, setMounted] = useState(false);

  /* Auth guard + load data */
  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) {
      navigate("/auth");
      return;
    }
    setStats(getAllStats());
    requestAnimationFrame(() => setMounted(true));
  }, [navigate]);

  /* Derived data */
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

  /* Bar chart data */
  const barData = stats.map((s) => {
    const def = TRAINER_DEFS.find((d) => d.id === s.trainerId);
    const words = def?.title.split(" ") || [s.trainerId];
    return {
      name: words[0],
      sessions: s.completedSessions,
    };
  });

  /* Line chart data for selected trainer */
  const lineData = useMemo(() => {
    if (!selectedTrainer) return [];
    const sessions = getSessions(selectedTrainer).filter(
      (s) => s.completedAt && s.result
    );
    return sessions.map((s, i) => ({
      session: i + 1,
      total: s.result?.scores?.total ?? 0,
      date: s.completedAt
        ? new Date(s.completedAt).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "short",
          })
        : "",
    }));
  }, [selectedTrainer]);

  const selectedDef = selectedTrainer
    ? TRAINER_DEFS.find((d) => d.id === selectedTrainer)
    : null;

  return (
    <div
      className="min-h-screen font-golos"
      style={{ background: "hsl(248, 50%, 98%)" }}
    >
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
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
              Статистика тренажёров
            </h1>
            <p className="text-sm text-muted-foreground">
              Отслеживайте прогресс и динамику
            </p>
          </div>
        </div>

        {/* Summary cards */}
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

        {/* Sessions bar chart */}
        {totalCompleted > 0 && (
          <div
            className={`
              bg-card rounded-2xl p-5 md:p-6 border border-border/50 shadow-sm mb-8
              transition-all duration-500 ease-out delay-300
              ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
            `}
          >
            <h2 className="font-bold text-foreground mb-4">
              Сессии по тренажёрам
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={barData}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 12,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{
                    fontSize: 12,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value: number) => [
                    `${value}`,
                    "Сессий",
                  ]}
                />
                <Bar
                  dataKey="sessions"
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Per-trainer details */}
        <div className="space-y-3 mb-8">
          <h2
            className={`
              font-bold text-lg text-foreground
              transition-all duration-500 ease-out
              ${mounted ? "opacity-100" : "opacity-0"}
            `}
          >
            Детали по тренажёрам
          </h2>

          {TRAINER_DEFS.map((def, idx) => (
            <TrainerDetailRow
              key={def.id}
              trainerId={def.id}
              isSelected={selectedTrainer === def.id}
              onToggle={() =>
                setSelectedTrainer((prev) =>
                  prev === def.id ? null : def.id
                )
              }
              delay={500 + idx * 80}
            />
          ))}
        </div>

        {/* Line chart for selected trainer */}
        {selectedTrainer && lineData.length > 0 && (
          <div className="bg-card rounded-2xl p-5 md:p-6 border border-border/50 shadow-sm mb-8 animate-fade-in-up">
            <div className="flex items-center gap-2.5 mb-4">
              {selectedDef && (
                <div
                  className={`w-8 h-8 rounded-lg ${selectedDef.color} flex items-center justify-center`}
                >
                  <Icon
                    name={selectedDef.icon}
                    size={16}
                    className={selectedDef.iconColor}
                  />
                </div>
              )}
              <h3 className="font-bold text-foreground">
                Динамика: {selectedDef?.title}
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={lineData}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="session"
                  tick={{
                    fontSize: 12,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: "Сессия",
                    position: "insideBottomRight",
                    offset: -4,
                    fontSize: 11,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                />
                <YAxis
                  tick={{
                    fontSize: 12,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value: number) => [
                    `${value}`,
                    "Балл",
                  ]}
                  labelFormatter={(label) => `Сессия ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{
                    r: 4,
                    fill: "hsl(var(--primary))",
                    strokeWidth: 2,
                    stroke: "hsl(var(--card))",
                  }}
                  activeDot={{
                    r: 6,
                    fill: "hsl(var(--primary))",
                    strokeWidth: 2,
                    stroke: "hsl(var(--card))",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Mini table of sessions */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 text-xs">
                <span className="text-muted-foreground font-medium">
                  Сессия
                </span>
                <span className="text-muted-foreground font-medium">
                  Дата
                </span>
                <span className="text-muted-foreground font-medium text-right">
                  Балл
                </span>
                {lineData.map((row) => (
                  <React.Fragment key={row.session}>
                    <span className="text-foreground tabular-nums">
                      #{row.session}
                    </span>
                    <span className="text-muted-foreground">
                      {row.date}
                    </span>
                    <span className="text-foreground font-medium text-right tabular-nums">
                      {row.total}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Selected trainer with no data yet */}
        {selectedTrainer && lineData.length === 0 && (
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm mb-8 text-center animate-fade-in">
            <Icon
              name="BarChart3"
              size={24}
              className="text-muted-foreground/40 mx-auto mb-2"
            />
            <p className="text-sm text-muted-foreground">
              Пока нет завершённых сессий для этого тренажёра
            </p>
          </div>
        )}

        {/* Empty state */}
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
              Пройдите хотя бы один тренажёр, чтобы увидеть статистику
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
              Перейти к тренажёрам
            </button>
          </div>
        )}
      </div>
    </div>
  );
}