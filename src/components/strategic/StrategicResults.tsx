import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { StrategicData, StrategicResults as StrategicResultsType } from "@/lib/proTrainerTypes";
import { getScoreGradient, applyStressTest } from "@/lib/proTrainerFormulas";
import { buildFullInterpretation } from "@/lib/proTrainerInterpretation";
import type { IndexInterpretation } from "@/lib/proTrainerInterpretation";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface ResultsProps {
  data: StrategicData;
  results: StrategicResultsType;
  onRestart: () => void;
  onExportPDF: () => void;
  readOnly?: boolean;
}

const RADAR_LABELS: Record<string, string> = {
  isg: "Системность",
  kps: "Структура",
  ism: "Сценарность",
  iur: "Риски",
  ia: "Адаптивность",
  ikg: "Гибкость",
};

const CATEGORY_COLORS: Record<string, string> = {
  micro: "#3b82f6",
  meso: "#f59e0b",
  macro: "#10b981",
  hidden: "#8b5cf6",
};

function IndexBar({ idx }: { idx: IndexInterpretation }) {
  const bgColor = idx.zone === "high" ? "bg-emerald-500" : idx.zone === "mid" ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{idx.fullName}</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${idx.zoneColor}`}>{idx.zoneLabel}</span>
          <span className="text-lg font-bold text-slate-900 tabular-nums">{idx.percent}%</span>
        </div>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div className={`h-full ${bgColor} rounded-full transition-all`} style={{ width: `${idx.percent}%` }} />
      </div>
      <p className="text-xs text-slate-500 leading-relaxed mb-2">{idx.meaning}</p>
      <p className="text-sm text-slate-700 leading-relaxed">{idx.description}</p>
      {idx.recommendation && (
        <div className="mt-3 flex gap-2 bg-slate-50 rounded-lg p-3">
          <Icon name="Lightbulb" size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-600 leading-relaxed">{idx.recommendation}</p>
        </div>
      )}
    </div>
  );
}

export default function StrategicResults({ data, results, onRestart, onExportPDF, readOnly }: ResultsProps) {
  const [copied, setCopied] = useState(false);
  const gradient = getScoreGradient(results.osi);

  const interpretation = useMemo(() => buildFullInterpretation(data, results), [data, results]);

  const radarData = useMemo(
    () =>
      Object.entries(results.indices).map(([key, value]) => ({
        axis: RADAR_LABELS[key],
        value: Math.round(value * 100),
      })),
    [results.indices]
  );

  const scenarioChartData = useMemo(() => {
    if (!data.step3) return [];
    const original = data.step3.scenarios;
    const stressed = applyStressTest(original);
    const labels = ["Оптимистичный", "Реалистичный", "Негативный"];
    return original.map((sc, i) => ({
      name: labels[i],
      "Доход": sc.revenue,
      "Затраты": sc.costs,
      "Доход (стресс)": stressed[i].revenue,
      "Затраты (стресс)": stressed[i].costs,
    }));
  }, [data.step3]);

  const factors = data.step1?.factors || [];
  const links = data.step1?.links || [];
  const pivotIds = data.step2?.pivotFactorIds || [];
  const blindSpots = data.step2?.blindSpots || [];

  const factorPositions = useMemo(() => {
    const count = factors.length;
    const cx = 150;
    const cy = 150;
    const r = 110;
    return factors.map((f, i) => {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2;
      return {
        id: f.id,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        factor: f,
      };
    });
  }, [factors]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto print:max-w-none">
      {/* OSI Score Card */}
      <div className={`rounded-2xl bg-gradient-to-br ${gradient} p-8 md:p-12 text-center mb-8`}>
        <p className="text-white/70 text-sm uppercase tracking-widest mb-4">Общий стратегический индекс</p>
        <div className="text-7xl md:text-8xl font-bold text-white mb-4">{results.osi}</div>
        <p className="text-white/90 text-lg font-medium mb-2">{results.level}</p>
        <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5">
          <Icon name="User" size={14} className="text-white/80" />
          <span className="text-sm text-white/90">{results.profile}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 mb-8">
        <h3 className="text-base font-semibold text-slate-900 mb-3">Краткий вывод</h3>
        <p className="text-sm text-slate-700 leading-relaxed mb-4">{interpretation.summary}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex gap-2 bg-emerald-50 rounded-lg p-3">
            <Icon name="TrendingUp" size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-emerald-800 mb-0.5">Сильная сторона</p>
              <p className="text-xs text-emerald-700 leading-relaxed">{interpretation.topStrength}</p>
            </div>
          </div>
          <div className="flex gap-2 bg-red-50 rounded-lg p-3">
            <Icon name="TrendingDown" size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-red-800 mb-0.5">Зона роста</p>
              <p className="text-xs text-red-700 leading-relaxed">{interpretation.topWeakness}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Level Interpretation */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Icon name="Award" size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Уровень: {interpretation.level.level}</h3>
          </div>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed mb-4">{interpretation.level.description}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Сильные стороны</p>
            <ul className="space-y-1.5">
              {interpretation.level.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <Icon name="Check" size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Зоны развития</p>
            <ul className="space-y-1.5">
              {interpretation.level.growthAreas.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <Icon name="ArrowUpRight" size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Profile Interpretation */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
            <Icon name="User" size={18} className="text-white" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Профиль: {interpretation.profile.profile}</h3>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed mb-3">{interpretation.profile.description}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {interpretation.profile.traits.map((t, i) => (
            <span key={i} className="text-xs bg-slate-100 text-slate-700 rounded-full px-3 py-1">{t}</span>
          ))}
        </div>
        <div className="flex gap-2 bg-amber-50 rounded-lg p-3">
          <Icon name="AlertTriangle" size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-amber-800 mb-0.5">Слепое пятно профиля</p>
            <p className="text-xs text-amber-700 leading-relaxed">{interpretation.profile.blindSpot}</p>
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 mb-4">
        <h3 className="text-base font-semibold text-slate-900 mb-6">Радар компетенций</h3>
        <div className="w-full" style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: "#64748b", fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <Radar name="Индексы" dataKey="value" stroke="#0f172a" fill="#0f172a" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Index Breakdown */}
      <div className="space-y-3 mb-8">
        {interpretation.indices.map((idx) => (
          <IndexBar key={idx.key} idx={idx} />
        ))}
      </div>

      {/* Scenario Chart + Interpretation */}
      {scenarioChartData.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 mb-8">
          <h3 className="text-base font-semibold text-slate-900 mb-6">Сценарии: до и после стресс-теста</h3>
          <div className="w-full" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scenarioChartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Доход" fill="#0f172a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Затраты" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Доход (стресс)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Затраты (стресс)" fill="#fca5a5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {interpretation.scenarios && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  interpretation.scenarios.stressResistance >= 70 ? "bg-emerald-100 text-emerald-700" :
                  interpretation.scenarios.stressResistance >= 50 ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {interpretation.scenarios.verdict}
                </span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{interpretation.scenarios.details}</p>
            </div>
          )}
        </div>
      )}

      {/* Factor Graph + Interpretation */}
      {factors.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 mb-8">
          <h3 className="text-base font-semibold text-slate-900 mb-2">Граф факторов</h3>
          <p className="text-xs text-slate-500 mb-4">
            Узловые факторы выделены тёмным. Факторы в слепой зоне отмечены предупреждением.
          </p>
          <div className="flex justify-center overflow-x-auto">
            <svg width={300} height={300} viewBox="0 0 300 300" className="flex-shrink-0">
              {links.map((link, i) => {
                const from = factorPositions.find((p) => p.id === link.from);
                const to = factorPositions.find((p) => p.id === link.to);
                if (!from || !to) return null;
                return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#cbd5e1" strokeWidth={1} opacity={0.6} />;
              })}
              {factorPositions.map((p) => {
                const isPivot = pivotIds.includes(p.id);
                const isBlind = blindSpots.includes(p.id);
                const color = isPivot ? "#0f172a" : CATEGORY_COLORS[p.factor.category] || "#94a3b8";
                const radius = isPivot ? 10 : 7;
                return (
                  <g key={p.id}>
                    <circle cx={p.x} cy={p.y} r={radius} fill={color} stroke={isBlind ? "#f59e0b" : "white"} strokeWidth={isBlind ? 3 : 2} />
                    {isBlind && <text x={p.x} y={p.y - radius - 4} textAnchor="middle" fontSize={10} fill="#f59e0b">!</text>}
                    <text x={p.x} y={p.y + radius + 12} textAnchor="middle" fontSize={8} fill="#64748b" className="select-none">
                      {p.factor.name.length > 10 ? p.factor.name.slice(0, 10) + "…" : p.factor.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 justify-center text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Микро</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Мезо</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Макро</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-violet-500 inline-block" /> Скрытые</span>
          </div>
          {interpretation.factors && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  interpretation.factors.blindSpotCount === 0 && interpretation.factors.categoriesUsed >= 3
                    ? "bg-emerald-100 text-emerald-700"
                    : interpretation.factors.categoriesUsed >= 2
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {interpretation.factors.verdict}
                </span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{interpretation.factors.details}</p>
            </div>
          )}
        </div>
      )}

      {/* Risk Interpretation */}
      {interpretation.risks && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Icon name="ShieldAlert" size={18} className="text-slate-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Анализ рисков</h3>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              interpretation.risks.avgManageability >= 4 ? "bg-emerald-100 text-emerald-700" :
              interpretation.risks.avgManageability >= 2.5 ? "bg-amber-100 text-amber-700" :
              "bg-red-100 text-red-700"
            }`}>
              {interpretation.risks.verdict}
            </span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed mb-3">{interpretation.risks.details}</p>
          {interpretation.risks.highRisks.length > 0 && (
            <div className="flex gap-2 bg-red-50 rounded-lg p-3">
              <Icon name="AlertTriangle" size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-red-800 mb-0.5">Критические риски</p>
                <p className="text-xs text-red-700">{interpretation.risks.highRisks.join(", ")}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Session Metadata */}
      {data.step0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 mb-8">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Параметры сессии</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Горизонт</p>
              <p className="text-slate-900 font-medium">{data.step0.horizonMonths} мес</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Бюджет</p>
              <p className="text-slate-900 font-medium">{data.step0.budget?.toLocaleString("ru-RU")} ₽</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Факторов</p>
              <p className="text-slate-900 font-medium">{data.step1?.factors.length || 0}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Рисков</p>
              <p className="text-slate-900 font-medium">{data.step4?.risks.length || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {!readOnly && (
          <Button
            onClick={onRestart}
            variant="outline"
            className="flex-1 h-12 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Icon name="RotateCcw" size={16} />
            Пройти заново
          </Button>
        )}
        <Button
          onClick={onExportPDF}
          className="flex-1 h-12 bg-slate-950 text-white hover:bg-slate-800"
        >
          <Icon name="FileDown" size={16} />
          Экспорт PDF
        </Button>
        <Button
          onClick={handleShare}
          variant="outline"
          className="flex-1 h-12 border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          <Icon name={copied ? "Check" : "Share2"} size={16} />
          {copied ? "Скопировано" : "Поделиться"}
        </Button>
      </div>
    </div>
  );
}
