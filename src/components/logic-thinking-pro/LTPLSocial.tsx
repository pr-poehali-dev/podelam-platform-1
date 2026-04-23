import Icon from "@/components/ui/icon";

const FOR_WHO = [
  { icon: "Briefcase", who: "Менеджеры и руководители", reason: "Принимать решения без когнитивных ловушек, выявлять слабые аргументы в обсуждениях" },
  { icon: "MessageSquare", who: "Переговорщики и консультанты", reason: "Видеть структуру чужих аргументов и строить безупречные собственные" },
  { icon: "GraduationCap", who: "Студенты и аналитики", reason: "Развить навык структурного мышления и критического анализа информации" },
  { icon: "Lightbulb", who: "Все, кто думает", reason: "Замечать, когда тебя убеждают ошибочно — и когда ошибаешься сам" },
];

const QUOTES = [
  {
    text: "LQI-балл 54. Я считал себя логичным человеком. Тренажёр показал три систематических искажения — якорение, ложную дихотомию и апелляцию к авторитету. Я видел их в других. Не в себе.",
    name: "Константин, 36 лет",
    role: "Пересмотрел стратегию переговоров",
  },
  {
    text: "Взяла рассуждение, которым обосновывала уход из проекта. Тренажёр разобрал его на части. Оказалось — половина аргументов «за» были следствием одного страха, а не реальными доводами. Осталась. Не пожалела.",
    name: "Мария, 31 год",
    role: "Приняла взвешенное карьерное решение",
  },
  {
    text: "Показал PDF-разбор коллеге. Мы разбирали его бизнес-кейс — и впервые говорили о логике, а не мнениях. Нашли две ошибки в рассуждении, которые стоили бы нам контракта.",
    name: "Виктор, 44 года",
    role: "Предотвратил ошибку на переговорах",
  },
];

interface LTPLSocialProps {
  quoteIdx: number;
  setQuoteIdx: (idx: number) => void;
}

export default function LTPLSocial({ quoteIdx, setQuoteIdx }: LTPLSocialProps) {
  return (
    <>
      {/* FOR WHO */}
      <section className="py-16 sm:py-24 px-4 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Для кого</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Тренажёр для тех, кто хочет думать без ловушек</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {FOR_WHO.map((item) => (
              <div key={item.who} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-colors">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Icon name={item.icon} size={20} className="text-slate-700" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{item.who}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTES */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Истории</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Когда видишь свои ошибки — перестаёшь их повторять</h2>
          </div>
          <div className="relative bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-10 min-h-[220px]">
            {QUOTES.map((q, i) => (
              <div
                key={i}
                className={`transition-all duration-700 ${i === quoteIdx ? "opacity-100" : "opacity-0 absolute inset-8 sm:inset-10 pointer-events-none"}`}
              >
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6 italic">«{q.text}»</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-950 flex items-center justify-center shrink-0">
                    <Icon name="User" size={14} className="text-white" />
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
                  onClick={() => setQuoteIdx(i)}
                  className={`rounded-full transition-all ${i === quoteIdx ? "w-5 h-2 bg-indigo-900" : "w-2 h-2 bg-slate-200"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
