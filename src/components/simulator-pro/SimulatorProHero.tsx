import Icon from "@/components/ui/icon";
import { SIMULATOR_PRICE } from "@/lib/access";

interface SimulatorProHeroProps {
  hasAccess: boolean;
  expiryFormatted: string | null;
  onCTA: () => void;
}

const SCENARIOS = [
  { icon: "Home", label: "Ипотека и недвижимость", desc: "Купить или снимать? Считаем реальную выгоду на 20 лет" },
  { icon: "Briefcase", label: "Смена работы", desc: "Стоит ли уходить? Сравниваем доход, риски и рост" },
  { icon: "TrendingUp", label: "Открытие бизнеса", desc: "Когда окупится и сколько реально заработаешь" },
  { icon: "MapPin", label: "Переезд в другой город", desc: "Стоимость жизни, карьера, качество — всё в сравнении" },
  { icon: "Car", label: "Покупка авто", desc: "Кредит сейчас или накопить? Честная математика" },
  { icon: "Sparkles", label: "Любой другой сценарий", desc: "Настрой параметры под свою ситуацию" },
];

export default function SimulatorProHero({ hasAccess, expiryFormatted, onCTA }: SimulatorProHeroProps) {

  return (
    <>
      {/* HERO */}
      <section className="pt-16 sm:pt-20 pb-0 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 pb-12 sm:pb-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 sm:mb-6">
                <Icon name="Cpu" size={13} />
                Симулятор решений
                <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">PRO</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-black text-slate-900 leading-[1.1] mb-5 sm:mb-6">
                Просчитай решение<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-400">до того, как сделаешь</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-7 sm:mb-8">
                Симулятор просчитывает любые жизненные сценарии — без ИИ, на чистой логике и данных.
                Сравни до трёх вариантов, увидь последствия на 30 лет вперёд и прими решение уверенно.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-5">
                <button
                  onClick={onCTA}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-2xl text-base transition-colors shadow-lg shadow-slate-900/20"
                >
                  {hasAccess ? "Открыть симулятор" : `Начать за ${SIMULATOR_PRICE} ₽`}
                </button>
                <button
                  onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-white border border-slate-200 text-slate-700 font-semibold px-8 py-4 rounded-2xl text-base hover:bg-slate-50 transition-colors"
                >
                  Как это работает
                </button>
              </div>
              {hasAccess && expiryFormatted ? (
                <p className="text-xs text-emerald-600 font-semibold">Доступ активен · действует до {expiryFormatted}</p>
              ) : (
                <p className="text-xs text-slate-400">490 ₽ / 7 дней · Отдельно от подписки · Без ИИ</p>
              )}
            </div>
            <div className="w-full lg:w-[460px] xl:w-[520px] shrink-0">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-200">
                <img
                  src="https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/2b9532a8-3a6a-463b-9e33-d4b9cffdea45.jpg"
                  alt="Симулятор решений PRO"
                  className="w-full h-[320px] sm:h-[400px] lg:h-[460px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ипотека vs Аренда · 20 лет</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Расчёт готов</span>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-[11px] text-slate-400">Ипотека</p>
                        <p className="text-base font-black text-slate-900">+4.2 млн ₽</p>
                      </div>
                      <div className="w-px bg-slate-100" />
                      <div>
                        <p className="text-[11px] text-slate-400">Аренда</p>
                        <p className="text-base font-black text-slate-400">−1.8 млн ₽</p>
                      </div>
                      <div className="w-px bg-slate-100" />
                      <div>
                        <p className="text-[11px] text-slate-400">PDF готов</p>
                        <Icon name="FileDown" size={18} className="text-slate-600 mt-0.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCENARIOS STRIP */}
      <section className="py-10 sm:py-14 px-4 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">Какие решения просчитывает симулятор</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {SCENARIOS.map((s) => (
              <div key={s.label} className="flex items-start gap-3 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Icon name={s.icon} size={18} className="text-slate-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm leading-tight">{s.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug hidden sm:block">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}