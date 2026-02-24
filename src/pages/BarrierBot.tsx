import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAccess, saveToolCompletion } from "@/lib/access";
import Icon from "@/components/ui/icon";
import BarrierBotPaywall from "@/components/barrier-bot/BarrierBotPaywall";
import BarrierBotChat from "@/components/barrier-bot/BarrierBotChat";
import ToolHint from "@/components/ToolHint";
import BarrierBotHistory, { BarrierSession } from "@/components/barrier-bot/BarrierBotHistory";
import {
  BotState,
  Message,
  Widget,
  INITIAL_STATE,
  applyAnswer,
  recalcY,
  detectProfile,
  PROFILE_TEXTS,
  CONTEXTS,
  STRENGTHS,
  WEAKNESSES,
} from "@/components/barrier-bot/barrierBotEngine";

const WELCOME_TEXT = `Привет! Это инструмент **«Барьеры, тревоги и стресс»**.

Мы воссоздадим твой прошлый провал по шагам, найдём точку срыва и покажем — как её можно было удержать.

Никакого AI — только твои ответы, логика и координатная модель X–Y.

Готов начать?`;

const BARRIER_API = "https://functions.poehali.dev/817cc650-9d57-4575-8a6d-072b98b1b815";

export default function BarrierBot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [botState, setBotState] = useState<BotState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [tab, setTab] = useState<"chat" | "history">("chat");
  const [sessions, setSessions] = useState<BarrierSession[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const getUserEmail = () => {
    const u = localStorage.getItem("pdd_user");
    return u ? JSON.parse(u).email : "";
  };

  const getUserData = () => {
    const u = localStorage.getItem("pdd_user");
    return u ? JSON.parse(u) : null;
  };

  const loadSessions = async (email: string, userId?: number) => {
    const localRaw = localStorage.getItem(`barrier_results_${email}`) ?? "[]";
    const localSessions = JSON.parse(localRaw);
    
    if (localSessions.length > 0) {
      setSessions(localSessions);
    }

    if (!userId) return;

    try {
      const resp = await fetch(BARRIER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync", userId, sessions: localSessions }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.sessions) {
          setSessions(data.sessions);
          localStorage.setItem(`barrier_results_${email}`, JSON.stringify(data.sessions));
          if (data.sessions.length > 0) {
            localStorage.setItem(`pdd_ever_done_${email}_barrier-bot`, "1");
          }
        }
      }
    } catch {
      if (localSessions.length > 0) {
        localStorage.setItem(`pdd_ever_done_${email}_barrier-bot`, "1");
      }
    }
  };

  const addMsg = (from: "bot" | "user", text: string, widget?: Widget) => {
    const id = Date.now() + Math.random();
    setMessages((m) => [...m, { id, from, text, widget }]);
  };

  const botReply = (text: string, widget?: Widget, delay = 500) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addMsg("bot", text, widget);
    }, delay);
  };

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) { navigate("/auth"); return; }
    const userData = JSON.parse(u);

    const access = checkAccess("barrier-bot");
    const hasAcc = access !== "locked";
    if (hasAcc) {
      setHasAccess(true);
    }

    loadSessions(userData.email, userData.id);

    const savedMessages = localStorage.getItem(`barrier_chat_${userData.email}`);
    const savedState = localStorage.getItem(`barrier_state_${userData.email}`);

    if (savedMessages && savedState && hasAcc) {
      setMessages(JSON.parse(savedMessages));
      setBotState(JSON.parse(savedState));
    }
  }, [navigate]);

  useEffect(() => {
    if (hasAccess && messages.length === 0) {
      botReply(WELCOME_TEXT, { type: "choices", options: ["Начать →"] });
    }
  }, [hasAccess]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const email = getUserEmail();
    if (!email || !hasAccess) return;
    if (messages.length > 0) {
      localStorage.setItem(`barrier_chat_${email}`, JSON.stringify(messages));
      localStorage.setItem(`barrier_state_${email}`, JSON.stringify(botState));
    }
  }, [messages, botState, hasAccess]);

  const handlePay = () => {
    setHasAccess(true);
  };

  const handleNewSession = () => {
    const email = getUserEmail();
    if (!email) return;
    localStorage.removeItem(`barrier_chat_${email}`);
    localStorage.removeItem(`barrier_state_${email}`);
    setMessages([]);
    setBotState(INITIAL_STATE);
    setTab("chat");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const id = Date.now() + Math.random();
      setMessages([{ id, from: "bot", text: WELCOME_TEXT, widget: { type: "choices", options: ["Начать →"] } }]);
    }, 500);
  };

  const getNextBotMessage = (newState: BotState, _answer: string | number | string[]): { text: string; widget?: Widget } => {
    switch (newState.phase) {
      case "context":
        return {
          text: "Выбери сферу, в которой был провал:",
          widget: { type: "choices", options: CONTEXTS },
        };

      case "strength":
        return {
          text: `Сфера: **${newState.selectedContext}**\n\nВыбери свои сильные стороны — то, что тебе помогало двигаться вперёд. Можно выбрать до 2:`,
          widget: { type: "multi_choices", options: STRENGTHS, max: 2 },
        };

      case "weakness":
        return {
          text: `Теперь выбери **основную слабую реакцию** — то, что тебя тормозит или ломает изнутри:`,
          widget: { type: "choices", options: WEAKNESSES },
        };

      case "steps_intro":
        return {
          text: `Отлично. Теперь восстановим провал по шагам.\n\nВведи минимум **5 шагов** (максимум 10) — по порядку, от начала до момента, когда ты сдался.\n\nДля каждого шага ты укажешь:\n- Что именно происходило\n- Насколько это приближало к цели (X, 1–10)\n- Какой уровень напряжения ты чувствовал (Y, 0–10)\n\nГотов?`,
          widget: { type: "choices", options: ["Начать →"] },
        };

      case "step_text":
        return {
          text: `**Шаг ${newState.currentStepIndex + 1}**\n\nОпиши, что происходило на этом шаге:`,
          widget: { type: "text_input", placeholder: "Например: я отправил резюме / сделал первый звонок..." },
        };

      case "step_x": {
        const last = newState.steps[newState.currentStepIndex];
        return {
          text: `Шаг ${last?.index}: «${last?.text}»\n\nНасколько этот шаг **приближал вас к успеху**?`,
          widget: { type: "slider", min: 1, max: 10, label: "1 — почти не приближал, 10 — огромный шаг вперёд" },
        };
      }

      case "step_y":
        return {
          text: `Какой **уровень напряжения** вы чувствовали в этот момент?`,
          widget: { type: "slider", min: 0, max: 10, label: "0 — спокойно, 10 — паника / невыносимо" },
        };

      case "step_more": {
        const done = newState.currentStepIndex;
        const canAdd = done < 10;
        const opts = done >= 5
          ? (canAdd ? ["Добавить ещё шаг", "Всё, завершить ввод"] : ["Всё, завершить ввод"])
          : (canAdd ? ["Добавить ещё шаг"] : ["Всё, завершить ввод"]);
        return {
          text: `Шаг ${done} сохранён.\n\nДобавить ещё один?`,
          widget: { type: "choices", options: opts },
        };
      }

      case "break_point": {
        const bp = newState.breakStep;
        if (bp >= 0) {
          const bs = newState.steps[bp];
          return {
            text: `Алгоритм нашёл **возможную точку срыва** — шаг ${bp + 1}: «${bs?.text}»\n\nНа этом шаге тревога достигла **${bs?.y}/10**.\n\nПодтвердить эту точку или указать другую?`,
            widget: { type: "choices", options: ["Да, это он", "Указать другой шаг"] },
          };
        }
        return {
          text: "Алгоритм не нашёл явной точки срыва автоматически.\n\nНа каком шаге ты внутренне начал сдаваться? Укажи номер:",
          widget: { type: "slider", min: 1, max: newState.steps.length, label: "Номер шага" },
        };
      }

      case "break_manual":
        return {
          text: "На каком шаге ты начал внутренне сдаваться? Укажи номер шага:",
          widget: { type: "slider", min: 1, max: newState.steps.length, label: "Номер шага" },
        };

      case "insight": {
        const bp = newState.breakStep;
        const bs = newState.steps[bp] ?? newState.steps[newState.steps.length - 1];
        const profile = PROFILE_TEXTS[newState.psychProfile];
        return {
          text: `## Вот твой путь\n\nТы дошёл до шага ${bp + 1}. Прогресс рос. Но тревога тоже росла — и на шаге ${bp + 1} достигла **${bs?.y}/10**.\n\nПосле этого движение остановилось.\n\n---\n\n**Ты не слабый.**\nТы не выдержал уровень внутреннего напряжения — это не одно и то же.\n\n---\n\n**Твой психологический профиль:**\n${profile?.title}\n\n${profile?.desc}`,
          widget: { type: "chart", steps: newState.steps, breakStep: bp },
        };
      }

      case "additional_strength":
        return {
          text: `Теперь — ключевой вопрос.\n\nКакая ещё твоя сильная сторона могла бы **помочь удержаться** в точке срыва? Выбери до 2:`,
          widget: { type: "multi_choices", options: STRENGTHS.filter((s) => !newState.mainStrength.includes(s)), max: 2 },
        };

      case "recalc": {
        const bp = newState.breakStep;
        const bs = newState.steps[bp] ?? newState.steps[newState.steps.length - 1];
        const origY = bs?.y ?? 0;
        const newY = recalcY(origY, newState.mainWeakness, newState.additionalStrength.length);
        const held = newY < 7;
        return {
          text: `## Что было бы иначе\n\nЕсли бы ты опирался на **${newState.additionalStrength.join(" и ")}**:\n\n• Было: тревога = **${origY}/10** → срыв\n• Стало: тревога = **${newY}/10** → ${held ? "✓ удержание позиции" : "напряжение снизилось"}\n\nПри добавлении второй опоры уровень напряжения снижается. Ты мог бы продолжить движение.`,
          widget: { type: "chart", steps: newState.steps, breakStep: bp, newY },
        };
      }

      case "result": {
        const email = getUserEmail();
        const userData = getUserData();
        const record: BarrierSession = {
          date: new Date().toLocaleDateString("ru-RU"),
          context: newState.selectedContext,
          mainStrength: newState.mainStrength,
          mainWeakness: newState.mainWeakness,
          additionalStrength: newState.additionalStrength,
          breakStep: newState.breakStep,
          profile: newState.psychProfile,
          steps: newState.steps,
        };

        if (userData?.id) {
          fetch(BARRIER_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "save", userId: userData.id, sessionData: record }),
          })
            .then((r) => r.json())
            .then((data) => {
              if (data.id) {
                const withId = { ...record, _server_id: data.id };
                const updated = [...sessions, withId];
                setSessions(updated);
                localStorage.setItem(`barrier_results_${email}`, JSON.stringify(updated));
              }
            })
            .catch(() => {
              const updated = [...sessions, record];
              setSessions(updated);
              localStorage.setItem(`barrier_results_${email}`, JSON.stringify(updated));
            });
        } else {
          const updated = [...sessions, record];
          setSessions(updated);
          localStorage.setItem(`barrier_results_${email}`, JSON.stringify(updated));
        }

        localStorage.setItem(`pdd_ever_done_${email}_barrier-bot`, "1");
        saveToolCompletion("barrier-bot", `Анализ барьеров завершён — сфера «${newState.selectedContext}», профиль ${PROFILE_TEXTS[newState.psychProfile]?.title ?? "определён"}`);

        return {
          text: `## Сессия завершена\n\nТы прошёл полный цикл анализа. Вот что ты узнал:\n\n• **Сфера:** ${newState.selectedContext}\n• **Слабость:** ${newState.mainWeakness}\n• **Сила:** ${newState.mainStrength.join(", ")}\n• **Дополнительная опора:** ${newState.additionalStrength.join(", ")}\n• **Профиль:** ${PROFILE_TEXTS[newState.psychProfile]?.title}\n\n---\n\nСессия сохранена. Посмотри историю — там можно скачать PDF или начать новый анализ.`,
          widget: { type: "confirm" },
        };
      }

      case "done":
        return { text: "Анализ сохранён. Возвращайся, когда будет следующий вызов — сравним динамику." };

      default:
        return { text: "..." };
    }
  };

  const handleAnswer = (answer: string | number | string[]) => {
    const displayText = Array.isArray(answer) ? answer.join(", ") : String(answer);
    addMsg("user", displayText);

    const newState = applyAnswer(botState, answer);
    setBotState(newState);

    const { text, widget } = getNextBotMessage(newState, answer);
    botReply(text, widget);
  };

  const isDone = botState.phase === "done" || botState.phase === "result";
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const userData = getUserData();
    if (!userData) return;
    const email = userData.email;

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);

    if (userData.id) {
      try {
        const resp = await fetch(BARRIER_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "sync", userId: userData.id, sessions }),
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.sessions) {
            setSessions(data.sessions);
            localStorage.setItem(`barrier_results_${email}`, JSON.stringify(data.sessions));
          }
        }
      } catch { /* localStorage fallback already done */ }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-4xl mx-auto w-full">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => navigate("/cabinet?tab=tools")}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <Icon name="ArrowLeft" size={18} className="text-gray-600" />
        </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center">
          <Icon name="ShieldAlert" size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-gray-900">Барьеры, тревоги и стресс</div>
          <div className="text-xs text-gray-400">Координатный анализ X–Y</div>
        </div>
        {hasAccess && sessions.length > 0 && (
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setTab("chat")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${tab === "chat" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
            >
              Анализ
            </button>
            <button
              onClick={() => setTab("history")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${tab === "history" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
            >
              История {sessions.length > 0 && <span className="ml-1 text-rose-500">{sessions.length}</span>}
            </button>
          </div>
        )}
      </div>

      {!hasAccess ? (
        <BarrierBotPaywall onPay={handlePay} />
      ) : tab === "history" ? (
        <div className="flex-1 overflow-y-auto">
          <BarrierBotHistory sessions={sessions} onNewSession={handleNewSession} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {!isDone && messages.length <= 1 && (
            <ToolHint
              title="Как получить точный результат"
              items={[
                "Вспомните конкретную ситуацию, когда вы хотели что-то сделать (проект, решение, шаг) — но в итоге отступили или сорвались.",
                "Восстановите путь поэтапно: от идеи и желания — через первые действия — до момента, когда стало тяжело. Что вы чувствовали на каждом шаге?",
                "Погрузитесь в ту ситуацию — как будто она происходит сейчас. Чем честнее ответы, тем точнее анализ.",
                "Убедитесь, что вас никто не отвлекает. Выделите 10–15 минут тишины. Не торопитесь с ответами.",
                "Отвечайте от первого лица, про себя. Не про то, «как должно быть», а про то, как было на самом деле.",
              ]}
            />
          )}
          {isDone && (
            <div className="px-4 pt-3 flex flex-col gap-2">
              <button
                onClick={handleSave}
                disabled={saved}
                className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  saved
                    ? "bg-green-100 border border-green-300 text-green-700"
                    : "bg-rose-500 text-white hover:bg-rose-600"
                }`}
              >
                <Icon name={saved ? "CheckCircle" : "Save"} size={15} />
                {saved ? "Результат сохранён!" : "Сохранить результат"}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleNewSession}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm font-semibold hover:bg-rose-100 transition-colors"
                >
                  <Icon name="RotateCcw" size={15} />
                  Новая сессия
                </button>
                {sessions.length > 0 && (
                  <button
                    onClick={() => setTab("history")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    <Icon name="History" size={15} />
                    История и PDF
                  </button>
                )}
              </div>
            </div>
          )}
          <BarrierBotChat
            messages={messages}
            loading={loading}
            onAnswer={handleAnswer}
            bottomRef={bottomRef as React.RefObject<HTMLDivElement>}
          />
        </div>
      )}
    </div>
  );
}