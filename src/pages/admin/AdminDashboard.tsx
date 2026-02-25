import { useState } from "react";
import Icon from "@/components/ui/icon";
import { type Stats, type Client, type Payment, type Tab, TOOL_LABELS, formatDate, formatMoney, ADMIN_URL } from "./types";

interface AdminDashboardProps {
  token: string;
  stats: Stats | null;
  clients: Client[];
  payments: Payment[];
  dataLoading: boolean;
  onRefresh: () => void;
  onDeleteClient: (client: Client) => void;
}

export default function AdminDashboard({ token, stats, clients, payments, dataLoading, onRefresh, onDeleteClient }: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>("clients");
  const [search, setSearch] = useState("");

  const filteredClients = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPayments = payments.filter(p =>
    p.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.user_email?.toLowerCase().includes(search.toLowerCase()) ||
    p.tariff?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard icon="Users" label="Всего клиентов" value={String(stats.total_users)} />
          <StatCard icon="CreditCard" label="Оплат всего" value={String(stats.total_payments)} />
          <StatCard icon="TrendingUp" label="Выручка всего" value={formatMoney(stats.total_revenue)} accent />
          <StatCard icon="Calendar" label="Оплат за месяц" value={String(stats.payments_month)} />
          <StatCard icon="Banknote" label="Выручка за месяц" value={formatMoney(stats.revenue_month)} accent />
        </div>
      )}

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
            onClick={onRefresh}
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
                  <th className="px-6 py-3 font-medium text-right">Пополнения</th>
                  <th className="px-6 py-3 font-medium text-right">Расходы</th>
                  <th className="px-6 py-3 font-medium text-right">Баланс</th>
                  <th className="px-6 py-3 font-medium">Подписка</th>
                  <th className="px-6 py-3 font-medium">Инструменты</th>
                  <th className="px-6 py-3 font-medium text-right">Оплат</th>
                  <th className="px-6 py-3 font-medium text-right">Сумма</th>
                  <th className="px-6 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredClients.length === 0 ? (
                  <tr><td colSpan={12} className="px-6 py-12 text-center text-muted-foreground">Клиентов нет</td></tr>
                ) : filteredClients.map(c => (
                  <tr key={c.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground">#{c.id}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{c.name || "—"}</td>
                    <td className="px-6 py-4 text-muted-foreground">{c.email}</td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(c.created_at)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(c.last_login)}</td>
                    <td className="px-6 py-4 text-right font-medium text-green-600">
                      {Number(c.total_topup) > 0 ? "+" + formatMoney(Number(c.total_topup)) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-red-500">
                      {Number(c.total_spent) > 0 ? "−" + formatMoney(Number(c.total_spent)) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {Number(c.balance) > 0 ? formatMoney(Number(c.balance)) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      {c.subscription_expires && new Date(c.subscription_expires) > new Date() ? (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          до {new Date(c.subscription_expires).toLocaleDateString("ru-RU")}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {c.paid_tools ? (
                        <div className="flex flex-wrap gap-1">
                          {c.paid_tools.split(",").filter(Boolean).map(t => (
                            <span key={t} className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-violet-100 text-violet-700">
                              {TOOL_LABELS[t.trim()] || t.trim()}
                            </span>
                          ))}
                        </div>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-6 py-4 text-right">{c.payments_count}</td>
                    <td className="px-6 py-4 text-right font-semibold text-primary">
                      {Number(c.total_paid) > 0 ? formatMoney(Number(c.total_paid)) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onDeleteClient(c)}
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
    </>
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
