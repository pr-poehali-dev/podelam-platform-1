import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type {
  FinancialData,
  FinancialResults,
  FinancialLevel,
} from "@/lib/financialTrainerTypes";
import FinancialResultsCharts from "./FinancialResultsCharts";
import FinancialResultsGoals from "./FinancialResultsGoals";
import FinancialResultsDecisions from "./FinancialResultsDecisions";

interface Props {
  data: FinancialData;
  results: FinancialResults;
  onRestart: () => void;
  onExportPDF: () => void;
  readOnly?: boolean;
}

const LEVEL_DESCRIPTIONS: Record<FinancialLevel, string> = {
  "Финансовая хаотичность": "Финансы не контролируются: расходы непредсказуемы, накоплений нет, решения принимаются импульсивно. Первый шаг — начать вести учёт доходов и расходов.",
  "Нестабильность": "Есть базовое понимание своих финансов, но системы нет. Доходы и расходы не сбалансированы, подушка безопасности недостаточна. Нужно выстроить регулярный бюджет.",
  "Управляемость": "Финансы в целом под контролем: вы знаете свои цифры, есть некоторый запас. Для роста нужно сфокусироваться на инвестициях и диверсификации дохода.",
  "Системность": "Сильное финансовое мышление: вы системно управляете деньгами, имеете подушку безопасности и работающую стратегию. Можно переходить к более сложным инвестиционным инструментам.",
  "Финансовая зрелость": "Экспертный уровень управления финансами. Множественные источники дохода, устойчивая система, долгосрочная стратегия. Вы готовы к масштабированию капитала.",
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

  const interpretation = useMemo(() => {
    const cfAbs = Math.abs(Math.round(indices.cf));
    const cfFmt = cfAbs.toLocaleString("ru-RU");
    const kdnPct = (indices.kdn * 100).toFixed(1);
    const kfpVal = indices.kfp.toFixed(1);

    const cfDesc =
      indices.cf > 0
        ? `У вас остаётся ${cfFmt}\u00A0\u20BD в месяц после всех расходов. Это деньги, которые можно направить на накопления и инвестиции.`
        : `Вы тратите больше, чем зарабатываете. Каждый месяц вы теряете ${cfFmt}\u00A0\u20BD. Нужно срочно пересмотреть расходы или увеличить доход.`;

    const kdnDesc =
      indices.kdn < 0.3
        ? "На долги уходит менее 30% дохода — это безопасный уровень."
        : indices.kdn <= 0.5
          ? `На долги уходит ${kdnPct}% дохода — это повышенная нагрузка. Рекомендуется снизить долговые обязательства.`
          : "На долги уходит более половины дохода — это критический уровень. Высокий риск финансовых проблем.";

    const kfpDesc =
      indices.kfp >= 6
        ? `У вас запас на ${kfpVal} месяцев жизни без дохода — отличный уровень безопасности.`
        : indices.kfp >= 3
          ? `Запас на ${kfpVal} месяцев — минимально достаточный. Рекомендуется довести до 6 месяцев.`
          : "Запас менее 3 месяцев — это мало. В случае потери дохода вы быстро окажетесь в сложной ситуации.";

    const kdiDesc =
      indices.kdi >= 0.6
        ? "У вас несколько источников дохода — это снижает финансовые риски."
        : indices.kdi >= 0.2
          ? "Источников дохода мало. Подумайте о дополнительных заработках для снижения рисков."
          : "У вас один источник дохода. Потеря работы может привести к финансовому кризису.";

    const ifdDesc =
      indices.ifd >= 0.7
        ? "Высокая дисциплина — вы контролируете расходы, ведёте учёт и планируете бюджет."
        : indices.ifd >= 0.4
          ? "Средний уровень дисциплины. Есть привычки учёта, но не все аспекты контролируются."
          : "Низкая дисциплина — расходы не контролируются, решения принимаются импульсивно.";

    const isuDesc =
      indices.isu > 1
        ? "Ваши финансы хорошо защищены от стресса. Даже при ухудшении условий вы сохраните устойчивость."
        : indices.isu >= 0.7
          ? "Средняя устойчивость — при снижении дохода на 20% и росте расходов на 15% вы останетесь на плаву, но с трудом."
          : "Ваши финансы уязвимы к стрессу. Небольшие изменения дохода или расходов могут привести к проблемам.";

    const stressDesc =
      stressTest.stressedCF < 0
        ? "При стрессовом сценарии (доход \u221220%, расходы +15%) ваш денежный поток становится отрицательным. Это значит, что вы не сможете покрывать расходы без использования накоплений."
        : stressTest.stressedCF < stressTest.originalCF * 0.5
          ? "При стрессе ваш денежный поток сильно сокращается, но остаётся положительным. Однако запас прочности невелик."
          : "Даже при стрессовом сценарии вы сохраняете достаточный денежный поток. Ваши финансы устойчивы к внешним потрясениям.";

    const pmtFmt = Math.round(goalProjection.pmt).toLocaleString("ru-RU");
    const monthsStr = String(goalProjection.monthsToGoal);
    const goalDesc =
      goalProjection.kdg >= 999
        ? "При текущем доходе и расходах достижение цели в срок затруднительно. Нужно увеличить доход или скорректировать цель."
        : goalProjection.kdg >= 1
          ? `Вашего текущего денежного потока достаточно для достижения цели в срок. При ежемесячном откладывании ${pmtFmt}\u00A0\u20BD вы достигнете цели за ${monthsStr} месяцев.`
          : goalProjection.kdg >= 0.5
            ? "Цель достижима, но потребуется направлять на неё значительную часть свободных средств."
            : "При текущем доходе и расходах достижение цели в срок затруднительно. Нужно увеличить доход или скорректировать цель.";

    interface IndexScore { name: string; score: number; desc: string }
    const scored: IndexScore[] = [
      {
        name: "Денежный поток (CF)",
        score: indices.cf > 0 ? (indices.cf > (data.step0?.monthlyIncome ?? 1) * 0.2 ? 90 : 70) : 15,
        desc: cfDesc,
      },
      {
        name: "Долговая нагрузка (KDN)",
        score: indices.kdn < 0.3 ? 90 : indices.kdn <= 0.5 ? 50 : 15,
        desc: kdnDesc,
      },
      {
        name: "Финансовая подушка (KFP)",
        score: indices.kfp >= 6 ? 90 : indices.kfp >= 3 ? 55 : 15,
        desc: kfpDesc,
      },
      {
        name: "Диверсификация дохода (KDI)",
        score: indices.kdi >= 0.6 ? 90 : indices.kdi >= 0.2 ? 50 : 15,
        desc: kdiDesc,
      },
      {
        name: "Финансовая дисциплина (IFD)",
        score: indices.ifd >= 0.7 ? 90 : indices.ifd >= 0.4 ? 50 : 15,
        desc: ifdDesc,
      },
      {
        name: "Стресс-устойчивость (ISU)",
        score: indices.isu > 1 ? 90 : indices.isu >= 0.7 ? 55 : 15,
        desc: isuDesc,
      },
    ];

    const sorted = [...scored].sort((a, b) => b.score - a.score);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];

    let summary = "";
    if (ifmp >= 85) {
      summary = `Ваш индекс финансового мышления ${ifmp.toFixed(1)} — это экспертный уровень. Вы контролируете денежные потоки, имеете достаточный запас прочности и чёткую стратегию. Продолжайте в том же духе и масштабируйте капитал.`;
    } else if (ifmp >= 70) {
      summary = `Ваш индекс ${ifmp.toFixed(1)} говорит о системном подходе к финансам. Основные параметры в порядке, но есть точки роста. Сфокусируйтесь на слабых местах для перехода на следующий уровень.`;
    } else if (ifmp >= 50) {
      summary = `Индекс ${ifmp.toFixed(1)} — финансы в целом управляемы, но есть уязвимости. Вы понимаете основы, однако некоторые показатели требуют внимания. Проработайте зоны роста.`;
    } else if (ifmp >= 30) {
      summary = `Индекс ${ifmp.toFixed(1)} указывает на нестабильность финансовой системы. Есть значительные риски: недостаточная подушка, высокая долговая нагрузка или слабая дисциплина. Необходимы системные изменения.`;
    } else {
      summary = `Индекс ${ifmp.toFixed(1)} говорит о хаотичном состоянии финансов. Расходы не контролируются, запаса прочности практически нет. Начните с базового учёта доходов и расходов и сокращения необязательных трат.`;
    }

    const decisionDescs = decisions.map((d) => {
      const parts: string[] = [];
      const dCfAbs = Math.abs(Math.round(d.deltaCF)).toLocaleString("ru-RU");
      if (d.deltaCF > 0) {
        parts.push(`Это решение увеличит ваш денежный поток на ${dCfAbs}\u00A0\u20BD в месяц.`);
      } else if (d.deltaCF < 0) {
        parts.push(`Это решение уменьшит денежный поток на ${dCfAbs}\u00A0\u20BD.`);
      }
      if (d.ikr > 1) {
        parts.push("Соотношение выгоды к риску хорошее — решение эффективно.");
      } else if (d.ikr >= 0) {
        parts.push("Выгода от решения умеренная относительно риска.");
      } else {
        parts.push("Решение несёт больше рисков, чем выгоды.");
      }
      return parts.join(" ");
    });

    return {
      summary,
      strongest,
      weakest,
      cfDesc,
      kdnDesc,
      kfpDesc,
      kdiDesc,
      ifdDesc,
      isuDesc,
      stressDesc,
      goalDesc,
      decisionDescs,
    };
  }, [ifmp, level, indices, stressTest, goalProjection, decisions, data.step0]);

  return (
    <div className="max-w-3xl mx-auto">
      {/* IFMP Score Card */}
      <div className={`rounded-2xl border p-8 md:p-12 text-center mb-8 ${getIfmpBg(ifmp)}`}>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">
          Индекс финансового мышления PRO
        </p>
        <div className={`text-7xl md:text-8xl font-bold ${getIfmpColor(ifmp)} mb-3`}>
          {ifmp.toFixed(1)}
        </div>
        <p className="text-lg font-medium text-slate-900 mb-2">{level}</p>
        <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto mb-4">
          {LEVEL_DESCRIPTIONS[level]}
        </p>
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

      {/* Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 mb-8">
        <h3 className="text-base font-semibold text-slate-900 mb-3">Краткий вывод</h3>
        <p className="text-sm text-slate-700 leading-relaxed mb-4">{interpretation.summary}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex gap-2 bg-emerald-50 rounded-lg p-3">
            <Icon name="TrendingUp" size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-emerald-800 mb-0.5">Сильная сторона</p>
              <p className="text-xs text-emerald-700 leading-relaxed">
                {interpretation.strongest.name}: {interpretation.strongest.desc}
              </p>
            </div>
          </div>
          <div className="flex gap-2 bg-red-50 rounded-lg p-3">
            <Icon name="TrendingDown" size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-red-800 mb-0.5">Зона роста</p>
              <p className="text-xs text-red-700 leading-relaxed">
                {interpretation.weakest.name}: {interpretation.weakest.desc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Index Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <IndexCard
          label="Денежный поток"
          code="CF"
          value={`${fmt(Math.round(indices.cf))} \u20BD`}
          color={indices.cf >= 0 ? "text-emerald-600" : "text-red-600"}
          description={interpretation.cfDesc}
        />
        <IndexCard
          label="Долговая нагрузка"
          code="KDN"
          value={`${(indices.kdn * 100).toFixed(1)}%`}
          color={kdnColor}
          sub={indices.kdn < 0.3 ? "норма" : indices.kdn < 0.5 ? "повышена" : "опасно"}
          description={interpretation.kdnDesc}
        />
        <IndexCard
          label="Фин. подушка"
          code="KFP"
          value={`${indices.kfp.toFixed(1)} мес`}
          color="text-slate-900"
          description={interpretation.kfpDesc}
        />
        <IndexCard
          label="Диверсификация"
          code="KDI"
          value={`${(indices.kdi * 100).toFixed(0)}%`}
          color="text-slate-900"
          description={interpretation.kdiDesc}
        />
        <IndexCard
          label="Дисциплина"
          code="IFD"
          value={`${(indices.ifd * 100).toFixed(0)}%`}
          color={indices.ifd >= 0.7 ? "text-emerald-600" : indices.ifd >= 0.4 ? "text-amber-600" : "text-red-600"}
          description={interpretation.ifdDesc}
        />
        <IndexCard
          label="Стресс-устойчивость"
          code="ISU"
          value={indices.isu.toFixed(2)}
          color={isuColor}
          sub={isuLabel}
          description={interpretation.isuDesc}
        />
      </div>

      <FinancialResultsCharts
        data={data}
        indices={indices}
        stressTest={stressTest}
        stressDesc={interpretation.stressDesc}
      />

      <FinancialResultsGoals
        data={data}
        indices={indices}
        goalProjection={goalProjection}
        goalDesc={interpretation.goalDesc}
      />

      <FinancialResultsDecisions
        decisions={decisions}
        decisionDescs={interpretation.decisionDescs}
      />

      {/* Actions */}
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
  description,
}: {
  label: string;
  code: string;
  value: string;
  color: string;
  sub?: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
      <p className="text-[11px] text-slate-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{code}</p>
      {sub && <p className="text-[10px] text-slate-500 mt-1">{sub}</p>}
      {description && (
        <p className="text-sm text-slate-600 leading-relaxed mt-2 text-left">{description}</p>
      )}
    </div>
  );
}