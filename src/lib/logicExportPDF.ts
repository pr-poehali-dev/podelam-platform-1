import type { LogicData, LogicResults, LogicLevel } from "@/lib/logicTrainerTypes";

const LEVEL_DESCRIPTIONS: Record<LogicLevel, string> = {
  "Интуитивное мышление":
    "Решения принимаются на основе интуиции и эмоций. Аргументация слабая, причинные связи не выстроены, альтернативы не рассматриваются.",
  "Частичная логика":
    "Есть элементы логического мышления, но системности нет. Аргументы частично обоснованы, когнитивные искажения влияют на выводы.",
  "Аналитическое":
    "Вы умеете выстраивать аргументацию и видите причинные связи. Для роста нужно углубить работу с альтернативными гипотезами.",
  "Системное":
    "Сильное логическое мышление: вы системно анализируете аргументы, строите причинные цепочки и проверяете данные.",
  "Стратегический аналитик":
    "Экспертный уровень аналитического мышления. Вы видите систему целиком, учитываете альтернативы и гибко корректируете выводы.",
};

const RADAR_LABELS = [
  "Аргументация",
  "Причинная логика",
  "Альтернативность",
  "Фактичность",
  "Гибкость",
  "Без искажений",
];

const INDEX_ROWS: {
  key: string;
  label: string;
  format: (v: number) => string;
  normalize: (v: number) => number;
  inverted?: boolean;
}[] = [
  { key: "ia", label: "Аргументированность", format: (v) => v.toFixed(2), normalize: (v) => Math.min(v / 25, 1) },
  { key: "ba", label: "Баланс аргументов", format: (v) => v.toFixed(2), normalize: (v) => Math.min(v, 1) },
  { key: "icl", label: "Причинная логика", format: (v) => v.toFixed(1), normalize: (v) => Math.min(v / 5, 1) },
  { key: "ial", label: "Альтернативность", format: (v) => v.toFixed(1), normalize: (v) => Math.min(v / 3, 1) },
  { key: "kf", label: "Фактичность", format: (v) => (v * 100).toFixed(0) + "%", normalize: (v) => v },
  { key: "inu", label: "Неопределённость", format: (v) => (v * 100).toFixed(0) + "%", normalize: (v) => v, inverted: true },
  { key: "iki", label: "Когнитивные искажения", format: (v) => (v * 100).toFixed(0) + "%", normalize: (v) => v, inverted: true },
  { key: "ilc", label: "Гибкость мышления", format: (v) => (v * 100).toFixed(0) + "%", normalize: (v) => v },
];

function getRingStroke(ilmp: number): string {
  if (ilmp >= 85) return "#6366f1";
  if (ilmp >= 70) return "#22c55e";
  if (ilmp >= 50) return "#f59e0b";
  if (ilmp >= 30) return "#f97316";
  return "#ef4444";
}

function getIndexInterpretation(key: string, raw: number): string {
  switch (key) {
    case "ia":
      if (raw >= 20) return "Отличная аргументированность. Ваши доводы хорошо подкреплены фактами и имеют высокую проверяемость.";
      if (raw >= 12) return "Средняя аргументированность. Часть аргументов основана на предположениях — попробуйте найти больше фактов.";
      return "Слабая аргументированность. Многие доводы не подкреплены фактами или имеют низкую проверяемость.";
    case "ba":
      if (raw >= 0.3 && raw <= 0.8) return "Хороший баланс аргументов «за» и «против». Вы рассматриваете вопрос объективно с разных сторон.";
      if (raw > 0.8) return "Аргументация смещена в одну сторону. Это может указывать на предвзятость — добавьте противоположные доводы.";
      return "Дисбаланс аргументов. Одна из сторон существенно перевешивает — проверьте, не упускаете ли вы важные контраргументы.";
    case "icl":
      if (raw >= 3) return "Сильная причинная логика. Вы выстроили качественные цепочки с подтверждёнными данными и альтернативными объяснениями.";
      if (raw >= 1.5) return "Причинные связи выстроены, но часть цепочек линейная или не подкреплена данными. Ищите альтернативные объяснения.";
      return "Причинная логика слабая. Цепочки линейные, данных мало, альтернативы не рассматриваются.";
    case "ial":
      if (raw >= 2) return "Вы рассматриваете достаточно альтернативных объяснений с адекватным распределением вероятностей.";
      if (raw >= 1) return "Альтернатив мало или одна гипотеза доминирует. Попробуйте рассмотреть больше вариантов.";
      return "Альтернативные объяснения практически не рассматриваются. Это признак туннельного мышления.";
    case "kf":
      if (raw >= 0.5) return "Более половины вашей аргументации основано на фактах. Это хорошая доказательная база для выводов.";
      if (raw >= 0.3) return "Доля фактов невысока — значительная часть рассуждений строится на предположениях.";
      return "Очень мало подтверждённых фактов. Рекомендуется собрать больше данных перед принятием решения.";
    case "inu":
      if (raw <= 0.3) return "Низкий уровень неопределённости. Вы хорошо понимаете факторы, влияющие на ситуацию.";
      if (raw <= 0.5) return "Умеренная неопределённость. Часть факторов остаётся неизвестной — будьте осторожны с выводами.";
      return "Высокая неопределённость. Слишком много неизвестных — выводы могут быть ненадёжными.";
    case "iki":
      if (raw <= 0.17) return "Минимум когнитивных искажений. Ваше мышление объективно и критично.";
      if (raw <= 0.5) return "Обнаружены некоторые когнитивные ошибки. Осознание их — первый шаг к более точному мышлению.";
      return "Много когнитивных искажений. Рекомендуется пересмотреть аргументацию, устранив выявленные ошибки мышления.";
    case "ilc":
      if (raw >= 0.3) return "Высокая гибкость мышления. Вы способны менять позицию на основе анализа — признак зрелого мышления.";
      if (raw > 0) return "Умеренная гибкость. Позиция немного изменилась, но есть потенциал для более глубокой корректировки.";
      return "Позиция не изменилась после анализа. Возможна ригидность мышления или изначально верное решение.";
    default:
      return "";
  }
}

function buildRadarSVG(values: number[]): string {
  const cx = 150;
  const cy = 150;
  const R = 120;
  const N = 6;

  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / N;

  const pt = (i: number, r: number) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  });

  const hexPoints = (r: number) =>
    Array.from({ length: N }, (_, i) => pt(i, r))
      .map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      .join(" ");

  const dataPoints = values.map((v, i) => pt(i, Math.max(v, 0.02) * R));
  const dataPolygon = dataPoints
    .map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");

  const labelPts = Array.from({ length: N }, (_, i) => pt(i, R + 22));

  const axisLines = Array.from({ length: N }, (_, i) => {
    const p = pt(i, R);
    return `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(2)}" y2="${p.y.toFixed(2)}" stroke="#e2e8f0" stroke-width="1"/>`;
  }).join("\n");

  const dots = dataPoints
    .map((p) => `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="4" fill="#6366f1"/>`)
    .join("\n");

  const labels = labelPts
    .map(
      (p, i) =>
        `<text x="${p.x.toFixed(2)}" y="${p.y.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" fill="#64748b" font-size="10">${RADAR_LABELS[i]}</text>`
    )
    .join("\n");

  return `<svg viewBox="0 0 300 300" width="340" style="display:block;margin:0 auto;max-width:100%;">
    <polygon points="${hexPoints(R * 0.333)}" fill="none" stroke="#e2e8f0" stroke-width="1"/>
    <polygon points="${hexPoints(R * 0.667)}" fill="none" stroke="#e2e8f0" stroke-width="1"/>
    <polygon points="${hexPoints(R)}" fill="none" stroke="#e2e8f0" stroke-width="1"/>
    ${axisLines}
    <polygon points="${dataPolygon}" fill="#c7d2fe" fill-opacity="0.6" stroke="#6366f1" stroke-width="2" stroke-linejoin="round"/>
    ${dots}
    ${labels}
  </svg>`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function exportLogicPDF(data: LogicData, results: LogicResults): void {
  const { ilmp, level, indices, warnings } = results;
  const ringColor = getRingStroke(ilmp);

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const dateStr = `${dd}.${mm}.${yyyy}`;

  const radarValues = [
    Math.min(indices.ia / 25, 1),
    Math.min(indices.icl / 5, 1),
    Math.min(indices.ial / 3, 1),
    Math.min(indices.kf, 1),
    Math.min(indices.ilc, 1),
    Math.max(1 - indices.iki, 0),
  ];

  const radarSVG = buildRadarSVG(radarValues);

  const indexRows = INDEX_ROWS.map((row) => {
    const raw = indices[row.key as keyof typeof indices];
    const normalized = row.normalize(raw);
    const display = row.inverted ? 1 - normalized : normalized;
    const formatted = row.format(raw);
    const interpretation = getIndexInterpretation(row.key, raw);

    let colorBg: string;
    let colorText: string;
    if (display >= 0.7) {
      colorBg = "#f0fdf4";
      colorText = "#16a34a";
    } else if (display >= 0.4) {
      colorBg = "#fffbeb";
      colorText = "#d97706";
    } else {
      colorBg = "#fef2f2";
      colorText = "#dc2626";
    }

    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;font-size:13px;">${escapeHtml(row.label)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">
        <span style="display:inline-block;padding:2px 10px;border-radius:20px;font-size:13px;font-weight:600;background:${colorBg};color:${colorText};">${escapeHtml(formatted)}</span>
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#374151;line-height:1.5;">${escapeHtml(interpretation)}</td>
    </tr>`;
  }).join("\n");

  let confidenceSection = "";
  if (data.step0 && data.step6) {
    const s0 = data.step0;
    const s6 = data.step6;
    const delta = s6.revisedConfidence - s0.initialConfidence;
    const deltaSign = delta > 0 ? "+" : "";
    const deltaColor = delta > 0 ? "#16a34a" : delta < 0 ? "#dc2626" : "#6b7280";

    confidenceSection = `
    <div class="section">
      <div class="section-title">Изменение уверенности</div>
      <div style="display:flex;gap:16px;">
        <div style="flex:1;background:#f9fafb;border-radius:12px;padding:14px 16px;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;font-weight:600;margin-bottom:6px;">До анализа</div>
          <div style="font-size:14px;font-weight:600;color:#0f172a;margin-bottom:4px;">${escapeHtml(s0.initialDecision)}</div>
          <div style="font-size:24px;font-weight:700;color:#6366f1;">${s0.initialConfidence}%</div>
        </div>
        <div style="flex:1;background:#f9fafb;border-radius:12px;padding:14px 16px;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;font-weight:600;margin-bottom:6px;">После анализа</div>
          <div style="font-size:14px;font-weight:600;color:#0f172a;margin-bottom:4px;">${escapeHtml(s6.revisedDecision)}</div>
          <div style="font-size:24px;font-weight:700;color:#6366f1;">${s6.revisedConfidence}%</div>
        </div>
      </div>
      <div style="text-align:center;margin-top:8px;font-size:14px;font-weight:600;color:${deltaColor};">
        ${deltaSign}${delta}%
      </div>
    </div>`;
  }

  let warningsSection = "";
  if (warnings && warnings.length > 0) {
    const tags = warnings
      .map(
        (w) =>
          `<span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500;background:#fffbeb;color:#d97706;margin:3px 4px 3px 0;">${escapeHtml(w)}</span>`
      )
      .join("\n");
    warningsSection = `
    <div class="section">
      <div class="section-title">Предупреждения</div>
      <div style="display:flex;flex-wrap:wrap;">${tags}</div>
    </div>`;
  }

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8"/>
<title>Логика мышления PRO — Результат</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Inter, sans-serif; color: #111; background: white; padding: 32px; max-width: 720px; margin: 0 auto; }
  h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
  .subtitle { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #9ca3af; font-weight: 600; margin-bottom: 10px; }
  .card { background: #f9fafb; border-radius: 12px; padding: 14px 16px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f3f4f6; padding: 8px 12px; font-size: 12px; font-weight: 600; text-align: left; border-bottom: 2px solid #e5e7eb; }
  @media print { body { padding: 16px; } }
</style>
</head>
<body>
<h1>Логика мышления PRO — Результат</h1>
<p class="subtitle">ПоДелам · ${dateStr}</p>

<div class="section" style="text-align:center;">
  <div style="position:relative;width:160px;height:160px;margin:0 auto 12px;">
    <svg viewBox="0 0 160 160" width="160" height="160">
      <circle cx="80" cy="80" r="70" fill="none" stroke="#e5e7eb" stroke-width="8"/>
      <circle cx="80" cy="80" r="70" fill="none" stroke="${ringColor}" stroke-width="8"
        stroke-dasharray="${(ilmp / 100) * 2 * Math.PI * 70} ${2 * Math.PI * 70}"
        stroke-linecap="round" transform="rotate(-90 80 80)"/>
    </svg>
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:40px;font-weight:700;color:${ringColor};">${Math.round(ilmp)}</div>
  </div>
  <div style="font-size:18px;font-weight:700;color:#0f172a;margin-bottom:4px;">${escapeHtml(level)}</div>
  <div style="font-size:13px;color:#374151;line-height:1.6;max-width:500px;margin:0 auto;">${escapeHtml(LEVEL_DESCRIPTIONS[level])}</div>
</div>

<div class="section">
  <div class="section-title">Профиль логического мышления</div>
  <div class="card" style="text-align:center;">
    ${radarSVG}
  </div>
</div>

<div class="section">
  <div class="section-title">Детализация индексов</div>
  <table>
    <thead>
      <tr>
        <th>Индекс</th>
        <th style="text-align:center;">Значение</th>
        <th>Интерпретация</th>
      </tr>
    </thead>
    <tbody>
      ${indexRows}
    </tbody>
  </table>
</div>

${confidenceSection}

${warningsSection}

<script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

export default exportLogicPDF;
