import { COLORS, COMPARE_ROWS, type Results } from './simulatorResultTypes';

interface Props {
  results: Results;
  bestIdx: number;
}

export default function SimulatorResultCompare({ results, bestIdx }: Props) {
  return (
    <>
      {/* Мобайл: карточки */}
      <div className="sm:hidden space-y-3">
        {COMPARE_ROWS.map(row => (
          <div key={row.key} className="bg-card border border-border rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-2">{row.label}</p>
            <div className="flex gap-2 flex-wrap">
              {results.variants.map((v, i) => (
                <div key={v.variant_id} className="flex-1 min-w-[80px]">
                  <div className="text-[10px] mb-0.5" style={{ color: COLORS[i] }}>{v.name}</div>
                  <div className={`text-sm font-semibold ${i === bestIdx && row.key === 'scenario_score' ? 'text-primary' : 'text-foreground'}`}>
                    {row.fmt(v.final[row.key] as number)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Десктоп: таблица */}
      <div className="hidden sm:block overflow-x-auto bg-card border border-border rounded-2xl">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-sm font-medium text-muted-foreground py-3 px-5 min-w-[160px]">Показатель</th>
              {results.variants.map((v, i) => (
                <th key={v.variant_id} className="text-sm font-semibold py-3 px-4 text-center" style={{ color: COLORS[i] }}>{v.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map(row => (
              <tr key={row.key} className="border-t border-border">
                <td className="py-3 px-5 text-sm text-muted-foreground">{row.label}</td>
                {results.variants.map(v => (
                  <td key={v.variant_id} className="py-3 px-4 text-sm font-medium text-center text-foreground">
                    {row.fmt(v.final[row.key] as number)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
