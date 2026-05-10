import Icon from "@/components/ui/icon";

interface ForWhomTrustProps {
  isLoggedIn: boolean;
  onNavigate: (path: string) => void;
}

export default function ForWhomTrust({ isLoggedIn, onNavigate }: ForWhomTrustProps) {
  return (
    <>
      {/* ДОВЕРИЕ */}
      <section className="py-16 sm:py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Почему это работает</p>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-6">
            Почему людям откликается этот разбор
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8">
            Потому что он помогает увидеть свои сильные стороны, причины внутреннего хаоса и подходящий формат реализации. И наконец почувствовать ясность и опору на себя.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "Target", label: "Конкретные выводы, не общие слова" },
              { icon: "BarChart2", label: "Разбор паттернов, не тест на тип" },
              { icon: "User", label: "Под тебя, а не «для всех»" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-background p-5 flex flex-col items-center gap-3 text-center">
                <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                  <Icon name={item.icon} fallback="Circle" size={18} className="text-white" />
                </div>
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ФИНАЛЬНЫЙ CTA */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto">
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
              <button
                onClick={() => onNavigate(isLoggedIn ? "/cabinet" : "/auth")}
                className="bg-white text-primary font-bold px-8 py-4 rounded-2xl hover:bg-white/90 transition-colors text-[15px]"
              >
                Пройти разбор
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
