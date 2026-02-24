import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

export type IncomeSession = {
  date: string;
  resultKey: string;
  resultText: string;
  planTitle: string;
  planSteps: string[];
  answers: Record<string, string>;
};

const RESULT_META: Record<string, { label: string; icon: string; color: string; bgColor: string; direction: string }> = {
  body: { label: "Телесные практики", icon: "Dumbbell", color: "text-rose-600", bgColor: "bg-rose-50", direction: "body" },
  sales: { label: "Продажи и коммуникации", icon: "TrendingUp", color: "text-orange-600", bgColor: "bg-orange-50", direction: "sales" },
  online: { label: "Онлайн-работа", icon: "Globe", color: "text-blue-600", bgColor: "bg-blue-50", direction: "online" },
  creative: { label: "Творчество", icon: "Palette", color: "text-purple-600", bgColor: "bg-purple-50", direction: "creative" },
  soft: { label: "Мягкий старт", icon: "Users", color: "text-emerald-600", bgColor: "bg-emerald-50", direction: "soft" },
};

type Props = {
  sessions: IncomeSession[];
  onNewSession: () => void;
};

export default function IncomeBotHistory({ sessions, onNewSession }: Props) {
  const navigate = useNavigate();

  const goToPlan = (session: IncomeSession) => {
    const email = JSON.parse(localStorage.getItem("pdd_user") || "{}").email;
    if (email) {
      localStorage.setItem(`income_context_${email}`, JSON.stringify({
        direction: session.resultKey,
        resultLabel: RESULT_META[session.resultKey]?.label || session.resultKey,
        incomeTarget: session.answers?.income_target || "",
        timePerWeek: session.answers?.time_per_week || "",
      }));
    }
    navigate("/plan-bot");
  };

  if (sessions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
          <Icon name="Banknote" size={24} className="text-green-600" />
        </div>
        <p className="font-bold text-foreground mb-1">Пока нет результатов</p>
        <p className="text-sm text-muted-foreground mb-4">Пройдите подбор дохода, чтобы увидеть историю</p>
        <button onClick={onNewSession} className="gradient-brand text-white font-bold px-6 py-2.5 rounded-xl text-sm">
          Начать подбор
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto px-4 py-5 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-bold text-foreground text-sm">Результаты ({sessions.length})</p>
        <button
          onClick={onNewSession}
          className="flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
        >
          <Icon name="Plus" size={16} />
          Новый подбор
        </button>
      </div>

      {[...sessions].reverse().map((s, revIdx) => {
        const idx = sessions.length - 1 - revIdx;
        const meta = RESULT_META[s.resultKey] || { label: s.resultKey, icon: "HelpCircle", color: "text-gray-600", bgColor: "bg-gray-50", direction: "soft" };

        return (
          <div key={idx} className="bg-white rounded-2xl border border-border p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl ${meta.bgColor} flex items-center justify-center shrink-0`}>
                <Icon name={meta.icon as "Dumbbell"} size={18} className={meta.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm text-foreground">{meta.label}</p>
                  <span className="text-[10px] text-muted-foreground">{s.date}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{s.resultText.slice(0, 120)}...</p>
              </div>
            </div>

            {s.planTitle && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="font-semibold text-xs text-foreground mb-1.5">{s.planTitle}</p>
                <ul className="space-y-1">
                  {s.planSteps.slice(0, 3).map((step, i) => (
                    <li key={i} className="text-[11px] text-muted-foreground leading-relaxed flex gap-1.5">
                      <span className="text-green-500 mt-0.5 shrink-0">
                        <Icon name="CheckCircle" size={10} />
                      </span>
                      <span className="line-clamp-1">{step}</span>
                    </li>
                  ))}
                  {s.planSteps.length > 3 && (
                    <li className="text-[11px] text-muted-foreground">...и ещё {s.planSteps.length - 3} шагов</li>
                  )}
                </ul>
              </div>
            )}

            <button
              onClick={() => goToPlan(s)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 transition-colors"
            >
              <Icon name="Map" size={15} />
              Построить шаги развития
            </button>
          </div>
        );
      })}
    </div>
  );
}
