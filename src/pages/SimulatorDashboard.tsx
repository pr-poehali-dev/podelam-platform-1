import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { simulatorApi } from '@/lib/simulatorApi';
import {
  checkAccess, getBalance, syncFromServer, payForSimulator,
  hasSimulatorAccess, simulatorAccessExpires, SIMULATOR_PRICE, SIMULATOR_DAYS,
} from '@/lib/access';
import BalanceTopUpModal from '@/components/BalanceTopUpModal';
import Icon from '@/components/ui/icon';

interface Scenario {
  id: number;
  title: string;
  type: string;
  period: number;
  created_at: string;
  variants: { id: number; name: string }[];
  last_result: { id: number } | null;
}

const GUIDE_STEPS = [
  { icon: 'Layers', title: 'Выберите тип решения', text: 'Недвижимость, работа, бизнес, авто, переезд — или свободный сценарий' },
  { icon: 'SlidersHorizontal', title: 'Задайте параметры', text: 'Доходы, расходы, кредит, инвестиции — незаполненные поля используют умные значения по умолчанию' },
  { icon: 'GitCompare', title: 'Сравните варианты', text: 'Добавьте до 3 сценариев — система просчитает каждый на 5–30 лет вперёд' },
  { icon: 'BarChart2', title: 'Получите результат', text: 'Графики капитала, таблицы, рейтинг каждого сценария и автоматическая рекомендация' },
  { icon: 'FileDown', title: 'Скачайте PDF', text: 'Экспортируйте результаты для себя или для обсуждения с финансовым консультантом' },
];

export default function SimulatorDashboard() {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [balance, setBalance] = useState(0);
  const [paying, setPaying] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [accessExpires, setAccessExpires] = useState<Date | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    const u = localStorage.getItem('pdd_user');
    if (!u) { navigate('/auth'); return; }
    refresh();
    load();
  }, []);

  function refresh() {
    const access = checkAccess('simulator');
    setHasAccess(access !== 'locked');
    setBalance(getBalance());
    setAccessExpires(simulatorAccessExpires());
  }

  async function load() {
    setLoading(true);
    const data = await simulatorApi.list();
    setScenarios(data.scenarios || []);
    setLoading(false);
  }

  async function handleDelete(id: number) {
    setDeleting(id);
    await simulatorApi.delete(id);
    await load();
    setDeleting(null);
  }

  function requireAccess(action: string) {
    if (hasAccess) {
      executeAction(action);
    } else {
      setPendingAction(action);
      setShowPayment(true);
    }
  }

  function executeAction(action: string) {
    if (action === 'create') {
      navigate('/pro/simulator/create');
    } else if (action.startsWith('edit:')) {
      navigate(`/pro/simulator/edit?id=${action.split(':')[1]}`);
    }
  }

  async function handlePaymentConfirm() {
    setPaying(true);
    await syncFromServer().catch(() => {});
    setBalance(getBalance());
    if (getBalance() < SIMULATOR_PRICE) {
      setPaying(false);
      setShowPayment(false);
      setShowTopUp(true);
      return;
    }
    const ok = await payForSimulator();
    setPaying(false);
    if (ok) {
      refresh();
      setShowPayment(false);
      if (pendingAction) executeAction(pendingAction);
      setPendingAction(null);
    }
  }

  const active = scenarios.filter(s => s.title !== '[удалён]');
  const withResults = active.filter(s => s.last_result);

  return (
    <div className="min-h-screen" style={{ background: 'hsl(var(--background))' }}>
      <div className="max-w-4xl mx-auto px-4 py-6 pb-12">

        <button onClick={() => navigate('/cabinet')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <Icon name="ChevronLeft" size={16} /> Личный кабинет
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Симулятор жизненных решений</h1>
        <p className="text-muted-foreground text-sm mt-1">Просчитайте последствия решений на годы вперёд</p>

        {hasAccess && accessExpires && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-green-700">
            <Icon name="CheckCircle2" size={16} />
            Доступ активен до {accessExpires.toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        )}

        {!hasAccess && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-amber-700">
            <Icon name="Lock" size={16} />
            Для создания и редактирования сценариев нужен доступ — {SIMULATOR_PRICE} ₽ / {SIMULATOR_DAYS} дней
          </div>
        )}

        {/* Как пользоваться — всегда видно */}
        <div className="mt-6">
          <h2 className="text-base font-semibold text-foreground mb-3">Как пользоваться</h2>
          <div className="grid gap-2">
            {GUIDE_STEPS.map((s, i) => (
              <div key={i} className="flex gap-3 items-start bg-card border border-border rounded-xl p-3.5">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{s.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Кнопка создания — всегда видна */}
        <button
          onClick={() => requireAccess('create')}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-primary text-white rounded-xl py-4 text-base font-medium hover:opacity-90 transition-opacity"
        >
          <Icon name="Plus" size={20} />
          Создать новый сценарий
          {!hasAccess && <Icon name="Lock" size={14} className="ml-1 opacity-70" />}
        </button>

        {/* Список сценариев */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Ваши сценарии</h2>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Icon name="Loader2" size={24} className="animate-spin mr-2" /> Загрузка...
            </div>
          ) : active.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="FolderOpen" size={48} className="mx-auto mb-3 opacity-30" />
              <p>Нет сохранённых сценариев</p>
              <p className="text-sm mt-1">Создайте первый — есть готовые шаблоны</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {active.map(sc => (
                <div key={sc.id} className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{sc.title}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Горизонт: {sc.period} лет · создан {new Date(sc.created_at).toLocaleDateString('ru')}
                      </p>
                      {sc.variants.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {sc.variants.map(v => (
                            <span key={v.id} className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">{v.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {sc.last_result && (
                      <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-lg shrink-0">Есть результат</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {sc.last_result && (
                      <button onClick={() => navigate(`/pro/simulator/result?scenario_id=${sc.id}`)}
                        className="flex-1 min-w-[120px] bg-primary text-white rounded-xl py-2 text-sm font-medium hover:opacity-90 transition-opacity">
                        Открыть результат
                      </button>
                    )}
                    {hasAccess ? (
                      <button onClick={() => navigate(`/pro/simulator/edit?id=${sc.id}`)}
                        className="px-4 border border-border rounded-xl py-2 text-sm text-foreground hover:bg-muted transition-colors">
                        Редактировать
                      </button>
                    ) : (
                      <button onClick={() => requireAccess(`edit:${sc.id}`)}
                        className="px-4 border border-border rounded-xl py-2 text-sm text-muted-foreground flex items-center gap-1.5">
                        <Icon name="Lock" size={12} /> Редактировать
                      </button>
                    )}
                    <button onClick={() => handleDelete(sc.id)} disabled={deleting === sc.id}
                      className="px-4 border border-destructive/30 text-destructive rounded-xl py-2 text-sm hover:bg-destructive/5 transition-colors">
                      {deleting === sc.id ? <Icon name="Loader2" size={14} className="animate-spin" /> : 'Удалить'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* История расчётов — всегда видна, только просмотр */}
        {withResults.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-foreground mb-4">История расчётов</h2>
            <div className="grid gap-3">
              {withResults.map(sc => (
                <div key={`h-${sc.id}`} onClick={() => navigate(`/pro/simulator/result?scenario_id=${sc.id}`)}
                  className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
                      <Icon name="CheckCircle2" size={18} className="text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{sc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {sc.period} лет · {sc.variants.length} вариант{sc.variants.length > 1 ? (sc.variants.length < 5 ? 'а' : 'ов') : ''}
                      </p>
                    </div>
                  </div>
                  <Icon name="ChevronRight" size={18} className="text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Модал оплаты */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowPayment(false); setPendingAction(null); }}>
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Icon name="Sparkles" size={28} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Доступ к симулятору</h3>
              <p className="text-sm text-muted-foreground mt-1">Создание и редактирование сценариев</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 mb-5">
              <div className="text-center">
                <span className="text-3xl font-black text-foreground">{SIMULATOR_PRICE} ₽</span>
                <span className="text-sm text-muted-foreground ml-1">/ {SIMULATOR_DAYS} дней</span>
              </div>
              <div className="text-xs text-muted-foreground text-center mt-2 space-y-0.5">
                <p>До 20 сценариев · До 3 вариантов · PDF-экспорт</p>
              </div>
            </div>
            <button
              onClick={handlePaymentConfirm}
              disabled={paying}
              className="w-full bg-primary text-white rounded-xl py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {paying
                ? <span className="flex items-center justify-center gap-2"><Icon name="Loader2" size={16} className="animate-spin" />Оплачиваем...</span>
                : balance >= SIMULATOR_PRICE
                  ? `Списать ${SIMULATOR_PRICE} ₽ с баланса`
                  : 'Пополнить баланс'
              }
            </button>
            {balance > 0 && balance < SIMULATOR_PRICE && (
              <p className="text-center text-xs text-muted-foreground mt-2">На балансе: {balance} ₽ — не хватает {SIMULATOR_PRICE - balance} ₽</p>
            )}
            {balance === 0 && (
              <p className="text-center text-xs text-muted-foreground mt-2">Баланс: 0 ₽</p>
            )}
            <button onClick={() => { setShowPayment(false); setPendingAction(null); }} className="w-full text-center text-sm text-muted-foreground mt-3 hover:text-foreground transition-colors">
              Отмена
            </button>
          </div>
        </div>
      )}

      {showTopUp && (
        <BalanceTopUpModal
          onClose={() => setShowTopUp(false)}
          onSuccess={() => { setShowTopUp(false); refresh(); }}
        />
      )}
    </div>
  );
}
