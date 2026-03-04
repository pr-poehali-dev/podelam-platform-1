import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import type { FinancialData, FinancialGoalProjection, FinancialIndices } from "@/lib/financialTrainerTypes";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface GoalsProps {
  data: FinancialData;
  indices: FinancialIndices;
  goalProjection: FinancialGoalProjection;
  goalDesc: string;
}

export default function FinancialResultsGoals({ data, indices, goalProjection, goalDesc }: GoalsProps) {
  const fmt = (n: number) => n.toLocaleString("ru-RU");

  const accumulationData = useMemo(() => {
    const cf = indices.cf;
    const goal = data.step0?.goalAmount ?? 0;
    const months = Math.min(goalProjection.monthsToGoal, data.step0?.goalMonths ?? 60, 120);
    const points: { month: number; accumulated: number; goal: number }[] = [];
    for (let m = 0; m <= months; m++) {
      points.push({
        month: m,
        accumulated: Math.round(Math.max(0, cf * m)),
        goal,
      });
    }
    return points;
  }, [indices.cf, data.step0, goalProjection]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 mb-8">
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Проекция цели</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
          <p className="text-[11px] text-slate-500 mb-1">Ежемесячный вклад (PMT)</p>
          <p className="text-lg font-bold text-slate-900">
            {fmt(Math.round(goalProjection.pmt))} ₽
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
          <p className="text-[11px] text-slate-500 mb-1">Достижимость (KDG)</p>
          <p
            className={`text-lg font-bold ${
              goalProjection.kdg < 1
                ? "text-red-600"
                : goalProjection.kdg < 1.5
                  ? "text-amber-600"
                  : "text-emerald-600"
            }`}
          >
            {goalProjection.kdg >= 999 ? "---" : goalProjection.kdg.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
          <p className="text-[11px] text-slate-500 mb-1">Срок при текущем CF</p>
          <p className="text-lg font-bold text-slate-900">
            {goalProjection.monthsToGoal >= 999
              ? "---"
              : `${goalProjection.monthsToGoal} мес`}
          </p>
        </div>
      </div>
      <div className={`flex gap-2 rounded-lg p-3 mb-4 ${goalProjection.kdg >= 1 ? "bg-emerald-50" : goalProjection.kdg >= 0.5 ? "bg-amber-50" : "bg-red-50"}`}>
        <Icon
          name={goalProjection.kdg >= 1 ? "Target" : goalProjection.kdg >= 0.5 ? "AlertCircle" : "AlertTriangle"}
          size={14}
          className={`mt-0.5 flex-shrink-0 ${goalProjection.kdg >= 1 ? "text-emerald-600" : goalProjection.kdg >= 0.5 ? "text-amber-500" : "text-red-500"}`}
        />
        <p className={`text-sm leading-relaxed ${goalProjection.kdg >= 1 ? "text-emerald-700" : goalProjection.kdg >= 0.5 ? "text-amber-700" : "text-red-700"}`}>
          {goalDesc}
        </p>
      </div>
      {accumulationData.length > 1 && indices.cf > 0 && (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={accumulationData}
              margin={{ left: 10, right: 20, top: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#64748b", fontSize: 11 }}
                label={{
                  value: "Месяц",
                  position: "insideBottom",
                  offset: -2,
                  style: { fill: "#94a3b8", fontSize: 10 },
                }}
              />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip
                formatter={(v: number) => fmt(v)}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="accumulated"
                name="Накопления"
                stroke="#1e293b"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="goal"
                name="Цель"
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="6 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}