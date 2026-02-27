import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import IndexNav from "@/components/index/IndexNav";
import LandingHero from "@/components/landing/LandingHero";
import LandingTrainersList from "@/components/landing/LandingTrainersList";
import LandingPricing from "@/components/landing/LandingPricing";
import LandingFooter from "@/components/landing/LandingFooter";

const META = {
  title: "Тренажеры ПоДелам — психологические тренажеры для осознанной жизни",
  description:
    "5 тренажеров: осознанный выбор, эмоции, антипрокрастинация, самооценка, деньги без тревоги. Индексы EMI, AI, IVO, FSI. От 990 ₽/мес.",
  ogImage:
    "https://cdn.poehali.dev/projects/6c16557d-8f84-49ee-9bbb-b86108059a50/files/4bf0e0ce-5476-4b6e-8961-7b514365e980.jpg",
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

export default function TrainersLanding() {
  const navigate = useNavigate();
  const trainersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = META.title;
    setMeta("description", META.description);
    setMeta("og:title", META.title, true);
    setMeta("og:description", META.description, true);
    setMeta("og:image", META.ogImage, true);
    setMeta("og:url", "https://podelam.su/trainers-info", true);
    setMeta("og:type", "website", true);
    setMeta("twitter:title", META.title);
    setMeta("twitter:description", META.description);
    setMeta("twitter:image", META.ogImage);
    setMeta("twitter:card", "summary_large_image");
    return () => {
      document.title = prevTitle;
    };
  }, []);

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