import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type {
  LogicData,
  LogicResults,
  LogicLevel,
} from "@/lib/logicTrainerTypes";

interface Props {
  data: LogicData;
  results: LogicResults;
  onRestart: () => void;
  onExportPDF: () => void;
  readOnly?: boolean;
}

const LEVEL_DESCRIPTIONS: Record<LogicLevel, string> = {
  "Интуитивное мышление":
    "Решения принимаются на основе интуиции и эмоций. Аргументация слабая, причинные связи не выстроены, альтернативы не рассматриваются.",
  "Частичная логика":
    "Есть элементы логического мышления, но системности нет. Аргументы частично обоснованы, когнитивные искажения влияют на выводы.",
  "Аналитическое":
    "Вы умеете выстраивать аргументацию и видите причинные связи. Для роста нужно углубить работу с альтернативными гипотезами.",
  "Системное":
    "Сильное логическое мышление: вы системно анализируете аргументы, строите причинные цепочки и проверяете данные.",
  "Стратегический аналитик":
    "Экспертный уровень аналитического мышления. Вы видите систему целиком, учитываете альтернативы и гибко корректируете выводы.",
};

const RADAR_LABELS = [
  "Аргументация",
  "Причинная логика",
  "Альтернативность",
  "Фактичность",
  "Гибкость",
  "Без искажений",
];

const INDEX_ROWS: {
  key: string;
  label: string;
  format: (v: number) => string;
  normalize: (v: number) => number;
  inverted?: boolean;
}[] = [
  { key: "ia", label: "Аргументированность", format: (v) => v.toFixed(2), normalize: (v) => Math.min(v / 25, 1) },
  { key: "ba", label: "Баланс аргументов", format: (v) => v.toFixed(2), normalize: (v) => Math.min(v, 1) },
  { key: "icl", label: "Причинная логика", format: (v) => v.toFixed(1), normalize: (v) => Math.min(v / 5, 1) },
  { key: "ial", label: "Альтернативность", format: (v) => v.toFixed(1), normalize: (v) => Math.min(v / 3, 1) },
  { key: "kf", label: "Фактичность", format: (v) => (v * 100).toFixed(0) + "%", normalize: (v) => v },
  { key: "inu", label: "Неопределённость", format: (v) => (v * 100).toFixed(0) + "%", normalize: (v) => v, inverted: true },
  { key: "iki", label: "Когнитивные искажения", format: (v) => (v * 100).toFixed(0) + "%", normalize: (v) => v, inverted: true },
  { key: "ilc", label: "Гибкость мышления", format: (v) => (v * 100).toFixed(0) + "%", normalize: (v) => v },
];

function getRingStroke(ilmp: number): string {
  if (ilmp >= 85) return "#6366f1";
  if (ilmp >= 70) return "#22c55e";
  if (ilmp >= 50) return "#f59e0b";
  if (ilmp >= 30) return "#f97316";
  return "#ef4444";
}

function getScoreTextClass(ilmp: number): string {
  if (ilmp >= 85) return "text-indigo-500";
  if (ilmp >= 70) return "text-emerald-500";
  if (ilmp >= 50) return "text-amber-500";
  if (ilmp >= 30) return "text-orange-500";
  return "text-red-500";
}

function RadarChart({ values }: { values: number[] }) {
  const cx = 150;
  const cy = 150;
  const R = 120;
  const N = 6;

  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / N;

  const pt = (i: number, r: number) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  });

  const hexPoints = (r: number) =>
    Array.from({ length: N }, (_, i) => pt(i, r))
      .map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      .join(" ");

  const dataPoints = values.map((v, i) => pt(i, Math.max(v, 0.02) * R));
  const dataPolygon = dataPoints
    .map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");

  const labelPts = Array.from({ length: N }, (_, i) => pt(i, R + 22));

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[340px] mx-auto">
      <polygon points={hexPoints(R * 0.333)} fill="none" stroke="#e2e8f0" strokeWidth={1} />
      <polygon points={hexPoints(R * 0.667)} fill="none" stroke="#e2e8f0" strokeWidth={1} />
      <polygon points={hexPoints(R)} fill="none" stroke="#e2e8f0" strokeWidth={1} />

      {Array.from({ length: N }, (_, i) => {
        const p = pt(i, R);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
        );
      })}

      <polygon
        points={dataPolygon}
        fill="#c7d2fe"
        fillOpacity={0.6}
        stroke="#6366f1"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#6366f1" />
      ))}

      {labelPts.map((p, i) => (
        <text
          key={i}
          x={p.x}
          y={p.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#64748b"
          fontSize={10}
        >
          {RADAR_LABELS[i]}
        </text>
      ))}
    </svg>
  );
}

export default function LogicResultsView({
  data,
  results,
  onRestart,
  onExportPDF,
  readOnly,
}: Props) {
  const { ilmp, level, indices, warnings } = results;
  const ringStroke = getRingStroke(ilmp);
  const scoreClass = getScoreTextClass(ilmp);

  const radarValues = useMemo(() => [
    Math.min(indices.ia / 25, 1),
    Math.min(indices.icl / 5, 1),
    Math.min(indices.ial / 3, 1),
    Math.min(indices.kf, 1),
    Math.min(indices.ilc, 1),
    Math.max(1 - indices.iki, 0),
  ], [indices]);

  const R_CIRCLE = 72;
  const circumference = 2 * Math.PI * R_CIRCLE;
  const dashOffset = circumference - (ilmp / 100) * circumference;

  const step0 = data.step0;
  const step6 = data.step6;
  const oldConf = step0?.initialConfidence ?? 0;
  const newConf = step6?.revisedConfidence ?? 0;
  const delta = newConf - oldConf;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="relative w-40 h-40 mx-auto mb-5">
          <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
            <circle cx={80} cy={80} r={R_CIRCLE} fill="none" stroke="#e2e8f0" strokeWidth={7} />
            <circle
              cx={80}
              cy={80}
              r={R_CIRCLE}
              fill="none"
              stroke={ringStroke}
              strokeWidth={7}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-bold ${scoreClass}`}>{ilmp}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
              ILMP
            </span>
          </div>
        </div>
        <h2 className={`text-xl font-bold mb-1 ${scoreClass}`}>{level}</h2>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          {LEVEL_DESCRIPTIONS[level]}
        </p>
      </div>

      {warnings.length > 0 && (
        <div className="mb-8">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
            Предупреждения
          </p>
          <div className="flex flex-wrap gap-2">
            {warnings.map((w, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-700"
              >
                <Icon name="AlertTriangle" size={12} />
                {w}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 mb-8">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-6">
          Профиль показателей
        </p>
        <RadarChart values={radarValues} />
      </div>

      {step0 && step6 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 mb-8">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-5">
            Изменение уверенности
          </p>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-500">До анализа</span>
                <span className="text-sm font-semibold text-slate-700">{oldConf}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-300 rounded-full transition-all"
                  style={{ width: `${oldConf}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-500">После анализа</span>
                <span className="text-sm font-semibold text-indigo-600">{newConf}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${newConf}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-400">Изменение:</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  delta > 0
                    ? "bg-emerald-50 text-emerald-700"
                    : delta < 0
                      ? "bg-amber-50 text-amber-700"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                {delta > 0 ? "+" : ""}
                {delta}%
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 mb-8">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-5">
          Детализация индексов
        </p>
        <div className="space-y-3">
          {INDEX_ROWS.map((row) => {
            const value = indices[row.key as keyof typeof indices];
            const barPct = Math.min(row.normalize(value) * 100, 100);
            const barColor = row.inverted ? "bg-red-400" : "bg-indigo-500";
            return (
              <div key={row.key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600">{row.label}</span>
                  <span className="text-xs font-semibold text-slate-900">
                    {row.format(value)}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${barPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {step0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 mb-8">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">
            Итог анализа
          </p>
          <div className="mb-4">
            <p className="text-[11px] text-slate-400 mb-1">Утверждение:</p>
            <p className="text-sm font-medium text-slate-900">{step0.statement}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-[11px] text-slate-400 mb-2">До</p>
              <p className="text-sm text-slate-700 mb-2">{step0.initialDecision}</p>
              <p className="text-xs font-semibold text-slate-500">
                Уверенность: {step0.initialConfidence}%
              </p>
            </div>
            {step6 && (
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                <p className="text-[11px] text-indigo-400 mb-2">После</p>
                <p className="text-sm text-indigo-900 font-medium mb-2">
                  {step6.revisedDecision}
                </p>
                <p className="text-xs font-semibold text-indigo-600">
                  Уверенность: {step6.revisedConfidence}%
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {!readOnly && (
        <div className="flex items-center justify-between pt-4">
          <Button
            onClick={onRestart}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <Icon name="RotateCcw" size={16} className="mr-2" />
            Новая сессия
          </Button>
          <Button
            variant="outline"
            onClick={onExportPDF}
            className="border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <Icon name="Download" size={16} className="mr-2" />
            Экспорт PDF
          </Button>
        </div>
      )}
    </div>
  );
}
