import { useState } from "react";
import { PROFILE_TEXTS } from "./barrierBotEngine";
import { BarrierSession } from "./BarrierBotHistory";

type Props = {
  sessions: BarrierSession[];
};

function avgY(s: BarrierSession) {
  if (!s.steps.length) return 0;
  return s.steps.reduce((acc, st) => acc + st.y, 0) / s.steps.length;
}

function avgX(s: BarrierSession) {
  if (!s.steps.length) return 0;
  return s.steps.reduce((acc, st) => acc + st.x, 0) / s.steps.length;
}

function breakY(s: BarrierSession) {
  return s.steps[s.breakStep]?.y ?? 0;
}

function breakX(s: BarrierSession) {
  return s.steps[s.breakStep]?.x ?? 0;
}

// Совмещённый SVG-график двух сессий
function CompareChart({ a, b, labelA, labelB }: { a: BarrierSession; b: BarrierSession; labelA: string; labelB: string }) {
  const W = 340;
  const H = 200;
  const PAD = { top: 20, right: 20, bottom: 36, left: 36 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxLen = Math.max(a.steps.length, b.steps.length, 2);
  const toSvgX = (i: number, total: number) => PAD.left + (i / (total - 1 || 1)) * chartW;
  const toSvgY = (val: number) => PAD.top + chartH - (val / 10) * chartH;

  const pathY = (s: BarrierSession) =>
    s.steps.map((st, i) => `${i === 0 ? "M" : "L"}${toSvgX(i, s.steps.length)},${toSvgY(st.y)}`).join(" ");

  return (
    <div className="bg-gray-50 rounded-2xl p-3">
      <p className="text-xs text-gray-500 mb-2 font-medium">Динамика тревоги (Y) по шагам</p>
      <svg width={W} height={H} className="overflow-visible max-w-full">
        {[0, 2, 4, 6, 8, 10].map((v) => (
          <g key={v}>
            <line x1={PAD.left} y1={toSvgY(v)} x2={PAD.left + chartW} y2={toSvgY(v)} stroke="#e5e7eb" strokeWidth="1" />
            <text x={PAD.left - 6} y={toSvgY(v) + 4} fontSize="9" fill="#9ca3af" textAnchor="end">{v}</text>
          </g>
        ))}

        {/* Сессия A — синяя */}
        <path d={pathY(a)} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {a.steps.map((st, i) => (
          <circle key={`ay${i}`} cx={toSvgX(i, a.steps.length)} cy={toSvgY(st.y)} r="3.5" fill="#6366f1" />
        ))}
        {a.breakStep >= 0 && (
          <line
            x1={toSvgX(a.breakStep, a.steps.length)} y1={PAD.top}
            x2={toSvgX(a.breakStep, a.steps.length)} y2={PAD.top + chartH}
            stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.5"
          />
        )}

        {/* Сессия B — оранжевая */}
        <path d={pathY(b)} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {b.steps.map((st, i) => (
          <circle key={`by${i}`} cx={toSvgX(i, b.steps.length)} cy={toSvgY(st.y)} r="3.5" fill="#f97316" />
        ))}
        {b.breakStep >= 0 && (
          <line
            x1={toSvgX(b.breakStep, b.steps.length)} y1={PAD.top}
            x2={toSvgX(b.breakStep, b.steps.length)} y2={PAD.top + chartH}
            stroke="#f97316" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.5"
          />
        )}

        {/* Шаги по оси X */}
        {Array.from({ length: maxLen }, (_, i) => (
          <text key={i} x={PAD.left + (i / (maxLen - 1 || 1)) * chartW} y={H - 4} fontSize="9" fill="#d1d5db" textAnchor="middle">{i + 1}</text>
        ))}
      </svg>

      <div className="flex gap-4 mt-1 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="w-4 h-0.5 bg-indigo-500 inline-block rounded" /> {labelA}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="w-4 h-0.5 bg-orange-500 inline-block rounded" /> {labelB}
        </div>
      </div>
    </div>
  );
}

function Delta({ value, inverse = false, suffix = "" }: { value: number; inverse?: boolean; suffix?: string }) {
  const improved = inverse ? value < 0 : value > 0;
  const neutral = Math.abs(value) < 0.1;
  const sign = value > 0 ? "+" : "";
  return (
    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-lg ${
      neutral ? "bg-gray-100 text-gray-500"
      : improved ? "bg-green-100 text-green-700"
      : "bg-rose-100 text-rose-700"
    }`}>
      {sign}{value.toFixed(1)}{suffix}
    </span>
  );
}

export default function BarrierBotCompare({ sessions }: Props) {
  const [idxA, setIdxA] = useState(0);
  const [idxB, setIdxB] = useState(Math.min(1, sessions.length - 1));

  if (sessions.length < 2) {
    return (
      <div className="text-center py-10 px-6">
        <p className="text-sm text-gray-400">Для сравнения нужно минимум 2 завершённые сессии.</p>
        <p className="text-xs text-gray-300 mt-1">Пройди ещё один анализ — и здесь появится сравнение.</p>
      </div>
    );
  }

  const a = sessions[idxA];
  const b = sessions[idxB];

  const deltaAvgY = avgY(b) - avgY(a);
  const deltaAvgX = avgX(b) - avgX(a);
  const deltaBreakY = breakY(b) - breakY(a);
  const deltaBreakX = breakX(b) - breakX(a);
  const deltaSteps = b.steps.length - a.steps.length;

  const profileA = PROFILE_TEXTS[a.profile];
  const profileB = PROFILE_TEXTS[b.profile];
  const profileChanged = a.profile !== b.profile;

  const labelA = `#${idxA + 1} (${a.date})`;
  const labelB = `#${idxB + 1} (${b.date})`;

  return (
    <div className="space-y-4 px-4 py-4">
      {/* Выбор сессий */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Сессия A", idx: idxA, setIdx: setIdxA, color: "indigo" },
          { label: "Сессия B", idx: idxB, setIdx: setIdxB, color: "orange" },
        ].map(({ label, idx, setIdx, color }) => (
          <div key={label}>
            <p className={`text-xs font-semibold mb-1 ${color === "indigo" ? "text-indigo-600" : "text-orange-600"}`}>{label}</p>
            <select
              value={idx}
              onChange={(e) => setIdx(Number(e.target.value))}
              className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-indigo-400"
            >
              {sessions.map((s, i) => (
                <option key={i} value={i}>#{i + 1} · {s.date} · {s.context}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* График */}
      <CompareChart a={a} b={b} labelA={labelA} labelB={labelB} />

      {/* Метрики */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Изменение показателей</p>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { label: "Средняя тревога (Y)", valA: avgY(a), valB: avgY(b), delta: deltaAvgY, inverse: true },
            { label: "Средний прогресс (X)", valA: avgX(a), valB: avgX(b), delta: deltaAvgX, inverse: false },
            { label: "Тревога в точке срыва", valA: breakY(a), valB: breakY(b), delta: deltaBreakY, inverse: true },
            { label: "Прогресс в точке срыва", valA: breakX(a), valB: breakX(b), delta: deltaBreakX, inverse: false },
            { label: "Кол-во шагов", valA: a.steps.length, valB: b.steps.length, delta: deltaSteps, inverse: false },
          ].map(({ label, valA, valB, delta, inverse }) => (
            <div key={label} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs text-gray-600">{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-indigo-500 font-medium">{typeof valA === "number" ? valA.toFixed(1) : valA}</span>
                <span className="text-gray-300 text-xs">→</span>
                <span className="text-xs text-orange-500 font-medium">{typeof valB === "number" ? valB.toFixed(1) : valB}</span>
                <Delta value={delta} inverse={inverse} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Профиль */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Психологический профиль</p>
        </div>
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-xs font-bold text-indigo-600 shrink-0 mt-0.5">A</span>
            <p className="text-xs text-gray-700">{profileA?.title}</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs font-bold text-orange-500 shrink-0 mt-0.5">B</span>
            <p className="text-xs text-gray-700">{profileB?.title}</p>
          </div>
          {profileChanged ? (
            <div className="mt-1 text-xs text-green-700 bg-green-50 rounded-xl px-3 py-2 font-medium">
              Профиль изменился — это сигнал роста.
            </div>
          ) : (
            <div className="mt-1 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
              Профиль остался прежним. Продолжай работу над этим паттерном.
            </div>
          )}
        </div>
      </div>

      {/* Слабость */}
      {a.mainWeakness !== b.mainWeakness && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 text-xs text-gray-700 space-y-1">
          <p className="font-semibold text-gray-500 uppercase tracking-wide text-[10px] mb-2">Слабая реакция</p>
          <div className="flex items-center gap-2">
            <span className="text-indigo-600 font-bold">A</span>
            <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full">{a.mainWeakness}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-500 font-bold">B</span>
            <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full">{b.mainWeakness}</span>
          </div>
        </div>
      )}
    </div>
  );
}
