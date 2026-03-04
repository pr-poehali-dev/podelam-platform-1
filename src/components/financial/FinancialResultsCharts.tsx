import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import type { FinancialData, FinancialStressTestResult } from "@/lib/financialTrainerTypes";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface ChartsProps {
  data: FinancialData;
  indices: {
    iu: number;
    isu: number;
    kdg: number;
    ifd: number;
    kdi: number;
    ksr: number;
    cf: number;
  };
  stressTest: FinancialStressTestResult;
  stressDesc: string;
}

export default function FinancialResultsCharts({ data, indices, stressTest, stressDesc }: ChartsProps) {
  const fmt = (n: number) => n.toLocaleString("ru-RU");

  const radarData = useMemo(() => {
    const iuNorm = Math.min(Math.max(indices.iu / ((data.step0?.monthlyIncome ?? 1) * 3), 0), 1) * 100;
    const isuNorm = Math.min(Math.max(indices.isu, 0), 1) * 100;
    const kdgNorm = Math.min(Math.max(indices.kdg / 2, 0), 1) * 100;
    const ifdNorm = indices.ifd * 100;
    const kdiNorm = indices.kdi * 100;
    const ksrNorm = indices.ksr * 100;
    return [
      { axis: "Устойчивость", value: Math.round(iuNorm) },
      { axis: "Дисциплина", value: Math.round(ifdNorm) },
      { axis: "Диверсификация", value: Math.round(kdiNorm) },
      { axis: "Цели", value: Math.round(kdgNorm) },
      { axis: "Стресс-устойчивость", value: Math.round(isuNorm) },
      { axis: "Структура расходов", value: Math.round(ksrNorm) },
    ];
  }, [indices, data.step0]);

  const expenseChartData = useMemo(() => {
    if (!data.step1) return [];
    const c = data.step1.categories;
    return [
      { name: "Базовые", value: c.basic },
      { name: "Развитие", value: c.development },
      { name: "Инвестиции", value: c.investments },
      { name: "Импульсные", value: c.impulse },
      { name: "Прочее", value: c.other },
    ].filter((d) => d.value > 0);
  }, [data.step1]);

  const stressChartData = useMemo(() => {
    return [
      {
        name: "Денежный поток (CF)",
        original: Math.round(stressTest.originalCF),
        stressed: Math.round(stressTest.stressedCF),
      },
      {
        name: "Устойчивость (IU)",
        original: Math.round(stressTest.originalIU),
        stressed: Math.round(stressTest.stressedIU),
      },
    ];
  }, [stressTest]);

  const stressIconName = stressTest.stressedCF < 0 ? "AlertTriangle" : stressTest.stressedCF < stressTest.originalCF * 0.5 ? "AlertCircle" : "ShieldCheck";
  const stressBg = stressTest.stressedCF < 0 ? "bg-red-50" : stressTest.stressedCF < stressTest.originalCF * 0.5 ? "bg-amber-50" : "bg-emerald-50";
  const stressIconColor = stressTest.stressedCF < 0 ? "text-red-500" : stressTest.stressedCF < stressTest.originalCF * 0.5 ? "text-amber-500" : "text-emerald-600";
  const stressTextColor = stressTest.stressedCF < 0 ? "text-red-700" : stressTest.stressedCF < stressTest.originalCF * 0.5 ? "text-amber-700" : "text-emerald-700";

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white p-6 mb-8">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-6">Профиль показателей</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fill: "#64748b", fontSize: 11 }}
              />
              <Radar
                dataKey="value"
                stroke="#1e293b"
                fill="#1e293b"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {expenseChartData.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 mb-8">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-6">
            Распределение расходов
          </p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={expenseChartData}
                layout="vertical"
                margin={{ left: 10, right: 20, top: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  width={80}
                />
                <Tooltip
                  formatter={(v: number) => fmt(v)}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill="#334155" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 mb-8">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-6">
          Стресс-тест: до и после
        </p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stressChartData}
              margin={{ left: 10, right: 20, top: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#64748b", fontSize: 11 }}
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
              <Legend
                wrapperStyle={{ fontSize: 11 }}
              />
              <Bar dataKey="original" name="Исходный" fill="#1e293b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="stressed" name="Стресс" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className={`flex gap-2 ${stressBg} rounded-lg p-3 mt-4`}>
          <Icon name={stressIconName} size={14} className={`${stressIconColor} mt-0.5 flex-shrink-0`} />
          <p className={`text-sm ${stressTextColor} leading-relaxed`}>{stressDesc}</p>
        </div>
      </div>
    </>
  );
}