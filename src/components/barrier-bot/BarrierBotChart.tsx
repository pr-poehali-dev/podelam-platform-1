import { Step } from "./barrierBotEngine";

type Props = {
  steps: Step[];
  breakStep: number;
  newY?: number;
};

export default function BarrierBotChart({ steps, breakStep, newY }: Props) {
  const W = 320;
  const H = 200;
  const PAD = { top: 20, right: 20, bottom: 36, left: 36 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  if (steps.length === 0) return null;

  const maxX = 10;
  const maxY = 10;

  const toSvgX = (i: number) => PAD.left + (i / (steps.length - 1 || 1)) * chartW;
  const toSvgY = (val: number) => PAD.top + chartH - (val / maxY) * chartH;

  const xPath = steps.map((s, i) => `${i === 0 ? "M" : "L"}${toSvgX(i)},${toSvgY(s.x)}`).join(" ");
  const yPath = steps.map((s, i) => `${i === 0 ? "M" : "L"}${toSvgX(i)},${toSvgY(s.y)}`).join(" ");

  const newYPath = newY !== undefined
    ? steps.map((s, i) => {
        const val = i === breakStep ? newY : s.y;
        return `${i === 0 ? "M" : "L"}${toSvgX(i)},${toSvgY(val)}`;
      }).join(" ")
    : null;

  const breakX = toSvgX(breakStep);

  return (
    <div className="bg-gray-50 rounded-2xl p-3 mt-3">
      <svg width={W} height={H} className="overflow-visible max-w-full">
        {/* Grid */}
        {[0, 2, 4, 6, 8, 10].map((v) => (
          <g key={v}>
            <line
              x1={PAD.left} y1={toSvgY(v)}
              x2={PAD.left + chartW} y2={toSvgY(v)}
              stroke="#e5e7eb" strokeWidth="1"
            />
            <text x={PAD.left - 6} y={toSvgY(v) + 4} fontSize="9" fill="#9ca3af" textAnchor="end">{v}</text>
          </g>
        ))}

        {/* Step labels */}
        {steps.map((_, i) => (
          <text
            key={i}
            x={toSvgX(i)} y={H - 4}
            fontSize="9" fill="#9ca3af" textAnchor="middle"
          >
            {i + 1}
          </text>
        ))}

        {/* Break point line */}
        {breakStep >= 0 && (
          <line
            x1={breakX} y1={PAD.top}
            x2={breakX} y2={PAD.top + chartH}
            stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4,3"
            opacity="0.6"
          />
        )}

        {/* X line (прогресс) — синий */}
        <path d={xPath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Y line (тревога) — красный */}
        <path d={yPath} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* New Y line (пересчёт) — зелёный */}
        {newYPath && (
          <path d={newYPath} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5,3" />
        )}

        {/* Dots X */}
        {steps.map((s, i) => (
          <circle key={`x${i}`} cx={toSvgX(i)} cy={toSvgY(s.x)} r="4" fill="#6366f1" />
        ))}

        {/* Dots Y */}
        {steps.map((s, i) => (
          <circle key={`y${i}`} cx={toSvgX(i)} cy={toSvgY(s.y)} r="4" fill="#f43f5e" />
        ))}
      </svg>

      {/* Легенда */}
      <div className="flex gap-4 mt-1 px-1 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="w-4 h-0.5 bg-indigo-500 inline-block rounded" /> Прогресс (X)
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="w-4 h-0.5 bg-rose-500 inline-block rounded" /> Тревога (Y)
        </div>
        {newYPath && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-4 h-0.5 bg-green-500 inline-block rounded border-dashed" /> Y с опорой
          </div>
        )}
        {breakStep >= 0 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-0.5 h-3 bg-rose-400 inline-block" /> Точка срыва
          </div>
        )}
      </div>
    </div>
  );
}
