import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { checkAccess, saveToolCompletion, getLatestCareerResult } from "@/lib/access";
import PaywallModal from "@/components/PaywallModal";
import IncomeBotHistory, { IncomeSession } from "@/components/income-bot/IncomeBotHistory";
import IncomeBotSourceChoice from "@/components/income-bot/IncomeBotSourceChoice";
import IncomeBotChat from "@/components/income-bot/IncomeBotChat";
import ToolHint from "@/components/ToolHint";
import SyncIndicator from "@/components/SyncIndicator";
import { QUESTIONS, RESULT_LABELS } from "@/components/income-bot/types";
import type { Message, ResultKey, Plan } from "@/components/income-bot/types";
import { calcScores, pickResult, getUserEmail } from "@/components/income-bot/engine";
import useToolSync from "@/hooks/useToolSync";

export default function IncomeBot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const [resultKey, setResultKey] = useState<ResultKey | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [msgId, setMsgId] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showSourceChoice, setShowSourceChoice] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"chat" | "history">("chat");
  const { sessions, saveSession, syncing } = useToolSync<IncomeSession>("income-bot", "income_results");

  const addMsg = (from: "bot" | "user", text: string) => {
    setMsgId((prev) => {
      const id = prev + 1;
      setMessages((m) => [...m, { id, from, text }]);
      return id;
    });
  };

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) { navigate("/auth"); return; }

    const access = checkAccess("income-bot");
    if (access === "locked") { setShowPaywall(true); return; }

    const u2 = JSON.parse(u);
    const hasPsych = !!localStorage.getItem(`psych_result_${u2.email}`);
    const hasCareer = !!getLatestCareerResult();
    if (hasPsych && hasCareer) { setShowSourceChoice(true); return; }

    setTimeout(() => {
      addMsg("bot", "Привет! Я помогу подобрать тебе подходящий вариант дополнительного дохода.");
      setTimeout(() => {
        addMsg("bot", QUESTIONS[0].text);
      }, 700);
    }, 300);
  }, [navigate]);

  const handleOption = (option: string) => {
    if (finished || analyzing) return;
    const currentQ = QUESTIONS[step];
    addMsg("user", option);

    const newAnswers = { ...answers, [currentQ.key]: option };
    setAnswers(newAnswers);

    const nextStep = step + 1;

    if (nextStep < QUESTIONS.length) {
      setTimeout(() => addMsg("bot", "Записал."), 400);
      setTimeout(() => addMsg("bot", QUESTIONS[nextStep].text), 900);
      setStep(nextStep);
    } else {
      setFinished(true);
      setAnalyzing(true);
      setTimeout(() => addMsg("bot", "Анализирую ответы..."), 400);
      setTimeout(async () => {
        const scores = calcScores(newAnswers);
        const key = pickResult(scores);
        setResultKey(key);
        try {
          const [resResult, resPlan] = await Promise.all([
            fetch("/results.json"),
            fetch("/plans.json"),
          ]);
          const resultData = await resResult.json();
          const planData = await resPlan.json();
          const resultText = resultData[key] ?? "Результат не найден.";
          const planObj = planData[key] ?? null;
          setResult(resultText);
          setPlan(planObj);

          const session: IncomeSession = {
            date: new Date().toLocaleDateString("ru-RU"),
            resultKey: key,
            resultText,
            planTitle: planObj?.title ?? "",
            planSteps: planObj?.steps ?? [],
            answers: newAnswers,
          };
          await saveSession(session);
        } catch {
          setResult("Не удалось загрузить результат. Попробуй обновить страницу.");
        }
        setAnalyzing(false);
        saveToolCompletion("income-bot", `Подбор дохода: ${RESULT_LABELS[key]}`);
      }, 2200);
    }
  };

  const startBot = (hint?: string) => {
    setShowSourceChoice(false);
    setTimeout(() => {
      addMsg("bot", hint
        ? `Привет! Подбираю доход с учётом ${hint}.\n\nОтвечай честно — результат зависит от точности ответов.`
        : "Привет! Я помогу подобрать тебе подходящий вариант дополнительного дохода."
      );
      setTimeout(() => addMsg("bot", QUESTIONS[0].text), 700);
    }, 300);
  };

  const handleNewSession = () => {
    setMessages([]);
    setAnswers({});
    setStep(0);
    setFinished(false);
    setResult(null);
    setResultKey(null);
    setPlan(null);
    setAnalyzing(false);
    setSaved(false);
    setMsgId(0);
    setTab("chat");
    setTimeout(() => {
      addMsg("bot", "Привет! Я помогу подобрать тебе подходящий вариант дополнительного дохода.");
      setTimeout(() => addMsg("bot", QUESTIONS[0].text), 700);
    }, 300);
  };

  const handleGoToPlan = () => {
    if (!resultKey) return;
    const email = getUserEmail();
    if (email) {
      localStorage.setItem(`income_context_${email}`, JSON.stringify({
        direction: resultKey,
        resultLabel: RESULT_LABELS[resultKey],
        incomeTarget: answers.income_target || "",
        timePerWeek: answers.time_per_week || "",
      }));
    }
    navigate("/plan-bot");
  };

  const currentOptions = !finished && step < QUESTIONS.length ? QUESTIONS[step].options : [];
  const isDone = !!result && !analyzing;

  if (showPaywall) {
    return (
      <div className="min-h-screen font-golos" style={{ background: "hsl(248, 50%, 98%)" }}>
        <PaywallModal
          toolId="income-bot"
          toolName="Подбор дохода"
          onClose={() => navigate("/cabinet?tab=tools")}
          onSuccess={() => { setShowPaywall(false); startBot(); }}
        />
      </div>
    );
  }

  if (showSourceChoice) {
    return (
      <IncomeBotSourceChoice
        onSelect={startBot}
        onBack={() => navigate("/cabinet?tab=tools")}
      />
    );
  }

  return (
    <div className="min-h-screen font-golos flex flex-col max-w-4xl mx-auto w-full" style={{ background: "hsl(248, 50%, 98%)" }}>
      <header className="sticky top-0 z-40 bg-white border-b border-border px-4 h-14 flex items-center gap-3">
        <button onClick={() => navigate("/cabinet?tab=tools")} className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <Icon name="ArrowLeft" size={18} className="text-muted-foreground" />
        </button>
        <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shrink-0">
          <Icon name="Banknote" size={15} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-foreground leading-tight">Подбор дохода</div>
          <div className="text-xs text-muted-foreground">Автоматический навигатор</div>
        </div>
        <SyncIndicator syncing={syncing} />
        {sessions.length > 0 && (
          <div className="flex gap-1 bg-gray-100 rounded-xl p-0.5">
            <button
              onClick={() => setTab("chat")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${tab === "chat" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
            >
              Подбор
            </button>
            <button
              onClick={() => setTab("history")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${tab === "history" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
            >
              История ({sessions.length})
            </button>
          </div>
        )}
      </header>

      {tab === "history" ? (
        <IncomeBotHistory sessions={sessions} onNewSession={handleNewSession} />
      ) : (
        <>
        {!isDone && messages.length <= 2 && (
          <ToolHint
            title="Как получить точный результат"
            items={[
              "Отвечайте исходя из того, что вам реально нравится и подходит, а не из того, что «правильно» или модно.",
              "Учитывайте своё текущее время, энергию и ресурсы — бот подберёт доход под ваши реальные возможности.",
              "Будьте честны в оценке навыков — завышенные ответы дадут неподходящие рекомендации.",
              "Выделите 5–10 минут без отвлечений, чтобы не торопиться с ответами.",
            ]}
          />
        )}
        <IncomeBotChat
          messages={messages}
          analyzing={analyzing}
          result={result}
          plan={plan}
          isDone={isDone}
          currentOptions={currentOptions}
          sessionsCount={sessions.length}
          onOptionClick={handleOption}
          onGoToPlan={handleGoToPlan}
          onNewSession={handleNewSession}
          onShowHistory={() => setTab("history")}
        />
        </>
      )}
    </div>
  );
}