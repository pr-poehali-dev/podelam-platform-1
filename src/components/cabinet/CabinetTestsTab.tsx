import Icon from "@/components/ui/icon";
import { TestResult, PsychResult, printPsychResult } from "./cabinetTypes";

type Props = {
  psychTest: TestResult | undefined;
  psychResult: PsychResult | null;
  onNavigate: (path: string) => void;
};

export default function CabinetTestsTab({ psychTest, psychResult, onNavigate }: Props) {
  return (
    <div className="animate-fade-in-up space-y-6">
      <h1 className="text-2xl font-black text-foreground">Тесты</h1>

      <div className="bg-white rounded-3xl border border-border p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 gradient-brand rounded-2xl flex items-center justify-center">
            <Icon name="Brain" size={20} className="text-white" />
          </div>
          {psychTest && (
            <span className="bg-green-50 text-green-600 text-xs font-bold px-3 py-1 rounded-full border border-green-200">Пройден</span>
          )}
        </div>
        <h3 className="font-bold text-lg text-foreground mb-2">Тест на призвание</h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-5">
          Анализирует мотивацию, ценности и стиль мышления. Даёт понимание твоих сильных сторон и профессий которые подойдут
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5">
          <span className="flex items-center gap-1"><Icon name="Clock" size={12} />20 мин</span>
          <span className="flex items-center gap-1"><Icon name="HelpCircle" size={12} />15 вопросов</span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="font-black text-xl text-foreground">299 ₽</span>
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
                className="gradient-brand text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
              >
                Начать тест
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}