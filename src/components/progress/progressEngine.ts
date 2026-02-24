export type MetricDef = { key: string; label: string };

export type Templates = {
  metrics: MetricDef[];
  focus_options: string[];
  delta_labels: Record<string, string>;
  dynamic_positive: string;
  dynamic_negative: string;
  dynamic_stable: string;
  focus_same: string;
  focus_changed: string;
  conclusions: string[];
  first_entry: string;
  start_message: string;
};

export type ProgressEntry = {
  date: string;
  values: Record<string, number>;
  main_focus: string;
  key_thought: string;
  _server_id?: number;
};

export type Message = { id: number; from: "bot" | "user"; text: string };

export type Phase = "intro" | "metrics" | "focus" | "thought" | "result" | "done";

function getUserEmail(): string {
  try { return JSON.parse(localStorage.getItem("pdd_user") || "{}").email || ""; } catch { return ""; }
}
export function ENTRIES_KEY() { return `progress_entries_${getUserEmail()}`; }
export function CHAT_KEY() { return `progress_chat_${getUserEmail()}`; }

function deltaLabel(delta: number, labels: Record<string, string>): string {
  if (delta >= 2) return labels.strong_up;
  if (delta === 1) return labels.mild_up;
  if (delta === 0) return labels.none;
  if (delta === -1) return labels.mild_down;
  return labels.strong_down;
}

function deltaSign(delta: number): string {
  if (delta > 0) return `+${delta}`;
  return String(delta);
}

export function buildResult(
  entry: ProgressEntry,
  prev: ProgressEntry | null,
  tpl: Templates,
  totalEntries?: number
): string {
  const lines: string[] = [];

  if (!prev) {
    lines.push(tpl.first_entry);
    lines.push("");
    lines.push(`Фокус: ${entry.main_focus}`);
    if (entry.key_thought) lines.push(`Мысль: ${entry.key_thought}`);
    lines.push("");
    lines.push(tpl.conclusions[2]);
    return lines.join("\n");
  }

  lines.push("📊 Сравнение с предыдущей записью\n");
  let grew = 0, fell = 0, same = 0;

  for (const m of tpl.metrics) {
    const cur = entry.values[m.key] ?? 0;
    const prv = prev.values[m.key] ?? 0;
    const d = cur - prv;
    const sign = deltaSign(d);
    const lbl = deltaLabel(d, tpl.delta_labels);
    lines.push(`${m.label}: ${prv} → ${cur} (${sign}) — ${lbl}`);
    if (d > 0) grew++;
    else if (d < 0) fell++;
    else same++;
  }

  lines.push("");
  lines.push("📈 Общая динамика\n");
  if (grew > fell && grew > same) lines.push(tpl.dynamic_positive);
  else if (fell > grew && fell > same) lines.push(tpl.dynamic_negative);
  else lines.push(tpl.dynamic_stable);

  lines.push(`Выросло: ${grew}  ·  Снизилось: ${fell}  ·  Без изменений: ${same}`);

  lines.push("");
  lines.push("🔁 Фокус\n");
  lines.push(
    entry.main_focus === prev.main_focus ? tpl.focus_same : tpl.focus_changed
  );
  lines.push(`Текущий фокус: ${entry.main_focus}`);

  lines.push("");
  lines.push("🧭 Итог\n");

  const count = totalEntries ?? 1;
  const conclusionIdx = count < 3 ? 2 : Math.floor(Math.random() * 2);
  lines.push(tpl.conclusions[conclusionIdx]);

  return lines.join("\n");
}