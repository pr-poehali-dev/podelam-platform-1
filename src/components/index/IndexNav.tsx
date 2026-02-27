import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

interface IndexNavProps {
  isLoggedIn: boolean;
  scrollTo: (id: string) => void;
}

export default function IndexNav({ isLoggedIn, scrollTo }: IndexNavProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center">
            <Icon name="Compass" size={16} className="text-white" />
          </div>
          <span className="font-bold text-[17px] text-foreground">ПоДелам</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <button onClick={() => scrollTo("how")} className="hover:text-foreground transition-colors">Как работает</button>
          <button onClick={() => scrollTo("tools")} className="hover:text-foreground transition-colors">Инструменты</button>
          <button onClick={() => navigate("/trainers-info")} className="hover:text-foreground transition-colors">Тренажеры</button>
          <button onClick={() => scrollTo("faq")} className="hover:text-foreground transition-colors">FAQ</button>
          <button onClick={() => navigate("/blog")} className="hover:text-foreground transition-colors">Статьи</button>
        </div>
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <button
              onClick={() => navigate("/cabinet")}
              className="gradient-brand text-white text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Icon name="LayoutDashboard" size={15} />
              <span className="hidden sm:inline">В кабинет</span>
            </button>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="gradient-brand text-white text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Начать тест
            </button>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-secondary transition-colors text-foreground"
          >
            <Icon name={menuOpen ? "X" : "Menu"} size={22} />
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-white/95 backdrop-blur-md animate-fade-in">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            <button onClick={() => { scrollTo("how"); setMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-colors">
              <Icon name="Lightbulb" size={18} className="text-primary" />
              Как работает
            </button>
            <button onClick={() => { scrollTo("tools"); setMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-colors">
              <Icon name="Wrench" size={18} className="text-primary" />
              Инструменты
            </button>
            <button onClick={() => { navigate("/trainers-info"); setMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-colors">
              <Icon name="Dumbbell" size={18} className="text-primary" />
              Тренажеры
            </button>
            <button onClick={() => { scrollTo("faq"); setMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-colors">
              <Icon name="HelpCircle" size={18} className="text-primary" />
              FAQ
            </button>
            <button onClick={() => { navigate("/blog"); setMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-colors">
              <Icon name="BookOpen" size={18} className="text-primary" />
              Статьи
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}