import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

const LEARN_POINTS = [
  { icon: "ArrowRightLeft", text: "Системное понимание денежных потоков" },
  { icon: "Shield", text: "Навык расчёта финансовой устойчивости" },
  { icon: "AlertTriangle", text: "Умение видеть риски в деньгах" },
  { icon: "Target", text: "Финансовая дисциплина и самоконтроль" },
  { icon: "GitBranch", text: "Способность просчитывать последствия решений" },
];

interface Props {
  access: boolean;
  expiresLabel: string | null;
  hasHistory: boolean;
  onNavigateTrainers: () => void;
  onNavigateTrainer: () => void;
  onScrollPricing: () => void;
}

export default function FinancialLandingHero({
  access,
  expiresLabel,
  hasHistory,
  onNavigateTrainers,
  onNavigateTrainer,
  onScrollPricing,
}: Props) {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-emerald-950/95 backdrop-blur-sm border-b border-emerald-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={onNavigateTrainers}
            className="flex items-center gap-2 text-emerald-300 hover:text-white transition-colors text-sm"
          >
            <Icon name="ArrowLeft" size={16} />
            <span>Тренажёры</span>
          </button>
          {access && (
            <span className="text-xs text-emerald-400 border border-emerald-400/30 rounded-full px-3 py-1">
              Доступ активен
            </span>
          )}
        </div>
      </nav>

      <section className="bg-emerald-950 pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="anim-in anim-d1 inline-flex items-center gap-2 border border-emerald-700 rounded-full px-4 py-1.5 mb-8">
            <Icon name="TrendingUp" size={16} className="text-white" />
            <span className="text-xs text-emerald-300 uppercase tracking-widest">PRO-тренажёр</span>
          </div>

          <h1 className="anim-in anim-d2 text-2xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
            Финансовое мышление PRO
          </h1>

          <p className="anim-in anim-d3 text-base md:text-lg text-emerald-300 mb-4 max-w-xl mx-auto">
            Симулятор финансовых решений
          </p>

          <p className="anim-in anim-d4 text-sm text-emerald-400/70 mb-10 max-w-lg mx-auto">
            Развивайте финансовую дисциплину и системное понимание денежных потоков. Без ИИ — чистая математика и формулы.
          </p>

          <div className="anim-in anim-d5 flex flex-col sm:flex-row items-center gap-3 justify-center">
            {access ? (
              <Button
                onClick={onNavigateTrainer}
                className="bg-white text-emerald-950 hover:bg-emerald-50 h-10 sm:h-12 px-6 sm:px-8 text-base font-medium rounded-lg"
              >
                Перейти к тренажёру
                <Icon name="ArrowRight" size={18} />
              </Button>
            ) : (
              <Button
                onClick={onScrollPricing}
                className="bg-white text-emerald-950 hover:bg-emerald-50 h-10 sm:h-12 px-6 sm:px-8 text-base font-medium rounded-lg"
              >
                Получить доступ
                <Icon name="ArrowDown" size={18} />
              </Button>
            )}
            {hasHistory && !access && (
              <Button
                onClick={onNavigateTrainer}
                className="bg-emerald-800 text-white border border-emerald-600 hover:bg-emerald-700 h-12 px-6 text-base font-medium rounded-lg"
              >
                <Icon name="BarChart3" size={18} />
                Моя история
              </Button>
            )}
          </div>

          {access && expiresLabel && (
            <p className="anim-in anim-d6 text-xs text-emerald-500 mt-4">
              Доступ до {expiresLabel}
            </p>
          )}
        </div>
      </section>

      <section className="py-20 md:py-28 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Зачем считать, если можно чувствовать?
            </h2>
            <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Потому что интуиция в финансах подводит. 70% людей не знают свой реальный денежный поток, а 85% не готовы к финансовому стрессу. Этот тренажёр покажет вам точную картину.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-16">
            <div className="rounded-2xl bg-red-50 p-4 sm:p-6">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                <Icon name="EyeOff" size={20} className="text-red-500" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Слепые зоны</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Вы знаете сколько зарабатываете, но не знаете куда уходят деньги. Импульсные траты съедают до 20% бюджета незаметно.
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4 sm:p-6">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                <Icon name="TrendingDown" size={20} className="text-amber-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Иллюзия стабильности</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Пока всё хорошо — кажется, что так будет всегда. Но стресс-тест показывает: одно увольнение — и финансовая подушка тает за месяц.
              </p>
            </div>
            <div className="rounded-2xl bg-blue-50 p-4 sm:p-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Icon name="Target" size={20} className="text-blue-500" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Цели без плана</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                «Хочу миллион» — не стратегия. Без расчёта PMT и KDG вы не знаете, достижима ли цель при вашем текущем потоке.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-950 p-8 md:p-12 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
              <Icon name="Zap" size={14} className="text-emerald-400" />
              <span className="text-xs text-emerald-300 uppercase tracking-widest">Решение</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
              Этот тренажёр — <span className="text-emerald-400">формульный анализ</span> ваших финансов
            </h3>
            <p className="text-sm md:text-base text-emerald-300/70 max-w-2xl mx-auto leading-relaxed mb-6">
              Вы вводите реальные данные — доходы, расходы, долги, цели — и пропускаете их через 7 этапов финансового анализа. На выходе: точные индексы, стресс-тест, проекция цели и оценка дисциплины.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-2xl font-bold text-white mb-1">7</p>
                <p className="text-xs text-emerald-400/60">этапов анализа</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-2xl font-bold text-white mb-1">10</p>
                <p className="text-xs text-emerald-400/60">индексов</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-2xl font-bold text-white mb-1">1</p>
                <p className="text-xs text-emerald-400/60">итоговый IFMP-балл</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Чему вы научитесь
            </h2>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Навыки, которые останутся после каждой сессии
            </p>
          </div>

          <div className="space-y-4 max-w-2xl mx-auto mb-10">
            {LEARN_POINTS.map((point, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl bg-white border border-slate-200 p-4"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Icon name={point.icon} size={18} className="text-emerald-700" />
                </div>
                <p className="text-sm font-medium text-slate-900">{point.text}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-white border border-slate-200 p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-5 max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Icon name="TrendingUp" size={24} className="text-emerald-600" />
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-base font-semibold text-slate-900 mb-1">Сравнивайте результаты</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Проходите тренажёр регулярно и наблюдайте, как растёт ваш финансовый индекс. История сохраняется.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}