import Icon from "@/components/ui/icon";
import type { FinancialDecisionResult, FinancialDecisionType } from "@/lib/financialTrainerTypes";

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

interface DecisionsProps {
  decisions: FinancialDecisionResult[];
  decisionDescs: string[];
}

export default function FinancialResultsDecisions({ decisions, decisionDescs }: DecisionsProps) {
  if (decisions.length === 0) return null;

  return (
    <div className="mb-8">
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">
        Результаты решений
      </p>
      <div className="space-y-3">
        {decisions.map((d, i) => (
          <DecisionCard key={i} decision={d} interpretation={decisionDescs[i]} />
        ))}
      </div>
    </div>
  );
}

function DecisionCard({ decision, interpretation }: { decision: FinancialDecisionResult; interpretation?: string }) {
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
      {interpretation && (
        <div className={`flex gap-2 rounded-lg p-3 mt-3 ${decision.deltaCF >= 0 ? "bg-emerald-50" : "bg-amber-50"}`}>
          <Icon
            name={decision.deltaCF >= 0 ? "CheckCircle" : "Info"}
            size={14}
            className={`mt-0.5 flex-shrink-0 ${decision.deltaCF >= 0 ? "text-emerald-600" : "text-amber-500"}`}
          />
          <p className={`text-sm leading-relaxed ${decision.deltaCF >= 0 ? "text-emerald-700" : "text-amber-700"}`}>
            {interpretation}
          </p>
        </div>
      )}
    </div>
  );
}