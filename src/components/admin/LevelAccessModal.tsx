import { useState } from "react";
import Icon from "@/components/ui/icon";

const noSpinnerStyle = `
  .no-spinner::-webkit-outer-spin-button,
  .no-spinner::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .no-spinner {
    -moz-appearance: textfield;
  }
`;

interface SiteSettings {
  [key: string]: { value: string; description: string };
}

interface Props {
  settings: SiteSettings;
  onSave: (updated: Record<string, { value: string }>) => Promise<void>;
  onClose: () => void;
}

const levels = [
  {
    key: "level_play_online",
    label: "Играть онлайн",
    icon: "Play",
    color: "text-green-400",
  },
  {
    key: "level_play_offline",
    label: "Играть офлайн",
    icon: "Gamepad2",
    color: "text-blue-400",
  },
  {
    key: "level_tournament",
    label: "Онлайн турнир",
    icon: "Trophy",
    color: "text-purple-400",
  },
  {
    key: "level_online_city",
    label: "Онлайн: город",
    icon: "Home",
    color: "text-orange-400",
  },
  {
    key: "level_online_region",
    label: "Онлайн: регион",
    icon: "Map",
    color: "text-cyan-400",
  },
  {
    key: "level_online_country",
    label: "Онлайн: вся Россия",
    icon: "Globe",
    color: "text-red-400",
  },
];

export const LevelAccessModal = ({ settings, onSave, onClose }: Props) => {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    levels.forEach((l) => {
      init[l.key] = settings[l.key]?.value || "0";
    });
    return init;
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const updated: Record<string, { value: string }> = {};
    levels.forEach((l) => {
      updated[l.key] = { value: values[l.key] || "0" };
    });
    await onSave(updated);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <style>{noSpinnerStyle}</style>
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-slate-800 rounded-2xl border border-slate-700/50 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Icon name="ShieldCheck" size={22} className="text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Доступы по уровням</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-sm text-slate-400 mb-4">
            Минимальный рейтинг для доступа к функции. Значение 0 — доступно
            всем.
          </p>
          {levels.map((l) => (
            <div
              key={l.key}
              className="flex items-center justify-between p-4 rounded-xl bg-slate-700/40 border border-slate-600/30"
            >
              <div className="flex items-center gap-3">
                <Icon name={l.icon} size={20} className={l.color} />
                <span className="text-white font-medium">{l.label}</span>
              </div>
              <input
                type="number"
                value={values[l.key]}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [l.key]: e.target.value }))
                }
                className="w-24 bg-slate-800/80 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-center font-bold focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 no-spinner"
                min="0"
              />
            </div>
          ))}
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
