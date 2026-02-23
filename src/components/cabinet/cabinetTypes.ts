import {
  PROFILE_DESCRIPTIONS,
  SEGMENT_NAMES,
  ENERGY_TEXT,
  BURNOUT_TEXT,
  FORMAT_TEXT,
} from "@/components/psych-bot/psychBotData";

export type User = { name: string; email: string };
export type TestResult = { id: string; type: string; date: string; score: number };

export type PsychResult = {
  profileName: string;
  topSeg: string;
  primMotiv: string;
  selectedProf: string;
  topSegs: { key: string; name: string; pct: number }[];
  topMotivations: { key: string; name: string; pct: number }[];
  topSegScore: number;
  professions: { name: string; match: number }[];
};

export const tools = [
  { icon: "Brain", title: "Психологический анализ", desc: "Профориентация и предотвращение выгорания", color: "bg-indigo-50 text-indigo-600", link: "/psych-bot", badge: "299 ₽" },
  { icon: "ShieldAlert", title: "Барьеры, тревоги и стресс", desc: "Выявляет страхи, синдром самозванца, прокрастинацию и усталость — даёт персональные рекомендации", color: "bg-rose-50 text-rose-600", link: "/barrier-bot", badge: "290 ₽" },
  { icon: "Banknote", title: "Подбор дохода", desc: "Найди подходящий вариант дополнительного заработка", color: "bg-green-50 text-green-600", link: "/income-bot" },
  { icon: "BookOpen", title: "Дневник самоанализа", desc: "Фиксируй мысли и наблюдай динамику", color: "bg-violet-50 text-violet-600", link: "/diary" },
  { icon: "Map", title: "Шаги развития", desc: "Персональный план на 3 месяца", color: "bg-emerald-50 text-emerald-600", link: "/plan-bot" },
  { icon: "BarChart3", title: "Прогресс развития", desc: "Сравнение с предыдущими результатами", color: "bg-blue-50 text-blue-600", link: "/progress" },
];

export function printPsychResult(psychResult: PsychResult, date: string, score: number) {
  const profList = psychResult.professions
    .map((p) => `<li>${p.name} — ${p.match}% совпадение</li>`)
    .join("");

  const segList = psychResult.topSegs
    .map((s) => `<li>${s.name} — ${s.pct}%</li>`)
    .join("");

  const motivList = psychResult.topMotivations
    .map((m) => `${m.name} (${m.pct}%)`)
    .join(", ");

  const description = PROFILE_DESCRIPTIONS[psychResult.primMotiv]?.[psychResult.topSeg] ?? "";
  const energy = ENERGY_TEXT[psychResult.topSeg] ?? "";
  const burnout = BURNOUT_TEXT[psychResult.topSeg] ?? "";
  const format = FORMAT_TEXT[psychResult.topSeg] ?? "";

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head>
    <meta charset="utf-8"/>
    <title>Тест на призвание — ПоДелам</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; color: #1a1a1a; line-height: 1.6; padding: 0 24px; }
      .header { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; border-radius: 16px; padding: 32px; margin-bottom: 32px; }
      .header h1 { font-size: 28px; font-weight: 900; margin: 0 0 8px; }
      .header p { margin: 0; opacity: 0.8; font-size: 15px; }
      .badges { display: flex; gap: 16px; margin-top: 20px; flex-wrap: wrap; }
      .badge { background: rgba(255,255,255,0.15); border-radius: 12px; padding: 10px 16px; text-align: center; }
      .badge .num { font-size: 22px; font-weight: 900; }
      .badge .lbl { font-size: 11px; opacity: 0.7; }
      h2 { font-size: 16px; color: #7c3aed; margin: 28px 0 8px; border-bottom: 2px solid #ede9fe; padding-bottom: 6px; }
      p { font-size: 14px; margin: 6px 0; }
      ul { margin: 6px 0; padding-left: 20px; }
      li { font-size: 14px; margin: 4px 0; }
      .highlight { background: #f5f3ff; border-left: 4px solid #7c3aed; padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 14px; }
      .footer { color: #9ca3af; font-size: 11px; margin-top: 40px; text-align: center; }
      @media print { body { margin: 20px; } }
    </style>
  </head><body>
    <div class="header">
      <div style="font-size:12px;opacity:0.7;margin-bottom:8px">Тест на призвание · ${date}</div>
      <h1>${psychResult.profileName}</h1>
      <p>${SEGMENT_NAMES[psychResult.topSeg]}</p>
      <div class="badges">
        <div class="badge"><div class="num">${score}%</div><div class="lbl">совпадение</div></div>
        <div class="badge"><div class="num">${psychResult.professions.length}</div><div class="lbl">профессии</div></div>
        <div class="badge"><div class="num">${psychResult.topSegs.length}</div><div class="lbl">направления</div></div>
      </div>
    </div>

    ${description ? `<h2>Портрет призвания</h2><div class="highlight">${description}</div>` : ""}

    <h2>Ведущие направления</h2>
    <ul>${segList}</ul>

    <h2>Мотивация</h2>
    <p>${motivList}</p>

    ${psychResult.selectedProf ? `<h2>Выбранная профессия</h2><p><strong>${psychResult.selectedProf}</strong></p>` : ""}

    <h2>Подходящие профессии</h2>
    <ul>${profList}</ul>

    ${energy ? `<h2>Что даёт тебе энергию</h2><p>${energy}</p>` : ""}
    ${burnout ? `<h2>Где ты будешь выгорать</h2><p>${burnout}</p>` : ""}
    ${format ? `<h2>Подходящий формат работы</h2><p>${format}</p>` : ""}

    <div class="footer">Сформировано на ПоДелам · ${new Date().toLocaleDateString("ru-RU")}</div>
  </body></html>`);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); }, 400);
}