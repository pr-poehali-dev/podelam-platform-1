import React, { useState } from "react";
import Icon from "@/components/ui/icon";
import { SEGMENT_NAMES } from "@/components/psych-bot/psychBotData";
import { User, TestResult, PsychResult, printPsychResult } from "./cabinetTypes";
import { CareerResult, hasSubscription, getToolCompletions } from "@/lib/access";
import { CAREER_TYPES } from "@/lib/careerTestEngine";

type Props = {
  user: User;
  psychTest: TestResult | undefined;
  psychResult: PsychResult | null;
  careerResult: CareerResult | null;
  profileComplete: number;
  onNavigate: (path: string) => void;
  onTabChange?: (tab: string) => void;
};

function AccordionSection({ icon, title, defaultOpen = false, children }: { icon: string; title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-3xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-5 text-left"
      >
        <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shrink-0">
          <Icon name={icon} size={16} className="text-white" />
        </div>
        <h3 className="font-bold text-foreground flex-1">{title}</h3>
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={18} className="text-muted-foreground shrink-0" />
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

export default function CabinetHomeTab({ user, psychTest, psychResult, careerResult, profileComplete, onNavigate, onTabChange }: Props) {
  const [careerExpanded, setCareerExpanded] = useState(false);
  const hasSub = hasSubscription();
  const completions = getToolCompletions();
  const barrierResults = localStorage.getItem(`barrier_results_${user.email}`);
  const hasBarrier = getToolCompletions("barrier-bot").length > 0 || (!!barrierResults && JSON.parse(barrierResults).length > 0);
  const hasPsychDone = !!psychResult;

  return (
    <div className="animate-fade-in-up space-y-5">
      {/* Приветствие */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-foreground">Привет, {user.name} 👋</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {careerResult
            ? hasPsychDone
              ? "Твой психологический профиль готов — изучай инструменты"
              : "Тест пройден. Рекомендуем психологический анализ"
            : "Начни с теста — узнай, какая профессия тебе подходит"}
        </p>
      </div>

      {/* Прогресс профиля */}
      <div className="bg-white rounded-3xl border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-foreground text-sm">Профиль заполнен</h3>
            <p className="text-muted-foreground text-xs mt-0.5">
              {profileComplete === 0 ? "Пройди тест — это первый шаг" : profileComplete < 65 ? "Продолжай — проходи инструменты" : profileComplete < 100 ? "Профиль почти готов" : "Все инструменты пройдены!"}
            </p>
          </div>
          <div className="text-2xl font-black text-gradient">{profileComplete}%</div>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className="h-full gradient-brand rounded-full transition-all duration-1000" style={{ width: `${profileComplete}%` }} />
        </div>
        {/* Шаги */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${careerResult ? "bg-green-50 text-green-600" : "bg-secondary text-muted-foreground"}`}>
            <Icon name={careerResult ? "CheckCircle2" : "Circle"} size={11} />
            Тест профессий
          </span>
          <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${hasPsychDone ? "bg-green-50 text-green-600" : "bg-secondary text-muted-foreground"}`}>
            <Icon name={hasPsychDone ? "CheckCircle2" : "Circle"} size={11} />
            Психоанализ
          </span>
          <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${hasBarrier ? "bg-green-50 text-green-600" : "bg-secondary text-muted-foreground"}`}>
            <Icon name={hasBarrier ? "CheckCircle2" : "Circle"} size={11} />
            Барьеры
          </span>
        </div>
      </div>

      {/* ШАГ 1: Тест профессий — отправная точка */}
      {!careerResult ? (
        <div className="bg-white rounded-3xl border-2 border-primary/30 p-6 relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">Шаг 1</div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 gradient-brand rounded-2xl flex items-center justify-center">
              <Icon name="Compass" size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Какая профессия тебе подходит?</h3>
              <p className="text-xs text-muted-foreground">10 вопросов · бесплатно</p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
            Рациональный тест — что ты думаешь о своих склонностях. Отправная точка для дальнейшего анализа.
          </p>
          <button
            onClick={() => onNavigate("/career-test")}
            className="gradient-brand text-white font-bold px-5 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm w-full"
          >
            Пройти тест — бесплатно
          </button>
        </div>
      ) : (
        /* Результат теста профессий */
        <div className="bg-white rounded-3xl border border-border overflow-hidden">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{CAREER_TYPES[careerResult.topType as keyof typeof CAREER_TYPES]?.emoji}</span>
                <div>
                  <div className="text-xs text-muted-foreground">Тест профессий · {careerResult.date}</div>
                  <h3 className="font-bold text-foreground">{careerResult.topTypeName} тип</h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-green-50 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">Пройден</span>
                <button
                  onClick={() => onNavigate("/career-test")}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Icon name="RefreshCw" size={12} />
                  Заново
                </button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{careerResult.topTypeDesc}</p>

            <button
              onClick={() => setCareerExpanded(!careerExpanded)}
              className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
            >
              {careerExpanded ? "Скрыть" : "Профессии и склонности"}
              <Icon name={careerExpanded ? "ChevronUp" : "ChevronDown"} size={13} />
            </button>

            {careerExpanded && (
              <div className="mt-3 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {careerResult.professions.map((p) => (
                    <span key={p} className="bg-violet-50 text-violet-700 text-xs font-medium px-2.5 py-1 rounded-lg border border-violet-100">{p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Призыв к психоанализу */}
          {!hasPsychDone && (
            <div className="bg-amber-50 border-t border-amber-100 p-4">
              <div className="flex items-start gap-3">
                <Icon name="Lightbulb" size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-amber-700 font-medium leading-relaxed">
                    Это рациональный результат. Твои глубинные таланты откроет психологический анализ.
                  </p>
                  <button
                    onClick={() => onNavigate("/psych-bot")}
                    className="mt-2 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Пройти психологический анализ →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Результат психологического анализа */}
      {psychTest && psychResult && (
        <div className="gradient-brand rounded-3xl p-5 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 text-[120px] flex items-center justify-end pr-4 leading-none select-none">🧠</div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">Психологический анализ</span>
              <span className="text-white/60 text-xs">{psychTest.date}</span>
            </div>
            <h2 className="text-xl font-black mb-1">{psychResult.profileName}</h2>
            <p className="text-white/80 text-sm mb-4">{SEGMENT_NAMES[psychResult.topSeg]}</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onNavigate(`/results/${psychTest.id}`)}
                className="flex items-center gap-1.5 bg-white text-primary font-bold px-3 py-2 rounded-xl hover:bg-white/90 transition-colors text-xs"
              >
                <Icon name="Eye" size={14} />
                Подробно
              </button>
              <button
                onClick={() => printPsychResult(psychResult, psychTest.date, psychTest.score)}
                className="flex items-center gap-1.5 bg-white/20 text-white font-semibold px-3 py-2 rounded-xl hover:bg-white/30 transition-colors text-xs"
              >
                <Icon name="Download" size={14} />
                PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Блок: инструменты после тестов */}
      {careerResult && (
        <AccordionSection icon="Rocket" title="Следующие шаги" defaultOpen>
          <div className="space-y-3">

            {/* Психологический анализ */}
            <div
              onClick={() => onNavigate("/psych-bot")}
              className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${hasPsychDone ? "bg-green-50 border border-green-100" : "bg-indigo-50 border border-indigo-100 hover:border-indigo-300"}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${hasPsychDone ? "bg-green-100" : "bg-indigo-100"}`}>
                <Icon name={hasPsychDone ? "CheckCircle2" : "Brain"} size={18} className={hasPsychDone ? "text-green-600" : "text-indigo-600"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground">Психологический анализ</div>
                <div className="text-xs text-muted-foreground">Профориентация и предотвращение выгорания · 290 ₽</div>
              </div>
              {!hasPsychDone && <Icon name="ChevronRight" size={16} className="text-indigo-400 shrink-0" />}
            </div>

            {/* Барьеры и тревога */}
            <div
              onClick={() => onNavigate("/barrier-bot")}
              className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${hasBarrier ? "bg-green-50 border border-green-100" : "bg-rose-50 border border-rose-100 hover:border-rose-300"}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${hasBarrier ? "bg-green-100" : "bg-rose-100"}`}>
                <Icon name={hasBarrier ? "CheckCircle2" : "ShieldAlert"} size={18} className={hasBarrier ? "text-green-600" : "text-rose-600"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground">Барьеры и тревога</div>
                <div className="text-xs text-muted-foreground">Страхи, самозванец, прокрастинация · 290 ₽</div>
              </div>
              {!hasBarrier && <Icon name="ChevronRight" size={16} className="text-rose-400 shrink-0" />}
            </div>

            {/* Прогресс развития */}
            {(hasPsychDone || hasBarrier) && (
              <div
                onClick={() => onNavigate("/progress")}
                className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all bg-blue-50 border border-blue-100 hover:border-blue-300"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <Icon name="BarChart3" size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground">Прогресс развития</div>
                  <div className="text-xs text-muted-foreground">Психологический портрет и динамика</div>
                </div>
                <Icon name="ChevronRight" size={16} className="text-blue-400 shrink-0" />
              </div>
            )}
          </div>
        </AccordionSection>
      )}

      {/* Подписка — баннер если нет */}
      {!hasSub && careerResult && (
        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-3xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-bold text-foreground mb-1">Полный доступ — 990 ₽/мес</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">Все инструменты + Дневник самоанализа. Без ограничений 30 дней.</p>
            </div>
            <button
              onClick={() => onTabChange?.("tools")}
              className="shrink-0 gradient-brand text-white font-bold px-4 py-2 rounded-xl text-xs hover:opacity-90 transition-opacity"
            >
              990 ₽
            </button>
          </div>
        </div>
      )}

      {completions.length > 0 && (
        <AccordionSection icon="Activity" title="Недавняя активность">
          <div className="space-y-2">
            {completions.slice(0, 5).map((c, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                <span className="text-muted-foreground flex-1">{c.summary}</span>
                <span className="text-xs text-muted-foreground shrink-0">{c.date}</span>
              </div>
            ))}
          </div>
        </AccordionSection>
      )}
    </div>
  );
}