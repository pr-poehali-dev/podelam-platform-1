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
      <section className="bg-white border-y border-border">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium mb-4">
              PRO
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
              PRO-тренажёры
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Продвинутые инструменты для глубокой проработки. Не входят в подписку.
            </p>
          </div>
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => navigate("/strategic-thinking-info")}
              className="w-full group flex items-start gap-5 rounded-2xl border border-slate-200 bg-slate-50/50 p-6 text-left transition-all hover:border-slate-300 hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                <span className="text-white text-lg">🧠</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-foreground group-hover:text-slate-900 transition-colors">
                    Стратегическое мышление PRO
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-semibold">
                    NEW
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Симулятор стратегического моделирования решений. 7 этапов, формулы, графики, PDF-отчёт.
                </p>
                <span className="text-xs font-medium text-slate-500">
                  от 1 490 ₽ · Отдельная покупка →
                </span>
              </div>
            </button>
          </div>
        </div>
      </section>
      <LandingFooter />
    </div>
  );
}