import Icon from "@/components/ui/icon";
import {
  PROFILE_DESCRIPTIONS,
  SEGMENT_NAMES,
  ENERGY_TEXT,
  BURNOUT_TEXT,
} from "@/components/psych-bot/psychBotData";
import { User, TestResult, PsychResult, printPsychResult } from "./cabinetTypes";

type Props = {
  user: User;
  psychTest: TestResult | undefined;
  psychResult: PsychResult | null;
  profileComplete: number;
  onNavigate: (path: string) => void;
};

export default function CabinetHomeTab({ user, psychTest, psychResult, profileComplete, onNavigate }: Props) {
  return (
    <div className="animate-fade-in-up space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-foreground">Привет, {user.name} 👋</h1>
        <p className="text-muted-foreground mt-1">
          {psychTest ? "Твой профиль призвания готов" : "Начни с теста на призвание"}
        </p>
      </div>

      {/* PROFILE COMPLETE */}
      <div className="bg-white rounded-3xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-foreground">Профиль заполнен</h3>
            <p className="text-muted-foreground text-sm mt-0.5">
              {profileComplete < 50 ? "Пройдите тест, чтобы получить рекомендации" : "Профиль призвания построен"}
            </p>
          </div>
          <div className="text-3xl font-black text-gradient">{profileComplete}%</div>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full gradient-brand rounded-full transition-all duration-1000" style={{ width: `${profileComplete}%` }} />
        </div>
      </div>

      {/* РЕЗУЛЬТАТ ТЕСТА — если пройден */}
      {psychTest && psychResult ? (
        <div className="space-y-4">
          {/* HERO КАРТОЧКА */}
          <div className="gradient-brand rounded-3xl p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 text-[160px] flex items-center justify-end pr-6 leading-none select-none">🧠</div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">Тест на призвание</span>
                <span className="text-white/60 text-xs">{psychTest.date}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-1">{psychResult.profileName}</h2>
              <p className="text-white/80 mb-5">{SEGMENT_NAMES[psychResult.topSeg]}</p>
              <div className="flex gap-3 flex-wrap mb-5">
                <div className="bg-white/15 rounded-2xl px-4 py-2.5">
                  <div className="text-xl font-black">{psychTest.score}%</div>
                  <div className="text-xs text-white/70">совпадение</div>
                </div>
                <div className="bg-white/15 rounded-2xl px-4 py-2.5">
                  <div className="text-xl font-black">{psychResult.professions.length}</div>
                  <div className="text-xs text-white/70">профессии</div>
                </div>
                <div className="bg-white/15 rounded-2xl px-4 py-2.5">
                  <div className="text-xl font-black">{psychResult.topSegs.length}</div>
                  <div className="text-xs text-white/70">направления</div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => onNavigate(`/results/${psychTest.id}`)}
                  className="flex items-center gap-2 bg-white text-primary font-bold px-4 py-2.5 rounded-xl hover:bg-white/90 transition-colors text-sm"
                >
                  <Icon name="Eye" size={15} />
                  Подробный результат
                </button>
                <button
                  onClick={() => printPsychResult(psychResult, psychTest.date, psychTest.score)}
                  className="flex items-center gap-2 bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-white/30 transition-colors text-sm"
                >
                  <Icon name="Download" size={15} />
                  Скачать PDF
                </button>
              </div>
            </div>
          </div>

          {/* ОПИСАНИЕ ПРОФИЛЯ */}
          {PROFILE_DESCRIPTIONS[psychResult.primMotiv]?.[psychResult.topSeg] && (
            <div className="bg-white rounded-3xl border border-border p-6">
              <h3 className="font-bold text-foreground mb-2">Твой портрет призвания</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {PROFILE_DESCRIPTIONS[psychResult.primMotiv][psychResult.topSeg]}
              </p>
            </div>
          )}

          {/* НАПРАВЛЕНИЯ */}
          <div className="bg-white rounded-3xl border border-border p-6">
            <h3 className="font-bold text-foreground mb-4">Ведущие направления</h3>
            <div className="space-y-3">
              {psychResult.topSegs.map((seg) => (
                <div key={seg.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-foreground">{seg.name}</span>
                    <span className="font-bold text-primary">{seg.pct}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full gradient-brand rounded-full" style={{ width: `${seg.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ПРОФЕССИИ */}
          {psychResult.professions.length > 0 && (
            <div className="bg-white rounded-3xl border border-border p-6">
              <h3 className="font-bold text-foreground mb-4">Подходящие профессии</h3>
              <div className="space-y-3">
                {psychResult.professions.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-secondary/40 rounded-2xl">
                    <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-white font-black text-xs">{p.match}%</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">{p.name}</div>
                      <div className="text-xs text-muted-foreground">Совпадение с профилем</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* МОТИВАЦИЯ */}
          {psychResult.topMotivations.length > 0 && (
            <div className="bg-white rounded-3xl border border-border p-6">
              <h3 className="font-bold text-foreground mb-3">Мотивация</h3>
              <div className="flex flex-wrap gap-2">
                {psychResult.topMotivations.map((m) => (
                  <span key={m.key} className="bg-violet-50 text-violet-700 text-sm font-semibold px-3 py-1.5 rounded-xl border border-violet-100">
                    {m.name} — {m.pct}%
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ЭНЕРГИЯ / ВЫГОРАНИЕ */}
          <div className="grid sm:grid-cols-2 gap-4">
            {ENERGY_TEXT[psychResult.topSeg] && (
              <div className="bg-white rounded-3xl border border-border p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Zap" size={16} className="text-amber-500" />
                  <h3 className="font-bold text-foreground text-sm">Что заряжает</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{ENERGY_TEXT[psychResult.topSeg]}</p>
              </div>
            )}
            {BURNOUT_TEXT[psychResult.topSeg] && (
              <div className="bg-white rounded-3xl border border-border p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="AlertTriangle" size={16} className="text-red-400" />
                  <h3 className="font-bold text-foreground text-sm">Где выгоришь</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{BURNOUT_TEXT[psychResult.topSeg]}</p>
              </div>
            )}
          </div>

          {/* ПОВТОР / ПЛАН */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => onNavigate("/psych-bot")}
              className="flex items-center gap-2 bg-white border border-border text-muted-foreground font-medium px-4 py-2.5 rounded-xl hover:bg-secondary transition-colors text-sm"
            >
              <Icon name="RotateCcw" size={15} />
              Пройти заново
            </button>
            <button
              onClick={() => onNavigate("/plan-bot")}
              className="flex items-center gap-2 gradient-brand text-white font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              <Icon name="Map" size={15} />
              Составить план развития
            </button>
          </div>
        </div>

      ) : (
        /* НЕТ ТЕСТА */
        <div className="bg-white rounded-3xl border border-border p-8 text-center">
          <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="Brain" size={28} className="text-white" />
          </div>
          <h3 className="font-bold text-foreground text-lg mb-2">Психологический тест</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
            15 вопросов — и ты узнаешь своё направление, мотивацию и подходящие профессии
          </p>
          <button
            onClick={() => onNavigate("/psych-bot")}
            className="gradient-brand text-white font-bold px-8 py-3 rounded-2xl hover:opacity-90 transition-opacity"
          >
            Пройти тест · 299 ₽
          </button>
        </div>
      )}
    </div>
  );
}