import Icon from "@/components/ui/icon";

interface SimulatorProContentProps {
  quoteIdx: number;
  onQuoteChange: (i: number) => void;
}

const FEELINGS = [
  {
    icon: "Brain",
    title: "Ясность вместо тумана",
    text: "Ты видишь цифры, а не догадки. «Стоит ли оно того?» больше не висит в воздухе — у тебя есть ответ.",
  },
  {
    icon: "Shield",
    title: "Уверенность в решении",
    text: "Ты принял это решение не на эмоциях, а на данных. Оглядываться назад незачем — ты всё посчитал.",
  },
  {
    icon: "Zap",
    title: "Освобождение от тревоги",
    text: "Когда сценарий просчитан — тревога «а вдруг» уходит. Ты знаешь, к чему приведёт каждый путь.",
  },
  {
    icon: "Award",
    title: "Чувство контроля",
    text: "Ты управляешь ситуацией, а не плывёшь по течению. Симулятор даёт ощущение взрослого выбора.",
  },
];

const FEATURES = [
  { icon: "GitBranch", title: "До 3 вариантов одновременно", desc: "Сравни «купить», «снять» и «подождать» в одном экране" },
  { icon: "CalendarDays", title: "Горизонт до 30 лет", desc: "Видишь, что будет через 5, 10 и 20 лет по каждому варианту" },
  { icon: "BarChart3", title: "5 измерений качества жизни", desc: "Финансы, время, стресс, стабильность, риски — всё в одном" },
  { icon: "FileDown", title: "PDF-отчёт для себя и банка", desc: "Сохрани расчёт, покажи партнёру или финансовому консультанту" },
  { icon: "Layers", title: "Готовые шаблоны сценариев", desc: "5 готовых шаблонов — заполни автоматически и смотри результат" },
  { icon: "SlidersHorizontal", title: "Гибкие параметры", desc: "Инфляция, рост дохода, вероятность риска — учитывай реальность" },
];

const STEPS = [
  { num: "01", title: "Выбираешь тип решения", desc: "Ипотека, бизнес, переезд — или создаёшь сценарий с нуля." },
  { num: "02", title: "Задаёшь параметры", desc: "Доход, расходы, ставки, сроки — всё под твою ситуацию." },
  { num: "03", title: "Сравниваешь варианты", desc: "До трёх сценариев рядом: финансы, время, стресс, риски." },
  { num: "04", title: "Получаешь расчёт и PDF", desc: "Наглядные графики и подробный отчёт — можно сохранить и поделиться." },
];

const QUOTES = [
  {
    text: "Три месяца думал об ипотеке. Загрузил данные в симулятор — за 20 минут увидел всё: переплату, точку безубыточности, сравнение с арендой. Взял ипотеку. Без сомнений.",
    name: "Роман, 37 лет",
    role: "Принял решение об ипотеке",
  },
  {
    text: "Хотела уйти из найма. Симулятор посчитал три сценария: остаться, уйти сейчас, уйти через год. Результат меня удивил — оказалось, что «через год» выгоднее на 40%. Подождала. Не пожалела.",
    name: "Алина, 31 год",
    role: "Спланировала переход в бизнес",
  },
  {
    text: "Показал расчёт жене. Она скептически относилась к переезду в Москву. После PDF-отчёта с цифрами по 10 годам — согласилась. Данные убеждают лучше слов.",
    name: "Никита, 34 года",
    role: "Переехал и не пожалел",
  },
];

export default function SimulatorProContent({ quoteIdx, onQuoteChange }: SimulatorProContentProps) {
  return (
    <>
      {/* FEELINGS */}
      <section className="py-14 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Что ты чувствуешь после расчёта</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">Не просто цифры — ощущение правоты</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto text-base">Когда важное решение просчитано — что-то меняется внутри. Это не эйфория. Это спокойствие.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEELINGS.map((f) => (
              <div key={f.title} className="flex gap-5 p-6 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Icon name={f.icon} size={22} className="text-slate-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-14 sm:py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Возможности</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">Всё, что нужно для серьёзного решения</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <Icon name={f.icon} size={20} className="text-slate-700" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-14 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Как работает</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">4 шага к ясному решению</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {STEPS.map((s) => (
              <div key={s.num} className="flex gap-5 p-6 rounded-3xl border border-slate-100 bg-white shadow-sm">
                <span className="text-3xl font-black text-slate-100 leading-none shrink-0 select-none">{s.num}</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTES */}
      <section className="py-14 sm:py-20 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Истории решений</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Что происходит, когда считаешь, а не гадаешь</h2>
          </div>
          <div className="relative bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-10 min-h-[210px]">
            {QUOTES.map((q, i) => (
              <div
                key={i}
                className={`transition-all duration-700 ${i === quoteIdx ? "opacity-100" : "opacity-0 absolute inset-8 sm:inset-10 pointer-events-none"}`}
              >
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6 italic">«{q.text}»</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <Icon name="User" size={14} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{q.name}</p>
                    <p className="text-xs text-slate-400">{q.role}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-6 justify-center">
              {QUOTES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => onQuoteChange(i)}
                  className={`rounded-full transition-all ${i === quoteIdx ? "w-5 h-2 bg-slate-800" : "w-2 h-2 bg-slate-200"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
