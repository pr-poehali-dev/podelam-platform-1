import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { ADMIN_URL, type Stats, type Client, type Payment } from "./admin/types";
import AdminLoginScreen from "./admin/AdminLoginScreen";
import AdminSettings from "./admin/AdminSettings";
import AdminDashboard from "./admin/AdminDashboard";

export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem("admin_token") || "");

  const [stats, setStats] = useState<Stats | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showSettings, setShowSettings] = useState(false);

  const fetchData = async (t: string) => {
    setDataLoading(true);
    try {
      const res = await fetch(ADMIN_URL, {
        headers: { "X-Admin-Token": t },
      });
      if (res.status === 403) {
        setToken("");
        sessionStorage.removeItem("admin_token");
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

  if (!token) {
    return <AdminLoginScreen onLogin={setToken} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
              <Icon name="LayoutDashboard" size={16} className="text-white" />
            </div>
            <span className="font-bold text-foreground">Админ-панель</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/admin/articles" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 text-sm font-semibold hover:bg-violet-100 transition-colors">
              <Icon name="BookOpen" size={14} />
              Статьи
            </a>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                showSettings ? "bg-primary text-white" : "bg-violet-50 text-violet-700 hover:bg-violet-100"
              }`}
            >
              <Icon name="Settings" size={14} />
            </button>
            <button onClick={logout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="LogOut" size={15} />
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {showSettings ? (
          <AdminSettings token={token} />
        ) : (
          <AdminDashboard
            token={token}
            stats={stats}
            clients={clients}
            payments={payments}
            dataLoading={dataLoading}
            onRefresh={() => fetchData(token)}
            onDeleteClient={setDeleteTarget}
          />
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Icon name="Trash2" size={18} className="text-destructive" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Удалить пользователя?</h2>
                <p className="text-sm text-muted-foreground">{deleteTarget.name} ({deleteTarget.email})</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Будут удалены все данные: результаты тестов, платежи, профиль.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-border rounded-xl py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
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
