import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

interface FTPLNavProps {
  access: boolean;
}

export default function FTPLNav({ access }: FTPLNavProps) {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => navigate("/trainers-info")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
        >
          <Icon name="ArrowLeft" size={16} />
          Тренажёры
        </button>
        <div className="flex items-center gap-3">
          {access && (
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 font-semibold rounded-full px-3 py-1">
              Доступ активен
            </span>
          )}
          <button
            onClick={() =>
              access
                ? navigate("/financial-thinking")
                : document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })
            }
            className="bg-emerald-900 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-emerald-800 transition-colors"
          >
            {access ? "Открыть" : "Получить доступ"}
          </button>
        </div>
      </div>
    </nav>
  );
}
