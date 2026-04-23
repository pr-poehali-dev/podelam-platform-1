import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  ENERGY_TEXT,
  BURNOUT_TEXT,
  FORMAT_TEXT,
  PROFILE_DESCRIPTIONS,
  SEGMENT_NAMES,
  PROFILE_MATRIX,
} from "@/components/psych-bot/psychBotData";
import { checkAccess, payFromBalanceOnce, getBalance, TOOL_PRICE } from "@/lib/access";
import BalanceTopUpModal from "@/components/BalanceTopUpModal";
import { TestResult, PsychResult, trackEvent } from "@/components/results/resultsTypes";
import ResultsHero from "@/components/results/ResultsHero";
import ResultsPaywall from "@/components/results/ResultsPaywall";
import ResultsUnlocked from "@/components/results/ResultsUnlocked";

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<TestResult | null>(null);
  const [psychResult, setPsychResult] = useState<PsychResult | null>(null);
  const [funnelStep, setFunnelStep] = useState<"emotion" | "pain" | "offer" | "unlocked">("emotion");
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState("");
  const [showTopUp, setShowTopUp] = useState(false);
  const [balance, setBalance] = useState(() => getBalance());

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) { navigate("/auth"); return; }
    const userData = JSON.parse(u);

    const tests: TestResult[] = JSON.parse(localStorage.getItem(`pdd_tests_${userData.email}`) || "[]");
    const found = tests.find((t) => t.id === id);
    if (found) {
      setResult(found);
      if (found.type === "Тест на призвание") {
        const saved = localStorage.getItem(`psych_result_${userData.email}`);
        if (saved) {
          setPsychResult(JSON.parse(saved));
        } else if (userData.id) {
          fetch("https://functions.poehali.dev/817cc650-9d57-4575-8a6d-072b98b1b815", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "load", userId: userData.id, toolType: "psych-bot" }),
          })
            .then((r) => r.json())
            .then((data) => {
              const sessions = data.sessions || [];
              if (sessions.length > 0) {
                const latest = sessions[sessions.length - 1];
                const sd = latest.session_data || latest;
                if (sd.topSeg) {
                  setPsychResult(sd);
                  localStorage.setItem(`psych_result_${userData.email}`, JSON.stringify(sd));
                }
              }
            })
            .catch(() => {});
        }
      }
    } else if (userData.id) {
      fetch("https://functions.poehali.dev/817cc650-9d57-4575-8a6d-072b98b1b815", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "load", userId: userData.id, toolType: "psych-bot" }),
      })
        .then((r) => r.json())
        .then((data) => {
          const sessions = data.sessions || [];
          if (sessions.length > 0) {
            const latest = sessions[sessions.length - 1];
            const sd = latest.session_data || latest;
            if (sd.topSeg && sd.profileName) {
              const topSegScore = sd.topSegScore ?? 0;
              const restoredResult: TestResult = {
                id: id || Date.now().toString(),
                type: "Тест на призвание",
                date: new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }),
                score: topSegScore,
              };
              setResult(restoredResult);
              setPsychResult(sd);
              localStorage.setItem(`psych_result_${userData.email}`, JSON.stringify(sd));
              const allTests: TestResult[] = JSON.parse(localStorage.getItem(`pdd_tests_${userData.email}`) || "[]");
              if (!allTests.find((t) => t.type === "Тест на призвание")) {
                allTests.push(restoredResult);
                localStorage.setItem(`pdd_tests_${userData.email}`, JSON.stringify(allTests));
              }
            }
          }
        })
        .catch(() => {});
    }

    // Проверяем, оплачен ли уже psych-bot
    const access = checkAccess("psych-bot");
    if (access === "paid_once" || access === "subscribed") {
      setFunnelStep("unlocked");
    }

    trackEvent("results_view");
  }, [id, navigate]);

  const topSeg = psychResult?.topSeg ?? "analytics";
  const primMotiv = psychResult?.primMotiv ?? "meaning";
  const profileName = psychResult?.profileName ?? PROFILE_MATRIX[primMotiv]?.[topSeg] ?? result?.type ?? "";
  const selectedProf = psychResult?.selectedProf ?? "";
  const topSegs = psychResult?.topSegs ?? [];
  const topMotivations = psychResult?.topMotivations ?? [];
  const professions = psychResult?.professions ?? [];

  const description = psychResult ? (PROFILE_DESCRIPTIONS[primMotiv]?.[topSeg] ?? "") : "";
  const energyText = psychResult ? (ENERGY_TEXT[topSeg] ?? "") : "";
  const burnoutText = psychResult ? (BURNOUT_TEXT[topSeg] ?? "") : "";
  const formatText = psychResult ? (FORMAT_TEXT[topSeg] ?? "") : "";

  const steps = psychResult
    ? [
        selectedProf ? `Изучи, что делает «${selectedProf}» в реальных проектах — найди 2–3 кейса` : `Изучи 2–3 реальных кейса по направлению «${SEGMENT_NAMES[topSeg]}»`,
        "Найди одного человека в этой сфере и задай ему 3 вопроса про вход в профессию",
        "Пройди 1 бесплатный урок или мини-курс по выбранному направлению",
        "Сделай первый маленький проект — даже учебный — и покажи кому-нибудь",
        "Сформулируй своё предложение в 2 предложениях и предложи помощь 3 людям бесплатно",
      ]
    : [
        "Сформулируй 3 направления, которые тебя давно привлекают",
        "Пройди 1–2 бесплатных онлайн-урока по каждому из них",
        "Найди первый пет-проект или волонтёрскую задачу для практики",
        "Собери портфолио из 3–5 работ — даже учебных",
        "Поговори с 2–3 людьми, которые уже работают в этих сферах",
      ];

  const handlePayClick = async () => {
    setPayError("");
    if (balance >= TOOL_PRICE) {
      setPayLoading(true);
      trackEvent("results_pay_click");
      try {
        const ok = await payFromBalanceOnce("psych-bot");
        if (ok) {
          setFunnelStep("unlocked");
          setBalance(getBalance());
          trackEvent("results_pay_success", { method: "balance" });
        } else {
          setPayError("Ошибка списания. Попробуйте ещё раз.");
        }
      } catch {
        setPayError("Ошибка оплаты. Попробуйте ещё раз.");
      } finally {
        setPayLoading(false);
      }
    } else {
      trackEvent("results_pay_click");
      setShowTopUp(true);
    }
  };

  if (!result) return (
    <div className="min-h-screen gradient-soft flex items-center justify-center font-golos">
      <div className="text-center">
        <Icon name="Loader2" size={32} className="animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Загружаем результаты...</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen font-golos" style={{ background: "hsl(248, 50%, 98%)" }}>
        {/* HEADER */}
        <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
            <button onClick={() => navigate("/cabinet")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
              <Icon name="ChevronLeft" size={18} />
              Кабинет
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
                <Icon name="Compass" size={13} className="text-white" />
              </div>
              <span className="font-bold text-foreground text-sm">ПоДелам</span>
            </div>
            <div className="w-16" />
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <ResultsHero
            result={result}
            psychResult={psychResult}
            profileName={profileName}
            topSeg={topSeg}
            topMotivations={topMotivations}
            professions={professions}
            topSegs={topSegs}
          />

          {funnelStep !== "unlocked" && (
            <ResultsPaywall
              payLoading={payLoading}
              payError={payError}
              onPayClick={handlePayClick}
            />
          )}

          {funnelStep === "unlocked" && (
            <ResultsUnlocked
              topSeg={topSeg}
              description={description}
              energyText={energyText}
              burnoutText={burnoutText}
              formatText={formatText}
              topSegs={topSegs}
              professions={professions}
              selectedProf={selectedProf}
              steps={steps}
            />
          )}

          {/* ─── Нижняя навигация ─── */}
          <div className="pb-6 pt-2">
            <button
              onClick={() => navigate("/cabinet")}
              className="w-full border-2 border-border text-foreground font-bold py-3.5 rounded-2xl text-sm hover:bg-secondary transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="ArrowLeft" size={16} />
              В личный кабинет
            </button>
          </div>
        </div>
      </div>

      {showTopUp && (
        <BalanceTopUpModal
          onClose={() => setShowTopUp(false)}
          onSuccess={() => {
            setBalance(getBalance());
            setShowTopUp(false);
            setTimeout(async () => {
              const newBalance = getBalance();
              if (newBalance >= TOOL_PRICE) {
                const ok = await payFromBalanceOnce("psych-bot");
                if (ok) {
                  setFunnelStep("unlocked");
                  setBalance(getBalance());
                  trackEvent("results_pay_success", { method: "topup_then_balance" });
                }
              }
            }, 300);
          }}
        />
      )}
    </>
  );
}
