import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const ADMIN_URL = "https://functions.poehali.dev/91afbdc0-3ea5-4c84-9ae2-510594dec646";

interface Stats {
  total_users: number;
  total_payments: number;
  total_revenue: number;
  payments_month: number;
  revenue_month: number;
}

interface Client {
  id: number;
  name: string;
  email: string;
  created_at: string;
  last_login: string | null;
  total_paid: number;
  payments_count: number;
}

interface Payment {
  id: number;
  user_name: string;
  user_email: string;
  amount: number;
  tariff: string;
  status: string;
  created_at: string;
}

type Tab = "clients" | "payments";

function formatDate(s: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function formatMoney(n: number) {
  return Number(n).toLocaleString("ru-RU") + " ₽";
}

export default function Admin() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(() => sessionStorage.getItem("admin_token") || "");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState<Stats | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tab, setTab] = useState<Tab>("clients");
  const [search, setSearch] = useState("");
  const [dataLoading, setDataLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async (t: string) => {
    setDataLoading(true);
    try {
      const res = await fetch(ADMIN_URL, {
        headers: { "X-Admin-Token": t },
      });
      if (res.status === 403) {
        setToken("");
        sessionStorage.removeItem("admin_token");
        setLoginError("Неверный пароль");
        return;
      }
      const data = await res.json();
      setStats(data.stats);
      setClients(data.clients);
      setPayments(data.payments);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData(token);
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    const res = await fetch(ADMIN_URL, {
      headers: { "X-Admin-Token": password },
    });
    setLoading(false);
    if (res.status === 403) {
      setLoginError("Неверный пароль");
      return;
    }
    sessionStorage.setItem("admin_token", password);
    setToken(password);
  };

  const deleteUser = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await fetch(ADMIN_URL, {
        method: "DELETE",
        headers: { "X-Admin-Token": token, "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: deleteTarget.id, user_email: deleteTarget.email }),
      });
      setClients(prev => prev.filter(c => c.id !== deleteTarget.id));
      setStats(prev => prev ? { ...prev, total_users: prev.total_users - 1 } : prev);
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const logout = () => {
    setToken("");
    sessionStorage.removeItem("admin_token");
  };

  const filteredClients = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPayments = payments.filter(p =>
    p.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.user_email?.toLowerCase().includes(search.toLowerCase()) ||
    p.tariff?.toLowerCase().includes(search.toLowerCase())
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center">
              <Icon name="ShieldCheck" size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg">Панель администратора</h1>
              <p className="text-xs text-muted-foreground">Введите пароль для входа</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Пароль администратора"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              autoFocus
            />
            {loginError && <p className="text-destructive text-sm">{loginError}</p>}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full gradient-brand text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Вход..." : "Войти"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
              <Icon name="LayoutDashboard" size={16} className="text-white" />
            </div>
            <span className="font-bold text-foreground">Админ-панель</span>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="LogOut" size={15} />
            Выйти
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCard icon="Users" label="Всего клиентов" value={String(stats.total_users)} />
            <StatCard icon="CreditCard" label="Оплат всего" value={String(stats.total_payments)} />
            <StatCard icon="TrendingUp" label="Выручка всего" value={formatMoney(stats.total_revenue)} accent />
            <StatCard icon="Calendar" label="Оплат за месяц" value={String(stats.payments_month)} />
            <StatCard icon="Banknote" label="Выручка за месяц" value={formatMoney(stats.revenue_month)} accent />
          </div>
        )}

        {/* Tabs + Search */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border gap-4 flex-wrap">
            <div className="flex gap-1 bg-secondary rounded-xl p-1">
              <TabBtn active={tab === "clients"} onClick={() => setTab("clients")}>
                <Icon name="Users" size={14} /> Клиенты ({clients.length})
              </TabBtn>
              <TabBtn active={tab === "payments"} onClick={() => setTab("payments")}>
                <Icon name="Receipt" size={14} /> Платежи ({payments.length})
              </TabBtn>
            </div>
            <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2 flex-1 min-w-[180px] max-w-xs">
              <Icon name="Search" size={14} className="text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск..."
                className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <button
              onClick={() => fetchData(token)}
              className="flex items-center gap-2 text-sm text-primary font-medium hover:opacity-80 transition-opacity"
            >
              <Icon name="RefreshCw" size={14} />
              Обновить
            </button>
          </div>

          {dataLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
              <Icon name="Loader2" size={18} className="animate-spin mr-2" /> Загрузка...
            </div>
          ) : tab === "clients" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50 text-muted-foreground text-left">
                    <th className="px-6 py-3 font-medium">ID</th>
                    <th className="px-6 py-3 font-medium">Имя</th>
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium">Зарегистрирован</th>
                    <th className="px-6 py-3 font-medium">Последний вход</th>
                    <th className="px-6 py-3 font-medium text-right">Оплат</th>
                    <th className="px-6 py-3 font-medium text-right">Сумма</th>
                    <th className="px-6 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredClients.length === 0 ? (
                    <tr><td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">Клиентов нет</td></tr>
                  ) : filteredClients.map(c => (
                    <tr key={c.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground">#{c.id}</td>
                      <td className="px-6 py-4 font-medium text-foreground">{c.name || "—"}</td>
                      <td className="px-6 py-4 text-muted-foreground">{c.email}</td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(c.created_at)}</td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(c.last_login)}</td>
                      <td className="px-6 py-4 text-right">{c.payments_count}</td>
                      <td className="px-6 py-4 text-right font-semibold text-primary">
                        {Number(c.total_paid) > 0 ? formatMoney(Number(c.total_paid)) : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setDeleteTarget(c)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-lg transition-colors"
                          title="Удалить пользователя"
                        >
                          <Icon name="Trash2" size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50 text-muted-foreground text-left">
                    <th className="px-6 py-3 font-medium">ID</th>
                    <th className="px-6 py-3 font-medium">Клиент</th>
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium">Тариф</th>
                    <th className="px-6 py-3 font-medium">Статус</th>
                    <th className="px-6 py-3 font-medium text-right">Сумма</th>
                    <th className="px-6 py-3 font-medium">Дата</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPayments.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">Платежей нет</td></tr>
                  ) : filteredPayments.map(p => (
                    <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground">#{p.id}</td>
                      <td className="px-6 py-4 font-medium text-foreground">{p.user_name || "—"}</td>
                      <td className="px-6 py-4 text-muted-foreground">{p.user_email}</td>
                      <td className="px-6 py-4">{p.tariff || "—"}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          p.status === "paid" ? "bg-green-100 text-green-700" :
                          p.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {p.status === "paid" ? "Оплачено" : p.status === "pending" ? "Ожидает" : p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-primary">{formatMoney(p.amount)}</td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(p.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Icon name="Trash2" size={18} className="text-destructive" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Удалить пользователя?</h2>
                <p className="text-xs text-muted-foreground">Это действие нельзя отменить</p>
              </div>
            </div>
            <div className="bg-secondary rounded-xl p-3 mb-5 text-sm">
              <p className="font-medium text-foreground">{deleteTarget.name}</p>
              <p className="text-muted-foreground">{deleteTarget.email}</p>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Будут удалены: аккаунт, все результаты тестов и история платежей.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="flex-1 border border-border rounded-xl py-2.5 text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={deleteUser}
                disabled={deleteLoading}
                className="flex-1 bg-destructive text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteLoading ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Trash2" size={14} />}
                {deleteLoading ? "Удаление..." : "Удалить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: string; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 border ${accent ? "gradient-brand text-white border-transparent" : "bg-white border-border"}`}>
      <div className={`flex items-center gap-2 mb-2 ${accent ? "text-white/80" : "text-muted-foreground"}`}>
        <Icon name={icon} size={14} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className={`text-xl font-bold ${accent ? "text-white" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}