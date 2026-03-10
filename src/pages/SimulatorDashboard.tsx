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
  { icon: 'SlidersHorizontal', title: 'Задайте параметры', text: 'Доходы, расходы, кредит, инвестиции — мы подставим умные значения по умолчанию' },
  { icon: 'GitCompare', title: 'Сравните варианты', text: 'Добавьте до 3 сценариев — система просчитает каждый на 5–30 лет вперёд' },
  { icon: 'BarChart2', title: 'Получите результат', text: 'Графики капитала, таблицы, рейтинг каждого сценария и рекомендация — лучший вариант определён автоматически' },
  { icon: 'FileDown', title: 'Скачайте PDF', text: 'Все результаты можно скачать в PDF для себя или обсуждения с финансовым консультантом' },
];

const WHAT_YOU_GET = [
  'Полная финансовая модель на 5–30 лет',
  'Расчёт капитала, инвестиций, кредитов',
  'Индекс качества жизни и стресса',
  'Сравнение до 3 вариантов одновременно',
  'Графики и таблицы по годам',
  'Экспорт результатов в PDF',
  'До 20 сценариев за 7 дней',
  '6 готовых шаблонов решений',
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

  async function handleBuy() {
    setPaying(true);
    await syncFromServer().catch(() => {});
    setBalance(getBalance());
    if (getBalance() < SIMULATOR_PRICE) {
      setPaying(false);
      setShowTopUp(true);
      return;
    }
    const ok = await payForSimulator();
    setPaying(false);
    if (ok) refresh();
  }

  function handleCreate() {
    if (!hasAccess) return;
    navigate('/pro/simulator/create');
  }

  const active = scenarios.filter(s => s.title !== '[удалён]');
  const withResults = active.filter(s => s.last_result);

  return (
    <div className="min-h-screen" style={{ background: 'hsl(var(--background))' }}>
      <div className="max-w-4xl mx-auto px-4 py-6 pb-12">

        {/* Шапка */}
        <button onClick={() => navigate('/cabinet')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <Icon name="ChevronLeft" size={16} /> Личный кабинет
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Симулятор жизненных решений</h1>
        <p className="text-muted-foreground text-sm mt-1">Просчитайте последствия решений на годы вперёд</p>

        {/* Статус доступа */}
        {hasAccess && accessExpires && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-green-700">
            <Icon name="CheckCircle2" size={16} />
            Доступ активен до {accessExpires.toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        )}

        {/* ─── Если НЕТ доступа: инструкция + paywall ─── */}
        {!hasAccess && (
          <>
            {/* Как это работает */}
            <div className="mt-6">
              <h2 className="text-base font-semibold text-foreground mb-4">Как работает симулятор</h2>
              <div className="grid gap-3">
                {GUIDE_STEPS.map((s, i) => (
                  <div key={i} className="flex gap-3 items-start bg-card border border-border rounded-xl p-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon name={s.icon as never} size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{s.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Что вы получите */}
            <div className="mt-6">
              <h2 className="text-base font-semibold text-foreground mb-3">Что вы получите</h2>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {WHAT_YOU_GET.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Какие сценарии можно создать */}
            <div className="mt-6">
              <h2 className="text-base font-semibold text-foreground mb-3">Какие решения можно моделировать</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { icon: 'Home', label: 'Ипотека или аренда' },
                  { icon: 'Briefcase', label: 'Смена работы' },
                  { icon: 'TrendingUp', label: 'Бизнес или найм' },
                  { icon: 'Car', label: 'Авто: кредит или копить' },
                  { icon: 'MapPin', label: 'Переезд в другой город' },
                  { icon: 'GraduationCap', label: 'Инвестиции в обучение' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-3">
                    <Icon name={s.icon as never} size={16} className="text-primary shrink-0" />
                    <span className="text-xs font-medium text-foreground leading-tight">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Пример результата */}
            <div className="mt-6">
              <h2 className="text-base font-semibold text-foreground mb-3">Пример результата</h2>
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <p className="text-sm text-muted-foreground">Для каждого сценария вы увидите:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: 'Чистый капитал', val: '12.4 млн ₽', color: 'text-foreground' },
                    { label: 'Суммарный доход', val: '48.2 млн ₽', color: 'text-emerald-600' },
                    { label: 'Рейтинг сценария', val: '7.8/10', color: 'text-primary' },
                    { label: 'Качество жизни', val: '6.5/10', color: 'text-amber-600' },
                  ].map((s, i) => (
                    <div key={i} className="bg-muted/50 rounded-lg p-2.5">
                      <p className="text-muted-foreground text-[10px]">{s.label}</p>
                      <p className={`font-bold text-sm mt-0.5 ${s.color}`}>{s.val}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">+ графики динамики капитала, таблица по годам, radar-диаграмма качества жизни</p>
              </div>
            </div>

            {/* PAYWALL */}
            <div className="mt-8 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5">
              <div className="text-center mb-4">
                <div className="text-3xl font-black text-foreground">{SIMULATOR_PRICE} ₽</div>
                <div className="text-sm text-muted-foreground">/ {SIMULATOR_DAYS} дней доступа</div>
              </div>
              <button
                onClick={handleBuy}
                disabled={paying}
                className="w-full bg-primary text-white rounded-xl py-4 text-base font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {paying
                  ? <span className="flex items-center justify-center gap-2"><Icon name="Loader2" size={18} className="animate-spin" />Списываем...</span>
                  : balance >= SIMULATOR_PRICE
                    ? `Списать ${SIMULATOR_PRICE} ₽ с баланса`
                    : 'Пополнить баланс'
                }
              </button>
              {balance > 0 && balance < SIMULATOR_PRICE && (
                <p className="text-center text-xs text-muted-foreground mt-2">На балансе: {balance} ₽ — не хватает {SIMULATOR_PRICE - balance} ₽</p>
              )}
              {balance === 0 && (
                <p className="text-center text-xs text-muted-foreground mt-2">Баланс: 0 ₽ — пополните, чтобы начать</p>
              )}
            </div>
          </>
        )}

        {/* ─── Если ЕСТЬ доступ: кнопка создания и список ─── */}
        {hasAccess && (
          <>
            <button
              onClick={handleCreate}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-primary text-white rounded-xl py-4 text-base font-medium hover:opacity-90 transition-opacity"
            >
              <Icon name="Plus" size={20} />
              Создать новый сценарий
            </button>

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
                        {sc.last_result ? (
                          <button onClick={() => navigate(`/pro/simulator/result?scenario_id=${sc.id}`)}
                            className="flex-1 min-w-[120px] bg-primary text-white rounded-xl py-2 text-sm font-medium hover:opacity-90 transition-opacity">
                            Открыть результат
                          </button>
                        ) : (
                          <button onClick={() => navigate(`/pro/simulator/edit?id=${sc.id}`)}
                            className="flex-1 min-w-[120px] bg-primary text-white rounded-xl py-2 text-sm font-medium hover:opacity-90 transition-opacity">
                            Открыть
                          </button>
                        )}
                        <button onClick={() => navigate(`/pro/simulator/edit?id=${sc.id}`)}
                          className="px-4 border border-border rounded-xl py-2 text-sm text-foreground hover:bg-muted transition-colors">
                          Редактировать
                        </button>
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
          </>
        )}
      </div>

      {showTopUp && (
        <BalanceTopUpModal
          onClose={() => setShowTopUp(false)}
          onSuccess={() => { setShowTopUp(false); refresh(); }}
        />
      )}
    </div>
  );
}
