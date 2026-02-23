import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { checkAccess, getToolCompletions, getLatestCareerResult } from "@/lib/access";
import PaywallModal from "@/components/PaywallModal";
import ProgressChat from "@/components/progress/ProgressChat";
import ProgressPortrait from "@/components/progress/ProgressPortrait";
import {
  Templates,
  ProgressEntry,
  Message,
  Phase,
  ENTRIES_KEY,
  CHAT_KEY,
  buildResult,
} from "@/components/progress/progressEngine";

export default function Progress() {
  const navigate = useNavigate();
  const [showPaywall, setShowPaywall] = useState(false);

  const [tpl, setTpl] = useState<Templates | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");

  const [metricIndex, setMetricIndex] = useState(0);
  const [values, setValues] = useState<Record<string, number>>({});
  const [sliderVal, setSliderVal] = useState(5);

  const [focus, setFocus] = useState("");
  const [thought, setThought] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);
  const idRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) { navigate("/auth"); return; }
    const access = checkAccess("progress");
    if (access === "locked") setShowPaywall(true);
  }, [navigate]);

  useEffect(() => {
    fetch("/progress_templates.json")
      .then((r) => r.json())
      .then((t: Templates) => setTpl(t));
  }, []);

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
      msgs = addBotRaw(msgs, "Выберите основной фокус этого периода:");
      setMessages(msgs);
      setPhase("focus");
    }
  }

  function submitFocus(selected: string) {
    if (!tpl) return;
    setFocus(selected);
    let msgs = addUserRaw(messages, selected);
    msgs = addBotRaw(msgs, "Одна ключевая мысль или наблюдение этого периода (коротко):");
    setMessages(msgs);
    setPhase("thought");
  }

  function submitThought() {
    if (!tpl || !thought.trim()) return;
    const kw = thought.trim();

    let msgs = addUserRaw(messages, kw);

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

  return (
    <div className="min-h-screen font-golos flex flex-col" style={{ background: "hsl(248, 50%, 98%)" }}>

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

      {phase === "metrics" && tpl && (
        <div className="h-1 bg-secondary">
          <div
            className="h-full bg-blue-400 transition-all duration-500"
            style={{ width: `${(metricIndex / tpl.metrics.length) * 100}%` }}
          />
        </div>
      )}

      <ProgressChat
        messages={messages}
        phase={phase}
        currentMetric={currentMetric}
        metricIndex={metricIndex}
        totalMetrics={tpl?.metrics.length ?? 0}
        sliderVal={sliderVal}
        onSliderChange={setSliderVal}
        onSubmitMetric={submitMetric}
        focusOptions={tpl?.focus_options ?? []}
        onSubmitFocus={submitFocus}
        thought={thought}
        onThoughtChange={setThought}
        onSubmitThought={submitThought}
        onStartNew={startNew}
        bottomRef={bottomRef as React.RefObject<HTMLDivElement>}
      />

      <ProgressPortrait completions={completions} careerResult={careerResult} />
    </div>
  );
}
