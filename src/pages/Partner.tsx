import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import InstallPWA from "@/components/InstallPWA";

const STEPS = [
  {
    num: "01",
    icon: "UserPlus",
    title: "Зарегистрируйтесь",
    desc: "Создайте аккаунт в проекте и перейдите в раздел «Рефералы» в личном кабинете",
  },
  {
    num: "02",
    icon: "FileCheck",
    title: "Примите правила",
    desc: "Ознакомьтесь с правилами партнёрской программы и подтвердите участие",
  },
  {
    num: "03",
    icon: "Share2",
    title: "Делитесь ссылкой",
    desc: "Получите персональную ссылку и отправляйте друзьям, в соцсети или блог",
  },
  {
    num: "04",
    icon: "Coins",
    title: "Получайте 20%",
    desc: "С каждой оплаты приглашённого вам начисляется 20% на бонусный баланс",
  },
];

const BENEFITS = [
  {
    icon: "Percent",
    title: "20% с каждой оплаты",
    desc: "Щедрая комиссия с любой покупки инструмента или подписки",
  },
  {
    icon: "Infinity",
    title: "Бессрочная привязка",
    desc: "Реферал закрепляется за вами — вы получаете бонусы со всех его покупок",
  },
  {
    icon: "Wallet",
    title: "Оплата продуктов",
    desc: "Используйте бонусы для оплаты инструментов и подписки на проект",
  },
  {
    icon: "Banknote",
    title: "Вывод от 50 000 ₽",
    desc: "При накоплении от 50 000 ₽/мес — вывод на счёт по партнёрскому договору",
  },
  {
    icon: "BarChart3",
    title: "Прозрачная статистика",
    desc: "Отслеживайте приглашённых, начисления и историю в личном кабинете",
  },
  {
    icon: "ShieldCheck",
    title: "Честные правила",
    desc: "Без скрытых условий — всё прописано в правилах партнёрской программы",
  },
];

const FAQ = [
  {
    q: "Кто может участвовать?",
    a: "Любой зарегистрированный пользователь проекта «ПоДелам». Не нужен опыт в маркетинге или продажах.",
  },
  {
    q: "Как начисляется вознаграждение?",
    a: "Когда человек переходит по вашей ссылке, регистрируется и оплачивает любой продукт — вам автоматически начисляется 20% от суммы оплаты.",
  },
  {
    q: "Куда можно потратить бонусы?",
    a: "Бонусы можно перевести на основной баланс и оплачивать инструменты и подписку проекта.",
  },
  {
    q: "Можно ли вывести деньги?",
    a: "Да, при накоплении от 50 000 ₽ за календарный месяц и заключении партнёрского договора. Выплата — через 1 месяц после заявки.",
  },
  {
    q: "Где брать ссылку?",
    a: "В личном кабинете → раздел «Рефералы». Также в каждой статье блога есть кнопка «Поделиться» с вашей ссылкой.",
  },
  {
    q: "Что запрещено?",
    a: "Спам-рассылки, ложные обещания дохода, обман пользователей, искусственное создание оплат.",
  },
];

export default function Partner() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-golos" style={{ background: "hsl(248, 50%, 98%)" }}>
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center">
              <Icon name="Compass" size={16} className="text-white" />
            </div>
            <span className="font-bold text-[17px] text-foreground">ПоДелам</span>
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="ArrowLeft" size={16} />
            Назад
          </button>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full bg-violet-300 blur-[120px]" />
          <div className="absolute bottom-10 right-1/4 w-60 h-60 rounded-full bg-fuchsia-300 blur-[100px]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-semibold mb-6">
            <Icon name="Gift" size={16} />
            20% с каждой оплаты
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-tight mb-5">
            Партнёрская программа
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
              проекта «ПоДелам»
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Рекомендуйте проект друзьям и знакомым — получайте вознаграждение с каждой их покупки. Без вложений, без рисков.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate("/cabinet?tab=referral")}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl gradient-brand text-white font-bold text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
            >
              <Icon name="Rocket" size={18} />
              Начать зарабатывать
            </button>
            <a
              href="#how"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white border border-border text-foreground font-semibold text-base hover:bg-secondary transition-all"
            >
              Узнать подробнее
              <Icon name="ArrowDown" size={16} />
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: "20%", label: "комиссия", accent: "text-violet-600" },
            { value: "0 ₽", label: "вложений", accent: "text-green-600" },
            { value: "∞", label: "срок привязки", accent: "text-fuchsia-600" },
            { value: "1 мин", label: "до старта", accent: "text-blue-600" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-border p-5 text-center">
              <div className={`text-2xl sm:text-3xl font-black ${stat.accent}`}>{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl md:text-3xl font-black text-foreground text-center mb-3">Как это работает</h2>
        <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
          Четыре простых шага до первого бонуса
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step, i) => (
            <div key={i} className="relative bg-white rounded-2xl border border-border p-6 group hover:border-violet-200 hover:shadow-md transition-all">
              <div className="text-[11px] font-black text-violet-300 uppercase tracking-widest mb-3">{step.num}</div>
              <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center mb-4 group-hover:bg-violet-100 transition-colors">
                <Icon name={step.icon} size={20} className="text-violet-600" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 text-violet-200">
                  <Icon name="ChevronRight" size={20} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl md:text-3xl font-black text-foreground text-center mb-3">Преимущества</h2>
        <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
          Почему стоит присоединиться
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map((b, i) => (
            <div key={i} className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-50 to-fuchsia-50 flex items-center justify-center mb-4">
                <Icon name={b.icon} size={18} className="text-violet-600" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-1.5">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-black mb-3">Пример заработка</h2>
            <p className="text-white/70 mb-8 max-w-lg">Подписка стоит 990 ₽. Ваш бонус — 198 ₽ с каждого.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { people: "10 человек", sum: "1 980 ₽", period: "в месяц" },
                { people: "50 человек", sum: "9 900 ₽", period: "в месяц" },
                { people: "250 человек", sum: "49 500 ₽", period: "в месяц" },
              ].map((ex, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                  <div className="text-sm text-white/60 mb-1">{ex.people}</div>
                  <div className="text-2xl font-black">{ex.sum}</div>
                  <div className="text-xs text-white/50 mt-1">{ex.period}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl md:text-3xl font-black text-foreground text-center mb-10">Частые вопросы</h2>
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <FaqItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-20 text-center">
        <h2 className="text-2xl md:text-3xl font-black text-foreground mb-4">
          Готовы начать?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Зарегистрируйтесь, примите правила и получите свою партнёрскую ссылку прямо сейчас
        </p>
        <button
          onClick={() => navigate("/cabinet?tab=referral")}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gradient-brand text-white font-bold text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
        >
          <Icon name="Rocket" size={18} />
          Перейти в партнёрский кабинет
        </button>
      </section>

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
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="bg-white rounded-2xl border border-border overflow-hidden transition-all"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <span className="text-[15px] font-semibold text-foreground pr-4">{q}</span>
        <Icon
          name={open ? "Minus" : "Plus"}
          size={18}
          className="shrink-0 text-violet-500 transition-transform"
        />
      </button>
      {open && (
        <div className="px-5 pb-5 -mt-1">
          <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}