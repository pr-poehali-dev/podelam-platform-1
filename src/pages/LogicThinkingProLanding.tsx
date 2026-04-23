import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InstallPWA from "@/components/InstallPWA";
import { PRO_TRAINERS } from "@/lib/proTrainerTypes";
import {
  hasProAccess,
  proAccessExpiresFormatted,
  getLogicSessions,
} from "@/lib/proTrainerAccess";
import LTPLNav from "@/components/logic-thinking-pro/LTPLNav";
import LTPLHero from "@/components/logic-thinking-pro/LTPLHero";
import LTPLSocial from "@/components/logic-thinking-pro/LTPLSocial";
import LTPLPricing from "@/components/logic-thinking-pro/LTPLPricing";

const TRAINER_ID = "logic-thinking" as const;

const META = {
  title: "Логика мышления PRO — тренажёр анализа рассуждений | ПоДелам",
  description:
    "Прокачай логику мышления. Структурирование аргументов, причинно-следственные связи, когнитивные искажения. Формульная модель без ИИ. От 2 590 ₽.",
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

export default function LogicThinkingProLanding() {
  const navigate = useNavigate();
  const trainer = PRO_TRAINERS.find((t) => t.id === TRAINER_ID)!;
  const [access, setAccess] = useState(false);
  const [expiresLabel, setExpiresLabel] = useState<string | null>(null);
  const [hasHistory, setHasHistory] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);

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
      setHasHistory(getLogicSessions(TRAINER_ID).some((s) => s.completedAt && s.results));
    };
    refresh();
    window.addEventListener("pdd_balance_change", refresh);
    return () => window.removeEventListener("pdd_balance_change", refresh);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx((i) => (i + 1) % 3), 5500);
    return () => clearInterval(t);
  }, []);

  const pricingSingle = trainer.pricing.find((p) => p.id === "single");
  const pricingPro = trainer.pricing.find((p) => p.id === "pro");

  function handleCTA(planId?: string) {
    navigate(`/logic-thinking?plan=${planId ?? "pro"}`);
  }

  return (
    <div className="min-h-screen bg-white font-golos">
      <LTPLNav access={access} />

      <LTPLHero
        access={access}
        hasHistory={hasHistory}
        expiresLabel={expiresLabel}
        pricingSinglePrice={pricingSingle?.price}
        onGetAccess={handleCTA}
      />

      <LTPLSocial
        quoteIdx={quoteIdx}
        setQuoteIdx={setQuoteIdx}
      />

      <LTPLPricing
        access={access}
        expiresLabel={expiresLabel}
        pricingSingle={pricingSingle}
        pricingPro={pricingPro}
        onGetAccess={handleCTA}
      />

      <InstallPWA />
    </div>
  );
}
