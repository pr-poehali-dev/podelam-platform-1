import React, { useState, useEffect, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { getAllStats, getSessions } from "@/components/trainers/trainerStorage";
import { TrainerId } from "@/components/trainers/types";
import { TRAINER_DEFS } from "@/components/trainers/trainerDefs";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

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

type Props = {
  selectedTrainer: TrainerId | null;
  onSelectTrainer: (id: TrainerId | null) => void;
  mounted: boolean;
};

export default function StatsTrainerDetails({
  selectedTrainer,
  onSelectTrainer,
  mounted,
}: Props) {
  const isEMITrainer = selectedTrainer === "emotions-in-action";
  const isAPTrainer = selectedTrainer === "anti-procrastination";
  const isSETrainer = selectedTrainer === "self-esteem";
  const hasCustomIndex = isEMITrainer || isAPTrainer || isSETrainer;

  const lineData = useMemo(() => {
    if (!selectedTrainer) return [];
    const sessions = getSessions(selectedTrainer).filter(
      (s) => s.completedAt && s.result
    );
    return sessions.map((s, i) => {
      const scores = s.result?.scores || {};
      const mainScore = isEMITrainer
        ? scores["EMI"] ?? 0
        : isAPTrainer
        ? scores["AI"] ?? 0
        : isSETrainer
        ? scores["IVO"] ?? 0
        : scores["total"] ?? 0;
      return {
        session: i + 1,
        total: mainScore,
        ...(isEMITrainer
          ? {
              EA: scores["EA"] ?? 0,
              SR: scores["SR"] ?? 0,
              IP: scores["IP"] ?? 0,
            }
          : {}),
        ...(isAPTrainer
          ? {
              SI: scores["SI"] ?? 0,
              RI: scores["RI"] ?? 0,
              PI: scores["PI"] ?? 0,
            }
          : {}),
        ...(isSETrainer
          ? {
              IOS: scores["IOS"] ?? 0,
              IA: scores["IA"] ?? 0,
              MRI: scores["MRI"] ?? 0,
            }
          : {}),
        date: s.completedAt
          ? new Date(s.completedAt).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "short",
            })
          : "",
      };
    });
  }, [selectedTrainer, isEMITrainer, isAPTrainer, isSETrainer]);

  const selectedDef = selectedTrainer
    ? TRAINER_DEFS.find((d) => d.id === selectedTrainer)
    : null;

  return (
    <>
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
              onSelectTrainer(
                selectedTrainer === def.id ? null : def.id
              )
            }
            delay={500 + idx * 80}
          />
        ))}
      </div>

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
                name={isEMITrainer ? "EMI" : isAPTrainer ? "AI" : isSETrainer ? "IVO" : "Балл"}
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
              {isEMITrainer && (
                <>
                  <Line
                    type="monotone"
                    dataKey="EA"
                    name="Осознанность"
                    stroke="hsl(252, 60%, 52%)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="SR"
                    name="Саморегуляция"
                    stroke="hsl(160, 55%, 42%)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="IP"
                    name="Импульсивность"
                    stroke="hsl(25, 70%, 50%)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </>
              )}
              {isAPTrainer && (
                <>
                  <Line
                    type="monotone"
                    dataKey="SI"
                    name="Запуск"
                    stroke="hsl(220, 60%, 52%)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="RI"
                    name="Снижение сопр."
                    stroke="hsl(160, 55%, 42%)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="PI"
                    name="Прокрастинация"
                    stroke="hsl(0, 60%, 50%)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </>
              )}
              {isSETrainer && (
                <>
                  <Line
                    type="monotone"
                    dataKey="IOS"
                    name="Опора дня"
                    stroke="hsl(32, 70%, 50%)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="IA"
                    name="Автономность"
                    stroke="hsl(220, 60%, 52%)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="MRI"
                    name="Зрелость реакции"
                    stroke="hsl(252, 60%, 52%)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 text-xs">
              <span className="text-muted-foreground font-medium">
                Сессия
              </span>
              <span className="text-muted-foreground font-medium">
                Дата
              </span>
              <span className="text-muted-foreground font-medium text-right">
                {isEMITrainer ? "EMI" : isAPTrainer ? "AI" : isSETrainer ? "IVO" : "Балл"}
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
    </>
  );
}