import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const TOOLS = [
  { icon: "Brain", color: "text-indigo-600", bg: "bg-indigo-50", name: "Психологический анализ" },
  { icon: "ShieldAlert", color: "text-rose-600", bg: "bg-rose-50", name: "Барьеры и тревога" },
  { icon: "Banknote", color: "text-green-600", bg: "bg-green-50", name: "Подбор дохода" },
  { icon: "Map", color: "text-emerald-600", bg: "bg-emerald-50", name: "Шаги развития" },
  { icon: "BarChart3", color: "text-blue-600", bg: "bg-blue-50", name: "Прогресс развития" },
];

const faqs = [
  {
    q: "Что входит в разовую оплату?",
    a: "Вы покупаете один конкретный инструмент и получаете полный доступ к нему навсегда. Результаты сохраняются в личном кабинете.",
  },
  {
    q: "Чем подписка лучше?",
    a: "Подписка открывает все 5 инструментов + Дневник самоанализа. Это выгоднее, если вы планируете работать с несколькими направлениями.",
  },
  {
    q: "Можно ли начать бесплатно?",
    a: "Да. Тест профессий полностью бесплатный — он покажет ваш профессиональный тип и подходящие направления. Остальные инструменты подключаются по желанию.",
  },
  {
    q: "Как работает пополнение баланса?",
    a: "Вы пополняете баланс в личном кабинете на любую сумму. Средства списываются при покупке инструмента или подписки.",
  },
  {
    q: "Можно ли отменить подписку?",
    a: "Подписка не продлевается автоматически. Через 30 дней доступ к Дневнику закрывается, но все результаты сохраняются.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border border-border rounded-2xl overflow-hidden transition-all ${open ? "bg-white shadow-sm" : "bg-white/60"}`}>
      <button className="w-full flex items-center justify-between px-5 py-4 text-left gap-3" onClick={() => setOpen(!open)}>
        <span className="font-semibold text-foreground text-sm leading-snug">{q}</span>
        <span className={`shrink-0 transition-transform duration-300 ${open ? "rotate-45" : ""}`}>
          <Icon name="Plus" size={18} className="text-primary" />
        </span>
      </button>
      {open && (
        <div className="px-5 pb-4 text-muted-foreground text-sm leading-relaxed animate-fade-in">
          {a}
        </div>
      )}
    </div>
  );
}

export default function Pricing() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("pdd_user");

  return (
    <div className="min-h-screen font-golos" style={{ background: "hsl(248, 50%, 98%)" }}>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="ArrowLeft" size={18} />
            <span className="text-sm font-medium">Назад</span>
          </button>
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <Icon name="Compass" size={13} className="text-white" />
            </div>
            <span className="font-bold text-foreground text-sm">ПоДелам</span>
          </button>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 bg-white border border-border rounded-full px-4 py-2 mb-5 text-sm text-primary font-medium shadow-sm">
            <Icon name="Sparkles" size={14} />
            Простые и понятные тарифы
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-tight mb-4">
            Инвестиция в <span className="text-gradient">понимание себя</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            Начните бесплатно, а дальше — выбирайте то, что нужно именно вам
          </p>
        </div>

        {/* Бесплатный тест */}
        <div className="bg-white rounded-3xl border-2 border-green-200 p-6 sm:p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-green-50 text-green-600 text-xs font-bold px-3 py-1 rounded-full border border-green-100">
            Бесплатно
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
              <Icon name="Compass" size={24} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground">Тест профессий</h2>
              <p className="text-sm text-muted-foreground">10 вопросов · 5 минут</p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed mb-5">
            Определите свой профессиональный тип, узнайте подходящие направления и получите первичный профиль склонностей. Без регистрации карты — просто пройдите тест.
          </p>
          <div className="flex flex-wrap gap-2 mb-5">
            {["Профессиональный тип", "Подходящие профессии", "Анализ склонностей", "Сохранение в кабинете"].map((f) => (
              <span key={f} className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                <Icon name="Check" size={12} />
                {f}
              </span>
            ))}
          </div>
          <button
            onClick={() => navigate(isLoggedIn ? "/career-test" : "/auth")}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Пройти бесплатно
          </button>
        </div>

        {/* Тарифы */}
        <div className="grid md:grid-cols-2 gap-5 mb-12 md:mb-16">
          {/* Разовая оплата */}
          <div className="bg-white rounded-3xl border border-border p-6 sm:p-8 flex flex-col">
            <div className="mb-5">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-black text-foreground">290</span>
                <span className="text-lg font-bold text-muted-foreground">₽</span>
              </div>
              <p className="text-sm text-muted-foreground">за один инструмент</p>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Разовая оплата</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Выберите один конкретный инструмент и получите полный доступ. Подходит, если хотите начать с чего-то одного.
            </p>
            <div className="space-y-3 mb-6 flex-1">
              {TOOLS.map((tool) => (
                <div key={tool.name} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl ${tool.bg} flex items-center justify-center shrink-0`}>
                    <Icon name={tool.icon} size={15} className={tool.color} />
                  </div>
                  <span className="text-sm text-foreground">{tool.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground font-medium">290 ₽</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate(isLoggedIn ? "/cabinet?tab=tools" : "/auth")}
              className="w-full bg-white border-2 border-primary text-primary font-bold px-6 py-3.5 rounded-xl hover:bg-primary/5 transition-colors text-sm"
            >
              Выбрать инструмент
            </button>
          </div>

          {/* Подписка */}
          <div className="gradient-brand rounded-3xl p-6 sm:p-8 text-white flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>
            <div className="relative flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-black">990</span>
                    <span className="text-lg font-bold text-white/70">₽</span>
                  </div>
                  <p className="text-sm text-white/70">в месяц</p>
                </div>
                <div className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  Выгодно
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2">Полный доступ</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-5">
                Все 5 инструментов + Дневник самоанализа на 30 дней. Экономия до 750 ₽ по сравнению с разовой покупкой.
              </p>
              <div className="space-y-2.5 mb-6 flex-1">
                {[
                  ...TOOLS.map((t) => t.name),
                  "Дневник самоанализа",
                ].map((name) => (
                  <div key={name} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <Icon name="Check" size={12} className="text-white" />
                    </div>
                    <span className="text-sm">{name}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2.5 pt-1">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Icon name="Infinity" size={12} className="text-white" />
                  </div>
                  <span className="text-sm">Без ограничений 30 дней</span>
                </div>
              </div>
              <button
                onClick={() => navigate(isLoggedIn ? "/cabinet?tab=tools" : "/auth")}
                className="w-full bg-white text-primary font-bold px-6 py-3.5 rounded-xl hover:bg-white/90 transition-colors text-sm"
              >
                Оформить подписку
              </button>
            </div>
          </div>
        </div>

        {/* Сравнение */}
        <div className="bg-white rounded-3xl border border-border p-5 sm:p-8 mb-12 md:mb-16">
          <h2 className="text-xl font-black text-foreground text-center mb-6">Сравнение тарифов</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 pr-4 font-semibold text-muted-foreground">Возможность</th>
                  <th className="text-center py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">Бесплатно</th>
                  <th className="text-center py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">290 ₽</th>
                  <th className="text-center py-3 px-3 font-semibold text-primary whitespace-nowrap">990 ₽/мес</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Тест профессий", free: true, single: true, sub: true },
                  { feature: "Личный кабинет", free: true, single: true, sub: true },
                  { feature: "Психологический анализ", free: false, single: true, sub: true },
                  { feature: "Барьеры и тревога", free: false, single: true, sub: true },
                  { feature: "Подбор дохода", free: false, single: true, sub: true },
                  { feature: "Шаги развития", free: false, single: true, sub: true },
                  { feature: "Прогресс развития", free: false, single: true, sub: true },
                  { feature: "Дневник самоанализа", free: false, single: false, sub: true },
                  { feature: "Все инструменты сразу", free: false, single: false, sub: true },
                ].map((row) => (
                  <tr key={row.feature} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-4 text-foreground">{row.feature}</td>
                    <td className="text-center py-3 px-3">
                      {row.free
                        ? <Icon name="Check" size={16} className="text-green-500 mx-auto" />
                        : <Icon name="Minus" size={16} className="text-border mx-auto" />
                      }
                    </td>
                    <td className="text-center py-3 px-3">
                      {row.single
                        ? <Icon name="Check" size={16} className="text-green-500 mx-auto" />
                        : <Icon name="Minus" size={16} className="text-border mx-auto" />
                      }
                    </td>
                    <td className="text-center py-3 px-3">
                      {row.sub
                        ? <Icon name="Check" size={16} className="text-primary mx-auto" />
                        : <Icon name="Minus" size={16} className="text-border mx-auto" />
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-xl font-black text-foreground text-center mb-6">Частые вопросы</h2>
          <div className="space-y-3 max-w-2xl mx-auto">
            {faqs.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="gradient-brand rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            </div>
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-black mb-3">Начните с бесплатного теста</h2>
              <p className="text-white/80 mb-6 max-w-md mx-auto">
                5 минут — и вы узнаете свой профессиональный тип. Дальше решите сами.
              </p>
              <button
                onClick={() => navigate(isLoggedIn ? "/career-test" : "/auth")}
                className="bg-white text-primary font-bold px-8 py-4 rounded-2xl hover:bg-white/90 transition-colors text-[15px]"
              >
                Пройти тест бесплатно
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© 2025 ПоДелам · ИП Уварова А. С. · ОГРНИП 322508100398078</p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="/privacy" className="hover:text-foreground transition-colors">Политика конфиденциальности</a>
            <a href="/oferta" className="hover:text-foreground transition-colors">Оферта</a>
            <a href="/partner" className="hover:text-foreground transition-colors">Партнёрская программа</a>
          </div>
        </div>
      </footer>
    </div>
  );
}