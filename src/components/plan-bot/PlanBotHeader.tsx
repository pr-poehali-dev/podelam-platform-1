import Icon from "@/components/ui/icon";

type Props = {
  onBack: () => void;
  onReset: () => void;
  showReset: boolean;
};

export default function PlanBotHeader({ onBack, onReset, showReset }: Props) {
  return (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center gap-3">
      <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
        <Icon name="ArrowLeft" size={18} className="text-gray-600" />
      </button>
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
        <Icon name="Map" size={18} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm leading-tight">Шаги развития</p>
        <p className="text-xs text-gray-500">Персональный план на 3 месяца</p>
      </div>
      {showReset && (
        <button
          onClick={onReset}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          title="Начать заново"
        >
          <Icon name="RotateCcw" size={16} />
        </button>
      )}
    </div>
  );
}
