import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  PROFILE_DESCRIPTIONS,
  SEGMENT_NAMES,
  ENERGY_TEXT,
  BURNOUT_TEXT,
  FORMAT_TEXT,
} from "@/components/psych-bot/psychBotData";

type User = { name: string; email: string };
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

const tools = [
  { icon: "Brain", title: "Психологический анализ", desc: "Профориентация и предотвращение выгорания", color: "bg-indigo-50 text-indigo-600", link: "/psych-bot", badge: "299 ₽" },
  { icon: "Banknote", title: "Подбор дохода", desc: "Найди подходящий вариант дополнительного заработка", color: "bg-green-50 text-green-600", link: "/income-bot" },
  { icon: "BookOpen", title: "Дневник самоанализа", desc: "Фиксируй мысли и наблюдай динамику", color: "bg-violet-50 text-violet-600", link: "/diary" },
  { icon: "Map", title: "Шаги развития", desc: "Персональный план на 3 месяца", color: "bg-emerald-50 text-emerald-600", link: "/plan-bot" },
  { icon: "BarChart3", title: "Прогресс развития", desc: "Сравнение с предыдущими результатами", color: "bg-blue-50 text-blue-600", link: "/progress" },
];

function printPsychResult(psychResult: PsychResult, date: string, score: number) {
  const profList = psychResult.professions
    .map((p) => `<li>${p.name} — ${p.match}% совпадение</li>`)
    .join("");

  const segList = psychResult.topSegs
    .map((s) => `<li>${s.name} — ${s.pct}%</li>`)
    .join("");

  const motivList = psychResult.topMotivations
    .map((m) => `${m.name} (${m.pct}%)`)
    .join(", ");

  const description = PROFILE_DESCRIPTIONS[psychResult.primMotiv]?.[psychResult.topSeg] ?? "";
  const energy = ENERGY_TEXT[psychResult.topSeg] ?? "";
  const burnout = BURNOUT_TEXT[psychResult.topSeg] ?? "";
  const format = FORMAT_TEXT[psychResult.topSeg] ?? "";

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head>
    <meta charset="utf-8"/>
    <title>Психологический профиль — ПоДелам</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; color: #1a1a1a; line-height: 1.6; padding: 0 24px; }
      .header { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; border-radius: 16px; padding: 32px; margin-bottom: 32px; }
      .header h1 { font-size: 28px; font-weight: 900; margin: 0 0 8px; }
      .header p { margin: 0; opacity: 0.8; font-size: 15px; }
      .badges { display: flex; gap: 16px; margin-top: 20px; flex-wrap: wrap; }
      .badge { background: rgba(255,255,255,0.15); border-radius: 12px; padding: 10px 16px; text-align: center; }
      .badge .num { font-size: 22px; font-weight: 900; }
      .badge .lbl { font-size: 11px; opacity: 0.7; }
      h2 { font-size: 16px; color: #7c3aed; margin: 28px 0 8px; border-bottom: 2px solid #ede9fe; padding-bottom: 6px; }
      p { font-size: 14px; margin: 6px 0; }
      ul { margin: 6px 0; padding-left: 20px; }
      li { font-size: 14px; margin: 4px 0; }
      .highlight { background: #f5f3ff; border-left: 4px solid #7c3aed; padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 14px; }
      .footer { color: #9ca3af; font-size: 11px; margin-top: 40px; text-align: center; }
      @media print { body { margin: 20px; } }
    </style>
  </head><body>
    <div class="header">
      <div style="font-size:12px;opacity:0.7;margin-bottom:8px">Психологический тест · ${date}</div>
      <h1>${psychResult.profileName}</h1>
      <p>${SEGMENT_NAMES[psychResult.topSeg]}</p>
      <div class="badges">
        <div class="badge"><div class="num">${score}%</div><div class="lbl">совпадение</div></div>
        <div class="badge"><div class="num">${psychResult.professions.length}</div><div class="lbl">профессии</div></div>
        <div class="badge"><div class="num">${psychResult.topSegs.length}</div><div class="lbl">направления</div></div>
      </div>
    </div>

    ${description ? `<h2>Психологический портрет</h2><div class="highlight">${description}</div>` : ""}

    <h2>Ведущие направления</h2>
    <ul>${segList}</ul>

    <h2>Мотивация</h2>
    <p>${motivList}</p>

    ${psychResult.selectedProf ? `<h2>Выбранная профессия</h2><p><strong>${psychResult.selectedProf}</strong></p>` : ""}

    <h2>Подходящие профессии</h2>
    <ul>${profList}</ul>

    ${energy ? `<h2>Что даёт тебе энергию</h2><p>${energy}</p>` : ""}
    ${burnout ? `<h2>Где ты будешь выгорать</h2><p>${burnout}</p>` : ""}
    ${format ? `<h2>Подходящий формат работы</h2><p>${format}</p>` : ""}

    <div class="footer">Сформировано на ПоДелам · ${new Date().toLocaleDateString("ru-RU")}</div>
  </body></html>`);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); }, 400);
}

export default function Cabinet() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [psychResult, setPsychResult] = useState<PsychResult | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "tests" | "tools">("home");

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) { navigate("/auth"); return; }
    const userData: User = JSON.parse(u);
    setUser(userData);
    const t = localStorage.getItem("pdd_tests");
    if (t) setTests(JSON.parse(t));
    const pr = localStorage.getItem(`psych_result_${userData.email}`);
    if (pr) setPsychResult(JSON.parse(pr));
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("pdd_user");
    navigate("/");
  };

  if (!user) return null;

  const psychTest = tests.find((t) => t.type === "Психологический тест");
  const profileComplete = psychTest ? 85 : 15;

  return (
    <div className="min-h-screen font-golos" style={{ background: "hsl(248, 50%, 98%)" }}>
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-border px-4 py-6 shrink-0">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 mb-8 px-2">
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center">
              <Icon name="Compass" size={16} className="text-white" />
            </div>
            <span className="font-bold text-[17px] text-foreground">ПоДелам</span>
          </button>

          <nav className="flex-1 space-y-1">
            {[
              { id: "home", icon: "LayoutDashboard", label: "Главная" },
              { id: "tests", icon: "ClipboardList", label: "Тесты" },
              { id: "tools", icon: "Wrench", label: "Инструменты" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as typeof activeTab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? "gradient-brand text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon name={item.icon as "LayoutDashboard"} size={17} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="border-t border-border pt-4 mt-4">
            <div className="flex items-center gap-3 px-2 mb-3">
              <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-sm">
                {user.name[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-foreground truncate">{user.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-xl hover:bg-secondary transition-colors"
            >
              <Icon name="LogOut" size={15} />
              Выйти
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 overflow-auto">
          {/* MOBILE NAV */}
          <div className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-border px-4 h-14 flex items-center justify-between">
            <button onClick={() => navigate("/")} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
                <Icon name="Compass" size={13} className="text-white" />
              </div>
              <span className="font-bold text-foreground">ПоДелам</span>
            </button>
            <div className="flex items-center gap-1">
              {[
                { id: "home", icon: "LayoutDashboard" },
                { id: "tests", icon: "ClipboardList" },
                { id: "tools", icon: "Wrench" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as typeof activeTab)}
                  className={`p-2 rounded-lg transition-colors ${activeTab === item.id ? "text-primary" : "text-muted-foreground"}`}
                >
                  <Icon name={item.icon as "LayoutDashboard"} size={20} />
                </button>
              ))}
              <button onClick={logout} className="p-2 rounded-lg text-muted-foreground ml-1">
                <Icon name="LogOut" size={18} />
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8 max-w-4xl">

            {/* HOME TAB */}
            {activeTab === "home" && (
              <div className="animate-fade-in-up space-y-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-foreground">Привет, {user.name} 👋</h1>
                  <p className="text-muted-foreground mt-1">
                    {psychTest ? "Твой психологический профиль готов" : "Начни с психологического теста"}
                  </p>
                </div>

                {/* PROFILE COMPLETE */}
                <div className="bg-white rounded-3xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-foreground">Профиль заполнен</h3>
                      <p className="text-muted-foreground text-sm mt-0.5">
                        {profileComplete < 50 ? "Пройдите тест, чтобы получить рекомендации" : "Психологический профиль построен"}
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
                          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">Психологический тест</span>
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
                            onClick={() => navigate(`/results/${psychTest.id}`)}
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
                        <h3 className="font-bold text-foreground mb-2">Твой психологический портрет</h3>
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

                    {/* ПОВТОР ТЕСТА */}
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={() => navigate("/psych-bot")}
                        className="flex items-center gap-2 bg-white border border-border text-muted-foreground font-medium px-4 py-2.5 rounded-xl hover:bg-secondary transition-colors text-sm"
                      >
                        <Icon name="RotateCcw" size={15} />
                        Пройти заново
                      </button>
                      <button
                        onClick={() => navigate("/plan-bot")}
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
                      onClick={() => navigate("/psych-bot")}
                      className="gradient-brand text-white font-bold px-8 py-3 rounded-2xl hover:opacity-90 transition-opacity"
                    >
                      Пройти тест · 299 ₽
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TESTS TAB */}
            {activeTab === "tests" && (
              <div className="animate-fade-in-up space-y-6">
                <h1 className="text-2xl font-black text-foreground">Тесты</h1>

                <div className="bg-white rounded-3xl border border-border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 gradient-brand rounded-2xl flex items-center justify-center">
                      <Icon name="Brain" size={20} className="text-white" />
                    </div>
                    {psychTest && (
                      <span className="bg-green-50 text-green-600 text-xs font-bold px-3 py-1 rounded-full border border-green-200">Пройден</span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2">Психологический тест</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                    Анализирует мотивацию, ценности и стиль мышления. Даёт понимание твоих сильных сторон и профессий которые подойдут
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5">
                    <span className="flex items-center gap-1"><Icon name="Clock" size={12} />20 мин</span>
                    <span className="flex items-center gap-1"><Icon name="HelpCircle" size={12} />15 вопросов</span>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <span className="font-black text-xl text-foreground">299 ₽</span>
                    <div className="flex gap-2">
                      {psychTest && psychResult && (
                        <button
                          onClick={() => printPsychResult(psychResult, psychTest.date, psychTest.score)}
                          className="flex items-center gap-1.5 border border-border text-muted-foreground font-semibold px-3 py-2 rounded-xl hover:bg-secondary transition-colors text-sm"
                        >
                          <Icon name="Download" size={14} />
                          PDF
                        </button>
                      )}
                      {psychTest ? (
                        <button
                          onClick={() => navigate(`/results/${psychTest.id}`)}
                          className="border border-primary text-primary font-semibold px-4 py-2 rounded-xl hover:bg-accent transition-colors text-sm"
                        >
                          Смотреть результат
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate("/psych-bot")}
                          className="gradient-brand text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
                        >
                          Начать тест
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TOOLS TAB */}
            {activeTab === "tools" && (
              <div className="animate-fade-in-up space-y-6">
                <h1 className="text-2xl font-black text-foreground">Инструменты</h1>
                <div className="grid sm:grid-cols-2 gap-4">
                  {tools.map((tool) => (
                    <div
                      key={tool.title}
                      onClick={() => tool.link && navigate(tool.link)}
                      className={`bg-white rounded-3xl border p-6 card-hover cursor-pointer transition-all ${tool.link ? "border-primary/30 hover:border-primary/60 hover:shadow-md" : "border-border"}`}
                    >
                      <div className={`w-11 h-11 rounded-2xl ${tool.color} flex items-center justify-center mb-4`}>
                        <Icon name={tool.icon as "BookOpen"} size={20} />
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-foreground">{tool.title}</h3>
                            {"badge" in tool && tool.badge && (
                              <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full shrink-0">{tool.badge}</span>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm">{tool.desc}</p>
                        </div>
                        {tool.link && <Icon name="ArrowRight" size={16} className="text-primary shrink-0 mt-1" />}
                      </div>
                    </div>
                  ))}
                </div>

                {!psychTest && (
                  <div className="bg-secondary/50 rounded-3xl p-6 text-center">
                    <Icon name="Lock" size={24} className="text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Инструменты станут доступны после прохождения теста</p>
                    <button
                      onClick={() => setActiveTab("tests")}
                      className="mt-4 text-primary font-semibold text-sm hover:underline"
                    >
                      Перейти к тестам →
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
