import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InstallPWA from "@/components/InstallPWA";
import { PRO_TRAINERS } from "@/lib/proTrainerTypes";
import {
  hasProAccess,
  proAccessExpiresFormatted,
  getFinancialSessions,
} from "@/lib/proTrainerAccess";
import FTPLNav from "@/components/financial-thinking-pro/FTPLNav";
import FTPLHero from "@/components/financial-thinking-pro/FTPLHero";
import FTPLSocial from "@/components/financial-thinking-pro/FTPLSocial";
import FTPLPricing from "@/components/financial-thinking-pro/FTPLPricing";

const TRAINER_ID = "financial-thinking" as const;

const META = {
  title: "Финансовое мышление PRO — симулятор финансовых решений | ПоДелам",
  description:
    "Прокачай финансовое мышление. 7 этапов анализа, 10 индексов, IFMP-балл, PDF-отчёт. Анализ денежных потоков, стресс-тест, моделирование целей. От 2 990 ₽.",
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

export default function FinancialThinkingProLanding() {
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
      setHasHistory(getFinancialSessions(TRAINER_ID).some((s) => s.completedAt && s.results));
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
    navigate(`/financial-thinking?plan=${planId ?? "pro"}`);
  }

  return (
    <div className="min-h-screen bg-white font-golos">
      <FTPLNav access={access} />

      <FTPLHero
        access={access}
        hasHistory={hasHistory}
        expiresLabel={expiresLabel}
        pricingSinglePrice={pricingSingle?.price}
        onGetAccess={handleCTA}
      />

      <FTPLSocial
        quoteIdx={quoteIdx}
        setQuoteIdx={setQuoteIdx}
      />

      <FTPLPricing
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
