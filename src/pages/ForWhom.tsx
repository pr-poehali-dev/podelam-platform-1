import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import IndexNav from "@/components/index/IndexNav";
import LandingFooter from "@/components/landing/LandingFooter";
import ForWhomHero from "@/components/for-whom/ForWhomHero";
import ForWhomFitSection from "@/components/for-whom/ForWhomFitSection";
import ForWhomQuiz from "@/components/for-whom/ForWhomQuiz";
import ForWhomTrust from "@/components/for-whom/ForWhomTrust";

function setMeta(name: string, content: string, property?: boolean) {
  const attr = property ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
  el.setAttribute("content", content);
}

const META = {
  title: "Для кого ПоДелам — если чувствуешь, что способен на большее",
  description: "Персональный разбор сильных сторон и модели роста — для тех, кто хочет двигаться увереннее, зарабатывать легче и не выгорать.",
};

export default function ForWhom() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("userId");

  useEffect(() => {
    const prevTitle = document.title;
    document.title = META.title;
    setMeta("description", META.description);
    setMeta("og:title", META.title, true);
    setMeta("og:description", META.description, true);
    return () => { document.title = prevTitle; };
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background font-golos">
      <IndexNav isLoggedIn={isLoggedIn} scrollTo={scrollTo} useHashNav />
      <ForWhomHero isLoggedIn={isLoggedIn} onNavigate={navigate} />
      <ForWhomFitSection />
      <ForWhomQuiz isLoggedIn={isLoggedIn} onNavigate={navigate} />
      <ForWhomTrust isLoggedIn={isLoggedIn} onNavigate={navigate} />
      <LandingFooter />
    </div>
  );
}
