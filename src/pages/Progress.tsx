import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { checkAccess, getToolCompletions, getLatestCareerResult, consumePaidOnce } from "@/lib/access";
import useToolSync from "@/hooks/useToolSync";
import PaywallModal from "@/components/PaywallModal";
import ProgressChat from "@/components/progress/ProgressChat";
import ToolHint from "@/components/ToolHint";
import SyncIndicator from "@/components/SyncIndicator";
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
  const { sessions: syncedEntries, setSessions: setSyncedEntries, saveSession: saveProgressEntry, syncing, saveLocal } = useToolSync<ProgressEntry>("progress", "progress_entries");
  const { sessions: psychSessions } = useToolSync<Record<string, unknown>>("psych-bot", "psych_result_history");
  const { sessions: barrierSessions } = useToolSync<{ context: string; profile: string }>("barrier-bot", "barrier_results");

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) { navigate("/auth"); return; }
    window.ym?.(107022183, 'reachGoal', 'tool_opened', { tool: 'progress' });
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

    const stored = localStorage.getItem(CHAT_KEY());
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
    localStorage.setItem(CHAT_KEY(), JSON.stringify(msgs));
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

  async function submitThought() {
    if (!tpl || !thought.trim()) return;
    const kw = thought.trim();

    let msgs = addUserRaw(messages, kw);

    const prev = syncedEntries.length > 0 ? syncedEntries[syncedEntries.length - 1] : null;

    const entry: ProgressEntry = {
      date: new Date().toISOString(),
      values,
      main_focus: focus,
      key_thought: kw,
    };

    await saveProgressEntry(entry);
    consumePaidOnce("progress");

    const resultText = buildResult(entry, prev, tpl, syncedEntries.length + 1);
    msgs = addBotRaw(msgs, resultText);
    save(msgs);
    setMessages(msgs);
    setPhase("done");
  }

  function startNew() {
    if (!tpl) return;
    localStorage.removeItem(CHAT_KEY());
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
    localStorage.removeItem(CHAT_KEY());
    localStorage.removeItem(ENTRIES_KEY());
    setSyncedEntries([]);
    saveLocal([]);
    startNew();
  }

  const entries = syncedEntries;
  const currentMetric = tpl?.metrics[metricIndex];
  const completions = getToolCompletions();
  const careerResult = getLatestCareerResult();

  if (showPaywall) {
    return (
      <div className="min-h-screen font-golos flex flex-col" style={{ background: "hsl(248, 50%, 98%)" }}>
        <PaywallModal
          toolId="progress"
          toolName="Прогресс развития"
          onClose={() => navigate("/cabinet?tab=tools")}
          onSuccess={() => setShowPaywall(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-golos flex flex-col" style={{ background: "hsl(248, 50%, 98%)" }}>

      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-border px-4 h-14 flex items-center justify-between shrink-0">
        <button
          onClick={() => navigate("/cabinet?tab=tools")}
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
          <SyncIndicator syncing={syncing} />
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

      {phase === "metrics" && metricIndex === 0 && (
        <ToolHint
          title="Как правильно оценить себя"
          items={[
            "Оценивайте себя именно сегодня, в этот момент — не «в целом по жизни» и не «на прошлой неделе».",
            "Ставьте оценку от 1 до 10 честно. 5 — это нормально, не нужно стремиться к 10 по всем показателям.",
            "Каждый ваш заход сравнивается с предыдущим — так видна реальная динамика состояния.",
            "Заходите сюда регулярно (раз в неделю) — чем больше точек, тем точнее картина прогресса.",
          ]}
        />
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

      <ProgressPortrait
        completions={completions}
        careerResult={careerResult}
        psychResult={psychSessions.length > 0 ? psychSessions[psychSessions.length - 1] as never : undefined}
        barrierSessions={barrierSessions.length > 0 ? barrierSessions : undefined}
      />
    </div>
  );
}