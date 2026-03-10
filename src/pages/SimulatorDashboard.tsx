import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { simulatorApi } from '@/lib/simulatorApi';
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

export default function SimulatorDashboard() {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    const u = localStorage.getItem('pdd_user');
    if (!u) { navigate('/auth'); return; }
    load();
  }, []);

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

  return (
    <div className="min-h-screen" style={{ background: 'hsl(var(--background))' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="mb-2">
          <button onClick={() => navigate('/cabinet')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <Icon name="ChevronLeft" size={16} /> Личный кабинет
          </button>
          <h1 className="text-2xl font-bold text-foreground">Симулятор жизненных решений</h1>
          <p className="text-muted-foreground mt-1">Просчитайте последствия ваших решений на годы вперёд</p>
        </div>

        {/* Кнопка создать */}
        <button
          onClick={() => navigate('/pro/simulator/create')}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-primary text-white rounded-xl py-4 text-base font-medium hover:opacity-90 transition-opacity"
        >
          <Icon name="Plus" size={20} />
          Создать новый сценарий
        </button>

        {/* Список сценариев */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Ваши сценарии</h2>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Icon name="Loader2" size={24} className="animate-spin mr-2" /> Загрузка...
            </div>
          ) : scenarios.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Icon name="FolderOpen" size={48} className="mx-auto mb-3 opacity-30" />
              <p>Нет сохранённых сценариев</p>
              <p className="text-sm mt-1">Создайте первый и начните моделировать будущее</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {scenarios.filter(s => s.title !== '[удалён]').map(sc => (
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
                  <div className="flex gap-2 mt-4">
                    {sc.last_result ? (
                      <button
                        onClick={() => navigate(`/pro/simulator/result?scenario_id=${sc.id}`)}
                        className="flex-1 bg-primary text-white rounded-xl py-2 text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        Открыть результат
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/pro/simulator/edit?id=${sc.id}`)}
                        className="flex-1 bg-primary text-white rounded-xl py-2 text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        Открыть
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/pro/simulator/edit?id=${sc.id}`)}
                      className="px-4 border border-border rounded-xl py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(sc.id)}
                      disabled={deleting === sc.id}
                      className="px-4 border border-destructive/30 text-destructive rounded-xl py-2 text-sm hover:bg-destructive/5 transition-colors"
                    >
                      {deleting === sc.id ? <Icon name="Loader2" size={14} className="animate-spin" /> : 'Удалить'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* История расчётов */}
        {!loading && scenarios.filter(s => s.title !== '[удалён]' && s.last_result).length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-foreground mb-4">История расчётов</h2>
            <div className="grid gap-3">
              {scenarios
                .filter(s => s.title !== '[удалён]' && s.last_result)
                .map(sc => (
                  <div
                    key={`history-${sc.id}`}
                    onClick={() => navigate(`/pro/simulator/result?scenario_id=${sc.id}`)}
                    className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
                        <Icon name="CheckCircle2" size={18} className="text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{sc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {sc.period} лет · {sc.variants.length} вариант{sc.variants.length > 1 ? (sc.variants.length < 5 ? 'а' : 'ов') : ''} · {new Date(sc.created_at).toLocaleDateString('ru')}
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
    </div>
  );
}