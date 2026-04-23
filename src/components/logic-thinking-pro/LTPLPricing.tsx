import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const CHECKLIST = [
  "Неограниченные сессии за весь период",
  "История кейсов и сравнение индексов",
  "6+ индексов: аргументы, причинность, данные, искажения, LQI",
  "PDF-отчёт с разбором после каждой сессии",
  "Без ИИ — формульный анализ рассуждений",
  "Просмотр прошлых сессий всегда бесплатен",
];

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
}

interface LTPLPricingProps {
  access: boolean;
  expiresLabel: string | null;
  pricingSingle?: PricingPlan;
  pricingPro?: PricingPlan;
  onGetAccess: (planId?: string) => void;
}

export default function LTPLPricing({
  access,
  expiresLabel,
  pricingSingle,
  pricingPro,
  onGetAccess,
}: LTPLPricingProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* PRICING */}
      <section id="pricing" className="py-16 sm:py-24 px-4 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Доступ</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">Одна сессия — и ты видишь своё мышление иначе</h2>
            <p className="text-slate-500 mt-3 max-w-lg mx-auto">Оплачивается отдельно от подписки на тренажёры. Без ИИ — только логика и формулы.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
            {pricingSingle && (
              <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{pricingSingle.name}</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-slate-900">{pricingSingle.price.toLocaleString("ru-RU")}</span>
                    <span className="text-xl font-bold text-slate-400 mb-1">₽</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">/ {pricingSingle.period}</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {pricingSingle.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon name="Check" size={10} className="text-slate-600" />
                      </div>
                      <span className="text-sm text-slate-600">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onGetAccess("single")}
                  className="w-full bg-indigo-900 hover:bg-indigo-800 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors"
                >
                  Начать за {pricingSingle.price.toLocaleString("ru-RU")} ₽
                </button>
              </div>
            )}
            {pricingPro && (
              <div className="relative bg-indigo-950 rounded-3xl border-2 border-indigo-900 p-8 flex flex-col shadow-2xl shadow-indigo-950/30">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-white text-indigo-950 text-xs font-black px-4 py-1.5 rounded-full tracking-wide">РЕКОМЕНДУЕМ</span>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-1">{pricingPro.name}</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-white">{pricingPro.price.toLocaleString("ru-RU")}</span>
                    <span className="text-xl font-bold text-indigo-600 mb-1">₽</span>
                  </div>
                  <p className="text-xs text-indigo-700 mt-1">/ {pricingPro.period}</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {CHECKLIST.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon name="Check" size={10} className="text-white" />
                      </div>
                      <span className="text-sm text-indigo-200">{f}</span>
                    </li>
                  ))}
                </ul>
                {access ? (
                  <div className="space-y-3">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-4 py-3 text-center">
                      <p className="text-indigo-400 font-bold text-sm">Доступ активен</p>
                      {expiresLabel && <p className="text-indigo-500/70 text-xs mt-0.5">до {expiresLabel}</p>}
                    </div>
                    <button
                      onClick={() => navigate("/logic-thinking")}
                      className="w-full bg-white text-indigo-950 font-bold py-3.5 rounded-2xl text-sm hover:bg-indigo-50 transition-colors"
                    >
                      Открыть тренажёр
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onGetAccess("pro")}
                    className="w-full bg-white text-indigo-950 hover:bg-indigo-50 font-bold py-3.5 rounded-2xl text-sm transition-colors"
                  >
                    Получить PRO за {pricingPro.price.toLocaleString("ru-RU")} ₽
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto text-center">
            {[{ icon: "Lock", label: "Без ИИ" }, { icon: "FileDown", label: "PDF-разбор" }, { icon: "Eye", label: "История всегда" }].map((b) => (
              <div key={b.label} className="bg-white rounded-2xl p-3 border border-slate-100">
                <Icon name={b.icon} size={15} className="text-slate-500 mx-auto mb-1" />
                <p className="text-xs text-slate-500 font-medium">{b.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 sm:py-24 px-4 bg-indigo-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-5 leading-tight">
            Хорошее мышление — это навык.<br className="hidden sm:block" /> Его можно прокачать.
          </h2>
          <p className="text-indigo-400/70 text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            Переговоры, решения, аргументы — везде важна логика. Начни видеть свои ошибки раньше, чем они станут последствиями.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => access ? navigate("/logic-thinking") : onGetAccess("pro")}
              className="bg-white text-indigo-950 font-bold px-8 py-4 rounded-2xl text-base hover:bg-indigo-50 transition-colors shadow-lg"
            >
              {access ? "Открыть тренажёр" : "Начать логический анализ"}
            </button>
            <button
              onClick={() => navigate("/trainers-info")}
              className="bg-indigo-900 border border-indigo-700 text-indigo-200 font-semibold px-8 py-4 rounded-2xl text-base hover:bg-indigo-800 transition-colors"
            >
              Смотреть тренажёры
            </button>
          </div>
          <p className="text-indigo-800 text-xs mt-6">от {pricingSingle?.price.toLocaleString("ru-RU")} ₽ · Оплата отдельно от подписки</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-950 flex items-center justify-center">
              <Icon name="Lightbulb" size={13} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm">Логика мышления PRO</span>
          </div>
          <p className="text-xs text-slate-400">Часть платформы ПоДелам</p>
          <button
            onClick={() => navigate("/trainers-info")}
            className="text-xs text-slate-600 font-semibold hover:text-slate-900 transition-colors"
          >
            Все тренажёры →
          </button>
        </div>
      </footer>
    </>
  );
}
