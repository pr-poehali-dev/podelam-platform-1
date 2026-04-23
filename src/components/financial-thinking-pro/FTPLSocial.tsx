import Icon from "@/components/ui/icon";

const FOR_WHO = [
  { icon: "User", who: "Наёмные сотрудники", reason: "Понять реальную картину своих финансов и выстроить подушку безопасности" },
  { icon: "Briefcase", who: "Предприниматели", reason: "Оценить финансовую устойчивость бизнеса и просчитать личный стресс-порог" },
  { icon: "GraduationCap", who: "Молодые специалисты", reason: "Начать управлять деньгами системно — не на ощущениях, а на цифрах" },
  { icon: "Home", who: "Семьи", reason: "Синхронизировать семейный бюджет, поставить цели и отслеживать прогресс" },
];

const QUOTES = [
  {
    text: "IFMP-балл 58. Я был уверен, что у меня всё хорошо с деньгами. Тренажёр показал: подушка на 1.4 месяца, а не на 3. Стресс-тест вскрыл дыру, которую я не видел. Закрыл её за 2 месяца.",
    name: "Денис, 34 года",
    role: "Выстроил финансовую подушку за 2 месяца",
  },
  {
    text: "Ввела данные по цели — купить квартиру через 5 лет. Тренажёр посчитал: при моём потоке это нереально без изменения расходов. Не было бы этой цифры — я бы ещё год жила в иллюзии.",
    name: "Ирина, 29 лет",
    role: "Пересчитала стратегию накоплений",
  },
  {
    text: "Показал PDF жене. Мы впервые за 8 лет брака поговорили о деньгах по цифрам, а не по ощущениям. Сели, пересмотрели бюджет. Теперь откладываем на 40% больше.",
    name: "Алексей, 41 год",
    role: "Наладил семейное финансовое планирование",
  },
];

interface FTPLSocialProps {
  quoteIdx: number;
  setQuoteIdx: (idx: number) => void;
}

export default function FTPLSocial({ quoteIdx, setQuoteIdx }: FTPLSocialProps) {
  return (
    <>
      {/* FOR WHO */}
      <section className="py-16 sm:py-24 px-4 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Для кого</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Тренажёр для тех, кто хочет управлять деньгами, а не угадывать</h2>
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
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Когда видишь цифры — меняешь поведение</h2>
          </div>
          <div className="relative bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-10 min-h-[220px]">
            {QUOTES.map((q, i) => (
              <div
                key={i}
                className={`transition-all duration-700 ${i === quoteIdx ? "opacity-100" : "opacity-0 absolute inset-8 sm:inset-10 pointer-events-none"}`}
              >
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6 italic">«{q.text}»</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-950 flex items-center justify-center shrink-0">
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
                  className={`rounded-full transition-all ${i === quoteIdx ? "w-5 h-2 bg-emerald-900" : "w-2 h-2 bg-slate-200"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
