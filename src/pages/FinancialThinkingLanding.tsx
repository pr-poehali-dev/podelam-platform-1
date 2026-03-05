import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { PRO_TRAINERS } from "@/lib/proTrainerTypes";
import {
  hasProAccess,
  proAccessExpiresFormatted,
  getFinancialSessions,
} from "@/lib/proTrainerAccess";
import FinancialLandingHero from "@/components/financial/FinancialLandingHero";
import FinancialLandingContent from "@/components/financial/FinancialLandingContent";
import FinancialLandingPricing from "@/components/financial/FinancialLandingPricing";

const TRAINER_ID = "financial-thinking" as const;

const META = {
  title: "Тренажёр финансового мышления — ПоДелам",
  description:
    "Развивайте финансовое мышление: анализ денежных потоков, стресс-тесты, моделирование целей. Формульная модель без ИИ. От 2 990 ₽.",
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

export default function FinancialThinkingLanding() {
  const navigate = useNavigate();
  const trainer = PRO_TRAINERS.find((t) => t.id === TRAINER_ID)!;
  const [access, setAccess] = useState(false);
  const [expiresLabel, setExpiresLabel] = useState<string | null>(null);
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const prevTitle = document.title;
    document.title = META.title;
    setMeta("description", META.description);
    setMeta("og:title", META.title, true);
    setMeta("og:description", META.description, true);
    setMeta("og:url", "https://podelam.su/financial-thinking-info", true);
    setMeta("og:type", "website", true);
    setMeta("twitter:title", META.title);
    setMeta("twitter:description", META.description);
    setMeta("twitter:card", "summary_large_image");
    return () => {
      document.title = prevTitle;
    };
  }, []);

  useEffect(() => {
    setAccess(hasProAccess(TRAINER_ID));
    setExpiresLabel(proAccessExpiresFormatted(TRAINER_ID));
    setHasHistory(
      getFinancialSessions(TRAINER_ID).some((s) => s.completedAt && s.results)
    );

    const handler = () => {
      setAccess(hasProAccess(TRAINER_ID));
      setExpiresLabel(proAccessExpiresFormatted(TRAINER_ID));
      setHasHistory(
        getFinancialSessions(TRAINER_ID).some((s) => s.completedAt && s.results)
      );
    };
    window.addEventListener("pdd_balance_change", handler);
    return () => window.removeEventListener("pdd_balance_change", handler);
  }, []);

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePlanClick = (planId: string) => {
    navigate(`/financial-thinking?plan=${planId}`);
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

      <FinancialLandingHero
        access={access}
        expiresLabel={expiresLabel}
        hasHistory={hasHistory}
        onNavigateTrainers={() => navigate("/trainers")}
        onNavigateTrainer={() => navigate("/financial-thinking")}
        onScrollPricing={scrollToPricing}
      />

      <FinancialLandingContent />

      <FinancialLandingPricing
        pricing={trainer.pricing}
        access={access}
        onPlanClick={handlePlanClick}
        onNavigate={() => navigate("/financial-thinking")}
      />

      <footer className="border-t border-border py-8 md:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Icon name="Compass" size={14} className="text-white" />
              </div>
              <span className="font-bold text-slate-900">ПоДелам</span>
            </div>
            <div className="text-center text-sm text-slate-500 space-y-0.5">
              <p>© 2025 ПоДелам. Найди своё дело.</p>
              <p>ИП Уварова А. С. · ОГРНИП 322508100398078 · Права защищены</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-slate-500">
              <a href="/pricing" className="hover:text-slate-900 transition-colors">Тарифы</a>
              <a href="/privacy" className="hover:text-slate-900 transition-colors">Политика конфиденциальности</a>
              <a href="/oferta" className="hover:text-slate-900 transition-colors">Оферта</a>
              <a href="/partner" className="hover:text-slate-900 transition-colors">Партнёрская программа</a>
              <a href="https://t.me/AnnaUvaro" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                <Icon name="Send" size={14} />
                Контакты
              </a>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-slate-200/50 max-w-3xl mx-auto text-[11px] leading-relaxed text-slate-400 text-center">
            <p>
              Проект «ПоДелам» не оказывает медицинских услуг и не является медицинской психотерапией. Материалы и результаты тестов носят
              информационно-рекомендательный характер и не заменяют консультацию специалиста. Проект не гарантирует достижение конкретных результатов.
              Сайт предназначен для лиц старше 18 лет. Используя сайт, вы соглашаетесь
              с <a href="/privacy" className="underline hover:text-slate-500 transition-colors">Политикой конфиденциальности</a> и <a href="/oferta" className="underline hover:text-slate-500 transition-colors">Офертой</a>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}