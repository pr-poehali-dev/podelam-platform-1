import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import IndexNav from "@/components/index/IndexNav";
import LandingHero from "@/components/landing/LandingHero";
import LandingTrainersList from "@/components/landing/LandingTrainersList";
import LandingPricing from "@/components/landing/LandingPricing";
import LandingFooter from "@/components/landing/LandingFooter";

export default function TrainersLanding() {
  const navigate = useNavigate();
  const trainersRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!localStorage.getItem("pdd_user");

  const goTrainers = () => navigate("/trainers");
  const goPricing = () => {
    trainersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollTo = (id: string) => {
    navigate(`/#${id}`);
  };

  return (
    <div className="min-h-screen font-golos" style={{ background: "hsl(248, 50%, 98%)" }}>
      <IndexNav isLoggedIn={isLoggedIn} scrollTo={scrollTo} />
      <LandingHero goTrainers={goTrainers} goPricing={goPricing} />
      <LandingTrainersList trainersRef={trainersRef} />
      <LandingPricing goTrainers={goTrainers} />
      <LandingFooter />
    </div>
  );
}
