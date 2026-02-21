import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";

type TestResult = { id: string; type: string; date: string; score: number };

const profilesMap: Record<string, {
  title: string;
  subtitle: string;
  emoji: string;
  description: string;
  strengths: string[];
  risks: string[];
  directions: { emoji: string; title: string; match: number; desc: string }[];
  format: { icon: string; title: string; label: string }[];
  steps: string[];
}> = {
  "Тест на склонности": {
    title: "Творческий стратег",
    subtitle: "Аналитически-гуманитарный тип",
    emoji: "🎨",
    description: "Ты сочетаешь развитое творческое мышление с системным подходом к задачам. Тебе важно видеть смысл в том, что делаешь, и иметь пространство для самовыражения. Рутинные задачи без творческой составляющей быстро выматывают тебя.",
    strengths: ["Нестандартное мышление и генерация идей", "Эмпатия и понимание людей", "Способность видеть общую картину", "Высокая адаптивность к изменениям"],
    risks: ["Склонность к перфекционизму", "Трудности с рутиной и повторяющимися задачами", "Риск рассеивания на множество проектов"],
    directions: [
      { emoji: "🎨", title: "Дизайн и UX", match: 91, desc: "Визуальные коммуникации, продуктовый дизайн" },
      { emoji: "📣", title: "Маркетинг и контент", match: 84, desc: "Бренд, социальные сети, сторителлинг" },
      { emoji: "🗣", title: "Обучение и коучинг", match: 78, desc: "Менторство, онлайн-курсы, тренинги" },
      { emoji: "✍️", title: "Копирайтинг", match: 73, desc: "Тексты для брендов, нарративы, сценарии" },
    ],
    format: [
      { icon: "Laptop", title: "Онлайн", label: "Основной формат" },
      { icon: "Users", title: "Малые команды", label: "Оптимально" },
      { icon: "Clock", title: "Гибкий график", label: "Важно для вас" },
    ],
    steps: [
      "Сформулируй 3 направления, которые тебя давно привлекают",
      "Пройди 1-2 бесплатных онлайн-урока по каждому из них",
      "Найди первый пет-проект или волонтёрскую задачу для практики",
      "Собери портфолио из 3-5 работ — даже учебных",
      "Поговори с 2-3 людьми, которые уже работают в этих сферах",
    ],
  },
  "Психологический тест": {
    title: "Мотивированный аналитик",
    subtitle: "Рационально-ценностный тип",
    emoji: "🧠",
    description: "Ты принимаешь решения взвешенно, опираясь на факты и личные ценности. Тебе важна автономия и ощущение, что твоя работа имеет реальное значение. Ты устойчив к давлению, но устаёшь от деятельности, лишённой смысла.",
    strengths: ["Критическое и системное мышление", "Высокая ответственность и надёжность", "Устойчивость к стрессу", "Умение видеть риски заранее"],
    risks: ["Тенденция к избыточному анализу", "Сложность в делегировании", "Риск выгорания при отсутствии смысла"],
    directions: [
      { emoji: "📊", title: "Аналитика и данные", match: 88, desc: "Бизнес-анализ, продуктовые метрики" },
      { emoji: "💼", title: "Консалтинг", match: 82, desc: "Стратегическое консультирование" },
      { emoji: "🧪", title: "Исследования", match: 75, desc: "UX-ресёрч, маркетинговые исследования" },
      { emoji: "📚", title: "Образование", match: 70, desc: "Методология, разработка курсов" },
    ],
    format: [
      { icon: "Home", title: "Удалённо", label: "Основной формат" },
      { icon: "Target", title: "Проектная работа", label: "Оптимально" },
      { icon: "BookOpen", title: "Непрерывное обучение", label: "Ваш ресурс" },
    ],
    steps: [
      "Определи 2-3 сферы, где ты уже имеешь экспертизу",
      "Найди конкретную проблему, которую ты можешь решить для других",
      "Протестируй гипотезу: предложи помощь 5 людям бесплатно",
      "Сформулируй своё уникальное предложение в 1-2 предложениях",
      "Выйди на первый платный клиент или проект",
    ],
  },
};

const defaultProfile = profilesMap["Тест на склонности"];

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<TestResult | null>(null);
  const [profile, setProfile] = useState(defaultProfile);
  const [activeSection, setActiveSection] = useState<"profile" | "directions" | "steps">("profile");

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) { navigate("/auth"); return; }
    const tests: TestResult[] = JSON.parse(localStorage.getItem("pdd_tests") || "[]");
    const found = tests.find((t) => t.id === id);
    if (found) {
      setResult(found);
      setProfile(profilesMap[found.type] || defaultProfile);
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

  return (
    <div className="min-h-screen font-golos" style={{ background: "hsl(248, 50%, 98%)" }}>
      {/* HEADER */}
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
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="Download" size={16} />
            PDF
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* HERO RESULT */}
        <div className="gradient-brand rounded-3xl p-8 md:p-10 text-white mb-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 text-[200px] flex items-center justify-end pr-8 leading-none select-none">
            {profile.emoji}
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{result.type}</span>
              <span className="text-white/60 text-xs">{result.date}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-2">{profile.title}</h1>
            <p className="text-white/80 text-lg mb-6">{profile.subtitle}</p>
            <div className="flex items-center gap-4">
              <div className="bg-white/15 rounded-2xl px-5 py-3">
                <div className="text-2xl font-black">{result.score}%</div>
                <div className="text-xs text-white/70">совпадение профиля</div>
              </div>
              <div className="bg-white/15 rounded-2xl px-5 py-3">
                <div className="text-2xl font-black">{profile.directions.length}</div>
                <div className="text-xs text-white/70">направления</div>
              </div>
              <div className="bg-white/15 rounded-2xl px-5 py-3">
                <div className="text-2xl font-black">{profile.steps.length}</div>
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
          <div className="space-y-5 animate-fade-in-up">
            <div className="bg-white rounded-3xl border border-border p-6 md:p-7">
              <h2 className="font-black text-xl text-foreground mb-4">Психологический портрет</h2>
              <p className="text-muted-foreground leading-relaxed">{profile.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-white rounded-3xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center">
                    <Icon name="TrendingUp" size={16} className="text-green-600" />
                  </div>
                  <h3 className="font-bold text-foreground">Сильные стороны</h3>
                </div>
                <ul className="space-y-2.5">
                  {profile.strengths.map((s) => (
                    <li key={s} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Icon name="Check" size={15} className="text-green-500 mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-3xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Icon name="AlertTriangle" size={16} className="text-amber-500" />
                  </div>
                  <h3 className="font-bold text-foreground">Зоны внимания</h3>
                </div>
                <ul className="space-y-2.5">
                  {profile.risks.map((r) => (
                    <li key={r} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Icon name="Minus" size={15} className="text-amber-400 mt-0.5 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-border p-6">
              <h3 className="font-bold text-foreground mb-4">Предпочтительный формат работы</h3>
              <div className="grid grid-cols-3 gap-4">
                {profile.format.map((f) => (
                  <div key={f.title} className="text-center p-4 rounded-2xl bg-secondary/50">
                    <div className="w-10 h-10 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Icon name={f.icon as "Laptop"} size={18} className="text-white" />
                    </div>
                    <div className="font-semibold text-sm text-foreground">{f.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{f.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DIRECTIONS TAB */}
        {activeSection === "directions" && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="bg-white rounded-3xl border border-border p-6 mb-2">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Направления подобраны на основе твоего психологического профиля. Чем выше процент — тем лучше совпадение по ценностям, типу задач и стилю работы.
              </p>
            </div>
            {profile.directions.map((d, i) => (
              <div key={d.title} className={`bg-white rounded-3xl border p-6 ${i === 0 ? "border-primary/30 shadow-sm" : "border-border"}`}>
                <div className="flex items-start gap-4">
                  <div className={`text-3xl shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${i === 0 ? "gradient-brand" : "bg-secondary"}`}>
                    {i === 0 ? <span className="text-2xl">{d.emoji}</span> : <span className="text-2xl">{d.emoji}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-foreground">{d.title}</h3>
                      <span className={`text-sm font-black ${i === 0 ? "text-primary" : "text-foreground"}`}>{d.match}%</span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">{d.desc}</p>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${d.match}%`,
                          background: i === 0
                            ? "linear-gradient(90deg, hsl(252,60%,48%), hsl(280,60%,52%))"
                            : "hsl(252,60%,75%)"
                        }}
                      />
                    </div>
                    {i === 0 && (
                      <div className="mt-2">
                        <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full">
                          ⭐ Лучшее совпадение
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEPS TAB */}
        {activeSection === "steps" && (
          <div className="space-y-5 animate-fade-in-up">
            <div className="bg-white rounded-3xl border border-border p-6">
              <h2 className="font-black text-xl text-foreground mb-2">Первые шаги</h2>
              <p className="text-muted-foreground text-sm">Персональный план на ближайшие 3 месяца</p>
            </div>
            <div className="space-y-3">
              {profile.steps.map((step, i) => (
                <div key={i} className="bg-white rounded-3xl border border-border p-5 flex items-start gap-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${
                    i === 0 ? "gradient-brand text-white" : "bg-secondary text-muted-foreground"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="pt-1.5">
                    <p className="text-foreground font-medium leading-relaxed">{step}</p>
                    <p className="text-xs text-muted-foreground mt-1">~{[1, 2, 2, 3, 4][i]} недели</p>
                  </div>
                </div>
              ))}
            </div>

            {/* BANNER */}
            <div className="gradient-brand rounded-3xl p-6 text-white">
              <div className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2">Ускори результат</div>
              <h3 className="font-black text-xl mb-2">Разбор твоих результатов с экспертом</h3>
              <p className="text-white/80 text-sm mb-4">30-минутная сессия, где разберём твои направления и составим конкретный план</p>
              <button className="bg-white text-primary font-bold px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors text-sm">
                Записаться на сессию
              </button>
            </div>
          </div>
        )}

        {/* NEXT ACTIONS */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/cabinet")}
            className="flex-1 gradient-brand text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition-opacity text-[15px]"
          >
            Перейти в кабинет
          </button>
          <button
            onClick={() => navigate("/test/психологический")}
            className="flex-1 bg-white border border-border text-foreground font-semibold py-3.5 rounded-2xl hover:bg-secondary transition-colors text-[15px]"
          >
            Пройти психологический тест
          </button>
        </div>
      </div>
    </div>
  );
}
