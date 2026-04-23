import Icon from "@/components/ui/icon";
import { SEGMENT_NAMES } from "@/components/psych-bot/psychBotData";
import { TestResult, PsychResult, IDENTITY_PHRASES, CONSEQUENCES } from "./resultsTypes";

interface ResultsHeroProps {
  result: TestResult;
  psychResult: PsychResult | null;
  profileName: string;
  topSeg: string;
  topMotivations: { key: string; name: string; pct: number }[];
  professions: { name: string; match: number }[];
  topSegs: { key: string; name: string; pct: number }[];
}

export default function ResultsHero({
  result,
  profileName,
  topSeg,
  topMotivations,
  professions,
  topSegs,
}: ResultsHeroProps) {
  const identityPhrases = IDENTITY_PHRASES[topSeg] ?? IDENTITY_PHRASES["analytics"];
  const consequences = CONSEQUENCES[topSeg] ?? CONSEQUENCES["analytics"];

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          ШАГ 1 — ЭМОЦИОНАЛЬНОЕ ПОПАДАНИЕ (всегда виден)
      ═══════════════════════════════════════════════════════════ */}
      <div className="gradient-brand rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-4 top-4 text-6xl opacity-10 select-none">🧠</div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{result.type}</span>
            <span className="text-white/60 text-xs">{result.date}</span>
          </div>
          <h1 className="text-2xl font-black mb-1">{profileName}</h1>
          <p className="text-white/75 text-sm mb-4">{SEGMENT_NAMES[topSeg]}{topMotivations[0] ? ` · ${topMotivations[0].name}` : ""}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-white/15 rounded-2xl px-4 py-2.5">
              <div className="text-xl font-black">{result.score}%</div>
              <div className="text-xs text-white/70">совпадение</div>
            </div>
            <div className="bg-white/15 rounded-2xl px-4 py-2.5">
              <div className="text-xl font-black">{professions.length || topSegs.length || 4}</div>
              <div className="text-xs text-white/70">направления</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Кто ты на самом деле ─── */}
      <div className="bg-white rounded-2xl p-5 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
            <Icon name="User" size={16} className="text-violet-600" />
          </div>
          <h2 className="font-bold text-foreground">Вот кто ты на самом деле</h2>
        </div>
        <div className="space-y-3">
          {identityPhrases.map((phrase, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                <Icon name="Check" size={11} className="text-violet-600" />
              </div>
              <p className="text-foreground text-sm leading-relaxed">{phrase}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          ШАГ 2 — УСИЛЕНИЕ БОЛИ
      ═══════════════════════════════════════════════════════════ */}
      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
            <Icon name="AlertTriangle" size={16} className="text-amber-600" />
          </div>
          <h2 className="font-bold text-amber-900">Что это значит в твоей жизни</h2>
        </div>
        <div className="space-y-3">
          {consequences.map((c, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                <Icon name="ArrowRight" size={11} className="text-amber-700" />
              </div>
              <p className="text-amber-800 text-sm leading-relaxed">{c}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
