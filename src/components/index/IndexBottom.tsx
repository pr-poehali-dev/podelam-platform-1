import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import InstallPWA from "@/components/InstallPWA";

const audience = [
  { icon: "Zap", color: "text-rose-500", bg: "bg-rose-50", title: "Застрял и не двигаешься", text: "Есть желание изменить жизнь, но что-то внутри тормозит. Откладываешь, сомневаешься, начинаешь заново." },
  { icon: "BatteryLow", color: "text-orange-500", bg: "bg-orange-50", title: "Работаешь, но денег нет", text: "Усилия есть — результата нет. Чувствуешь, что идёшь не той дорогой, но не знаешь, какой должна быть твоя." },
  { icon: "Compass", color: "text-indigo-500", bg: "bg-indigo-50", title: "Хочешь понять свой путь", text: "Устал копировать чужие модели успеха. Хочется найти то, что работает именно для тебя — и начать зарабатывать без выгорания." },
];

const faqs = [
  { q: "Почему я много стараюсь, но доход не растёт?", a: "Скорее всего ты используешь модель заработка, которая не совпадает с твоим типом личности и энергетикой. Это как пытаться ехать на велосипеде с пробитым колесом — усилий много, движения мало. Тест помогает найти именно ту модель, которая даст результат без лишнего выгорания." },
  { q: "Что такое «внутренние блоки» и как они мешают?", a: "Блок — это паттерн поведения, который тормозит тебя на пути к деньгам и результату. Это может быть страх ошибки, перегруз от задач, синдром самозванца или хаос в приоритетах. Пока блок не выявлен, он работает незаметно — но мощно. Тест определяет твой главный блок и показывает, как с ним работать." },
  { q: "Как работает тест и насколько он точен?", a: "Все расчёты построены на проверенных психологических методиках и математических алгоритмах. Мы принципиально не используем ИИ для оценки — только точные формулы. Одни и те же ответы всегда дают один результат. Чем честнее отвечаешь — тем точнее картина." },
  { q: "Сколько времени занимает прохождение?", a: "Базовый тест — 15–20 минут. Можно прерваться и продолжить позже — прогресс сохраняется. Расширенный разбор займёт немного больше времени, но даст глубокую расшифровку и персональный план." },
  { q: "Нужно ли платить?", a: "Мини-тест на главной странице — бесплатно. Полный тест с разбором блоков и моделью дохода — 299 ₽. Расширенный разбор с глубокой расшифровкой и планом — 990 ₽." },
  { q: "Что такое PRO-тренажёры?", a: "PRO-тренажёры — это углублённые инструменты для развития мышления: стратегическое, финансовое и логическое. Прохождение занимает 30–50 минут. В конце получаешь подробный отчёт с индексами, графиками и рекомендациями — его можно скачать в PDF." },
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
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Что ты получишь внутри</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Разбор твоих блоков, модель дохода и конкретный план — всё в одном месте, без воды и мотивашек</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: "Brain", color: "bg-indigo-50", iconColor: "text-indigo-600", border: "border-indigo-100", name: "Тип личности", desc: "Кто ты: Аналитик, Инициатор, Исполнитель или Созидатель. На основе этого строится твоя персональная модель.", link: "/psych-analysis-info" },
              { icon: "ShieldAlert", color: "bg-rose-50", iconColor: "text-rose-600", border: "border-rose-100", name: "Главный блок", desc: "Страх, перегруз, хаос или расфокус — что именно тормозит тебя прямо сейчас и как с этим работать.", link: "/barrier-info" },
              { icon: "Banknote", color: "bg-green-50", iconColor: "text-green-600", border: "border-green-100", name: "Модель дохода", desc: "Какой способ заработка подходит именно тебе: фриланс, найм, экспертность, своё дело или партнёрство.", link: "/income-info" },
              { icon: "Zap", color: "bg-amber-50", iconColor: "text-amber-600", border: "border-amber-100", name: "Где ты теряешь энергию", desc: "Конкретные паттерны, которые съедают твой ресурс — и как их убрать, чтобы работать эффективнее.", link: "/plan-info" },
              { icon: "BarChart3", color: "bg-blue-50", iconColor: "text-blue-600", border: "border-blue-100", name: "Прогресс развития", desc: "Отслеживаешь динамику: блоки уменьшаются, энергия растёт, доход двигается вперёд.", link: "/progress-info" },
              { icon: "Target", color: "bg-violet-50", iconColor: "text-violet-600", border: "border-violet-100", name: "Что делать дальше", desc: "Персональный пошаговый план — не общие советы, а конкретные действия для твоей ситуации.", link: "/diary-info" },
            ].map((tool) => (
              <div
                key={tool.name}
                className={`rounded-3xl p-6 border ${tool.border} ${tool.color} card-hover ${tool.link ? "cursor-pointer" : ""}`}
                onClick={() => tool.link && navigate(tool.link)}
              >
                <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm`}>
                  <Icon name={tool.icon} size={22} className={tool.iconColor} />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-foreground text-[17px]">{tool.name}</h3>
                  {tool.link && <Icon name="ArrowRight" size={16} className="text-muted-foreground shrink-0" />}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{tool.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-16">
            <div className="text-center mb-8">
              <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">Этапы</p>
              <h3 className="text-2xl font-black text-foreground">Как выглядит путь</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
              {[
                { icon: "MessageCircle", label: "Отвечаешь", text: "на вопросы о себе — честно, без правильных ответов" },
                { icon: "Lightbulb", label: "Видишь", text: "свои блоки и то, что тебя тормозит прямо сейчас" },
                { icon: "Banknote", label: "Узнаёшь", text: "свою модель дохода и где ты теряешь энергию" },
                { icon: "TrendingUp", label: "Действуешь", text: "по конкретному плану и движешься к результату" },
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
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Для тебя, если</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Тебе это нужно, если...</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Это не слабость и не лень. Просто текущая модель не твоя — и это можно изменить.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {audience.map((a) => (
              <div key={a.title} className="flex gap-4 bg-white rounded-3xl p-6 border border-border card-hover">
                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${a.bg} shrink-0`}>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Icon name={a.icon as any} size={22} className={a.color} />
                </div>
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
                Начни разбираться в себе уже сегодня
              </h2>
              <p className="text-white/80 max-w-lg mx-auto mb-8 text-[15px] leading-relaxed">
                Пройди тест — и мы поможем понять, что происходит внутри и что именно мешает тебе чувствовать себя по-настоящему успешным.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => scrollTo("demo")}
                  className="bg-white text-primary font-bold px-8 py-4 rounded-2xl hover:bg-white/90 transition-colors text-[15px]"
                >
                  Пройти тест бесплатно
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