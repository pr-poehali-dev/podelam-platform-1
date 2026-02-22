import Icon from "@/components/ui/icon";
import { tools } from "./cabinetTypes";

type Props = {
  hasPsychTest: boolean;
  onNavigate: (path: string) => void;
  onGoToTests: () => void;
};

export default function CabinetToolsTab({ hasPsychTest, onNavigate, onGoToTests }: Props) {
  return (
    <div className="animate-fade-in-up space-y-6">
      <h1 className="text-2xl font-black text-foreground">Инструменты</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <div
            key={tool.title}
            onClick={() => tool.link && onNavigate(tool.link)}
            className={`bg-white rounded-3xl border p-6 card-hover cursor-pointer transition-all ${tool.link ? "border-primary/30 hover:border-primary/60 hover:shadow-md" : "border-border"}`}
          >
            <div className={`w-11 h-11 rounded-2xl ${tool.color} flex items-center justify-center mb-4`}>
              <Icon name={tool.icon as "BookOpen"} size={20} />
            </div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-foreground">{tool.title}</h3>
                  {"badge" in tool && tool.badge && (
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full shrink-0">{tool.badge}</span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">{tool.desc}</p>
              </div>
              {tool.link && <Icon name="ArrowRight" size={16} className="text-primary shrink-0 mt-1" />}
            </div>
          </div>
        ))}
      </div>

      {!hasPsychTest && (
        <div className="bg-secondary/50 rounded-3xl p-6 text-center">
          <Icon name="Lock" size={24} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Инструменты станут доступны после прохождения теста</p>
          <button
            onClick={onGoToTests}
            className="mt-4 text-primary font-semibold text-sm hover:underline"
          >
            Перейти к тестам →
          </button>
        </div>
      )}
    </div>
  );
}
