import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import InstallPWA from "@/components/InstallPWA";

const whatYouGet = [
  { icon: "Zap", color: "bg-amber-50", iconColor: "text-amber-600", border: "border-amber-100", name: "Твои сильные стороны", desc: "Что у тебя получается естественно и на что стоит опираться в работе и жизни." },
  { icon: "Anchor", color: "bg-indigo-50", iconColor: "text-indigo-600", border: "border-indigo-100", name: "Твоя внутренняя опора", desc: "На что тебе стоит опираться в сложных ситуациях — чтобы не терять себя." },
  { icon: "TrendingUp", color: "bg-green-50", iconColor: "text-green-600", border: "border-green-100", name: "Твой стиль роста", desc: "Как тебе проще развиваться и двигаться вперёд — без выгорания и лишнего напряжения." },
  { icon: "Banknote", color: "bg-emerald-50", iconColor: "text-emerald-600", border: "border-emerald-100", name: "Твоя модель дохода", desc: "Какой формат заработка подходит именно тебе: фриланс, найм, экспертность или своё дело." },
  { icon: "ShieldAlert", color: "bg-rose-50", iconColor: "text-rose-600", border: "border-rose-100", name: "Твои ограничения", desc: "Что мешает раскрывать потенциал на максимум — и как с этим работать конкретно." },
  { icon: "Target", color: "bg-violet-50", iconColor: "text-violet-600", border: "border-violet-100", name: "Пошаговые рекомендации", desc: "Не общие советы, а конкретные действия под твою ситуацию и тип мышления." },
];

const exampleResult = {
  type: "Стратегический аналитик",
  strength: "Умение видеть систему и принимать взвешенные решения",
  block: "Перегруз вариантами и постоянные сомнения",
  growth: "Постепенное развитие через структуру и фокус на одном направлении",
  recommendation: "Убрать лишние задачи и выстроить понятную систему действий",
};

const faqs = [
  { q: "Это психологический тест?", a: "Нет. Это структурированный разбор твоих сильных сторон, поведенческих паттернов и модели реализации. Без абстрактной психологии — только конкретные выводы." },
  { q: "Что я получу в итоге?", a: "Понимание того, как тебе лучше двигаться, на что опираться, где твои сильные стороны и как реализовывать себя и зарабатывать. Не описание характера — а разбор, который можно применять." },
  { q: "Это подойдёт, если я уже многое пробовал?", a: "Да. Особенно тем, кто чувствует потенциал, но пока не смог собрать себя в понятную систему. Разбор помогает увидеть, что именно тормозит и куда направить усилия." },
  { q: "Сколько времени занимает прохождение?", a: "Базовый разбор — 15–20 минут. Можно прерваться и продолжить позже — прогресс сохраняется. Расширенный даст глубокую расшифровку и персональный план." },
  { q: "Нужно ли платить?", a: "Мини-разбор на главной странице — бесплатно. Полный разбор с профилем сильных сторон и моделью дохода — 299 ₽. Расширенный разбор с глубокой расшифровкой и планом — 990 ₽." },
  { q: "Что такое PRO-тренажёры?", a: "PRO-тренажёры — углублённые инструменты для развития мышления: стратегическое, финансовое и логическое. В конце получаешь подробный отчёт с индексами, графиками и рекомендациями." },
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
      {/* WHAT YOU GET */}
      <section id="tools" className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Что ты получишь</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Не просто описание — а понимание себя и своего пути</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Разбор, который можно применять в жизни — без воды и абстрактных формулировок</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whatYouGet.map((item) => (
              <div
                key={item.name}
                className={`rounded-3xl p-6 border ${item.border} ${item.color} card-hover`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm">
                  <Icon name={item.icon as Parameters<typeof Icon>[0]["name"]} size={22} className={item.iconColor} />
                </div>
                <h3 className="font-bold text-foreground text-[17px] mb-2">{item.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => scrollTo("demo")}
              className="gradient-brand text-white font-bold px-8 py-3.5 rounded-2xl hover:opacity-90 transition-opacity text-[15px]"
            >
              Пройти разбор бесплатно
            </button>
          </div>
        </div>
      </section>

      {/* EXAMPLE RESULT */}
      <section className="py-12 md:py-20 bg-white/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Пример результата</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Вот как выглядит персональный разбор</h2>
          </div>
          <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
            <div className="gradient-brand p-6 text-white text-center">
              <p className="text-white/70 text-sm mb-1">Тип личности</p>
              <h3 className="text-2xl font-black">{exampleResult.type}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-4 p-4 bg-green-50 rounded-2xl border border-green-100">
                <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                  <Icon name="Zap" size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1">Сильная сторона</p>
                  <p className="text-foreground text-sm">{exampleResult.strength}</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                  <Icon name="AlertCircle" size={16} className="text-rose-600" />
                </div>
                <div>
                  <p className="text-xs text-rose-600 font-semibold uppercase tracking-wide mb-1">Что мешает</p>
                  <p className="text-foreground text-sm">{exampleResult.block}</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                  <Icon name="TrendingUp" size={16} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide mb-1">Твоя модель роста</p>
                  <p className="text-foreground text-sm">{exampleResult.growth}</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-accent/40 rounded-2xl border border-accent">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon name="CheckCircle" size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">Рекомендация</p>
                  <p className="text-foreground text-sm">{exampleResult.recommendation}</p>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 text-center">
              <p className="text-muted-foreground text-xs">👉 Это не абстрактная характеристика, а разбор, который можно применять в жизни</p>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Почему это работает</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Почему людям откликается этот разбор</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
              Потому что он помогает наконец увидеть свои сильные стороны, причины внутреннего хаоса и подходящий формат реализации — и почувствовать ясность и опору на себя.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "BookOpen", title: "Научная методология", text: "Разбор основан на валидированных психологических методиках: анализ поведенческих паттернов, мотивационных профилей и моделей ценностей." },
              { icon: "BarChart3", title: "Адаптивный алгоритм", text: "Система учитывает твои ответы в комплексе — чем честнее отвечаешь, тем точнее картина. Одни и те же ответы всегда дают один результат." },
              { icon: "Lock", title: "Только для тебя", text: "Твои ответы видишь только ты. Мы не передаём данные третьим лицам — всё хранится в твоём личном кабинете." },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-3xl p-7 border border-border card-hover text-center">
                <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4">
                  <Icon name={item.icon as Parameters<typeof Icon>[0]["name"]} size={22} className="text-white" />
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
                У тебя уже есть потенциал.<br />Нужно понять, как раскрыть его правильно.
              </h2>
              <p className="text-white/80 max-w-lg mx-auto mb-8 text-[15px] leading-relaxed">
                Пройди персональный разбор и выстрой свою модель роста, реализации и дохода.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => scrollTo("demo")}
                  className="bg-white text-primary font-bold px-8 py-4 rounded-2xl hover:bg-white/90 transition-colors text-[15px]"
                >
                  Пройти разбор
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
              <a href="/partner" className="hover:text-foreground transition-colors">Партнёрская программа</a>
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
