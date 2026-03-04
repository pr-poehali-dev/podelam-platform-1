import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { FinancialSession, FinancialIndices } from "@/lib/financialTrainerTypes";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";

const INDEX_LABELS: Record<string, string> = {
  iu: "Устойчивость",
  ifd: "Дисциплина",
  kdi: "Диверсификация",
  kdg: "Цели",
  isu: "Стресс-устойчивость",
  ksr: "Структура расходов",
};

const COMPARE_COLORS = ["#0f172a", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

interface Props {
  sessions: FinancialSession[];
  onResume: (session: FinancialSession) => void;
  onDelete: (id: string) => void;
}

function getScoreColor(ifmp: number): string {
  if (ifmp >= 85) return "text-emerald-600";
  if (ifmp >= 70) return "text-green-600";
  if (ifmp >= 50) return "text-amber-600";
  if (ifmp >= 30) return "text-orange-600";
  return "text-red-600";
}

function getScoreBg(ifmp: number): string {
  if (ifmp >= 85) return "bg-emerald-600";
  if (ifmp >= 70) return "bg-green-600";
  if (ifmp >= 50) return "bg-amber-500";
  if (ifmp >= 30) return "bg-orange-500";
  return "bg-red-500";
}

function normalizeIndex(key: string, indices: FinancialIndices): number {
  switch (key) {
    case "iu":
      return Math.round(Math.min(Math.max(indices.iu / 500000, 0), 1) * 100);
    case "ifd":
      return Math.round(indices.ifd * 100);
    case "kdi":
      return Math.round(indices.kdi * 100);
    case "kdg":
      return Math.round(Math.min(Math.max(indices.kdg / 2, 0), 1) * 100);
    case "isu":
      return Math.round(Math.min(Math.max(indices.isu, 0), 1) * 100);
    case "ksr":
      return Math.round(indices.ksr * 100);
    default:
      return 0;
  }
}

function sessionLabel(s: FinancialSession, idx: number): string {
  const d = new Date(s.completedAt!);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }) + ` #${idx + 1}`;
}

export default function FinancialHistory({ sessions, onResume, onDelete }: Props) {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const completed = useMemo(
    () =>
      sessions
        .filter((s) => s.completedAt && s.results)
        .sort(
          (a, b) =>
            new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime()
        ),
    [sessions]
  );

  const fmt = (n: number) => n.toLocaleString("ru-RU");

  // Trend data — chronological order for line chart
  const trendData = useMemo(
    () =>
      completed.map((s, i) => ({
        label: sessionLabel(s, i),
        date: new Date(s.completedAt!).toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
        }),
        ifmp: Math.round(s.results!.ifmp * 10) / 10,
      })),
    [completed]
  );

  // Radar comparison data
  const compareData = useMemo(() => {
    const selected = completed.filter((s) => compareIds.includes(s.id));
    if (selected.length < 2) return null;

    const keys = Object.keys(INDEX_LABELS);
    return keys.map((key) => {
      const entry: Record<string, string | number> = { axis: INDEX_LABELS[key] };
      selected.forEach((s) => {
        const idx = completed.indexOf(s);
        const name = sessionLabel(s, idx);
        entry[name] = normalizeIndex(key, s.results!.indices);
      });
      return entry;
    });
  }, [completed, compareIds]);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 5 ? prev : [...prev, id]
    );
  };

  if (completed.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Icon name="BarChart3" size={24} className="text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-2">Пока нет результатов</h3>
        <p className="text-sm text-slate-500">
          Завершите первую сессию, чтобы увидеть историю
        </p>
      </div>
    );
  }

  const selectedSessions = completed.filter((s) => compareIds.includes(s.id));

  return (
    <div className="space-y-6">
      {/* IFMP Trend Chart */}
      {completed.length >= 2 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-1">Динамика IFMP</h3>
          <p className="text-xs text-slate-500 mb-4">Как менялся ваш индекс финансового мышления</p>
          <div className="w-full" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(val: number) => [`${val}`, "IFMP"]}
                  labelFormatter={(label) => {
                    const item = trendData.find((d) => d.date === label);
                    return item?.label || label;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ifmp"
                  stroke="#0f172a"
                  strokeWidth={2}
                  dot={{ fill: "#0f172a", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Session Comparison */}
      {completed.length >= 2 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-1">Сравнение сессий</h3>
          <p className="text-xs text-slate-500 mb-4">Выберите 2-5 сессий для сравнения на радаре</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {completed.map((s, i) => {
              const selected = compareIds.includes(s.id);
              const colorIdx = compareIds.indexOf(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleCompare(s.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    selected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-600 hover:border-slate-400"
                  }`}
                  style={
                    selected && colorIdx >= 0
                      ? { backgroundColor: COMPARE_COLORS[colorIdx], borderColor: COMPARE_COLORS[colorIdx] }
                      : undefined
                  }
                >
                  {sessionLabel(s, i)}{" "}
                  <span className="opacity-70">({s.results!.ifmp.toFixed(0)})</span>
                </button>
              );
            })}
          </div>

          {/* Radar Chart */}
          {compareData && selectedSessions.length >= 2 && (
            <div className="w-full" style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={compareData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  {selectedSessions.map((s) => {
                    const idx = completed.indexOf(s);
                    const colorIdx = compareIds.indexOf(s.id);
                    const name = sessionLabel(s, idx);
                    return (
                      <Radar
                        key={s.id}
                        name={name}
                        dataKey={name}
                        stroke={COMPARE_COLORS[colorIdx]}
                        fill={COMPARE_COLORS[colorIdx]}
                        fillOpacity={0.08}
                        strokeWidth={2}
                      />
                    );
                  })}
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Comparison Table */}
          {compareData && selectedSessions.length >= 2 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 pr-4 text-slate-500 font-medium">Индекс</th>
                    {selectedSessions.map((s) => {
                      const idx = completed.indexOf(s);
                      const colorIdx = compareIds.indexOf(s.id);
                      return (
                        <th
                          key={s.id}
                          className="text-center py-2 px-3 font-medium"
                          style={{ color: COMPARE_COLORS[colorIdx] }}
                        >
                          {sessionLabel(s, idx)}
                        </th>
                      );
                    })}
                    {selectedSessions.length === 2 && (
                      <th className="text-center py-2 px-3 text-slate-500 font-medium">{"\u0394"}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(INDEX_LABELS).map(([key, label]) => {
                    const vals = selectedSessions.map((s) =>
                      normalizeIndex(key, s.results!.indices)
                    );
                    const delta = selectedSessions.length === 2 ? vals[1] - vals[0] : null;
                    return (
                      <tr key={key} className="border-b border-slate-50">
                        <td className="py-2 pr-4 text-slate-700">{label}</td>
                        {vals.map((v, i) => (
                          <td key={i} className="text-center py-2 px-3 tabular-nums text-slate-900">
                            {v}%
                          </td>
                        ))}
                        {delta !== null && (
                          <td
                            className={`text-center py-2 px-3 tabular-nums font-medium ${
                              delta > 0 ? "text-emerald-600" : delta < 0 ? "text-red-500" : "text-slate-400"
                            }`}
                          >
                            {delta > 0 ? "+" : ""}
                            {delta}%
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {/* IFMP total row */}
                  <tr className="border-t border-slate-200">
                    <td className="py-2 pr-4 text-slate-900 font-semibold">IFMP</td>
                    {selectedSessions.map((s) => (
                      <td key={s.id} className="text-center py-2 px-3 tabular-nums font-bold text-slate-900">
                        {s.results!.ifmp.toFixed(1)}
                      </td>
                    ))}
                    {selectedSessions.length === 2 && (() => {
                      const d = Math.round((selectedSessions[1].results!.ifmp - selectedSessions[0].results!.ifmp) * 10) / 10;
                      return (
                        <td
                          className={`text-center py-2 px-3 tabular-nums font-bold ${
                            d > 0 ? "text-emerald-600" : d < 0 ? "text-red-500" : "text-slate-400"
                          }`}
                        >
                          {d > 0 ? "+" : ""}{d}
                        </td>
                      );
                    })()}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Session List */}
      <div>
        <h3 className="text-base font-semibold text-slate-900 mb-3">Все результаты</h3>
        <div className="space-y-4">
          {completed
            .slice()
            .reverse()
            .map((s) => {
              const r = s.results!;
              const dateLabel = new Date(s.completedAt!).toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={s.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-bold text-white px-2 py-0.5 rounded-full ${getScoreBg(
                            r.ifmp
                          )}`}
                        >
                          {r.ifmp.toFixed(0)}
                        </span>
                        <span className={`text-sm font-semibold ${getScoreColor(r.ifmp)}`}>
                          {r.level}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{dateLabel}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(s.id);
                        }}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
                    <IndexChip label="CF" value={`${fmt(Math.round(r.indices.cf))} \u20BD`} />
                    <IndexChip
                      label="KDN"
                      value={`${(r.indices.kdn * 100).toFixed(0)}%`}
                    />
                    <IndexChip
                      label="KFP"
                      value={`${r.indices.kfp.toFixed(1)} мес`}
                    />
                    <IndexChip
                      label="IFD"
                      value={`${(r.indices.ifd * 100).toFixed(0)}%`}
                    />
                    <IndexChip
                      label="ISU"
                      value={r.indices.isu.toFixed(2)}
                    />
                  </div>

                  <Button
                    onClick={() => onResume(s)}
                    variant="outline"
                    className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 h-9 text-sm"
                  >
                    <Icon name="Eye" size={14} className="mr-2" />
                    Посмотреть
                  </Button>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function IndexChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-1.5 text-center">
      <p className="text-[10px] text-slate-400 mb-0.5">{label}</p>
      <p className="text-xs font-semibold text-slate-700 truncate">{value}</p>
    </div>
  );
}
