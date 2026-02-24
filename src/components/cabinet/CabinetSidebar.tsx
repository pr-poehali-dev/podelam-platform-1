import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { User } from "./cabinetTypes";
import { getBalance } from "@/lib/access";
import BalanceTopUpModal from "@/components/BalanceTopUpModal";

function useBalance() {
  const [balance, setBalance] = useState(getBalance);
  const refresh = useCallback(() => setBalance(getBalance()), []);
  useEffect(() => {
    window.addEventListener("pdd_balance_change", refresh);
    return () => window.removeEventListener("pdd_balance_change", refresh);
  }, [refresh]);
  return { balance, refresh };
}

type Tab = "home" | "tests" | "tools" | "referral" | "blog";

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
  { id: "referral" as Tab, icon: "Gift", label: "Рефералы" },
  { id: "blog" as Tab, icon: "BookOpen", label: "Статьи" },
];

export function CabinetMobileNav({ activeTab, onTabChange, onLogoClick, onLogout }: Omit<Props, "user">) {
  const [showTopUp, setShowTopUp] = useState(false);
  const { balance } = useBalance();

  return (
    <>
      <div className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-border/50 px-4 h-13 flex items-center justify-between">
        <button onClick={onLogoClick} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
            <Icon name="Compass" size={13} className="text-white" />
          </div>
          <span className="font-bold text-foreground text-sm">ПоДелам</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTopUp(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold hover:bg-violet-100 transition-colors"
          >
            <Icon name="Wallet" size={13} />
            {balance} ₽
          </button>
          <button onClick={onLogout} className="p-2 rounded-lg text-muted-foreground">
            <Icon name="LogOut" size={17} />
          </button>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-border/50 safe-bottom">
        <div className="flex items-center justify-around px-2 py-1.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[60px] ${
                activeTab === item.id
                  ? "text-primary"
                  : "text-muted-foreground/60"
              }`}
            >
              <Icon name={item.icon as "LayoutDashboard"} size={20} />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {showTopUp && (
        <BalanceTopUpModal
          onClose={() => setShowTopUp(false)}
          onSuccess={() => setShowTopUp(false)}
        />
      )}
    </>
  );
}

// Десктопный сайдбар
export default function CabinetSidebar({ user, activeTab, onTabChange, onLogoClick, onLogout }: Props) {
  const [showTopUp, setShowTopUp] = useState(false);
  const { balance } = useBalance();

  return (
    <>
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

      <div className="border-t border-border pt-4 mt-4 space-y-2">
        {/* Баланс */}
        <button
          onClick={() => setShowTopUp(true)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-violet-50 border border-violet-200 hover:bg-violet-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Icon name="Wallet" size={15} className="text-violet-600" />
            <span className="text-sm font-semibold text-violet-800">Баланс</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-black text-violet-700">{balance} ₽</span>
            <Icon name="Plus" size={13} className="text-violet-500" />
          </div>
        </button>

        <div className="flex items-center gap-3 px-2">
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
    {showTopUp && (
      <BalanceTopUpModal
        onClose={() => setShowTopUp(false)}
        onSuccess={() => setShowTopUp(false)}
      />
    )}
    </>
  );
}