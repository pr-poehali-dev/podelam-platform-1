import Icon from "@/components/ui/icon";
import { CareerResult, ToolCompletion } from "@/lib/access";
import { PsychResult } from "@/components/cabinet/cabinetTypes";

type Props = {
  completions: ToolCompletion[];
  careerResult: CareerResult | null;
  psychResult?: PsychResult | null;
  barrierSessions?: { context: string; profile: string }[];
};

export default function ProgressPortrait({ completions, careerResult, psychResult: psychResultProp, barrierSessions: barrierProp }: Props) {
  const u = localStorage.getItem("pdd_user");
  const email = u ? JSON.parse(u).email : "";

  const psychResult: PsychResult | null = psychResultProp ?? (() => {
    const raw = localStorage.getItem(`psych_result_${email}`);
    return raw ? JSON.parse(raw) : null;
  })();

  const barrierSessions = barrierProp ?? (() => {
    const raw = localStorage.getItem(`barrier_results_${email}`);
    return raw ? JSON.parse(raw) : [];
  })();

  const hasAny = completions.length > 0 || careerResult || psychResult;
  if (!hasAny) return null;

  const toolsDone = new Set(completions.map((c) => c.toolId));
  const totalTools = 5;
  const donePct = Math.round(((toolsDone.size + (careerResult ? 1 : 0)) / totalTools) * 100);

  return (
    <div className="px-4 pb-8 max-w-2xl mx-auto w-full space-y-4">
      <div className="flex items-center justify-between mt-4">
        <h3 className="font-bold text-foreground text-base flex items-center gap-2">
          <Icon name="Fingerprint" size={18} className="text-violet-600" />
          Психологический портрет
        </h3>
        <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
          Раскрыт на {donePct}%
        </span>
      </div>

      {(psychResult || careerResult) && (
        <div className="bg-gradient-to-br from-violet-50 via-white to-blue-50 border border-violet-100 rounded-3xl p-5 space-y-4">
          {psychResult && (
            <>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Icon name="Brain" size={20} className="text-white" />
                </div>
                <div>
                  <div className="font-black text-foreground text-base">{psychResult.profileName}</div>
                  <div className="text-xs text-muted-foreground">Тип личности по психоанализу</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Направления</div>
                <div className="space-y-2">
                  {psychResult.topSegs.map((seg, i) => {
                    const colors = ["bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500"];
                    return (
                      <div key={seg.key}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs text-foreground font-medium">{seg.name}</span>
                          <span className="text-xs font-bold text-muted-foreground">{seg.pct}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${colors[i % colors.length]} transition-all duration-700`}
                            style={{ width: `${Math.max(seg.pct, 4)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Мотивация</div>
                <div className="flex flex-wrap gap-2">
                  {psychResult.topMotivations.map((m, i) => {
                    const badges = [
                      "bg-violet-100 text-violet-700 border-violet-200",
                      "bg-blue-100 text-blue-700 border-blue-200",
                      "bg-emerald-100 text-emerald-700 border-emerald-200",
                    ];
                    return (
                      <span
                        key={m.key}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border ${badges[i % badges.length]}`}
                      >
                        {m.name} · {m.pct}%
                      </span>
                    );
                  })}
                </div>
              </div>

              {psychResult.professions.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Подходящие профессии</div>
                  <div className="grid grid-cols-2 gap-2">
                    {psychResult.professions.map((p) => (
                      <div key={p.name} className="bg-white rounded-xl border border-gray-100 px-3 py-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground truncate">{p.name}</span>
                        <span className={`text-xs font-bold ml-2 shrink-0 ${p.match >= 80 ? "text-green-600" : "text-amber-600"}`}>
                          {p.match}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {psychResult.selectedProf && (
                <div className="bg-violet-600 text-white rounded-2xl px-4 py-3 flex items-center gap-3">
                  <Icon name="Target" size={18} />
                  <div>
                    <div className="text-xs text-violet-200">Выбранное направление</div>
                    <div className="font-bold text-sm">{psychResult.selectedProf}</div>
                  </div>
                </div>
              )}
            </>
          )}

          {careerResult && (
            <div className={psychResult ? "border-t border-violet-100 pt-4" : ""}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Icon name="Compass" size={16} className="text-indigo-600" />
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground">{careerResult.topTypeName}</div>
                  <div className="text-xs text-muted-foreground">Тест профессий · {careerResult.date}</div>
                </div>
              </div>
              {careerResult.scores && careerResult.scores.length > 0 && (
                <div className="space-y-1.5">
                  {careerResult.scores.slice(0, 4).map((s) => (
                    <div key={s.type} className="flex items-center gap-2">
                      <span className="text-xs text-foreground w-28 truncate">{s.name}</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${(s.score / 60) * 100}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-6 text-right">{s.score}</span>
                    </div>
                  ))}
                </div>
              )}
              {careerResult.professions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {careerResult.professions.slice(0, 4).map((p) => (
                    <span key={p} className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-medium">{p}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {barrierSessions.length > 0 && (
        <div className="bg-white border border-rose-100 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
              <Icon name="ShieldAlert" size={16} className="text-rose-600" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">Барьеры и тревога</div>
              <div className="text-xs text-muted-foreground">
                {barrierSessions.length} {barrierSessions.length === 1 ? "сессия" : barrierSessions.length < 5 ? "сессии" : "сессий"} анализа
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {barrierSessions.slice(-3).map((s: { context: string; profile: string }, i: number) => (
              <span key={i} className="text-xs bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg">
                {s.context}
              </span>
            ))}
          </div>
        </div>
      )}

      {donePct < 100 && (
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="text-xs font-semibold text-muted-foreground mb-2">Для полного портрета осталось</div>
          <div className="flex flex-wrap gap-2">
            {!careerResult && (
              <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Icon name="Compass" size={11} />Тест профессий
              </span>
            )}
            {!toolsDone.has("psych-bot") && !psychResult && (
              <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Icon name="Brain" size={11} />Психоанализ
              </span>
            )}
            {!toolsDone.has("barrier-bot") && (
              <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Icon name="ShieldAlert" size={11} />Барьеры
              </span>
            )}
            {!toolsDone.has("income-bot") && (
              <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Icon name="Banknote" size={11} />Подбор дохода
              </span>
            )}
            {!toolsDone.has("plan-bot") && (
              <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Icon name="Map" size={11} />Шаги развития
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}