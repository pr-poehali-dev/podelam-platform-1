import IndexNav from "@/components/index/IndexNav";
import IndexHero from "@/components/index/IndexHero";
import IndexDemo from "@/components/index/IndexDemo";
import IndexBottom from "@/components/index/IndexBottom";

export default function Index() {
  const isLoggedIn = !!localStorage.getItem("pdd_user");

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
