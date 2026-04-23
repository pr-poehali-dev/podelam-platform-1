import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { SEGMENT_TRAINERS, trackEvent } from "./resultsTypes";

interface ResultsUnlockedProps {
  topSeg: string;
  description: string;
  energyText: string;
  burnoutText: string;
  formatText: string;
  topSegs: { key: string; name: string; pct: number }[];
  professions: { name: string; match: number }[];
  selectedProf: string;
  steps: string[];
}

export default function ResultsUnlocked({
  topSeg,
  description,
  energyText,
  burnoutText,
  formatText,
  topSegs,
  professions,
  selectedProf,
  steps,
}: ResultsUnlockedProps) {
  const navigate = useNavigate();
  const trainers = SEGMENT_TRAINERS[topSeg] ?? SEGMENT_TRAINERS["analytics"];

  return (
    <>
      {/* Баннер успеха */}
      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
          <Icon name="CheckCircle" size={20} className="text-emerald-600" />
        </div>
        <div>
          <p className="font-bold text-emerald-800 text-sm">Полный разбор открыт</p>
          <p className="text-emerald-600 text-xs">Теперь ты видишь полную картину</p>
        </div>
      </div>

      {/* ─── Психологический портрет ─── */}
      {description && (
        <div className="bg-white rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
              <Icon name="Brain" size={16} className="text-violet-600" />
            </div>
            <h2 className="font-bold text-foreground">Твой психологический портрет</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
      )}

      {/* ─── Состояние по секциям ─── */}
      <div className="grid grid-cols-2 gap-3">
        {energyText && (
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Icon name="Zap" size={14} className="text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Энергия</span>
            </div>
            <p className="text-emerald-800 text-xs leading-relaxed line-clamp-4">{energyText}</p>
          </div>
        )}
        {burnoutText && (
          <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Icon name="AlertTriangle" size={14} className="text-rose-600" />
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wide">Выгорание</span>
            </div>
            <p className="text-rose-800 text-xs leading-relaxed line-clamp-4">{burnoutText}</p>
          </div>
        )}
        {formatText && (
          <div className="col-span-2 bg-sky-50 rounded-2xl p-4 border border-sky-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Icon name="Briefcase" size={14} className="text-sky-600" />
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wide">Формат работы</span>
            </div>
            <p className="text-sky-800 text-xs leading-relaxed">{formatText}</p>
          </div>
        )}
      </div>

      {/* ─── Ведущие направления ─── */}
      {topSegs.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-border">
          <h2 className="font-bold text-foreground mb-3">Ведущие направления</h2>
          <div className="space-y-3">
            {topSegs.map((seg) => (
              <div key={seg.key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground font-medium">{seg.name}</span>
                  <span className="text-primary font-bold">{seg.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full gradient-brand rounded-full transition-all duration-500" style={{ width: `${seg.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Профессии ─── */}
      {professions.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-border">
          <h2 className="font-bold text-foreground mb-3">Твои направления</h2>
          <div className="space-y-2">
            {professions.slice(0, 6).map((p, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shrink-0">
                  <span className="text-white font-black text-xs">{p.match}%</span>
                </div>
                <p className="font-medium text-foreground text-sm">{p.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedProf && (
        <div className="bg-violet-50 rounded-2xl p-5 border border-violet-100">
          <p className="text-xs font-bold text-violet-500 uppercase tracking-wide mb-1">Выбранная профессия</p>
          <p className="text-violet-800 text-lg font-black">{selectedProf}</p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          МОСТ К ИНСТРУМЕНТАМ — персональные тренажёры
      ═══════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl p-5 border border-border">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Icon name="Dumbbell" size={16} className="text-indigo-600" />
          </div>
          <h2 className="font-bold text-foreground">Твои инструменты под тебя</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4 ml-10">Подобраны под твой профиль — не общий список</p>

        <div className="space-y-3">
          {trainers.map((t) => (
            <div key={t.id} className="border border-border rounded-2xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shrink-0">
                  <Icon name={t.icon as "Compass"} size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm">{t.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{t.why}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon name="TrendingUp" size={13} className="text-emerald-500" />
                  <span className="text-xs text-emerald-700 font-medium">{t.effect}</span>
                </div>
                <button
                  onClick={() => {
                    trackEvent("results_trainer_click", { trainer: t.id });
                    navigate(`/trainers`);
                  }}
                  className="text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors px-3 py-1.5 bg-violet-50 rounded-xl hover:bg-violet-100 shrink-0 ml-3"
                >
                  Попробовать →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Как использовать систему ─── */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center">
            <Icon name="Map" size={16} className="text-slate-600" />
          </div>
          <h2 className="font-bold text-foreground">Как использовать систему</h2>
        </div>
        <div className="space-y-3">
          {[
            { step: "1", text: "Определи слабую зону из своего профиля выше" },
            { step: "2", text: "Запусти подходящий тренажёр — первая сессия займёт 7–10 минут" },
            { step: "3", text: "Повторяй через 2–3 дня — система отслеживает динамику" },
            { step: "4", text: "Отследи изменения через 2 недели — ты почувствуешь разницу" },
          ].map((item) => (
            <div key={item.step} className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-lg gradient-brand flex items-center justify-center shrink-0 text-white font-black text-xs">
                {item.step}
              </div>
              <p className="text-sm text-foreground leading-relaxed pt-0.5">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Триггер действия ─── */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-5 text-white">
        <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">Важно</p>
        <h3 className="font-black text-lg mb-2">Твоё состояние актуально прямо сейчас</h3>
        <p className="text-white/80 text-sm leading-relaxed mb-4">
          Изменения возможны уже после первых сессий. Лучше начать сегодня — завтра это легко отложить ещё на месяц.
        </p>
        <button
          onClick={() => {
            trackEvent("results_go_trainers");
            navigate("/trainers");
          }}
          className="w-full bg-white text-violet-700 font-black py-3.5 rounded-2xl text-sm hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
        >
          <Icon name="Dumbbell" size={17} />
          Хочу улучшить своё состояние
        </button>
      </div>

      {/* ─── План развития ─── */}
      <div className="bg-white rounded-2xl p-5 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
            <Icon name="Target" size={16} className="text-amber-600" />
          </div>
          <h2 className="font-bold text-foreground">Первые шаги к результату</h2>
        </div>
        <div className="space-y-2.5">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-xl gradient-brand flex items-center justify-center shrink-0 text-white font-black text-xs">
                {i + 1}
              </div>
              <p className="text-foreground text-sm leading-relaxed pt-0.5">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
