import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import InstallPWA from "@/components/InstallPWA";

const audience = [
  { emoji: "💼", title: "Ищут доп. доход", text: "Хотите монетизировать навыки или найти подработку, которая не будет в тягость" },
  { emoji: "😮‍💨", title: "Выгорели", text: "Устали от текущей работы и не знаете, куда двигаться дальше" },
  { emoji: "🔀", title: "Меняют сферу", text: "Готовы к переходу, но боитесь ошибиться и потерять время" },
];

const faqs = [
  { q: "Как работают тесты?", a: "Тесты основаны на психологических методиках (Голланд, MBTI-адаптации, анализ ценностей). Вы отвечаете на вопросы, система строит профиль и подбирает направления по алгоритму совместимости." },
  { q: "Сколько времени занимает прохождение?", a: "Один тест — 15–20 минут. Можно прерваться и продолжить позже — прогресс сохраняется." },
  { q: "Результаты точные?", a: "Точность зависит от честности ответов. Чем искреннее вы отвечаете, тем точнее рекомендации. Платформа не даёт универсальных ответов — она помогает увидеть ваши склонности." },
  { q: "Можно ли пройти тест повторно?", a: "Да, тест можно проходить в любое время. Жизненные обстоятельства меняются — и ответы тоже. Каждое новое прохождение сохраняется в личном кабинете, так видна динамика изменений." },
  { q: "Нужно ли платить?", a: "Базовый тест на склонности — бесплатный. Остальные инструменты подключаются по желанию: можно остаться на бесплатном уровне или расширить возможности, когда почувствуете готовность идти глубже." },
];

const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border border-border rounded-2xl overflow-hidden transition-all duration-300 ${open ? "bg-white shadow-sm" : "bg-white/60"}`}
    >
      <button
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-foreground text-[15px] leading-snug">{q}</span>
        <span className={`shrink-0 transition-transform duration-300 ${open ? "rotate-45" : ""}`}>
          <Icon name="Plus" size={20} className="text-primary" />
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 text-muted-foreground text-[14px] leading-relaxed animate-fade-in">
          {a}
        </div>
      )}
    </div>
  );
};

interface IndexBottomProps {
  scrollTo: (id: string) => void;
}

export default function IndexBottom({ scrollTo }: IndexBottomProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* TOOLS */}
      <section id="tools" className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Инструменты</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">6 инструментов для поиска себя</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Каждый помогает найти своё дело или работу — от внутренних мотивов до конкретного плана действий</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: "Brain", color: "bg-indigo-50", iconColor: "text-indigo-600", border: "border-indigo-100", name: "Психологический анализ", desc: "Глубокий разбор твоей личности: тип мышления, мотивация, риски выгорания. Помогает понять, в каких условиях тебе комфортно работать" },
              { icon: "ShieldAlert", color: "bg-rose-50", iconColor: "text-rose-600", border: "border-rose-100", name: "Барьеры и тревога", desc: "Выявляет страхи, синдром самозванца и прокрастинацию. Показывает, что именно мешает двигаться вперёд и как с этим работать" },
              { icon: "Banknote", color: "bg-green-50", iconColor: "text-green-600", border: "border-green-100", name: "Подбор дохода", desc: "Анализирует навыки и предпочтения, подбирает подходящие варианты заработка — от фриланса до своего дела" },
              { icon: "Map", color: "bg-emerald-50", iconColor: "text-emerald-600", border: "border-emerald-100", name: "Шаги развития", desc: "Составляет персональный план на 3 месяца с конкретными шагами — от первых действий до результата" },
              { icon: "BarChart3", color: "bg-blue-50", iconColor: "text-blue-600", border: "border-blue-100", name: "Прогресс развития", desc: "Отслеживает динамику твоего состояния: энергия, мотивация, удовлетворённость. Видна реальная картина изменений" },
              { icon: "BookOpen", color: "bg-violet-50", iconColor: "text-violet-600", border: "border-violet-100", name: "Дневник самоанализа", desc: "Пространство для рефлексии и фиксации мыслей. Алгоритм помогает находить паттерны и делать выводы" },
            ].map((tool) => (
              <div key={tool.name} className={`rounded-3xl p-6 border ${tool.border} ${tool.color} card-hover`}>
                <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm`}>
                  <Icon name={tool.icon} size={22} className={tool.iconColor} />
                </div>
                <h3 className="font-bold text-foreground text-[17px] mb-2">{tool.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{tool.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-16">
            <div className="text-center mb-8">
              <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">Этапы</p>
              <h3 className="text-2xl font-black text-foreground">Этапы работы с инструментами</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
              {[
                { icon: "MessageCircle", label: "Отвечаешь", text: "на точные вопросы о себе — честно и без правильных ответов" },
                { icon: "Lightbulb", label: "Осознаёшь", text: "свои ценности, барьеры и то, что действительно важно" },
                { icon: "Target", label: "Находишь", text: "направление и конкретные шаги с минимумом ошибок" },
                { icon: "TrendingUp", label: "Действуешь", text: "по плану и отслеживаешь реальные изменения" },
              ].map((s, i) => (
                <div key={s.label} className="flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-border">
                  <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center mb-3 shrink-0">
                    <Icon name={s.icon} size={18} className="text-white" />
                  </div>
                  <span className="text-xs text-muted-foreground mb-1">Шаг {i + 1}</span>
                  <p className="font-bold text-foreground text-sm mb-1">{s.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => scrollTo("demo")}
              className="gradient-brand text-white font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-opacity text-[15px]"
            >
              Попробовать бесплатно
            </button>
          </div>
        </div>
      </section>

      {/* AUDIENCE */}
      <section className="py-12 md:py-20 bg-white/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Кому подойдёт</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {audience.map((a) => (
              <div key={a.title} className="flex gap-4 bg-white rounded-3xl p-6 border border-border card-hover">
                <div className="text-3xl shrink-0">{a.emoji}</div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{a.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{a.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Доверие</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Почему нам доверяют</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { icon: "BookOpen", title: "Научная методология", text: "Тесты основаны на валидированных методиках: теория типов Голланда, анализ мотивационных профилей и модели ценностей Шварца" },
              { icon: "BarChart3", title: "Адаптивный алгоритм", text: "Система учитывает историю ответов и адаптирует рекомендации на основе паттернов — чем больше данных, тем точнее результат" },
              { icon: "Lock", title: "Гарантия конфиденциальности", text: "Ваши ответы видите только вы. Мы не передаём данные третьим лицам и не анализируем содержание — всё хранится в вашем личном кабинете" },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-3xl p-7 border border-border card-hover text-center">
                <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4">
                  <Icon name={item.icon as "BookOpen"} size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-12 md:py-20 bg-white/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Частые вопросы</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="gradient-brand rounded-3xl p-8 sm:p-10 md:p-14 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-white blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-white blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 leading-snug">
                Найди своё дело уже сегодня
              </h2>
              <p className="text-white/80 max-w-lg mx-auto mb-8 text-[15px] leading-relaxed">
                Бесплатный тест покажет твои склонности за 15 минут. Без регистрации — просто ответь на вопросы.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => scrollTo("demo")}
                  className="bg-white text-primary font-bold px-8 py-4 rounded-2xl hover:bg-white/90 transition-colors text-[15px]"
                >
                  Попробовать бесплатно
                </button>
                <button
                  onClick={() => navigate("/auth")}
                  className="border border-white/40 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/10 transition-colors text-[15px]"
                >
                  Личный кабинет
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-8 md:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
                <Icon name="Compass" size={14} className="text-white" />
              </div>
              <span className="font-bold text-foreground">ПоДелам</span>
            </div>
            <div className="text-center text-sm text-muted-foreground space-y-0.5">
              <p>© 2025 ПоДелам. Найди своё дело.</p>
              <p>ИП Уварова А. С. · ОГРНИП 322508100398078 · Права защищены</p>
            </div>
            <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              <InstallPWA />
              <a href="/pricing" className="hover:text-foreground transition-colors">Тарифы</a>
              <a href="/privacy" className="hover:text-foreground transition-colors">Политика конфиденциальности</a>
              <a href="/oferta" className="hover:text-foreground transition-colors">Оферта</a>
              <a href="https://t.me/AnnaUvaro" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <Icon name="Send" size={14} />
                Контакты
              </a>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-border/50 max-w-3xl mx-auto text-[11px] leading-relaxed text-muted-foreground/60 text-center">
            <p>
              Проект «ПоДелам» не оказывает медицинских услуг и не является медицинской психотерапией. Материалы и результаты тестов носят
              информационно-рекомендательный характер и не заменяют консультацию специалиста. Проект не гарантирует достижение конкретных результатов.
              Сайт предназначен для лиц старше 18 лет. Используя сайт, вы соглашаетесь
              с <a href="/privacy" className="underline hover:text-muted-foreground transition-colors">Политикой конфиденциальности</a> и <a href="/oferta" className="underline hover:text-muted-foreground transition-colors">Офертой</a>.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}