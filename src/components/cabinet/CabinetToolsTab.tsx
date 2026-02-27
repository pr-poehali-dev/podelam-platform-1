import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { checkAccess, hasSubscription, subscriptionExpires, ToolId, getBalance, payFromBalanceSub, getToolCompletions } from "@/lib/access";
import PaywallModal from "@/components/PaywallModal";
import BalanceTopUpModal from "@/components/BalanceTopUpModal";

type ToolDef = {
  id: ToolId;
  icon: string;
  title: string;
  desc: string;
  color: string;
  iconColor: string;
  link: string;
  price: string;
  onlySubscription?: boolean;
};

const TOOLS: ToolDef[] = [
  {
    id: "psych-bot",
    icon: "Brain",
    title: "Психологический анализ",
    desc: "Профориентация и предотвращение выгорания",
    color: "bg-indigo-50",
    iconColor: "text-indigo-600",
    link: "/psych-bot",
    price: "290 ₽ / раз",
  },
  {
    id: "barrier-bot",
    icon: "ShieldAlert",
    title: "Барьеры и тревога",
    desc: "Страхи, синдром самозванца, прокрастинация",
    color: "bg-rose-50",
    iconColor: "text-rose-600",
    link: "/barrier-bot",
    price: "290 ₽ / раз",
  },
  {
    id: "income-bot",
    icon: "Banknote",
    title: "Подбор дохода",
    desc: "Найди подходящий вариант заработка",
    color: "bg-green-50",
    iconColor: "text-green-600",
    link: "/income-bot",
    price: "290 ₽ / раз",
  },
  {
    id: "plan-bot",
    icon: "Map",
    title: "Шаги развития",
    desc: "Персональный план на 3 месяца",
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
    link: "/plan-bot",
    price: "290 ₽ / раз",
  },
  {
    id: "progress",
    icon: "BarChart3",
    title: "Прогресс развития",
    desc: "Психологический портрет и динамика",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    link: "/progress",
    price: "290 ₽ / раз",
  },
  {
    id: "diary",
    icon: "BookOpen",
    title: "Дневник самоанализа",
    desc: "Фиксируй мысли, наблюдай динамику. Только при подписке.",
    color: "bg-violet-50",
    iconColor: "text-violet-600",
    link: "/diary",
    price: "990 ₽/мес",
    onlySubscription: true,
  },
];

type Props = {
  hasPsychTest: boolean;
  onNavigate: (path: string) => void;
  onGoToTests: () => void;
};

export default function CabinetToolsTab({ hasPsychTest, onNavigate }: Props) {
  const [accessMap, setAccessMap] = useState<Record<ToolId, ReturnType<typeof checkAccess>>>({} as Record<ToolId, ReturnType<typeof checkAccess>>);
  const [paywall, setPaywall] = useState<{ tool: ToolDef } | null>(null);
  const [hasSub, setHasSub] = useState(false);
  const [subExp, setSubExp] = useState<Date | null>(null);
  const [balance, setBalance] = useState(() => getBalance());
  const [showTopUp, setShowTopUp] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [lastActivity, setLastActivity] = useState<Record<string, string>>({});

  const refresh = () => {
    const map = {} as Record<ToolId, ReturnType<typeof checkAccess>>;
    for (const t of TOOLS) map[t.id] = checkAccess(t.id);
    setAccessMap(map);
    setHasSub(hasSubscription());
    setSubExp(subscriptionExpires());
    setBalance(getBalance());

    const activityMap: Record<string, string> = {};
    const completions = getToolCompletions();
    for (const t of TOOLS) {
      const last = completions.find(c => c.toolId === t.id);
      if (last) activityMap[t.id] = last.date;
    }
    setLastActivity(activityMap);
  };

  useEffect(() => { refresh(); }, []);

  const handleToolClick = (tool: ToolDef) => {
    const access = accessMap[tool.id];
    if (access === "locked") {
      setPaywall({ tool });
    } else {
      onNavigate(tool.link);
    }
  };

  const handlePaySuccess = (toolLink?: string) => {
    setPaywall(null);
    refresh();
    if (toolLink) onNavigate(toolLink);
  };

  const buySubscription = async () => {
    if (balance >= 990) {
      setSubLoading(true);
      const ok = await payFromBalanceSub();
      setSubLoading(false);
      if (ok) refresh();
    } else {
      setShowTopUp(true);
    }
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">Инструменты</h1>
        {hasSub && subExp && (
          <span className="text-xs font-medium text-green-600 bg-green-50 border border-green-100 px-3 py-1 rounded-full">
            Подписка до {subExp.toLocaleDateString("ru-RU")}
          </span>
        )}
      </div>

      {/* Подписка — баннер */}
      {!hasSub && (
        <div className="gradient-brand rounded-3xl p-5 text-white">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <div className="font-black text-lg mb-1">Полный доступ</div>
              <div className="text-white/80 text-sm mb-3">Все инструменты на 30 дней, включая Дневник</div>
              <div className="flex flex-wrap gap-1.5">
                {["Психоанализ", "Барьеры", "Доход", "Шаги", "Прогресс", "Дневник"].map((t) => (
                  <span key={t} className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-0 w-full sm:w-auto sm:text-right shrink-0">
              <div>
                <div className="text-3xl font-black">990 ₽</div>
                <div className="text-white/70 text-xs mb-2">/ 30 дней</div>
              </div>
              <button
                onClick={buySubscription}
                disabled={subLoading}
                className="bg-white text-primary font-bold px-4 py-2 rounded-xl text-sm hover:bg-white/90 transition-colors flex items-center gap-1.5 disabled:opacity-70 whitespace-nowrap"
              >
                {subLoading
                  ? <><Icon name="Loader2" size={14} className="animate-spin" />Списываем...</>
                  : balance >= 990
                    ? <><Icon name="Wallet" size={14} />Списать 990 ₽</>
                    : <><Icon name="Plus" size={14} />Пополнить</>
                }
              </button>
              {balance > 0 && balance < 990 && (
                <div className="text-white/60 text-[11px] mt-1">Баланс: {balance} ₽</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Тренажёры — баннер */}
      <div
        onClick={() => onNavigate("/trainers")}
        className="bg-white rounded-3xl border border-indigo-200/60 p-5 cursor-pointer transition-all hover:border-indigo-300 hover:shadow-md relative overflow-hidden group"
      >
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br from-indigo-100/60 to-violet-100/40 transition-transform duration-300 group-hover:scale-110" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
            <Icon name="Dumbbell" size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-bold text-foreground text-sm">Тренажёры</h3>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">5 штук</span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">Осознанный выбор, эмоции, прокрастинация, самооценка, деньги</p>
          </div>
          <Icon name="ChevronRight" size={18} className="text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Список инструментов */}
      <div className="grid sm:grid-cols-2 gap-3">
        {TOOLS.map((tool) => {
          const access = accessMap[tool.id] ?? "locked";
          const isLocked = access === "locked";
          const isActive = access === "paid_once" || access === "subscribed";

          return (
            <div
              key={tool.id}
              onClick={() => handleToolClick(tool)}
              className={`bg-white rounded-3xl border p-5 cursor-pointer transition-all relative overflow-hidden ${
                isLocked
                  ? "border-border opacity-80 hover:opacity-100 hover:border-gray-300"
                  : "border-primary/20 hover:border-primary/50 hover:shadow-md"
              }`}
            >
              {/* Бейдж статуса */}
              {isActive && (
                <div className="absolute top-3 right-3 bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-100">
                  Активно
                </div>
              )}
              {isLocked && (
                <div className="absolute top-3 right-3">
                  <Icon name="Lock" size={14} className="text-muted-foreground" />
                </div>
              )}

              <div className={`w-10 h-10 rounded-xl ${tool.color} flex items-center justify-center mb-3`}>
                <Icon name={tool.icon as "Brain"} size={18} className={tool.iconColor} />
              </div>
              <h3 className="font-bold text-foreground text-sm mb-1">{tool.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed mb-3">{tool.desc}</p>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isActive ? "text-green-600" : "text-primary"}`}>
                  {isActive ? (hasSub ? "Включено в подписку" : "Куплено") : tool.price}
                </span>
                {lastActivity[tool.id] ? (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Icon name="Clock" size={10} />
                    {lastActivity[tool.id]}
                  </span>
                ) : tool.onlySubscription && !hasSub ? (
                  <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Только подписка</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Разовый доступ — история сохраняется. Подписка — без ограничений.
      </p>

      {paywall && (
        <PaywallModal
          toolId={paywall.tool.id}
          toolName={paywall.tool.title}
          onClose={() => setPaywall(null)}
          onSuccess={() => handlePaySuccess(paywall.tool.link)}
        />
      )}

      {showTopUp && (
        <BalanceTopUpModal
          onClose={() => setShowTopUp(false)}
          onSuccess={() => { refresh(); setShowTopUp(false); }}
        />
      )}
    </div>
  );
}