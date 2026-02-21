import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

type User = { name: string; email: string };
type TestResult = { id: string; type: string; date: string; score: number };

const tools = [
  { icon: "Banknote", title: "Подбор дохода", desc: "Найди подходящий вариант дополнительного заработка", color: "bg-green-50 text-green-600", link: "/income-bot" },
  { icon: "BookOpen", title: "Дневник самоанализа", desc: "Фиксируй мысли и наблюдай динамику", color: "bg-violet-50 text-violet-600", link: "/diary" },
  { icon: "BarChart3", title: "Прогресс развития", desc: "Сравнение с предыдущими результатами", color: "bg-blue-50 text-blue-600", link: "/progress" },
  { icon: "Map", title: "Шаги развития", desc: "Персональный план на 3 месяца", color: "bg-emerald-50 text-emerald-600" },
  { icon: "RefreshCw", title: "Повторный тест", desc: "Доступен через 90 дней после первого", color: "bg-amber-50 text-amber-600" },
];

const directions = [
  { emoji: "🎨", title: "Дизайн и творчество", match: 91 },
  { emoji: "📊", title: "Аналитика и данные", match: 78 },
  { emoji: "🗣", title: "Обучение и коучинг", match: 74 },
];

export default function Cabinet() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [activeTab, setActiveTab] = useState<"home" | "tests" | "tools">("home");

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) { navigate("/auth"); return; }
    setUser(JSON.parse(u));
    const t = localStorage.getItem("pdd_tests");
    if (t) setTests(JSON.parse(t));
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("pdd_user");
    navigate("/");
  };

  if (!user) return null;

  const profileComplete = tests.length > 0 ? Math.min(30 + tests.length * 35, 100) : 15;

  return (
    <div className="min-h-screen font-golos" style={{ background: "hsl(248, 50%, 98%)" }}>
      {/* SIDEBAR + CONTENT */}
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

        {/* MAIN CONTENT */}
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
                {/* GREETING */}
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-foreground">
                    Привет, {user.name} 👋
                  </h1>
                  <p className="text-muted-foreground mt-1">Продолжай путь к своему делу</p>
                </div>

                {/* PROFILE STATUS */}
                <div className="bg-white rounded-3xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-foreground">Профиль заполнен</h3>
                      <p className="text-muted-foreground text-sm mt-0.5">
                        {profileComplete < 50 ? "Пройдите тест, чтобы получить рекомендации" : "Отличный прогресс!"}
                      </p>
                    </div>
                    <div className="text-3xl font-black text-gradient">{profileComplete}%</div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-brand rounded-full transition-all duration-1000"
                      style={{ width: `${profileComplete}%` }}
                    />
                  </div>
                </div>

                {/* TESTS STATUS */}
                {tests.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-border p-6 text-center">
                    <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon name="ClipboardList" size={24} className="text-muted-foreground" />
                    </div>
                    <h3 className="font-bold text-foreground mb-1">Тесты ещё не пройдены</h3>
                    <p className="text-muted-foreground text-sm mb-5">Начните с теста на склонности — это займёт 15 минут</p>
                    <button
                      onClick={() => navigate("/test/склонности")}
                      className="gradient-brand text-white font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition-opacity text-sm"
                    >
                      Пройти тест на склонности
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-border p-6">
                    <h3 className="font-bold text-foreground mb-4">Пройденные тесты</h3>
                    <div className="space-y-3">
                      {tests.map((t) => (
                        <div key={t.id} className="flex items-center justify-between p-4 bg-secondary/40 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center">
                              <Icon name="CheckCircle" size={17} className="text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-foreground">{t.type}</div>
                              <div className="text-xs text-muted-foreground">{t.date}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(`/results/${t.id}`)}
                            className="text-primary text-sm font-semibold hover:underline"
                          >
                            Результаты →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* DIRECTIONS */}
                {tests.length > 0 && (
                  <div className="bg-white rounded-3xl border border-border p-6">
                    <h3 className="font-bold text-foreground mb-4">Рекомендованные направления</h3>
                    <div className="space-y-3">
                      {directions.map((d) => (
                        <div key={d.title} className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/40">
                          <span className="text-2xl">{d.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-foreground">{d.title}</div>
                            <div className="h-1.5 bg-border rounded-full mt-2 overflow-hidden">
                              <div className="h-full gradient-brand rounded-full" style={{ width: `${d.match}%` }} />
                            </div>
                          </div>
                          <div className="text-sm font-bold text-primary shrink-0">{d.match}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* BANNER */}
                <div className="gradient-brand rounded-3xl p-6 text-white relative overflow-hidden">
                  <div className="absolute right-4 top-4 opacity-20 text-6xl">🚀</div>
                  <div className="relative">
                    <div className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2">Вебинар · 28 февраля</div>
                    <h3 className="font-black text-xl mb-2">«Как найти дело жизни за 30 дней»</h3>
                    <p className="text-white/80 text-sm mb-4">Разбор реальных историй и практические упражнения</p>
                    <button className="bg-white text-primary font-bold px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors text-sm">
                      Записаться бесплатно
                    </button>
                  </div>
                </div>

                {/* QUICK TESTS */}
                {tests.length === 0 && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { title: "Тест на склонности", desc: "15–20 мин · 40 вопросов", price: "299 ₽", type: "склонности" },
                      { title: "Психологический тест", desc: "20 мин · 45 вопросов", price: "299 ₽", type: "психологический" },
                    ].map((t) => (
                      <div key={t.type} className="bg-white rounded-3xl border border-border p-5 card-hover">
                        <h3 className="font-bold text-foreground mb-1">{t.title}</h3>
                        <p className="text-muted-foreground text-xs mb-4">{t.desc}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-lg text-foreground">{t.price}</span>
                          <button
                            onClick={() => navigate(`/test/${t.type}`)}
                            className="gradient-brand text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
                          >
                            Начать
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TESTS TAB */}
            {activeTab === "tests" && (
              <div className="animate-fade-in-up space-y-6">
                <h1 className="text-2xl font-black text-foreground">Тесты</h1>
                <div className="grid sm:grid-cols-2 gap-5">
                  {[
                    { title: "Тест на склонности", desc: "Определяет твои природные таланты и подходящие сферы деятельности на основе 40 вопросов", time: "15–20 мин", questions: 40, price: "299 ₽", type: "склонности", icon: "Zap" },
                    { title: "Психологический тест", desc: "Анализирует мотивацию, ценности и стиль мышления. Даёт понимание твоих сильных сторон", time: "20 мин", questions: 45, price: "299 ₽", type: "психологический", icon: "Brain" },
                  ].map((t) => {
                    const done = tests.find((r) => r.type === t.title);
                    return (
                      <div key={t.type} className="bg-white rounded-3xl border border-border p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-11 h-11 gradient-brand rounded-2xl flex items-center justify-center">
                            <Icon name={t.icon as "Zap"} size={20} className="text-white" />
                          </div>
                          {done && (
                            <span className="bg-green-50 text-green-600 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                              Пройден
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-lg text-foreground mb-2">{t.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-5">{t.desc}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5">
                          <span className="flex items-center gap-1"><Icon name="Clock" size={12} />{t.time}</span>
                          <span className="flex items-center gap-1"><Icon name="HelpCircle" size={12} />{t.questions} вопросов</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xl text-foreground">{t.price}</span>
                          {done ? (
                            <button
                              onClick={() => navigate(`/results/${done.id}`)}
                              className="border border-primary text-primary font-semibold px-4 py-2.5 rounded-xl hover:bg-accent transition-colors text-sm"
                            >
                              Смотреть результат
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate(`/test/${t.type}`)}
                              className="gradient-brand text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
                            >
                              Начать тест
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-white rounded-3xl border-2 border-primary/20 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 gradient-brand text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl">
                    Выгодно −40%
                  </div>
                  <h3 className="font-black text-xl text-foreground mb-2">Полный тариф</h3>
                  <p className="text-muted-foreground text-sm mb-4">Оба теста + расширенные рекомендации с пошаговым планом развития на 3 месяца</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-black text-foreground">990 ₽</div>
                      <div className="text-xs text-muted-foreground line-through">598 ₽ × 2</div>
                    </div>
                    <button
                      onClick={() => navigate("/test/склонности")}
                      className="gradient-brand text-white font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition-opacity"
                    >
                      Выбрать тариф
                    </button>
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
                        <div>
                          <h3 className="font-bold text-foreground mb-1">{tool.title}</h3>
                          <p className="text-muted-foreground text-sm">{tool.desc}</p>
                        </div>
                        {tool.link && <Icon name="ArrowRight" size={16} className="text-primary shrink-0 mt-1" />}
                      </div>
                    </div>
                  ))}
                </div>

                {tests.length === 0 && (
                  <div className="bg-secondary/50 rounded-3xl p-6 text-center">
                    <Icon name="Lock" size={24} className="text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Инструменты станут доступны после прохождения первого теста</p>
                    <button
                      onClick={() => { setActiveTab("tests"); }}
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