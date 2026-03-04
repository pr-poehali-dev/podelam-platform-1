import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PRO_TRAINERS } from "@/lib/proTrainerTypes";
import {
  hasProAccess,
  getProAccess,
  proAccessExpiresFormatted,
  getSavedSessions,
} from "@/lib/proTrainerAccess";
import LandingHero from "@/components/strategic/LandingHero";
import LandingOffer from "@/components/strategic/LandingOffer";
import LandingHowItWorks from "@/components/strategic/LandingHowItWorks";
import LandingPricing from "@/components/strategic/LandingPricing";

const TRAINER_ID = "strategic-thinking" as const;

const META = {
  title: "Тренажёр стратегического мышления — ПоДелам",
  description:
    "Развивайте навык стратегического мышления с помощью AI-тренажёра. Практические кейсы, персональная обратная связь и индекс SТI. От 990 ₽/мес.",
  ogImage:
    "https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/4bf0e0ce-5476-4b6e-8961-7b514365e980.jpg",
};

function setMeta(name: string, content: string, property?: boolean) {
  const attr = property ? "property" : "name";
  let el = document.querySelector(
    `meta[${attr}="${name}"]`
  ) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function StrategicThinkingLanding() {
  const navigate = useNavigate();
  const trainer = PRO_TRAINERS.find((t) => t.id === TRAINER_ID)!;
  const [access, setAccess] = useState(false);
  const [expiresLabel, setExpiresLabel] = useState<string | null>(null);
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = META.title;
    setMeta("description", META.description);
    setMeta("og:title", META.title, true);
    setMeta("og:description", META.description, true);
    setMeta("og:image", META.ogImage, true);
    setMeta("og:url", "https://podelam.su/strategic-thinking-info", true);
    setMeta("og:type", "website", true);
    setMeta("twitter:title", META.title);
    setMeta("twitter:description", META.description);
    setMeta("twitter:image", META.ogImage);
    setMeta("twitter:card", "summary_large_image");
    return () => {
      document.title = prevTitle;
    };
  }, []);

  useEffect(() => {
    setAccess(hasProAccess(TRAINER_ID));
    setExpiresLabel(proAccessExpiresFormatted(TRAINER_ID));
    setHasHistory(getSavedSessions(TRAINER_ID).some((s) => s.completedAt && s.results));

    const handler = () => {
      setAccess(hasProAccess(TRAINER_ID));
      setExpiresLabel(proAccessExpiresFormatted(TRAINER_ID));
      setHasHistory(getSavedSessions(TRAINER_ID).some((s) => s.completedAt && s.results));
    };
    window.addEventListener("pdd_balance_change", handler);
    return () => window.removeEventListener("pdd_balance_change", handler);
  }, []);

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePlanClick = (planId: string) => {
    navigate(`/strategic-thinking?plan=${planId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-in {
          animation: fadeInUp 0.7s ease-out both;
        }
        .anim-d1 { animation-delay: 0.1s; }
        .anim-d2 { animation-delay: 0.2s; }
        .anim-d3 { animation-delay: 0.3s; }
        .anim-d4 { animation-delay: 0.4s; }
        .anim-d5 { animation-delay: 0.5s; }
        .anim-d6 { animation-delay: 0.6s; }
        .anim-d7 { animation-delay: 0.7s; }
        .anim-d8 { animation-delay: 0.8s; }
      `}</style>

      <LandingHero
        access={access}
        expiresLabel={expiresLabel}
        hasHistory={hasHistory}
        onNavigateTrainers={() => navigate("/trainers")}
        onNavigateTrainer={() => navigate("/strategic-thinking")}
        onScrollToPricing={scrollToPricing}
      />
      <LandingOffer />
      <LandingHowItWorks />
      <LandingPricing
        pricing={trainer.pricing}
        access={access}
        activeAccess={getProAccess(TRAINER_ID)}
        onPlanClick={handlePlanClick}
        onNavigateTrainer={() => navigate("/strategic-thinking")}
      />
    </div>
  );
}