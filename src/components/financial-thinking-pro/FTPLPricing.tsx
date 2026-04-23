import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const CHECKLIST = [
  "Неограниченные сессии за весь период",
  "История решений и динамика индексов",
  "10 индексов: поток, устойчивость, стресс, цели, дисциплина и др.",
  "PDF-отчёт после каждой сессии",
  "Без ИИ — формульный анализ",
  "Просмотр прошлых сессий всегда бесплатен",
];

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
}

interface FTPLPricingProps {
  access: boolean;
  expiresLabel: string | null;
  pricingSingle?: PricingPlan;
  pricingPro?: PricingPlan;
  onGetAccess: (planId?: string) => void;
}

export default function FTPLPricing({
  access,
  expiresLabel,
  pricingSingle,
  pricingPro,
  onGetAccess,
}: FTPLPricingProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* PRICING */}
      <section id="pricing" className="py-16 sm:py-24 px-4 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Доступ</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">Одна сессия — и ты видишь деньги иначе</h2>
            <p className="text-slate-500 mt-3 max-w-lg mx-auto">Оплачивается отдельно от подписки на тренажёры. Без ИИ — только твои данные и математика.</p>
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
                  className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors"
                >
                  Начать за {pricingSingle.price.toLocaleString("ru-RU")} ₽
                </button>
              </div>
            )}
            {pricingPro && (
              <div className="relative bg-emerald-950 rounded-3xl border-2 border-emerald-900 p-8 flex flex-col shadow-2xl shadow-emerald-950/30">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-white text-emerald-950 text-xs font-black px-4 py-1.5 rounded-full tracking-wide">РЕКОМЕНДУЕМ</span>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-1">{pricingPro.name}</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-white">{pricingPro.price.toLocaleString("ru-RU")}</span>
                    <span className="text-xl font-bold text-emerald-600 mb-1">₽</span>
                  </div>
                  <p className="text-xs text-emerald-700 mt-1">/ {pricingPro.period}</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {CHECKLIST.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon name="Check" size={10} className="text-white" />
                      </div>
                      <span className="text-sm text-emerald-200">{f}</span>
                    </li>
                  ))}
                </ul>
                {access ? (
                  <div className="space-y-3">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3 text-center">
                      <p className="text-emerald-400 font-bold text-sm">Доступ активен</p>
                      {expiresLabel && <p className="text-emerald-500/70 text-xs mt-0.5">до {expiresLabel}</p>}
                    </div>
                    <button
                      onClick={() => navigate("/financial-thinking")}
                      className="w-full bg-white text-emerald-950 font-bold py-3.5 rounded-2xl text-sm hover:bg-emerald-50 transition-colors"
                    >
                      Открыть тренажёр
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onGetAccess("pro")}
                    className="w-full bg-white text-emerald-950 hover:bg-emerald-50 font-bold py-3.5 rounded-2xl text-sm transition-colors"
                  >
                    Получить PRO за {pricingPro.price.toLocaleString("ru-RU")} ₽
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto text-center">
            {[{ icon: "Lock", label: "Без ИИ" }, { icon: "FileDown", label: "PDF-отчёт" }, { icon: "Eye", label: "История всегда" }].map((b) => (
              <div key={b.label} className="bg-white rounded-2xl p-3 border border-slate-100">
                <Icon name={b.icon} size={15} className="text-slate-500 mx-auto mb-1" />
                <p className="text-xs text-slate-500 font-medium">{b.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 sm:py-24 px-4 bg-emerald-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-5 leading-tight">
            Деньги — это не стресс.<br className="hidden sm:block" /> Это система. Выучи её.
          </h2>
          <p className="text-emerald-400/70 text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            Одна сессия даст тебе точную картину. Ты увидишь свои финансы — настоящие, не ощущаемые.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => access ? navigate("/financial-thinking") : onGetAccess("pro")}
              className="bg-white text-emerald-950 font-bold px-8 py-4 rounded-2xl text-base hover:bg-emerald-50 transition-colors shadow-lg"
            >
              {access ? "Открыть тренажёр" : "Начать финансовый анализ"}
            </button>
            <button
              onClick={() => navigate("/trainers-info")}
              className="bg-emerald-900 border border-emerald-700 text-emerald-200 font-semibold px-8 py-4 rounded-2xl text-base hover:bg-emerald-800 transition-colors"
            >
              Смотреть тренажёры
            </button>
          </div>
          <p className="text-emerald-800 text-xs mt-6">от {pricingSingle?.price.toLocaleString("ru-RU")} ₽ · Оплата отдельно от подписки</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-950 flex items-center justify-center">
              <Icon name="TrendingUp" size={13} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm">Финансовое мышление PRO</span>
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
