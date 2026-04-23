import Icon from "@/components/ui/icon";

const FOR_WHO = [
  { icon: "Briefcase", who: "Предприниматели", reason: "Проверить бизнес-идею или стратегию до того, как вложить деньги и время" },
  { icon: "Users", who: "Руководители", reason: "Принимать решения не на интуиции, а на системном анализе факторов и рисков" },
  { icon: "GraduationCap", who: "Начинающие стратеги", reason: "Научиться мыслить сценариями, видеть связи и управлять неопределённостью" },
  { icon: "Lightbulb", who: "Продакт-менеджеры", reason: "Оценить запуск фичи или продукта: риски, сценарии, точки рычага" },
];

const QUOTES = [
  {
    text: "Я думал, что умею мыслить стратегически. После первой сессии понял — я просто умею убеждать себя. Тренажёр показал три слепые зоны, которые я игнорировал месяцами. Перестроил план. Запустился в срок.",
    name: "Павел, основатель SaaS-стартапа",
    role: "Принял решение о пивоте",
  },
  {
    text: "OSI-балл 61 из 100. Я ожидал больше. Но именно это меня и встряхнуло — увидеть точно, где дыры. Не «где-то в стратегии», а конкретно: слабый стресс-тест и единственный сценарий. Теперь у меня три.",
    name: "Анна, директор по развитию",
    role: "Перестроила стратегию выхода на рынок",
  },
  {
    text: "Показал PDF-отчёт инвесторам. Они сказали: «Это серьёзно». Не потому что красиво — а потому что там было видно, что я думал системно. Это другой разговор.",
    name: "Михаил, 39 лет",
    role: "Привлёк раунд после стратегической сессии",
  },
];

interface STPLSocialProps {
  quoteIdx: number;
  setQuoteIdx: (idx: number) => void;
}

export default function STPLSocial({ quoteIdx, setQuoteIdx }: STPLSocialProps) {
  return (
    <>
      {/* FOR WHO */}
      <section className="py-16 sm:py-24 px-4 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Для кого</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Тренажёр для тех, кто принимает серьёзные решения</h2>
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
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Истории решений</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Когда думаешь системно — видишь больше</h2>
          </div>
          <div className="relative bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-10 min-h-[220px]">
            {QUOTES.map((q, i) => (
              <div
                key={i}
                className={`transition-all duration-700 ${i === quoteIdx ? "opacity-100" : "opacity-0 absolute inset-8 sm:inset-10 pointer-events-none"}`}
              >
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6 italic">«{q.text}»</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-950 flex items-center justify-center shrink-0">
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
                  className={`rounded-full transition-all ${i === quoteIdx ? "w-5 h-2 bg-slate-900" : "w-2 h-2 bg-slate-200"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
