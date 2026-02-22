import Icon from "@/components/ui/icon";
import { User } from "./cabinetTypes";

type Tab = "home" | "tests" | "tools";

type Props = {
  user: User;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onLogoClick: () => void;
  onLogout: () => void;
};

const NAV_ITEMS = [
  { id: "home" as Tab, icon: "LayoutDashboard", label: "Главная" },
  { id: "tests" as Tab, icon: "ClipboardList", label: "Тесты" },
  { id: "tools" as Tab, icon: "Wrench", label: "Инструменты" },
];

// Мобильная навигация — используется внутри <main> в Cabinet.tsx
export function CabinetMobileNav({ activeTab, onTabChange, onLogoClick, onLogout }: Omit<Props, "user">) {
  return (
    <div className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-border px-4 h-14 flex items-center justify-between">
      <button onClick={onLogoClick} className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
          <Icon name="Compass" size={13} className="text-white" />
        </div>
        <span className="font-bold text-foreground">ПоДелам</span>
      </button>
      <div className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`p-2 rounded-lg transition-colors ${activeTab === item.id ? "text-primary" : "text-muted-foreground"}`}
          >
            <Icon name={item.icon as "LayoutDashboard"} size={20} />
          </button>
        ))}
        <button onClick={onLogout} className="p-2 rounded-lg text-muted-foreground ml-1">
          <Icon name="LogOut" size={18} />
        </button>
      </div>
    </div>
  );
}

// Десктопный сайдбар
export default function CabinetSidebar({ user, activeTab, onTabChange, onLogoClick, onLogout }: Props) {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-border px-4 py-6 shrink-0">
      <button onClick={onLogoClick} className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center">
          <Icon name="Compass" size={16} className="text-white" />
        </div>
        <span className="font-bold text-[17px] text-foreground">ПоДелам</span>
      </button>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === item.id
                ? "gradient-brand text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Icon name={item.icon as "LayoutDashboard"} size={17} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-border pt-4 mt-4">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-sm">
            {user.name[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm text-foreground truncate">{user.name}</div>
            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-xl hover:bg-secondary transition-colors"
        >
          <Icon name="LogOut" size={15} />
          Выйти
        </button>
      </div>
    </aside>
  );
}
