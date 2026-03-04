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

export default function StrategicThinkingLanding() {
  const navigate = useNavigate();
  const trainer = PRO_TRAINERS.find((t) => t.id === TRAINER_ID)!;
  const [access, setAccess] = useState(false);
  const [expiresLabel, setExpiresLabel] = useState<string | null>(null);
  const [hasHistory, setHasHistory] = useState(false);

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
