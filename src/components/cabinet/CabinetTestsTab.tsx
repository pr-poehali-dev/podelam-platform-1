import Icon from "@/components/ui/icon";
import { TestResult, PsychResult, printPsychResult } from "./cabinetTypes";
import { CareerResult } from "@/lib/access";
import { CAREER_TYPES } from "@/lib/careerTestEngine";

type Props = {
  psychTest: TestResult | undefined;
  psychResult: PsychResult | null;
  careerResult: CareerResult | null;
  onNavigate: (path: string) => void;
};

export default function CabinetTestsTab({ psychTest, psychResult, careerResult, onNavigate }: Props) {
  return (
    <div className="animate-fade-in-up space-y-5">
      <h1 className="text-2xl font-black text-foreground">Тесты</h1>

      {/* Тест 1: Какая профессия тебе подходит */}
      <div className="bg-white rounded-3xl border border-border p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 bg-violet-50 rounded-2xl flex items-center justify-center">
            <Icon name="Compass" size={20} className="text-violet-600" />
          </div>
          <div className="flex items-center gap-2">
            {careerResult ? (
              <span className="bg-green-50 text-green-600 text-xs font-bold px-3 py-1 rounded-full border border-green-100">Пройден</span>
            ) : (
              <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">Старт отсюда</span>
            )}
          </div>
        </div>
        <h3 className="font-bold text-lg text-foreground mb-1">Какая профессия тебе подходит?</h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-1">
          Рациональный тест — что ты думаешь о своих склонностях. Даёт первичный профиль и профессии.
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><Icon name="Clock" size={12} />5 мин</span>
          <span className="flex items-center gap-1"><Icon name="HelpCircle" size={12} />10 вопросов</span>
          <span className="flex items-center gap-1 text-green-600 font-semibold"><Icon name="CheckCircle2" size={12} />Бесплатно</span>
        </div>

        {careerResult && (
          <div className="mb-4 p-3 bg-secondary/50 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">{CAREER_TYPES[careerResult.topType as keyof typeof CAREER_TYPES]?.emoji}</span>
            <div>
              <div className="font-semibold text-sm text-foreground">{careerResult.topTypeName} тип</div>
              <div className="text-xs text-muted-foreground">{careerResult.date}</div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="font-black text-xl text-foreground text-green-600">Бесплатно</span>
          <button
            onClick={() => onNavigate("/career-test")}
            className={`font-bold px-5 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-90 ${
              careerResult
                ? "border border-border text-muted-foreground hover:bg-secondary"
                : "gradient-brand text-white"
            }`}
          >
            {careerResult ? "Пройти заново" : "Начать тест"}
          </button>
        </div>
      </div>

      {/* Тест 2: Психологический анализ */}
      <div className="bg-white rounded-3xl border border-border p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 gradient-brand rounded-2xl flex items-center justify-center">
            <Icon name="Brain" size={20} className="text-white" />
          </div>
          <div className="flex items-center gap-2">
            {psychTest && (
              <span className="bg-green-50 text-green-600 text-xs font-bold px-3 py-1 rounded-full border border-green-200">Пройден</span>
            )}
            {!careerResult && (
              <span className="bg-amber-50 text-amber-600 text-xs font-medium px-3 py-1 rounded-full border border-amber-100">Сначала тест 1</span>
            )}
          </div>
        </div>
        <h3 className="font-bold text-lg text-foreground mb-1">Психологический анализ</h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-1">
          Профориентация и предотвращение выгорания. Раскрывает глубинные таланты, мотивацию и риски выгорания.
        </p>
        {careerResult && !psychTest && (
          <p className="text-indigo-600 text-xs font-medium mb-3 bg-indigo-50 p-2 rounded-xl">
            💡 Твой тест показал {careerResult.topTypeName.toLowerCase()} тип. Психоанализ проверит — это и вправду твоё призвание?
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><Icon name="Clock" size={12} />20 мин</span>
          <span className="flex items-center gap-1"><Icon name="HelpCircle" size={12} />15 вопросов</span>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="font-black text-xl text-foreground">290 ₽</span>
          <div className="flex gap-2">
            {psychTest && psychResult && (
              <button
                onClick={() => printPsychResult(psychResult, psychTest.date, psychTest.score)}
                className="flex items-center gap-1.5 border border-border text-muted-foreground font-semibold px-3 py-2 rounded-xl hover:bg-secondary transition-colors text-sm"
              >
                <Icon name="Download" size={14} />
                PDF
              </button>
            )}
            {psychTest ? (
              <button
                onClick={() => onNavigate(`/results/${psychTest.id}`)}
                className="border border-primary text-primary font-semibold px-4 py-2 rounded-xl hover:bg-accent transition-colors text-sm"
              >
                Смотреть результат
              </button>
            ) : (
              <button
                onClick={() => onNavigate("/psych-bot")}
                disabled={!careerResult}
                className="gradient-brand text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {careerResult ? "Начать анализ" : "Сначала пройди тест 1"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hint: две версии результата */}
      {psychTest && careerResult && (
        <div className="bg-amber-50 border border-amber-100 rounded-3xl p-5">
          <div className="flex items-start gap-3">
            <Icon name="GitCompare" size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-800 mb-1 text-sm">У тебя два результата</h4>
              <p className="text-amber-700 text-xs leading-relaxed">
                Тест показал: <strong>{careerResult.topTypeName} тип</strong>. Психоанализ показал: <strong>{psychTest.score}% совпадение</strong>. Инструменты «Шаги развития» и «Подбор дохода» предложат выбрать, от какого результата отталкиваться.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
