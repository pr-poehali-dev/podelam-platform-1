import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InstallPWA from "@/components/InstallPWA";
import { PRO_TRAINERS } from "@/lib/proTrainerTypes";
import {
  hasProAccess,
  proAccessExpiresFormatted,
  getSavedSessions,
} from "@/lib/proTrainerAccess";
import BalanceTopUpModal from "@/components/BalanceTopUpModal";
import { getBalance } from "@/lib/access";
import STPLNav from "@/components/strategic-thinking-pro/STPLNav";
import STPLHero from "@/components/strategic-thinking-pro/STPLHero";
import STPLSocial from "@/components/strategic-thinking-pro/STPLSocial";
import STPLPricing from "@/components/strategic-thinking-pro/STPLPricing";

const TRAINER_ID = "strategic-thinking" as const;

const META = {
  title: "Стратегическое мышление PRO — симулятор стратегических решений | ПоДелам",
  description:
    "Прокачай стратегическое мышление. 7 этапов анализа, 6 индексов, OSI-балл, PDF-отчёт. Без ИИ — чистая логика. От 3 590 ₽.",
};

function setMeta(name: string, content: string, property?: boolean) {
  const attr = property ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function StrategicThinkingProLanding() {
  const navigate = useNavigate();
  const trainer = PRO_TRAINERS.find((t) => t.id === TRAINER_ID)!;
  const [access, setAccess] = useState(false);
  const [expiresLabel, setExpiresLabel] = useState<string | null>(null);
  const [hasHistory, setHasHistory] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [showTopUp, setShowTopUp] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const prevTitle = document.title;
    document.title = META.title;
    setMeta("description", META.description);
    setMeta("og:title", META.title, true);
    setMeta("og:description", META.description, true);
    return () => { document.title = prevTitle; };
  }, []);

  useEffect(() => {
    const refresh = () => {
      setAccess(hasProAccess(TRAINER_ID));
      setExpiresLabel(proAccessExpiresFormatted(TRAINER_ID));
      setHasHistory(getSavedSessions(TRAINER_ID).some((s) => s.completedAt && s.results));
      getBalance();
    };
    refresh();
    window.addEventListener("pdd_balance_change", refresh);
    return () => window.removeEventListener("pdd_balance_change", refresh);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx((i) => (i + 1) % 3), 5500);
    return () => clearInterval(t);
  }, []);

  function handleCTA(planId?: string) {
    const plan = planId ?? "pro";
    navigate(`/strategic-thinking?plan=${plan}`);
  }

  const pricingSingle = trainer.pricing.find((p) => p.id === "single");
  const pricingPro = trainer.pricing.find((p) => p.id === "pro");

  return (
    <div className="min-h-screen bg-white font-golos">
      <STPLNav access={access} />

      <STPLHero
        access={access}
        hasHistory={hasHistory}
        expiresLabel={expiresLabel}
        pricingSinglePrice={pricingSingle?.price}
        onGetAccess={handleCTA}
      />

      <STPLSocial
        quoteIdx={quoteIdx}
        setQuoteIdx={setQuoteIdx}
      />

      <STPLPricing
        access={access}
        expiresLabel={expiresLabel}
        pricingSingle={pricingSingle}
        pricingPro={pricingPro}
        onGetAccess={handleCTA}
      />

      {showTopUp && (
        <BalanceTopUpModal
          onClose={() => setShowTopUp(false)}
          onSuccess={() => setShowTopUp(false)}
        />
      )}

      <InstallPWA />
    </div>
  );
}
