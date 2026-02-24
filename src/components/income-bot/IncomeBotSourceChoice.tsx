import Icon from "@/components/ui/icon";
import { getLatestCareerResult } from "@/lib/access";

type Props = {
  onSelect: (hint?: string) => void;
  onBack: () => void;
};

export default function IncomeBotSourceChoice({ onSelect, onBack }: Props) {
  const career = getLatestCareerResult();

  return (
    <div className="min-h-screen font-golos flex flex-col max-w-4xl mx-auto w-full items-center justify-center px-6" style={{ background: "hsl(248, 50%, 98%)" }}>
      <div className="w-full max-w-md space-y-5 animate-fade-in-up">
        <div className="text-center">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="GitCompare" size={24} className="text-green-600" />
          </div>
          <h2 className="text-xl font-black text-foreground mb-2">На основе какого профиля?</h2>
          <p className="text-muted-foreground text-sm">У тебя два результата. Выбери, от чего отталкиваться при подборе дохода.</p>
        </div>
        <button
          onClick={() => onSelect(`тестового профиля (${career?.topTypeName})`)}
          className="w-full bg-white border-2 border-violet-200 hover:border-violet-400 rounded-2xl p-5 text-left transition-all"
        >
          <div className="font-bold text-foreground mb-1">🧭 Тест — {career?.topTypeName}</div>
          <div className="text-xs text-muted-foreground">Рациональный профиль</div>
        </button>
        <button
          onClick={() => onSelect("психологического анализа (глубинный профиль)")}
          className="w-full gradient-brand text-white rounded-2xl p-5 text-left"
        >
          <div className="font-bold mb-1">🧠 Психологический анализ</div>
          <div className="text-xs text-white/80">Истинные таланты</div>
        </button>
        <button onClick={onBack} className="w-full text-sm text-muted-foreground py-2 hover:text-foreground transition-colors">
          ← В кабинет
        </button>
      </div>
    </div>
  );
}
