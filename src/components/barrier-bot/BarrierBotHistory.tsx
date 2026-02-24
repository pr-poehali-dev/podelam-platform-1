import { useState } from "react";
import { PROFILE_TEXTS, Step } from "./barrierBotEngine";
import BarrierBotChart from "./BarrierBotChart";
import BarrierBotCompare from "./BarrierBotCompare";
import Icon from "@/components/ui/icon";

export type BarrierSession = {
  date: string;
  context: string;
  mainStrength: string[];
  mainWeakness: string;
  additionalStrength: string[];
  breakStep: number;
  profile: string;
  steps: Step[];
};

type Props = {
  sessions: BarrierSession[];
  onNewSession: () => void;
};

function exportPDF(session: BarrierSession, index: number) {
  const profile = PROFILE_TEXTS[session.profile];

  const svgW = 400;
  const svgH = 220;
  const PAD = { top: 24, right: 24, bottom: 40, left: 40 };
  const chartW = svgW - PAD.left - PAD.right;
  const chartH = svgH - PAD.top - PAD.bottom;
  const steps = session.steps;
  const bp = session.breakStep;

  const toSvgX = (i: number) => PAD.left + (i / (steps.length - 1 || 1)) * chartW;
  const toSvgY = (val: number) => PAD.top + chartH - (val / 10) * chartH;

  const xPath = steps.map((s, i) => `${i === 0 ? "M" : "L"}${toSvgX(i)},${toSvgY(s.x)}`).join(" ");
  const yPath = steps.map((s, i) => `${i === 0 ? "M" : "L"}${toSvgX(i)},${toSvgY(s.y)}`).join(" ");

  const gridLines = [0, 2, 4, 6, 8, 10].map(v => `
    <line x1="${PAD.left}" y1="${toSvgY(v)}" x2="${PAD.left + chartW}" y2="${toSvgY(v)}" stroke="#e5e7eb" stroke-width="1"/>
    <text x="${PAD.left - 6}" y="${toSvgY(v) + 4}" font-size="9" fill="#9ca3af" text-anchor="end">${v}</text>
  `).join("");

  const stepLabels = steps.map((_, i) => `
    <text x="${toSvgX(i)}" y="${svgH - 8}" font-size="9" fill="#9ca3af" text-anchor="middle">${i + 1}</text>
  `).join("");

  const breakLine = bp >= 0 ? `
    <line x1="${toSvgX(bp)}" y1="${PAD.top}" x2="${toSvgX(bp)}" y2="${PAD.top + chartH}"
      stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.6"/>
  ` : "";

  const dotsX = steps.map((s, i) => `<circle cx="${toSvgX(i)}" cy="${toSvgY(s.x)}" r="4" fill="#6366f1"/>`).join("");
  const dotsY = steps.map((s, i) => `<circle cx="${toSvgX(i)}" cy="${toSvgY(s.y)}" r="4" fill="#f43f5e"/>`).join("");

  const stepsTable = steps.map((s, i) => `
    <tr style="background:${i % 2 === 0 ? '#f9fafb' : 'white'}">
      <td style="padding:6px 10px;border:1px solid #e5e7eb;font-weight:600;">${i + 1}${bp === i ? ' ⚡' : ''}</td>
      <td style="padding:6px 10px;border:1px solid #e5e7eb;">${s.text}</td>
      <td style="padding:6px 10px;border:1px solid #e5e7eb;text-align:center;color:#6366f1;font-weight:600;">${s.x}</td>
      <td style="padding:6px 10px;border:1px solid #e5e7eb;text-align:center;color:#f43f5e;font-weight:600;">${s.y}</td>
    </tr>
  `).join("");

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8"/>
<title>Анализ барьеров — ${session.date}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Inter, sans-serif; color: #111; background: white; padding: 32px; max-width: 720px; margin: 0 auto; }
  h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
  .section { margin-bottom: 20px; }
  .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #9ca3af; font-weight: 600; margin-bottom: 8px; }
  .card { background: #f9fafb; border-radius: 12px; padding: 14px 16px; }
  .profile-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
  .profile-desc { font-size: 13px; color: #374151; line-height: 1.6; }
  .tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .tag { font-size: 12px; padding: 3px 10px; border-radius: 20px; font-weight: 500; }
  .tag-blue { background: #eff6ff; color: #2563eb; }
  .tag-red { background: #fff1f2; color: #e11d48; }
  .tag-green { background: #f0fdf4; color: #16a34a; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #f3f4f6; padding: 8px 10px; border: 1px solid #e5e7eb; font-weight: 600; text-align: left; }
  .chart-wrap { background: #f9fafb; border-radius: 12px; padding: 12px; }
  .legend { display: flex; gap: 16px; margin-top: 8px; flex-wrap: wrap; }
  .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6b7280; }
  .legend-dot { width: 24px; height: 3px; border-radius: 2px; }
  @media print { body { padding: 16px; } }
</style>
</head>
<body>
<h1>Барьеры, тревоги и стресс</h1>
<p class="subtitle">Сессия #${index + 1} · ${session.date} · Сфера: ${session.context}</p>

<div class="section">
  <div class="section-title">Психологический профиль</div>
  <div class="card">
    <div class="profile-title">${profile?.title ?? '—'}</div>
    <div class="profile-desc">${profile?.desc ?? ''}</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Параметры</div>
  <div class="tags">
    ${session.mainStrength.map(s => `<span class="tag tag-blue">💪 ${s}</span>`).join("")}
    <span class="tag tag-red">⚡ ${session.mainWeakness}</span>
    ${session.additionalStrength.map(s => `<span class="tag tag-green">🛡 ${s}</span>`).join("")}
  </div>
</div>

<div class="section">
  <div class="section-title">График X–Y (прогресс и тревога)</div>
  <div class="chart-wrap">
    <svg width="${svgW}" height="${svgH}" style="max-width:100%;overflow:visible">
      ${gridLines}
      ${stepLabels}
      ${breakLine}
      <path d="${xPath}" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${yPath}" fill="none" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${dotsX}
      ${dotsY}
    </svg>
    <div class="legend">
      <div class="legend-item"><div class="legend-dot" style="background:#6366f1"></div>Прогресс (X)</div>
      <div class="legend-item"><div class="legend-dot" style="background:#f43f5e"></div>Тревога (Y)</div>
      ${bp >= 0 ? `<div class="legend-item"><div class="legend-dot" style="background:#f43f5e;height:12px;width:2px"></div>Точка срыва (шаг ${bp + 1})</div>` : ""}
    </div>
  </div>
</div>

<div class="section">
  <div class="section-title">Шаги</div>
  <table>
    <thead>
      <tr>
        <th>#</th><th>Описание</th><th style="text-align:center">X</th><th style="text-align:center">Y</th>
      </tr>
    </thead>
    <tbody>${stepsTable}</tbody>
  </table>
</div>

<script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

export default function BarrierBotHistory({ sessions, onNewSession }: Props) {
  const [tab, setTab] = useState<"list" | "compare">("list");

  if (sessions.length === 0) return null;

  return (
    <div className="py-4 space-y-4">
      {/* Шапка */}
      <div className="flex items-center justify-between px-4">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setTab("list")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${tab === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
          >
            Все сессии
          </button>
          {sessions.length >= 2 && (
            <button
              onClick={() => setTab("compare")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${tab === "compare" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
            >
              Сравнение
            </button>
          )}
        </div>
        <button
          onClick={onNewSession}
          className="flex items-center gap-1.5 text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors"
        >
          <Icon name="Plus" size={16} />
          Новая
        </button>
      </div>

      {tab === "compare" && <BarrierBotCompare sessions={sessions} />}

      {tab === "list" && <div className="space-y-3 px-4">
        {sessions.length >= 2 && (
          <div className="rounded-2xl overflow-hidden border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 px-4 py-4 flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-lg">🧠</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-violet-900 mb-1">Похожий барьер возвращается снова?</p>
              <p className="text-xs text-violet-700 leading-relaxed mb-3">
                Когда до успеха остаётся чуть-чуть, но стресс нарастает, энергия уходит и сложно опираться на свои сильные стороны — это не слабость. Это сигнал, что барьер глубже, чем кажется.
              </p>
              <p className="text-xs text-violet-600 leading-relaxed mb-3">
                Наши коучи с психологическим образованием помогают разобраться с повторяющимися паттернами и выйти на новый уровень без выгорания.
              </p>
              <a
                href="https://annauvarova.ru/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-colors"
              >
                <Icon name="MessageCircle" size={13} />
                Поговорить с коучем
              </a>
            </div>
          </div>
        )}

        {[...sessions].reverse().map((s, revIdx) => {
          const idx = sessions.length - 1 - revIdx;
          const profile = PROFILE_TEXTS[s.profile];
          return (
            <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                    Сессия #{idx + 1}
                  </span>
                  <span className="ml-2 text-xs text-gray-400">{s.date}</span>
                </div>
                <button
                  onClick={() => exportPDF(s, idx)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-rose-600 transition-colors font-medium"
                >
                  <Icon name="Download" size={14} />
                  PDF
                </button>
              </div>

              <div className="px-4 py-3 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500">Сфера:</span>
                  <span className="text-xs font-semibold text-gray-800">{s.context}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {s.mainStrength.map((str) => (
                    <span key={str} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                      💪 {str}
                    </span>
                  ))}
                  <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-medium">
                    ⚡ {s.mainWeakness}
                  </span>
                  {s.additionalStrength.map((str) => (
                    <span key={str} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      🛡 {str}
                    </span>
                  ))}
                </div>

                {profile && (
                  <p className="text-xs text-gray-600 font-medium">
                    Профиль: <span className="text-gray-900">{profile.title}</span>
                  </p>
                )}

                <BarrierBotChart steps={s.steps} breakStep={s.breakStep} />
              </div>
            </div>
          );
        })}
      </div>}
    </div>
  );
}