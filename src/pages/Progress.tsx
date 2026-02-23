import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { checkAccess, getToolCompletions, getLatestCareerResult } from "@/lib/access";
import PaywallModal from "@/components/PaywallModal";

// ─── Types ───────────────────────────────────────────────────────────────────

type MetricDef = { key: string; label: string };

type Templates = {
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

type ProgressEntry = {
  date: string;
  values: Record<string, number>;
  main_focus: string;
  key_thought: string;
};

type Message = { id: number; from: "bot" | "user"; text: string };

// ─── Phase types ──────────────────────────────────────────────────────────────
// phases: intro → metrics → focus → thought → result → done

type Phase = "intro" | "metrics" | "focus" | "thought" | "result" | "done";

const ENTRIES_KEY = "progress_entries";
const CHAT_KEY    = "progress_chat";

// ─── Delta logic ─────────────────────────────────────────────────────────────

function deltaLabel(delta: number, labels: Record<string, string>): string {
  if (delta >= 2)  return labels.strong_up;
  if (delta === 1) return labels.mild_up;
  if (delta === 0) return labels.none;
  if (delta === -1) return labels.mild_down;
  return labels.strong_down;
}

function deltaSign(delta: number): string {
  if (delta > 0) return `+${delta}`;
  return String(delta);
}

function buildResult(
  entry: ProgressEntry,
  prev: ProgressEntry | null,
  tpl: Templates
): string {
  const lines: string[] = [];

  if (!prev) {
    lines.push(tpl.first_entry);
    lines.push("");
    lines.push(`Фокус: ${entry.main_focus}`);
    if (entry.key_thought) lines.push(`Мысль: ${entry.key_thought}`);
    lines.push("");
    lines.push(tpl.conclusions[2]); // "Для более точного анализа..."
    return lines.join("\n");
  }

  // Comparison block
  lines.push("📊 Сравнение с предыдущей записью\n");
  let grew = 0, fell = 0, same = 0;

  for (const m of tpl.metrics) {
    const cur  = entry.values[m.key] ?? 0;
    const prv  = prev.values[m.key] ?? 0;
    const d    = cur - prv;
    const sign = deltaSign(d);
    const lbl  = deltaLabel(d, tpl.delta_labels);
    lines.push(`${m.label}: ${prv} → ${cur} (${sign}) — ${lbl}`);
    if (d > 0) grew++;
    else if (d < 0) fell++;
    else same++;
  }

  lines.push("");
  lines.push("📈 Общая динамика\n");
  if (grew > fell && grew > same)       lines.push(tpl.dynamic_positive);
  else if (fell > grew && fell > same)  lines.push(tpl.dynamic_negative);
  else                                  lines.push(tpl.dynamic_stable);

  lines.push(`Выросло: ${grew}  ·  Снизилось: ${fell}  ·  Без изменений: ${same}`);

  lines.push("");
  lines.push("🔁 Фокус\n");
  lines.push(
    entry.main_focus === prev.main_focus ? tpl.focus_same : tpl.focus_changed
  );
  lines.push(`Текущий фокус: ${entry.main_focus}`);

  lines.push("");
  lines.push("🧭 Итог\n");

  const allEntries: ProgressEntry[] = JSON.parse(localStorage.getItem(ENTRIES_KEY) ?? "[]");
  const conclusionIdx = allEntries.length < 3 ? 2 : Math.floor(Math.random() * 2);
  lines.push(tpl.conclusions[conclusionIdx]);

  return lines.join("\n");
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Progress() {
  const navigate = useNavigate();
  const [showPaywall, setShowPaywall] = useState(false);

  const [tpl, setTpl] = useState<Templates | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");

  // Metric input state
  const [metricIndex, setMetricIndex] = useState(0);
  const [values, setValues] = useState<Record<string, number>>({});
  const [sliderVal, setSliderVal] = useState(5);

  // Focus & thought
  const [focus, setFocus] = useState("");
  const [thought, setThought] = useState("");

  // Chat
  const [messages, setMessages] = useState<Message[]>([]);
  const idRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Auth + access check ─────────────────────────────────────────────────────
  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) { navigate("/auth"); return; }
    const access = checkAccess("progress");
    if (access === "locked") setShowPaywall(true);
  }, [navigate]);

  // ── Load templates ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/progress_templates.json")
      .then((r) => r.json())
      .then((t: Templates) => setTpl(t));
  }, []);

  // ── Init chat ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!tpl) return;

    const stored = localStorage.getItem(CHAT_KEY);
    if (stored) {
      setMessages(JSON.parse(stored));
      setPhase("done");
      return;
    }

    const msgs = addBotRaw([], tpl.start_message);
    setMessages(msgs);
    setPhase("metrics");
  }, [tpl]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, phase]);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function addBotRaw(current: Message[], text: string): Message[] {
    const msg: Message = { id: idRef.current++, from: "bot", text };
    return [...current, msg];
  }

  function addUserRaw(current: Message[], text: string): Message[] {
    const msg: Message = { id: idRef.current++, from: "user", text };
    return [...current, msg];
  }

  function save(msgs: Message[]) {
    localStorage.setItem(CHAT_KEY, JSON.stringify(msgs));
  }

  // ── Metric submit ────────────────────────────────────────────────────────────
  function submitMetric() {
    if (!tpl) return;
    const metric = tpl.metrics[metricIndex];
    const newValues = { ...values, [metric.key]: sliderVal };
    setValues(newValues);

    let msgs = addUserRaw(messages, `${metric.label}: ${sliderVal}`);

    const nextIdx = metricIndex + 1;
    if (nextIdx < tpl.metrics.length) {
      setMetricIndex(nextIdx);
      setSliderVal(5);
      setMessages(msgs);
    } else {
      // All metrics done → ask focus
      msgs = addBotRaw(msgs, "Выберите основной фокус этого периода:");
      setMessages(msgs);
      setPhase("focus");
    }
  }

  // ── Focus submit ─────────────────────────────────────────────────────────────
  function submitFocus(selected: string) {
    if (!tpl) return;
    setFocus(selected);
    let msgs = addUserRaw(messages, selected);
    msgs = addBotRaw(msgs, "Одна ключевая мысль или наблюдение этого периода (коротко):");
    setMessages(msgs);
    setPhase("thought");
  }

  // ── Thought submit ───────────────────────────────────────────────────────────
  function submitThought() {
    if (!tpl || !thought.trim()) return;
    const kw = thought.trim();

    let msgs = addUserRaw(messages, kw);

    // Build entry
    const entries: ProgressEntry[] = JSON.parse(localStorage.getItem(ENTRIES_KEY) ?? "[]");
    const prev = entries.length > 0 ? entries[entries.length - 1] : null;

    const entry: ProgressEntry = {
      date: new Date().toISOString(),
      values,
      main_focus: focus,
      key_thought: kw,
    };
    entries.push(entry);
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));

    const resultText = buildResult(entry, prev, tpl);
    msgs = addBotRaw(msgs, resultText);
    save(msgs);
    setMessages(msgs);
    setPhase("done");
  }

  // ── New session ──────────────────────────────────────────────────────────────
  function startNew() {
    if (!tpl) return;
    localStorage.removeItem(CHAT_KEY);
    setValues({});
    setMetricIndex(0);
    setSliderVal(5);
    setFocus("");
    setThought("");
    const msgs = addBotRaw([], tpl.start_message);
    setMessages(msgs);
    setPhase("metrics");
  }

  function clearAll() {
    localStorage.removeItem(CHAT_KEY);
    localStorage.removeItem(ENTRIES_KEY);
    startNew();
  }

  const entries: ProgressEntry[] = JSON.parse(localStorage.getItem(ENTRIES_KEY) ?? "[]");
  const currentMetric = tpl?.metrics[metricIndex];
  const completions = getToolCompletions();
  const careerResult = getLatestCareerResult();

  if (showPaywall) {
    return (
      <div className="min-h-screen font-golos flex flex-col" style={{ background: "hsl(248, 50%, 98%)" }}>
        <PaywallModal
          toolId="progress"
          toolName="Прогресс развития"
          onClose={() => navigate("/cabinet")}
          onSuccess={() => setShowPaywall(false)}
        />
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen font-golos flex flex-col" style={{ background: "hsl(248, 50%, 98%)" }}>

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-border px-4 h-14 flex items-center justify-between shrink-0">
        <button
          onClick={() => navigate("/cabinet")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="ArrowLeft" size={18} />
          <span className="text-sm font-medium">Кабинет</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center">
            <Icon name="BarChart3" size={14} className="text-blue-600" />
          </div>
          <span className="font-bold text-sm text-foreground">Прогресс</span>
          {entries.length > 0 && (
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              {entries.length} {entries.length === 1 ? "запись" : entries.length < 5 ? "записи" : "записей"}
            </span>
          )}
        </div>

        <button onClick={clearAll} title="Очистить всё" className="text-muted-foreground hover:text-foreground transition-colors p-1">
          <Icon name="Trash2" size={17} />
        </button>
      </header>

      {/* PROGRESS BAR */}
      {phase === "metrics" && tpl && (
        <div className="h-1 bg-secondary">
          <div
            className="h-full bg-blue-400 transition-all duration-500"
            style={{ width: `${(metricIndex / tpl.metrics.length) * 100}%` }}
          />
        </div>
      )}

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 max-w-2xl mx-auto w-full">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            {msg.from === "bot" && (
              <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                <Icon name="BarChart3" size={13} className="text-blue-600" />
              </div>
            )}
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${
                msg.from === "user"
                  ? "gradient-brand text-white rounded-tr-sm"
                  : "bg-white border border-border rounded-tl-sm"
              }`}
            >
              {msg.text.split("\n").map((line, i) => {
                if (line === "") return <div key={i} className="h-1.5" />;
                const isBold = /^(📊|📈|🔁|🧭)/.test(line);
                return (
                  <p
                    key={i}
                    className={`leading-relaxed ${isBold ? "font-bold mt-1" : ""} ${msg.from === "user" ? "text-white" : "text-foreground"}`}
                  >
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        ))}

        {/* METRIC SLIDER */}
        {phase === "metrics" && currentMetric && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mr-2 mt-0.5">
              <Icon name="BarChart3" size={13} className="text-blue-600" />
            </div>
            <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-5 py-4 w-full max-w-sm">
              <p className="font-semibold text-foreground text-sm mb-4">
                {currentMetric.label}
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  (шаг {metricIndex + 1} из {tpl!.metrics.length})
                </span>
              </p>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs text-muted-foreground w-4">1</span>
                <input
                  type="range"
                  min={1} max={10} step={1}
                  value={sliderVal}
                  onChange={(e) => setSliderVal(Number(e.target.value))}
                  className="flex-1 accent-blue-500 cursor-pointer"
                />
                <span className="text-xs text-muted-foreground w-4 text-right">10</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-blue-600">{sliderVal}</span>
                <button
                  onClick={submitMetric}
                  className="bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Далее
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FOCUS PICKER */}
        {phase === "focus" && tpl && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mr-2 mt-0.5">
              <Icon name="BarChart3" size={13} className="text-blue-600" />
            </div>
            <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-5 py-4 max-w-sm w-full">
              <div className="flex flex-wrap gap-2">
                {tpl.focus_options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => submitFocus(opt)}
                    className="px-3 py-1.5 rounded-xl border border-border text-sm text-foreground hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* THOUGHT INPUT */}
        {phase === "thought" && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mr-2 mt-0.5">
              <Icon name="BarChart3" size={13} className="text-blue-600" />
            </div>
            <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-5 py-4 max-w-sm w-full">
              <input
                type="text"
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitThought()}
                placeholder="Короткая фраза..."
                maxLength={120}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm text-foreground bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-300 mb-3"
                autoFocus
              />
              <button
                onClick={submitThought}
                disabled={!thought.trim()}
                className="w-full bg-blue-500 text-white font-semibold py-2 rounded-xl hover:bg-blue-600 transition-colors text-sm disabled:opacity-40"
              >
                Завершить
              </button>
            </div>
          </div>
        )}

        {/* DONE */}
        {phase === "done" && (
          <div className="flex justify-center pt-4">
            <button
              onClick={startNew}
              className="bg-blue-100 text-blue-700 font-semibold px-5 py-2.5 rounded-2xl hover:bg-blue-200 transition-colors text-sm"
            >
              Новая запись
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ПСИХОЛОГИЧЕСКИЙ ПОРТРЕТ — пройденные инструменты */}
      {(completions.length > 0 || careerResult) && (
        <div className="px-4 pb-8 max-w-2xl mx-auto w-full space-y-4">
          <h3 className="font-bold text-foreground text-sm mt-4">Психологический портрет</h3>

          {careerResult && (
            <div className="bg-white border border-border rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
                <Icon name="Compass" size={18} className="text-violet-600" />
              </div>
              <div>
                <div className="font-semibold text-sm text-foreground">Тест профессий — {careerResult.topTypeName}</div>
                <div className="text-xs text-muted-foreground">{careerResult.date} · {careerResult.professions.slice(0, 3).join(", ")}</div>
              </div>
            </div>
          )}

          {completions.map((c, i) => (
            <div key={i} className="bg-white border border-border rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <Icon name="CheckCircle2" size={18} className="text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-sm text-foreground">{c.summary}</div>
                <div className="text-xs text-muted-foreground">{c.date}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}