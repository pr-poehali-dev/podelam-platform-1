import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type {
  FinancialData,
  FinancialResults,
  FinancialDecisionResult,
  FinancialDecisionType,
} from "@/lib/financialTrainerTypes";
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
  LineChart,
  Line,
  Legend,
} from "recharts";

interface Props {
  data: FinancialData;
  results: FinancialResults;
  onRestart: () => void;
  onExportPDF: () => void;
  readOnly?: boolean;
}

const DECISION_LABELS: Record<FinancialDecisionType, string> = {
  increase_income: "Увеличить доход",
  reduce_expenses: "Снизить расходы",
  restructure_debt: "Реструктурировать долг",
};

const DECISION_ICONS: Record<FinancialDecisionType, string> = {
  increase_income: "TrendingUp",
  reduce_expenses: "TrendingDown",
  restructure_debt: "RefreshCw",
};

function getIfmpColor(ifmp: number): string {
  if (ifmp >= 85) return "text-emerald-600";
  if (ifmp >= 70) return "text-green-600";
  if (ifmp >= 50) return "text-amber-600";
  if (ifmp >= 30) return "text-orange-600";
  return "text-red-600";
}

function getIfmpBg(ifmp: number): string {
  if (ifmp >= 85) return "bg-emerald-50 border-emerald-200";
  if (ifmp >= 70) return "bg-green-50 border-green-200";
  if (ifmp >= 50) return "bg-amber-50 border-amber-200";
  if (ifmp >= 30) return "bg-orange-50 border-orange-200";
  return "bg-red-50 border-red-200";
}

function getIfmpBarColor(ifmp: number): string {
  if (ifmp >= 85) return "bg-emerald-500";
  if (ifmp >= 70) return "bg-green-500";
  if (ifmp >= 50) return "bg-amber-500";
  if (ifmp >= 30) return "bg-orange-500";
  return "bg-red-500";
}

export default function FinancialResultsView({
  data,
  results,
  onRestart,
  onExportPDF,
  readOnly,
}: Props) {
  const { ifmp, level, indices, decisions, stressTest, goalProjection } = results;
  const fmt = (n: number) => n.toLocaleString("ru-RU");
  const fmtDelta = (n: number) => (n >= 0 ? `+${fmt(Math.round(n))}` : fmt(Math.round(n)));

  const isuLabel =
    indices.isu < 0.7
      ? "Уязвим"
      : indices.isu <= 1
        ? "Средняя"
        : "Высокая";
  const isuColor =
    indices.isu < 0.7
      ? "text-red-600"
      : indices.isu <= 1
        ? "text-amber-600"
        : "text-emerald-600";

  const kdnColor =
    indices.kdn > 0.5
      ? "text-red-600"
      : indices.kdn > 0.3
        ? "text-amber-600"
        : "text-emerald-600";

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
    <div className="max-w-3xl mx-auto">
      <div className={`rounded-2xl border p-8 md:p-12 text-center mb-8 ${getIfmpBg(ifmp)}`}>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">
          Индекс финансового мышления PRO
        </p>
        <div className={`text-7xl md:text-8xl font-bold ${getIfmpColor(ifmp)} mb-3`}>
          {ifmp.toFixed(1)}
        </div>
        <p className="text-lg font-medium text-slate-900 mb-4">{level}</p>
        <div className="max-w-md mx-auto">
          <div className="h-3 bg-white/80 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full rounded-full transition-all ${getIfmpBarColor(ifmp)}`}
              style={{ width: `${Math.min(ifmp, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-slate-400">0</span>
            <span className="text-[10px] text-slate-400">30</span>
            <span className="text-[10px] text-slate-400">50</span>
            <span className="text-[10px] text-slate-400">70</span>
            <span className="text-[10px] text-slate-400">85</span>
            <span className="text-[10px] text-slate-400">100</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <IndexCard
          label="Денежный поток"
          code="CF"
          value={`${fmt(Math.round(indices.cf))} ₽`}
          color={indices.cf >= 0 ? "text-emerald-600" : "text-red-600"}
        />
        <IndexCard
          label="Долговая нагрузка"
          code="KDN"
          value={`${(indices.kdn * 100).toFixed(1)}%`}
          color={kdnColor}
          sub={indices.kdn < 0.3 ? "норма" : indices.kdn < 0.5 ? "повышена" : "опасно"}
        />
        <IndexCard
          label="Фин. подушка"
          code="KFP"
          value={`${indices.kfp.toFixed(1)} мес`}
          color="text-slate-900"
        />
        <IndexCard
          label="Диверсификация"
          code="KDI"
          value={`${(indices.kdi * 100).toFixed(0)}%`}
          color="text-slate-900"
        />
        <IndexCard
          label="Дисциплина"
          code="IFD"
          value={`${(indices.ifd * 100).toFixed(0)}%`}
          color={indices.ifd >= 0.7 ? "text-emerald-600" : indices.ifd >= 0.4 ? "text-amber-600" : "text-red-600"}
        />
        <IndexCard
          label="Стресс-устойчивость"
          code="ISU"
          value={indices.isu.toFixed(2)}
          color={isuColor}
          sub={isuLabel}
        />
      </div>

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
      </div>

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

      {decisions.length > 0 && (
        <div className="mb-8">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">
            Результаты решений
          </p>
          <div className="space-y-3">
            {decisions.map((d, i) => (
              <DecisionCard key={i} decision={d} />
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-4 pt-4 pb-8">
        {!readOnly && (
          <Button
            variant="outline"
            onClick={onRestart}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Icon name="RotateCcw" size={16} className="mr-2" />
            Пройти заново
          </Button>
        )}
        <Button
          onClick={onExportPDF}
          className="bg-slate-950 text-white hover:bg-slate-800"
        >
          <Icon name="Download" size={16} className="mr-2" />
          Экспорт PDF
        </Button>
      </div>
    </div>
  );
}

function IndexCard({
  label,
  code,
  value,
  color,
  sub,
}: {
  label: string;
  code: string;
  value: string;
  color: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
      <p className="text-[11px] text-slate-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{code}</p>
      {sub && <p className="text-[10px] text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

function DecisionCard({ decision }: { decision: FinancialDecisionResult }) {
  const fmt = (n: number) => n.toLocaleString("ru-RU");
  const fmtDelta = (n: number) => (n >= 0 ? `+${fmt(Math.round(n))}` : fmt(Math.round(n)));
  const ikrColor =
    decision.ikr > 0
      ? "text-emerald-600"
      : decision.ikr < 0
        ? "text-red-600"
        : "text-slate-900";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
          <Icon name={DECISION_ICONS[decision.type]} size={15} className="text-slate-700" />
        </div>
        <h4 className="text-sm font-semibold text-slate-900">
          {DECISION_LABELS[decision.type]}
        </h4>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center">
          <p className="text-[10px] text-slate-500 mb-0.5">Delta CF</p>
          <p
            className={`text-sm font-bold ${
              decision.deltaCF >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {fmtDelta(decision.deltaCF)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-500 mb-0.5">Delta IU</p>
          <p
            className={`text-sm font-bold ${
              decision.deltaIU >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {fmtDelta(decision.deltaIU)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-500 mb-0.5">Delta KDG</p>
          <p
            className={`text-sm font-bold ${
              decision.deltaKDG >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {decision.deltaKDG >= 0 ? "+" : ""}
            {decision.deltaKDG.toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-500 mb-0.5">IKR</p>
          <p className={`text-sm font-bold ${ikrColor}`}>{decision.ikr.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
