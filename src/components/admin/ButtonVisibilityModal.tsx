import { useState } from "react";
import Icon from "@/components/ui/icon";

interface SiteSettings {
  [key: string]: { value: string; description: string };
}

interface Props {
  settings: SiteSettings;
  onSave: (updated: Record<string, { value: string }>) => Promise<void>;
  onClose: () => void;
}

const buttons = [
  {
    key: "btn_play_online",
    label: "Играть онлайн",
    icon: "Play",
    color: "text-green-400",
  },
  {
    key: "btn_play_friend",
    label: "Играть с другом",
    icon: "Users",
    color: "text-blue-400",
  },
  {
    key: "btn_play_computer",
    label: "Играть с компьютером",
    icon: "Bot",
    color: "text-orange-400",
  },
  {
    key: "btn_play_offline",
    label: "Играть офлайн",
    icon: "Gamepad2",
    color: "text-blue-400",
  },
  {
    key: "btn_tournament",
    label: "Турнир онлайн",
    icon: "Trophy",
    color: "text-purple-400",
  },
  {
    key: "btn_rankings",
    label: "Рейтинги на главной",
    icon: "BarChart3",
    color: "text-yellow-400",
  },
];

const modeToggle = {
  key: "rankings_mode",
  label: "Данные рейтинга",
  icon: "Users",
  color: "text-cyan-400",
  options: [
    { value: "demo", label: "Демо (фейковые)" },
    { value: "real", label: "Реальные игроки" },
  ],
};

export const ButtonVisibilityModal = ({ settings, onSave, onClose }: Props) => {
  const [values, setValues] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    buttons.forEach((b) => {
      init[b.key] = settings[b.key]?.value === "true";
    });
    return init;
  });
  const [rankingsMode, setRankingsMode] = useState<string>(
    settings[modeToggle.key]?.value || "demo",
  );
  const [saving, setSaving] = useState(false);

  const toggle = (key: string) => {
    setValues((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    const updated: Record<string, { value: string }> = {};
    buttons.forEach((b) => {
      updated[b.key] = { value: values[b.key] ? "true" : "false" };
    });
    updated[modeToggle.key] = { value: rankingsMode };
    await onSave(updated);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-slate-800 rounded-2xl border border-slate-700/50 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Icon name="ToggleRight" size={22} className="text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Видимость кнопок</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {buttons.map((b) => (
            <button
              key={b.key}
              onClick={() => toggle(b.key)}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-700/40 border border-slate-600/30 hover:bg-slate-700/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon name={b.icon} size={20} className={b.color} />
                <span className="text-white font-medium">{b.label}</span>
              </div>
              <div
                className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${values[b.key] ? "bg-emerald-500" : "bg-slate-600"}`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${values[b.key] ? "translate-x-5" : "translate-x-0"}`}
                />
              </div>
            </button>
          ))}

          <div className="pt-2 border-t border-slate-700/50">
            <div className="p-4 rounded-xl bg-slate-700/40 border border-slate-600/30">
              <div className="flex items-center gap-3 mb-3">
                <Icon
                  name={modeToggle.icon}
                  size={20}
                  className={modeToggle.color}
                />
                <span className="text-white font-medium">
                  {modeToggle.label}
                </span>
              </div>
              <div className="flex gap-2">
                {modeToggle.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRankingsMode(opt.value)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      rankingsMode === opt.value
                        ? "bg-cyan-500 text-white"
                        : "bg-slate-600/50 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-slate-700/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-colors font-medium"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-amber-500 text-black hover:bg-amber-400 transition-colors font-bold disabled:opacity-50"
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
};