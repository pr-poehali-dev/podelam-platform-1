import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  ENERGY_TEXT,
  BURNOUT_TEXT,
  FORMAT_TEXT,
  PROFILE_DESCRIPTIONS,
  SEGMENT_NAMES,
  PROFILE_MATRIX,
} from "@/components/psych-bot/psychBotData";

type TestResult = { id: string; type: string; date: string; score: number };

type PsychResult = {
  profileName: string;
  topSeg: string;
  primMotiv: string;
  selectedProf: string;
  topSegs: { key: string; name: string; pct: number }[];
  topMotivations: { key: string; name: string; pct: number }[];
  topSegScore: number;
  professions: { name: string; match: number }[];
};

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<TestResult | null>(null);
  const [psychResult, setPsychResult] = useState<PsychResult | null>(null);
  const [activeSection, setActiveSection] = useState<"profile" | "directions" | "steps">("profile");

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) { navigate("/auth"); return; }
    const userData = JSON.parse(u);

    const tests: TestResult[] = JSON.parse(localStorage.getItem("pdd_tests") || "[]");
    const found = tests.find((t) => t.id === id);
    if (found) {
      setResult(found);
      if (found.type === "Психологический тест") {
        const saved = localStorage.getItem(`psych_result_${userData.email}`);
        if (saved) setPsychResult(JSON.parse(saved));
      }
    }
  }, [id, navigate]);

  if (!result) return (
    <div className="min-h-screen gradient-soft flex items-center justify-center font-golos">
      <div className="text-center">
        <Icon name="Loader2" size={32} className="animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Загружаем результаты...</p>
      </div>
    </div>
  );

  const isPsychTest = result.type === "Психологический тест";

  // Данные — из реального результата бота или дефолт
  const topSeg = psychResult?.topSeg ?? "analytics";
  const primMotiv = psychResult?.primMotiv ?? "meaning";
  const profileName = psychResult?.profileName ?? PROFILE_MATRIX[primMotiv]?.[topSeg] ?? result.type;
  const selectedProf = psychResult?.selectedProf ?? "";
  const topSegs = psychResult?.topSegs ?? [];
  const topMotivations = psychResult?.topMotivations ?? [];
  const professions = psychResult?.professions ?? [];

  const description = isPsychTest ? (PROFILE_DESCRIPTIONS[primMotiv]?.[topSeg] ?? "") : "";
  const energyText = isPsychTest ? (ENERGY_TEXT[topSeg] ?? "") : "";
  const burnoutText = isPsychTest ? (BURNOUT_TEXT[topSeg] ?? "") : "";
  const formatText = isPsychTest ? (FORMAT_TEXT[topSeg] ?? "") : "";

  const steps = isPsychTest
    ? [
        selectedProf ? `Изучи, что делает «${selectedProf}» в реальных проектах — найди 2–3 кейса` : `Изучи 2–3 реальных кейса по направлению «${SEGMENT_NAMES[topSeg]}»`,
        "Найди одного человека в этой сфере и задай ему 3 вопроса про вход в профессию",
        "Пройди 1 бесплатный урок или мини-курс по выбранному направлению",
        "Сделай первый маленький проект — даже учебный — и покажи кому-нибудь",
        "Сформулируй своё предложение в 2 предложениях и предложи помощь 3 людям бесплатно",
      ]
    : [
        "Сформулируй 3 направления, которые тебя давно привлекают",
        "Пройди 1–2 бесплатных онлайн-урока по каждому из них",
        "Найди первый пет-проект или волонтёрскую задачу для практики",
        "Собери портфолио из 3–5 работ — даже учебных",
        "Поговори с 2–3 людьми, которые уже работают в этих сферах",
      ];

  return (
    <div className="min-h-screen font-golos" style={{ background: "hsl(248, 50%, 98%)" }}>
      <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/cabinet")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <Icon name="ChevronLeft" size={18} />
            Личный кабинет
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <Icon name="Compass" size={13} className="text-white" />
            </div>
            <span className="font-bold text-foreground text-sm">ПоДелам</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* HERO */}
        <div className="gradient-brand rounded-3xl p-8 md:p-10 text-white mb-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 text-[200px] flex items-center justify-end pr-8 leading-none select-none">
            🧠
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{result.type}</span>
              <span className="text-white/60 text-xs">{result.date}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-2">{profileName}</h1>
            {isPsychTest && <p className="text-white/80 text-lg mb-6">{SEGMENT_NAMES[topSeg]}{topMotivations[0] ? ` · ${topMotivations[0].name}` : ""}</p>}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="bg-white/15 rounded-2xl px-5 py-3">
                <div className="text-2xl font-black">{result.score}%</div>
                <div className="text-xs text-white/70">совпадение профиля</div>
              </div>
              <div className="bg-white/15 rounded-2xl px-5 py-3">
                <div className="text-2xl font-black">{professions.length || topSegs.length || 4}</div>
                <div className="text-xs text-white/70">направления</div>
              </div>
              <div className="bg-white/15 rounded-2xl px-5 py-3">
                <div className="text-2xl font-black">{steps.length}</div>
                <div className="text-xs text-white/70">шагов вперёд</div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex bg-white border border-border rounded-2xl p-1 mb-6">
          {([
            { id: "profile", label: "Профиль", icon: "User" },
            { id: "directions", label: "Направления", icon: "Compass" },
            { id: "steps", label: "План развития", icon: "Map" },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeSection === tab.id
                  ? "gradient-brand text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon name={tab.icon as "User"} size={15} />
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* PROFILE TAB */}
        {activeSection === "profile" && (
          <div className="space-y-4">

            {description && (
              <div className="bg-white rounded-2xl p-6 border border-border">
                <h3 className="font-bold text-foreground mb-2">Твой психологический портрет</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              </div>
            )}

            {topSegs.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-border">
                <h3 className="font-bold text-foreground mb-3">Ведущие направления</h3>
                <div className="space-y-3">
                  {topSegs.map((seg) => (
                    <div key={seg.key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground font-medium">{seg.name}</span>
                        <span className="text-primary font-bold">{seg.pct}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full gradient-brand rounded-full" style={{ width: `${seg.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {topMotivations.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-border">
                <h3 className="font-bold text-foreground mb-3">Мотивация</h3>
                <div className="flex flex-wrap gap-2">
                  {topMotivations.map((m) => (
                    <span key={m.key} className="bg-violet-50 text-violet-700 text-sm font-semibold px-3 py-1.5 rounded-xl border border-violet-100">
                      {m.name} — {m.pct}%
                    </span>
                  ))}
                </div>
              </div>
            )}

            {energyText && (
              <div className="bg-white rounded-2xl p-6 border border-border">
                <h3 className="font-bold text-foreground mb-2">Что тебя заряжает</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{energyText}</p>
              </div>
            )}

            {burnoutText && (
              <div className="bg-white rounded-2xl p-6 border border-border">
                <h3 className="font-bold text-foreground mb-2">Где ты будешь выгорать</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{burnoutText}</p>
              </div>
            )}

            {formatText && (
              <div className="bg-white rounded-2xl p-6 border border-border">
                <h3 className="font-bold text-foreground mb-2">Подходящий формат работы</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{formatText}</p>
              </div>
            )}

            {selectedProf && (
              <div className="bg-violet-50 rounded-2xl p-6 border border-violet-100">
                <h3 className="font-bold text-violet-800 mb-1">Выбранная профессия</h3>
                <p className="text-violet-700 text-lg font-semibold">{selectedProf}</p>
              </div>
            )}

            {!psychResult && isPsychTest && (
              <div className="bg-white rounded-2xl p-6 border border-border text-center space-y-4">
                <p className="text-muted-foreground text-sm">Для полного профиля с профессиями и развёрнутым анализом пройди обновлённый тест.</p>
                <button
                  onClick={() => navigate("/psych-bot")}
                  className="gradient-brand text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
                >
                  Пройти обновлённый тест
                </button>
              </div>
            )}

          </div>
        )}

        {/* DIRECTIONS TAB */}
        {activeSection === "directions" && (
          <div className="space-y-3">
            {professions.length > 0 ? (
              professions.map((p, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-border flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center shrink-0">
                    <span className="text-white font-black text-sm">{p.match}%</span>
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{p.name}</p>
                    <p className="text-muted-foreground text-sm">Совпадение с твоим профилем</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-border text-center space-y-4">
                <p className="text-muted-foreground text-sm">Пройди обновлённый тест — получишь персональный список профессий с оценкой совпадения.</p>
                <button
                  onClick={() => navigate("/psych-bot")}
                  className="gradient-brand text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
                >
                  Пройти тест
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEPS TAB */}
        {activeSection === "steps" && (
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-border flex gap-4">
                <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shrink-0 text-white font-black text-sm">
                  {i + 1}
                </div>
                <p className="text-foreground text-sm leading-relaxed pt-1">{step}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}