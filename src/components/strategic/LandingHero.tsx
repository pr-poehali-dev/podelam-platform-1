import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

interface Props {
  access: boolean;
  expiresLabel: string | null;
  hasHistory: boolean;
  onNavigateTrainers: () => void;
  onNavigateTrainer: () => void;
  onScrollToPricing: () => void;
}

export default function LandingHero({
  access,
  expiresLabel,
  hasHistory,
  onNavigateTrainers,
  onNavigateTrainer,
  onScrollToPricing,
}: Props) {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={onNavigateTrainers}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
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

      <section className="bg-slate-950 pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="anim-in anim-d1 inline-flex items-center gap-2 border border-slate-700 rounded-full px-4 py-1.5 mb-8">
            <Icon name="Brain" size={16} className="text-white" />
            <span className="text-xs text-slate-400 uppercase tracking-widest">PRO-тренажёр</span>
          </div>

          <h1 className="anim-in anim-d2 text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
            Стратегическое мышление PRO
          </h1>

          <p className="anim-in anim-d3 text-base md:text-lg text-slate-400 mb-4 max-w-xl mx-auto">
            Инструмент стратегического моделирования решений
          </p>

          <p className="anim-in anim-d4 text-sm text-slate-500 mb-10">
            Это не тест. Это симулятор.
          </p>

          <div className="anim-in anim-d5 flex flex-col sm:flex-row items-center gap-3 justify-center">
            {access ? (
              <Button
                onClick={onNavigateTrainer}
                className="bg-white text-slate-950 hover:bg-slate-100 h-12 px-8 text-base font-medium rounded-lg"
              >
                Перейти к тренажёру
                <Icon name="ArrowRight" size={18} />
              </Button>
            ) : (
              <Button
                onClick={onScrollToPricing}
                className="bg-white text-slate-950 hover:bg-slate-100 h-12 px-8 text-base font-medium rounded-lg"
              >
                Получить доступ
                <Icon name="ArrowDown" size={18} />
              </Button>
            )}
            {hasHistory && !access && (
              <Button
                onClick={onNavigateTrainer}
                className="bg-slate-800 text-white border border-slate-600 hover:bg-slate-700 h-12 px-6 text-base font-medium rounded-lg"
              >
                <Icon name="BarChart3" size={18} />
                Моя история
              </Button>
            )}
          </div>

          {access && expiresLabel && (
            <p className="anim-in anim-d6 text-xs text-slate-500 mt-4">
              Доступ до {expiresLabel}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
