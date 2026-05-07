import { useEffect } from "react";
import IndexNav from "@/components/index/IndexNav";
import IndexHero from "@/components/index/IndexHero";
import IndexDemo from "@/components/index/IndexDemo";
import IndexBottom from "@/components/index/IndexBottom";

function setMeta(name: string, content: string, property?: boolean) {
  const attr = property ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
  el.setAttribute("content", content);
}

const META = {
  title: "ПоДелам — найди своё дело и способ зарабатывать без выгорания",
  description: "Психологические инструменты для тех, кто хочет понять себя: что тормозит, где теряешь энергию и деньги, какой формат заработка подходит именно тебе.",
};

export default function Index() {
  const isLoggedIn = !!localStorage.getItem("pdd_user");

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
    <div className="min-h-screen font-golos" style={{ background: "hsl(248, 50%, 98%)" }}>
      <IndexNav isLoggedIn={isLoggedIn} scrollTo={scrollTo} />
      <IndexHero scrollTo={scrollTo} />
      <IndexDemo />
      <IndexBottom scrollTo={scrollTo} />
    </div>
  );
}