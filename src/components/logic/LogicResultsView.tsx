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

function getIndexInterpretation(key: string, raw: number, normalized: number): string {
  switch (key) {
    case "ia":
      if (raw >= 20) return "Отличная аргументированность. Ваши доводы хорошо подкреплены фактами и имеют высокую проверяемость.";
      if (raw >= 12) return "Средняя аргументированность. Часть аргументов основана на предположениях — попробуйте найти больше фактов.";
      return "Слабая аргументированность. Многие доводы не подкреплены фактами или имеют низкую проверяемость.";
    case "ba":
      if (raw >= 0.3 && raw <= 0.8) return "Хороший баланс аргументов «за» и «против». Вы рассматриваете вопрос объективно с разных сторон.";
      if (raw > 0.8) return "Аргументация смещена в одну сторону. Это может указывать на предвзятость — добавьте противоположные доводы.";
      return "Дисбаланс аргументов. Одна из сторон существенно перевешивает — проверьте, не упускаете ли вы важные контраргументы.";
    case "icl":
      if (raw >= 3) return "Сильная причинная логика. Вы выстроили качественные цепочки с подтверждёнными данными и альтернативными объяснениями.";
      if (raw >= 1.5) return "Причинные связи выстроены, но часть цепочек линейная или не подкреплена данными. Ищите альтернативные объяснения.";
      return "Причинная логика слабая. Цепочки линейные, данных мало, альтернативы не рассматриваются.";
    case "ial":
      if (raw >= 2) return "Вы рассматриваете достаточно альтернативных объяснений с адекватным распределением вероятностей.";
      if (raw >= 1) return "Альтернатив мало или одна гипотеза доминирует. Попробуйте рассмотреть больше вариантов.";
      return "Альтернативные объяснения практически не рассматриваются. Это признак туннельного мышления.";
    case "kf":
      if (raw >= 0.5) return "Более половины вашей аргументации основано на фактах. Это хорошая доказательная база для выводов.";
      if (raw >= 0.3) return "Доля фактов невысока — значительная часть рассуждений строится на предположениях.";
      return "Очень мало подтверждённых фактов. Рекомендуется собрать больше данных перед принятием решения.";
    case "inu":
      if (raw <= 0.3) return "Низкий уровень неопределённости. Вы хорошо понимаете факторы, влияющие на ситуацию.";
      if (raw <= 0.5) return "Умеренная неопределённость. Часть факторов остаётся неизвестной — будьте осторожны с выводами.";
      return "Высокая неопределённость. Слишком много неизвестных — выводы могут быть ненадёжными.";
    case "iki":
      if (raw <= 0.17) return "Минимум когнитивных искажений. Ваше мышление объективно и критично.";
      if (raw <= 0.5) return "Обнаружены некоторые когнитивные ошибки. Осознание их — первый шаг к более точному мышлению.";
      return "Много когнитивных искажений. Рекомендуется пересмотреть аргументацию, устранив выявленные ошибки мышления.";
    case "ilc":
      if (raw >= 0.3) return "Высокая гибкость мышления. Вы способны менять позицию на основе анализа — признак зрелого мышления.";
      if (raw > 0) return "Умеренная гибкость. Позиция немного изменилась, но есть потенциал для более глубокой корректировки.";
      return "Позиция не изменилась после анализа. Возможна ригидность мышления или изначально верное решение.";
    default:
      return "";
  }
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
        <div className="space-y-5">
          {INDEX_ROWS.map((row) => {
            const raw = indices[row.key as keyof typeof indices] as number;
            const norm = row.normalize(raw);
            const display = row.inverted ? 1 - norm : norm;
            const barW = `${(display * 100).toFixed(0)}%`;
            const color =
              display >= 0.7
                ? "bg-emerald-500"
                : display >= 0.4
                  ? "bg-amber-400"
                  : "bg-red-400";
            const textColor =
              display >= 0.7
                ? "text-emerald-700"
                : display >= 0.4
                  ? "text-amber-700"
                  : "text-red-700";
            const bgColor =
              display >= 0.7
                ? "bg-emerald-50"
                : display >= 0.4
                  ? "bg-amber-50"
                  : "bg-red-50";

            const interpretation = getIndexInterpretation(row.key, raw, display);

            return (
              <div key={row.key} className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">{row.label}</span>
                  <span className="text-sm font-bold text-slate-900">
                    {row.format(raw)}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${color}`}
                    style={{ width: barW }}
                  />
                </div>
                {interpretation && (
                  <div className={`rounded-lg ${bgColor} px-3 py-2`}>
                    <p className={`text-xs ${textColor}`}>{interpretation}</p>
                  </div>
                )}
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

      <div className="rounded-xl border border-slate-200 bg-white p-6 mb-8">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-5">
          Рекомендации
        </p>
        <div className="space-y-3">
          {ilmp < 30 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50">
              <Icon name="Target" size={16} className="text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">Начните с фундамента: научитесь разделять факты от мнений и строить простые причинно-следственные цепочки.</p>
            </div>
          )}
          {indices.kf < 0.3 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50">
              <Icon name="Database" size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-700">Соберите больше фактов. Многие ваши выводы основаны на предположениях — найдите подтверждающие данные.</p>
            </div>
          )}
          {indices.iki > 0.5 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50">
              <Icon name="Brain" size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-700">Работайте над когнитивными искажениями. Перед принятием решений проверяйте себя на типичные ошибки мышления.</p>
            </div>
          )}
          {indices.ial < 1 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50">
              <Icon name="GitBranch" size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-700">Рассматривайте больше альтернатив. Привычка видеть только одно объяснение ограничивает качество решений.</p>
            </div>
          )}
          {indices.ilc === 0 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50">
              <Icon name="RefreshCw" size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-700">Развивайте гибкость мышления. Готовность менять позицию на основе новых данных — ключевой навык аналитика.</p>
            </div>
          )}
          {ilmp >= 70 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50">
              <Icon name="Award" size={16} className="text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-sm text-emerald-700">Отличный уровень! Продолжайте практиковать для закрепления навыков системного анализа.</p>
            </div>
          )}
          {ilmp >= 30 && ilmp < 70 && indices.kf >= 0.3 && indices.iki <= 0.5 && indices.ial >= 1 && indices.ilc > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50">
              <Icon name="TrendingUp" size={16} className="text-indigo-600 mt-0.5 shrink-0" />
              <p className="text-sm text-indigo-700">Хорошая база! Углубляйте анализ причинных связей и расширяйте набор альтернативных гипотез.</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        {!readOnly ? (
          <Button
            onClick={onRestart}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <Icon name="RotateCcw" size={16} className="mr-2" />
            Новая сессия
          </Button>
        ) : <div />}
        <Button
          variant="outline"
          onClick={onExportPDF}
          className="border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <Icon name="Download" size={16} className="mr-2" />
          Скачать PDF
        </Button>
      </div>
    </div>
  );
}