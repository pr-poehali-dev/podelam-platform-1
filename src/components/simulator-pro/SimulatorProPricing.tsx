import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { SIMULATOR_PRICE, SIMULATOR_DAYS } from "@/lib/access";

interface SimulatorProPricingProps {
  hasAccess: boolean;
  expiryFormatted: string | null;
  isLoggedIn: boolean;
  onCTA: () => void;
}

export default function SimulatorProPricing({ hasAccess, expiryFormatted, isLoggedIn, onCTA }: SimulatorProPricingProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* PRICING BLOCK */}
      <section id="pricing" className="py-14 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Доступ</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">Один раз заплатить — один раз решить правильно</h2>
            <p className="text-slate-500 mt-3 text-base max-w-lg mx-auto">Симулятор оплачивается отдельно от подписки на тренажёры. 7 дней — достаточно, чтобы просчитать любое важное решение.</p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="relative bg-white rounded-3xl border-2 border-slate-900 shadow-xl p-8">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-slate-900 text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wide">PRO ДОСТУП</span>
              </div>

              <div className="text-center mt-2 mb-8">
                <div className="flex items-end justify-center gap-1 mb-1">
                  <span className="text-5xl font-black text-slate-900">{SIMULATOR_PRICE}</span>
                  <span className="text-2xl font-bold text-slate-400 mb-1.5">₽</span>
                </div>
                <p className="text-slate-500 text-sm">/ {SIMULATOR_DAYS} дней · отдельно от подписки</p>
              </div>

              <ul className="space-y-3.5 mb-8">
                {[
                  { icon: "GitBranch", text: "До 20 сценариев и до 3 вариантов каждый" },
                  { icon: "CalendarDays", text: "Горизонт расчёта до 30 лет" },
                  { icon: "BarChart3", text: "Индексы: финансы, стресс, стабильность, риски" },
                  { icon: "FileDown", text: "PDF-отчёт — сохрани и поделись" },
                  { icon: "Layers", text: "5 готовых шаблонов сценариев" },
                  { icon: "Eye", text: "Просмотр прошлых сценариев всегда бесплатен" },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon name="Check" size={11} className="text-slate-700" />
                    </div>
                    <span className="text-sm text-slate-600">{item.text}</span>
                  </li>
                ))}
              </ul>

              {hasAccess ? (
                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 text-center">
                    <p className="text-emerald-700 font-bold text-sm">Доступ активен</p>
                    {expiryFormatted && <p className="text-emerald-600 text-xs mt-0.5">Действует до {expiryFormatted}</p>}
                  </div>
                  <button
                    onClick={() => navigate("/pro/simulator")}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl text-base transition-colors"
                  >
                    Открыть симулятор
                  </button>
                </div>
              ) : (
                <button
                  onClick={onCTA}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl text-base transition-colors shadow-lg shadow-slate-900/20"
                >
                  {isLoggedIn ? `Получить доступ за ${SIMULATOR_PRICE} ₽` : "Войти и получить доступ"}
                </button>
              )}

              <p className="text-center text-xs text-slate-400 mt-4">
                Без ИИ · Чистая логика и данные · Результат мгновенно
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[
                { icon: "Lock", label: "Без ИИ" },
                { icon: "Clock", label: "За 20 минут" },
                { icon: "RefreshCw", label: "7 дней доступа" },
              ].map((b) => (
                <div key={b.label} className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                  <Icon name={b.icon} size={16} className="text-slate-500 mx-auto mb-1" />
                  <p className="text-xs text-slate-500 font-medium">{b.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-14 sm:py-20 px-4 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            Одно правильное решение<br className="hidden sm:block" /> стоит гораздо больше 490 ₽
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            Ипотека на 20 лет. Смена работы. Открытие бизнеса. Это не те решения, в которых стоит гадать.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onCTA}
              className="bg-white text-slate-900 font-bold px-8 py-4 rounded-2xl text-base hover:bg-slate-100 transition-colors shadow-lg"
            >
              {hasAccess ? "Открыть симулятор" : `Начать за ${SIMULATOR_PRICE} ₽`}
            </button>
            <button
              onClick={() => navigate("/trainers-info")}
              className="bg-slate-800 border border-slate-700 text-slate-300 font-semibold px-8 py-4 rounded-2xl text-base hover:bg-slate-700 transition-colors"
            >
              Смотреть тренажёры
            </button>
          </div>
          <p className="text-slate-600 text-xs mt-6">490 ₽ / 7 дней · Отдельно от подписки на тренажёры</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
                <Icon name="Cpu" size={13} className="text-white" />
              </div>
              <span className="font-bold text-slate-800 text-sm">Симулятор решений PRO</span>
            </div>
            <p className="text-xs text-slate-400 text-center">Часть платформы ПоДелам</p>
            <button
              onClick={() => navigate("/trainers-info")}
              className="text-xs text-slate-600 font-semibold hover:text-slate-900 transition-colors"
            >
              Все тренажёры →
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
