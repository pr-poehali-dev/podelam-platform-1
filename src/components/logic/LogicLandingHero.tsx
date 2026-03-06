import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

interface Props {
  access: boolean;
  expiresLabel: string | null;
  hasHistory: boolean;
  onNavigateTrainers: () => void;
  onNavigateTrainer: () => void;
  onScrollPricing: () => void;
}

export default function LogicLandingHero({
  access,
  expiresLabel,
  hasHistory,
  onNavigateTrainers,
  onNavigateTrainer,
  onScrollPricing,
}: Props) {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
              <Icon name="Lightbulb" size={14} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm">ПоДелам</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateTrainers}
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Тренажёры
            </button>
            {access ? (
              <Button
                onClick={onNavigateTrainer}
                size="sm"
                className="bg-indigo-600 text-white hover:bg-indigo-700 h-9"
              >
                Открыть тренажёр
              </Button>
            ) : (
              <Button
                onClick={onScrollPricing}
                size="sm"
                variant="outline"
                className="border-slate-200 text-slate-700 hover:bg-slate-50 h-9"
              >
                Получить доступ
              </Button>
            )}
          </div>
        </div>
      </nav>

      <section className="pt-20 pb-16 md:pt-28 md:pb-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="anim-in anim-d1 inline-flex items-center gap-2 border border-slate-200 rounded-full px-4 py-1.5 mb-8">
            <span className="text-xs text-slate-500 tracking-wide">
              PRO-тренажёр · Без ИИ · Формульная модель
            </span>
          </div>

          <h1 className="anim-in anim-d2 text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
            Тренажёр логического мышления
          </h1>

          <p className="anim-in anim-d3 text-base md:text-lg text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Развивайте причинно-следственное мышление, структурируйте аргументы,
            выявляйте логические ошибки и принимайте решения на основе фактов
          </p>

          <div className="anim-in anim-d4 flex flex-col sm:flex-row items-center gap-3 justify-center">
            {access ? (
              <>
                <Button
                  onClick={onNavigateTrainer}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 h-12 px-8 text-base font-medium rounded-lg"
                >
                  Открыть тренажёр
                  <Icon name="ArrowRight" size={18} className="ml-2" />
                </Button>
                {hasHistory && (
                  <Button
                    onClick={onNavigateTrainer}
                    variant="outline"
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 h-12 px-6 text-base font-medium rounded-lg"
                  >
                    <Icon name="BarChart3" size={18} className="mr-2" />
                    Моя история
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  onClick={onScrollPricing}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 h-12 px-8 text-base font-medium rounded-lg"
                >
                  Начать тренировку
                  <Icon name="ArrowDown" size={18} className="ml-2" />
                </Button>
                <Button
                  onClick={onScrollPricing}
                  variant="outline"
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 h-12 px-6 text-base font-medium rounded-lg"
                >
                  Подробнее
                </Button>
              </>
            )}
            {hasHistory && !access && (
              <Button
                onClick={onNavigateTrainer}
                className="bg-indigo-800 text-white border border-indigo-600 hover:bg-indigo-700 h-12 px-6 text-base font-medium rounded-lg"
              >
                <Icon name="BarChart3" size={18} />
                Моя история
              </Button>
            )}
          </div>

          {access && expiresLabel && (
            <p className="anim-in anim-d5 text-xs text-slate-400 mt-4">
              Доступ до {expiresLabel}
            </p>
          )}
        </div>
      </section>

      <section className="py-16 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Зачем тренировать логику?
            </h2>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Потому что большинство решений принимаются на эмоциях, а не на основе анализа
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-indigo-50 p-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                <Icon name="Brain" size={20} className="text-indigo-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Причинно-следственное мышление
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Научитесь выстраивать цепочки причин и следствий вместо поверхностных
                выводов
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-6">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                <Icon name="Scale" size={20} className="text-amber-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Баланс аргументов
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Перестаньте видеть только подтверждения своей позиции — учитесь
                взвешивать «за» и «против»
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                <Icon name="Shield" size={20} className="text-emerald-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Защита от искажений
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Выявляйте когнитивные искажения в своих рассуждениях до того, как они
                приведут к ошибке
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Чему вы научитесь
            </h2>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Навыки, которые останутся после каждой сессии
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Структурировать аргументы
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Разделять факты, предположения и мнения. Оценивать силу каждого
                аргумента
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Строить причинные цепочки
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Выявлять связи между факторами, следствиями и результатами
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Видеть альтернативы
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Генерировать альтернативные гипотезы и оценивать их вероятность
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Пересматривать решения
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Менять позицию на основе анализа, а не эмоций
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}