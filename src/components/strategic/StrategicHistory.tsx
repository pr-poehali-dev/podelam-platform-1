import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { StrategicSession, StrategicResults as StrategicResultsType } from "@/lib/proTrainerTypes";
import { getScoreGradient } from "@/lib/proTrainerFormulas";
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
  isg: "Системность",
  kps: "Структура",
  ism: "Сценарность",
  iur: "Риски",
  ia: "Адаптивность",
  ikg: "Гибкость",
};

const COMPARE_COLORS = ["#0f172a", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

interface Props {
  sessions: StrategicSession[];
  onViewSession: (s: StrategicSession) => void;
}

export default function StrategicHistory({ sessions, onViewSession }: Props) {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const completed = useMemo(
    () =>
      sessions
        .filter((s) => s.completedAt && s.results)
        .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime()),
    [sessions]
  );

  const trendData = useMemo(
    () =>
      completed.map((s, i) => ({
        name: s.data.step0?.name || `#${i + 1}`,
        date: new Date(s.completedAt!).toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
        }),
        osi: s.results!.osi,
      })),
    [completed]
  );

  const compareData = useMemo(() => {
    const selected = completed.filter((s) => compareIds.includes(s.id));
    if (selected.length < 2) return null;

    const keys = Object.keys(INDEX_LABELS);
    return keys.map((key) => {
      const entry: Record<string, string | number> = { axis: INDEX_LABELS[key] };
      selected.forEach((s, i) => {
        const val = s.results!.indices[key as keyof StrategicResultsType["indices"]];
        entry[s.data.step0?.name || `#${i + 1}`] = Math.round(val * 100);
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
        <p className="text-sm text-slate-500">Завершите первую сессию, чтобы увидеть историю</p>
      </div>
    );
  }

  const selectedSessions = completed.filter((s) => compareIds.includes(s.id));

  return (
    <div className="space-y-6">
      {completed.length >= 2 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-1">Динамика OSI</h3>
          <p className="text-xs text-slate-500 mb-4">Как менялся ваш стратегический индекс</p>
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
                  formatter={(val: number) => [`${val}`, "OSI"]}
                  labelFormatter={(label) => {
                    const item = trendData.find((d) => d.date === label);
                    return item?.name || label;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="osi"
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

      {completed.length >= 2 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-1">Сравнение сессий</h3>
          <p className="text-xs text-slate-500 mb-4">Выберите 2–5 сессий для сравнения на радаре</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {completed.map((s) => {
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
                  {s.data.step0?.name || "Без названия"}{" "}
                  <span className="opacity-70">({s.results!.osi})</span>
                </button>
              );
            })}
          </div>

          {compareData && selectedSessions.length >= 2 && (
            <div className="w-full" style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={compareData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  {selectedSessions.map((s, i) => (
                    <Radar
                      key={s.id}
                      name={s.data.step0?.name || `#${i + 1}`}
                      dataKey={s.data.step0?.name || `#${i + 1}`}
                      stroke={COMPARE_COLORS[i]}
                      fill={COMPARE_COLORS[i]}
                      fillOpacity={0.08}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {compareData && selectedSessions.length >= 2 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 pr-4 text-slate-500 font-medium">Индекс</th>
                    {selectedSessions.map((s, i) => (
                      <th key={s.id} className="text-center py-2 px-3 font-medium" style={{ color: COMPARE_COLORS[i] }}>
                        {s.data.step0?.name || `#${i + 1}`}
                      </th>
                    ))}
                    {selectedSessions.length === 2 && (
                      <th className="text-center py-2 px-3 text-slate-500 font-medium">Δ</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(INDEX_LABELS).map(([key, label]) => {
                    const vals = selectedSessions.map(
                      (s) => Math.round(s.results!.indices[key as keyof StrategicResultsType["indices"]] * 100)
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
                  <tr className="border-t border-slate-200">
                    <td className="py-2 pr-4 text-slate-900 font-semibold">OSI</td>
                    {selectedSessions.map((s, i) => (
                      <td key={s.id} className="text-center py-2 px-3 tabular-nums font-bold text-slate-900">
                        {s.results!.osi}
                      </td>
                    ))}
                    {selectedSessions.length === 2 && (() => {
                      const d = selectedSessions[1].results!.osi - selectedSessions[0].results!.osi;
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

      <div>
        <h3 className="text-base font-semibold text-slate-900 mb-3">Все результаты</h3>
        <div className="space-y-2">
          {completed
            .slice()
            .reverse()
            .map((s) => {
              const gradient = getScoreGradient(s.results!.osi);
              const date = new Date(s.completedAt!).toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
              return (
                <div
                  key={s.id}
                  onClick={() => onViewSession(s)}
                  className="rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}
                    >
                      <span className="text-white font-bold text-sm">{s.results!.osi}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">
                        {s.data.step0?.name || "Без названия"}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{date}</span>
                        <span className="text-slate-300">·</span>
                        <span>{s.results!.level}</span>
                        <span className="text-slate-300">·</span>
                        <span>{s.results!.profile}</span>
                      </div>
                    </div>
                    <Icon name="ChevronRight" size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
