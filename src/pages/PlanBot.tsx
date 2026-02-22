import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  INITIAL_PLAN_STATE,
  Message,
  PlanBotState,
  PlanBotStep,
  UserInputs,
  buildPlan,
  formatPlanAsMarkdown,
  FinalPlan,
} from "@/components/plan-bot/planBotEngine";
import { Direction, DIRECTION_NAMES, DIRECTION_ICONS } from "@/components/plan-bot/planBotData";

// ─── РЕНДЕР MARKDOWN ──────────────────────────────────────────────────────────

function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("# ")) {
      return <h1 key={i} className="text-xl font-bold text-gray-900 mt-4 mb-2">{line.replace(/^# /, "").replace(/📅\s*/, "")}</h1>;
    }
    if (line.startsWith("## ")) {
      return <h2 key={i} className="text-base font-bold text-gray-900 mt-4 mb-1">{line.replace(/^## /, "")}</h2>;
    }
    if (line.startsWith("### ")) {
      return <h3 key={i} className="text-sm font-semibold text-gray-800 mt-3 mb-1">{line.replace(/^### /, "")}</h3>;
    }
    if (line.startsWith("---")) {
      return <hr key={i} className="my-3 border-gray-200" />;
    }
    if (line.startsWith("> ⚠️") || line.startsWith("> 🕐") || line.startsWith("> ⚡") || line.startsWith("> 🎯") || line.startsWith("> 📈")) {
      return (
        <div key={i} className="bg-amber-50 border-l-4 border-amber-400 px-3 py-2 my-2 rounded-r-lg text-sm text-amber-800">
          {line.replace(/^> /, "")}
        </div>
      );
    }
    if (line.startsWith("• ") || line.startsWith("✓ ")) {
      const isCheck = line.startsWith("✓");
      const content = line.replace(/^[•✓] /, "");
      const isExtra = content.startsWith("🔍") || content.startsWith("📈");
      return (
        <p key={i} className={`flex items-start gap-2 text-sm leading-relaxed my-0.5 ${isExtra ? "text-indigo-700" : "text-gray-700"}`}>
          <span className={`mt-1 shrink-0 ${isCheck ? "text-emerald-500" : "text-indigo-400"}`}>{isCheck ? "✓" : "•"}</span>
          <span dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
        </p>
      );
    }
    if (line.startsWith("*") && line.endsWith("*")) {
      return <p key={i} className="text-xs text-gray-500 italic mt-3">{line.replace(/^\*/, "").replace(/\*$/, "")}</p>;
    }
    if (line.trim() === "") return <div key={i} className="h-1" />;

    const formatted = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    if (line.startsWith("**") && line.endsWith("**")) {
      return <p key={i} className="text-sm font-semibold text-gray-800 mt-2.5 mb-1" dangerouslySetInnerHTML={{ __html: formatted }} />;
    }
    return <p key={i} className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
  });
}

// ─── КОМПОНЕНТ СЛАЙДЕРА ───────────────────────────────────────────────────────

function SliderWidget({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="mt-3 bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-lg font-bold text-indigo-600">{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>1 — минимум</span>
        <span>10 — максимум</span>
      </div>
    </div>
  );
}

// ─── КОМПОНЕНТ ЧИСЛОВОГО ВВОДА ────────────────────────────────────────────────

function NumberInputWidget({
  placeholder,
  suffix,
  onSubmit,
}: {
  placeholder: string;
  suffix: string;
  onSubmit: (v: number) => void;
}) {
  const [val, setVal] = useState("");
  const isValid = Number(val) > 0;

  return (
    <div className="mt-3 flex gap-2 items-center">
      <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
        <input
          type="number"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3.5 py-3 text-sm outline-none"
          onKeyDown={(e) => e.key === "Enter" && isValid && onSubmit(Number(val))}
        />
        <span className="px-3 text-sm text-gray-500 shrink-0">{suffix}</span>
      </div>
      <button
        onClick={() => isValid && onSubmit(Number(val))}
        disabled={!isValid}
        className="w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 transition-colors flex items-center justify-center shrink-0"
      >
        <Icon name="Send" size={16} className="text-white" />
      </button>
    </div>
  );
}

// ─── ОСНОВНАЯ СТРАНИЦА ────────────────────────────────────────────────────────

export default function PlanBot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [botState, setBotState] = useState<PlanBotState>(INITIAL_PLAN_STATE);
  const [loading, setLoading] = useState(false);
  const [sliderValues, setSliderValues] = useState({ energy: 5, motivation: 5, confidence: 5 });
  const [currentPlan, setCurrentPlan] = useState<FinalPlan | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const addMsg = (from: "bot" | "user", text: string) => {
    const id = Date.now() + Math.random();
    setMessages((m) => [...m, { id, from, text }]);
  };

  const botReply = (text: string, delay = 600) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addMsg("bot", text);
    }, delay);
  };

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) { navigate("/auth"); return; }

    const savedMessages = localStorage.getItem("plan_chat");
    const savedState = localStorage.getItem("plan_state");
    const savedPlan = localStorage.getItem("plan_result");

    if (savedMessages && savedState) {
      setMessages(JSON.parse(savedMessages));
      setBotState(JSON.parse(savedState));
      if (savedPlan) setCurrentPlan(JSON.parse(savedPlan));
    } else {
      setTimeout(() => {
        addMsg("bot", `Привет! Я помогу составить **персональный план развития на 3 месяца**.

Никакого ИИ — только алгоритм на основе твоих реальных показателей. 

Сначала отвечу на несколько вопросов, потом выберу стратегию и сформирую пошаговый план под твои условия.

Готов? Нажми кнопку ниже 👇`);
        setTimeout(() => {
          addMsg("bot", "**Шаг 1 из 7 — Направление**\n\nВыбери, в каком направлении хочешь развиваться:");
          setBotState((s) => ({ ...s, step: "ask_direction" }));
          setLoading(false);
        }, 800);
      }, 400);
    }
  }, [navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("plan_chat", JSON.stringify(messages));
      localStorage.setItem("plan_state", JSON.stringify(botState));
      if (currentPlan) localStorage.setItem("plan_result", JSON.stringify(currentPlan));
    }
  }, [messages, botState, currentPlan]);

  const handleReset = () => {
    localStorage.removeItem("plan_chat");
    localStorage.removeItem("plan_state");
    localStorage.removeItem("plan_result");
    setMessages([]);
    setBotState(INITIAL_PLAN_STATE);
    setCurrentPlan(null);
    setSliderValues({ energy: 5, motivation: 5, confidence: 5 });
    setTimeout(() => {
      addMsg("bot", `Привет! Я помогу составить **персональный план развития на 3 месяца**.

Никакого ИИ — только алгоритм на основе твоих реальных показателей. 

Готов? Начнём с выбора направления:`);
      setBotState((s) => ({ ...s, step: "ask_direction" }));
    }, 300);
  };

  // ── ВЫБОР НАПРАВЛЕНИЯ ────────────────────────────────────────────────────────

  const handleDirection = (dir: Direction) => {
    addMsg("user", DIRECTION_NAMES[dir]);
    setBotState((s) => ({ ...s, step: "ask_energy", inputs: { ...s.inputs, direction: dir } }));
    botReply(`Отлично, «${DIRECTION_NAMES[dir]}» — хороший выбор.

**Шаг 2 из 7 — Уровень энергии**

Оцени, насколько у тебя сейчас есть силы и ресурсы на развитие в этом направлении:`);
  };

  // ── ОБРАБОТЧИКИ СЛАЙДЕРОВ ────────────────────────────────────────────────────

  const handleEnergySubmit = () => {
    const v = sliderValues.energy;
    addMsg("user", `Уровень энергии: ${v}/10`);
    setBotState((s) => ({ ...s, step: "ask_motivation", inputs: { ...s.inputs, energy_level: v } }));
    botReply(`Зафиксировал: ${v}/10.

**Шаг 3 из 7 — Мотивация**

Насколько сильно ты хочешь развиваться именно в этом направлении прямо сейчас?`);
  };

  const handleMotivationSubmit = () => {
    const v = sliderValues.motivation;
    addMsg("user", `Уровень мотивации: ${v}/10`);
    setBotState((s) => ({ ...s, step: "ask_confidence", inputs: { ...s.inputs, motivation_level: v } }));
    botReply(`Понял: ${v}/10.

**Шаг 4 из 7 — Уверенность**

Насколько ты уверен в своих навыках и возможностях для работы в этом направлении?`);
  };

  const handleConfidenceSubmit = () => {
    const v = sliderValues.confidence;
    addMsg("user", `Уровень уверенности: ${v}/10`);
    setBotState((s) => ({ ...s, step: "ask_time", inputs: { ...s.inputs, confidence_level: v } }));
    botReply(`Хорошо.

**Шаг 5 из 7 — Время**

Сколько часов в неделю ты можешь уделять этому направлению? (честно — без перегрузки)`);
  };

  // ── ЧИСЛОВЫЕ ПОЛЯ ────────────────────────────────────────────────────────────

  const handleTimeSubmit = (v: number) => {
    addMsg("user", `${v} часов в неделю`);
    setBotState((s) => ({ ...s, step: "ask_income_target", inputs: { ...s.inputs, time_per_week: v } }));
    botReply(`${v} ч/нед — записал.

**Шаг 6 из 7 — Цель по доходу**

Сколько рублей в месяц ты хочешь зарабатывать в этом направлении через 3 месяца?`);
  };

  const handleIncomeTargetSubmit = (v: number) => {
    addMsg("user", `Цель: ${v.toLocaleString("ru")} ₽/мес`);
    setBotState((s) => ({ ...s, step: "ask_current_income", inputs: { ...s.inputs, income_target: v } }));
    botReply(`Цель — **${v.toLocaleString("ru")} ₽/мес**.

**Шаг 7 из 7 — Текущий доход**

Сколько ты уже зарабатываешь в этом направлении сейчас? (если ничего — введи 0)`);
  };

  const handleCurrentIncomeSubmit = (v: number) => {
    addMsg("user", `Сейчас: ${v > 0 ? v.toLocaleString("ru") + " ₽/мес" : "пока ничего"}`);

    const inputs = { ...botState.inputs, current_income: v } as UserInputs;
    setBotState((s) => ({ ...s, step: "building", inputs }));
    setLoading(true);

    setTimeout(() => {
      const plan = buildPlan(inputs);
      setCurrentPlan(plan);
      const markdown = formatPlanAsMarkdown(plan);
      setLoading(false);
      setBotState((s) => ({ ...s, step: "report" }));
      addMsg("bot", `Анализирую твои данные...`);
      setTimeout(() => {
        addMsg("bot", markdown);
      }, 500);
    }, 1200);
  };

  const step = botState.step;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/cabinet")} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <Icon name="ArrowLeft" size={18} className="text-gray-600" />
        </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
          <Icon name="Map" size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight">Шаги развития</p>
          <p className="text-xs text-gray-500">Персональный план на 3 месяца</p>
        </div>
        {messages.length > 1 && (
          <button onClick={handleReset} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600" title="Начать заново">
            <Icon name="RotateCcw" size={16} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-32">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            {msg.from === "bot" && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 mr-2 mt-1">
                <Icon name="Map" size={14} className="text-white" />
              </div>
            )}
            <div className={`max-w-[92%] ${msg.from === "user" ? "" : "w-full"}`}>
              <div className={`rounded-2xl px-4 py-3 ${
                msg.from === "user"
                  ? "bg-emerald-600 text-white rounded-tr-sm ml-auto inline-block"
                  : "bg-white border border-gray-100 shadow-sm rounded-tl-sm"
              }`}>
                {msg.from === "bot" ? (
                  <div className="text-sm leading-relaxed">{renderMarkdown(msg.text)}</div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>

              {/* Интерактивные блоки под последним сообщением бота */}
              {msg.from === "bot" && msg.id === Math.max(...messages.filter((m) => m.from === "bot").map((m) => m.id)) && !loading && (

                <div className="mt-2 ml-0">
                  {/* Выбор направления */}
                  {step === "ask_direction" && (
                    <div className="grid grid-cols-1 gap-2">
                      {(Object.keys(DIRECTION_NAMES) as Direction[]).map((dir) => (
                        <button
                          key={dir}
                          onClick={() => handleDirection(dir)}
                          className="flex items-center gap-3 bg-white border border-gray-200 text-left px-4 py-3 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all text-sm font-medium text-gray-800"
                        >
                          <Icon name={DIRECTION_ICONS[dir] as "Map"} size={18} className="text-emerald-600 shrink-0" />
                          {DIRECTION_NAMES[dir]}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Слайдер энергии */}
                  {step === "ask_energy" && (
                    <>
                      <SliderWidget
                        label="Уровень энергии"
                        value={sliderValues.energy}
                        onChange={(v) => setSliderValues((s) => ({ ...s, energy: v }))}
                      />
                      <button
                        onClick={handleEnergySubmit}
                        className="mt-2 w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition-colors text-sm"
                      >
                        Подтвердить: {sliderValues.energy}/10 →
                      </button>
                    </>
                  )}

                  {/* Слайдер мотивации */}
                  {step === "ask_motivation" && (
                    <>
                      <SliderWidget
                        label="Уровень мотивации"
                        value={sliderValues.motivation}
                        onChange={(v) => setSliderValues((s) => ({ ...s, motivation: v }))}
                      />
                      <button
                        onClick={handleMotivationSubmit}
                        className="mt-2 w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition-colors text-sm"
                      >
                        Подтвердить: {sliderValues.motivation}/10 →
                      </button>
                    </>
                  )}

                  {/* Слайдер уверенности */}
                  {step === "ask_confidence" && (
                    <>
                      <SliderWidget
                        label="Уровень уверенности"
                        value={sliderValues.confidence}
                        onChange={(v) => setSliderValues((s) => ({ ...s, confidence: v }))}
                      />
                      <button
                        onClick={handleConfidenceSubmit}
                        className="mt-2 w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition-colors text-sm"
                      >
                        Подтвердить: {sliderValues.confidence}/10 →
                      </button>
                    </>
                  )}

                  {/* Числовой ввод: часы в неделю */}
                  {step === "ask_time" && (
                    <NumberInputWidget
                      placeholder="Например: 10"
                      suffix="ч/нед"
                      onSubmit={handleTimeSubmit}
                    />
                  )}

                  {/* Числовой ввод: цель по доходу */}
                  {step === "ask_income_target" && (
                    <NumberInputWidget
                      placeholder="Например: 50000"
                      suffix="₽/мес"
                      onSubmit={handleIncomeTargetSubmit}
                    />
                  )}

                  {/* Числовой ввод: текущий доход */}
                  {step === "ask_current_income" && (
                    <NumberInputWidget
                      placeholder="0 если ещё не зарабатываешь"
                      suffix="₽/мес"
                      onSubmit={handleCurrentIncomeSubmit}
                    />
                  )}

                  {/* Кнопка скачать/сохранить план */}
                  {step === "report" && currentPlan && (
                    <div className="mt-3 flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const text = formatPlanAsMarkdown(currentPlan);
                            const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "plan_3_months.txt";
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="flex-1 flex items-center gap-2 justify-center bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition-colors text-sm"
                        >
                          <Icon name="Download" size={16} />
                          Скачать .txt
                        </button>
                        <button
                          onClick={() => {
                            const plan = currentPlan;
                            const md = formatPlanAsMarkdown(plan);
                            const html = md
                              .split("\n")
                              .map((line) => {
                                if (line.startsWith("# ")) return `<h1>${line.replace(/^# /, "")}</h1>`;
                                if (line.startsWith("## ")) return `<h2>${line.replace(/^## /, "")}</h2>`;
                                if (line.startsWith("### ")) return `<h3>${line.replace(/^### /, "")}</h3>`;
                                if (line.startsWith("---")) return `<hr/>`;
                                if (line.startsWith("> ")) return `<blockquote>${line.replace(/^> /, "")}</blockquote>`;
                                if (line.startsWith("• ") || line.startsWith("✓ ")) return `<p class="bullet">${line}</p>`;
                                if (line.trim() === "") return `<br/>`;
                                return `<p>${line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`;
                              })
                              .join("");

                            const win = window.open("", "_blank");
                            if (!win) return;
                            win.document.write(`<!DOCTYPE html><html><head>
                              <meta charset="utf-8"/>
                              <title>Мой план развития на 3 месяца</title>
                              <style>
                                body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; color: #1a1a1a; line-height: 1.6; padding: 0 20px; }
                                h1 { font-size: 22px; color: #059669; border-bottom: 2px solid #059669; padding-bottom: 8px; margin-top: 32px; }
                                h2 { font-size: 17px; color: #1a1a1a; margin-top: 24px; }
                                h3 { font-size: 14px; color: #374151; margin-top: 18px; }
                                hr { border: none; border-top: 1px solid #e5e7eb; margin: 16px 0; }
                                blockquote { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 8px 12px; margin: 10px 0; border-radius: 0 8px 8px 0; font-size: 13px; }
                                p { font-size: 13px; margin: 4px 0; }
                                p.bullet { padding-left: 8px; }
                                strong { font-weight: 600; }
                                @media print { body { margin: 20px; } }
                              </style>
                            </head><body>${html}<br/><p style="color:#9ca3af;font-size:11px;margin-top:32px">Сформировано: ${new Date().toLocaleDateString("ru-RU")}</p></body></html>`);
                            win.document.close();
                            setTimeout(() => { win.focus(); win.print(); }, 400);
                          }}
                          className="flex-1 flex items-center gap-2 justify-center bg-white border border-emerald-300 text-emerald-700 font-semibold py-3 rounded-xl hover:bg-emerald-50 transition-colors text-sm"
                        >
                          <Icon name="FileText" size={16} />
                          Сохранить PDF
                        </button>
                      </div>
                      <button
                        onClick={handleReset}
                        className="flex items-center gap-2 justify-center bg-white border border-gray-200 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                      >
                        <Icon name="RotateCcw" size={15} />
                        Построить новый план
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 mr-2 mt-1">
              <Icon name="Map" size={14} className="text-white" />
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}