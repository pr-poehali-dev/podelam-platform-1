import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { ProTrainerPricing } from "@/lib/proTrainerTypes";
import type { ProTrainerAccess } from "@/lib/proTrainerAccess";

interface Props {
  pricing: ProTrainerPricing[];
  access: boolean;
  activeAccess: ProTrainerAccess | null;
  onPlanClick: (planId: string) => void;
  onNavigateTrainer: () => void;
}

export default function LandingPricing({
  pricing,
  access,
  activeAccess,
  onPlanClick,
  onNavigateTrainer,
}: Props) {
  return (
    <>
      <section id="pricing" className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="anim-in text-2xl md:text-3xl font-bold text-slate-900 mb-4 text-center">
            Тарифы
          </h2>
          <p className="anim-in anim-d1 text-sm text-slate-500 text-center mb-14 max-w-md mx-auto">
            Выберите подходящий формат доступа
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pricing.map((plan, i) => {
              const isActive = access && activeAccess?.planId === plan.id;
              const isPro = plan.id === "pro";

              return (
                <div
                  key={plan.id}
                  className={`anim-in relative rounded-xl border p-6 md:p-8 transition-all ${
                    isPro
                      ? "border-slate-900 bg-slate-950"
                      : "border-slate-200 bg-white"
                  }`}
                  style={{ animationDelay: `${0.2 + i * 0.15}s` }}
                >
                  {isPro && (
                    <div className="absolute -top-3 left-6 bg-white text-slate-950 text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                      Рекомендуем
                    </div>
                  )}

                  <h3
                    className={`text-lg font-bold mb-1 ${
                      isPro ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {plan.name}
                  </h3>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span
                      className={`text-3xl font-bold ${
                        isPro ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {plan.price.toLocaleString("ru-RU")} &#8381;
                    </span>
                    <span
                      className={`text-sm ${
                        isPro ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      / {plan.period}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-center gap-3">
                        <Icon
                          name="Check"
                          size={14}
                          className={isPro ? "text-white" : "text-slate-900"}
                        />
                        <span
                          className={`text-sm ${
                            isPro ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {isActive ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <Icon name="Check" size={16} className="text-emerald-500" />
                        <span className="text-sm font-medium text-emerald-500">
                          Доступ активен
                        </span>
                      </div>
                      <Button
                        onClick={onNavigateTrainer}
                        className={`w-full h-12 rounded-lg text-base font-medium ${
                          isPro
                            ? "bg-white text-slate-950 hover:bg-slate-100"
                            : "bg-slate-950 text-white hover:bg-slate-800"
                        }`}
                      >
                        Перейти к тренажёру
                        <Icon name="ArrowRight" size={18} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => onPlanClick(plan.id)}
                      className={`w-full h-12 rounded-lg text-base font-medium ${
                        isPro
                          ? "bg-white text-slate-950 hover:bg-slate-100"
                          : "bg-slate-950 text-white hover:bg-slate-800"
                      }`}
                    >
                      Выбрать
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 md:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Icon name="Compass" size={14} className="text-white" />
              </div>
              <span className="font-bold text-slate-900">ПоДелам</span>
            </div>
            <div className="text-center text-sm text-slate-500 space-y-0.5">
              <p>© 2025 ПоДелам. Найди своё дело.</p>
              <p>ИП Уварова А. С. · ОГРНИП 322508100398078 · Права защищены</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-slate-500">
              <a href="/pricing" className="hover:text-slate-900 transition-colors">Тарифы</a>
              <a href="/privacy" className="hover:text-slate-900 transition-colors">Политика конфиденциальности</a>
              <a href="/oferta" className="hover:text-slate-900 transition-colors">Оферта</a>
              <a href="/partner" className="hover:text-slate-900 transition-colors">Партнёрская программа</a>
              <a href="https://t.me/AnnaUvaro" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                <Icon name="Send" size={14} />
                Контакты
              </a>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-slate-200/50 max-w-3xl mx-auto text-[11px] leading-relaxed text-slate-400 text-center">
            <p>
              Проект «ПоДелам» не оказывает медицинских услуг и не является медицинской психотерапией. Материалы и результаты тестов носят
              информационно-рекомендательный характер и не заменяют консультацию специалиста. Проект не гарантирует достижение конкретных результатов.
              Сайт предназначен для лиц старше 18 лет. Используя сайт, вы соглашаетесь
              с <a href="/privacy" className="underline hover:text-slate-500 transition-colors">Политикой конфиденциальности</a> и <a href="/oferta" className="underline hover:text-slate-500 transition-colors">Офертой</a>.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}