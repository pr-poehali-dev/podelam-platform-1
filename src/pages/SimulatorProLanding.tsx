import { useEffect, useState } from "react";
import IndexNav from "@/components/index/IndexNav";
import InstallPWA from "@/components/InstallPWA";
import {
  getBalance,
  syncFromServer,
  payForSimulator,
  SIMULATOR_PRICE,
  hasSimulatorAccess,
  simulatorAccessExpires,
} from "@/lib/access";
import { useNavigate } from "react-router-dom";
import SimulatorProHero from "@/components/simulator-pro/SimulatorProHero";
import SimulatorProContent from "@/components/simulator-pro/SimulatorProContent";
import SimulatorProPricing from "@/components/simulator-pro/SimulatorProPricing";
import SimulatorProPaymentModal from "@/components/simulator-pro/SimulatorProPaymentModal";

const META = {
  title: "Симулятор решений PRO — просчитай любой жизненный сценарий | ПоДелам",
  description:
    "Симулятор решений PRO: просчитай ипотеку, смену работы, бизнес, переезд или покупку авто. Сравни до 3 вариантов, получи PDF-отчёт. 490 ₽ / 7 дней.",
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

export default function SimulatorProLanding() {
  const navigate = useNavigate();
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [paying, setPaying] = useState(false);
  const [balance, setBalance] = useState(getBalance());
  const [showTopUp, setShowTopUp] = useState(false);
  const [hasAccess, setHasAccess] = useState(hasSimulatorAccess());
  const [expiry, setExpiry] = useState<Date | null>(simulatorAccessExpires());
  const isLoggedIn = !!localStorage.getItem("pdd_user");

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

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
    const t = setInterval(() => setQuoteIdx((i) => (i + 1) % 3), 5500);
    return () => clearInterval(t);
  }, []);

  function refreshBalance() {
    setBalance(getBalance());
    setHasAccess(hasSimulatorAccess());
    setExpiry(simulatorAccessExpires());
  }

  async function handlePaymentConfirm() {
    setPaying(true);
    await syncFromServer().catch(() => {});
    refreshBalance();
    if (getBalance() < SIMULATOR_PRICE) {
      setPaying(false);
      setShowPayment(false);
      setShowTopUp(true);
      return;
    }
    const ok = await payForSimulator();
    setPaying(false);
    if (ok) {
      refreshBalance();
      setShowPayment(false);
      navigate("/pro/simulator");
    }
  }

  function handleCTA() {
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }
    if (hasAccess) {
      navigate("/pro/simulator");
      return;
    }
    setBalance(getBalance());
    setShowPayment(true);
  }

  const expiryFormatted = expiry
    ? new Date(expiry).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
    : null;

  return (
    <div className="min-h-screen bg-white font-golos">
      <IndexNav isLoggedIn={isLoggedIn} scrollTo={scrollTo} useHashNav />

      <SimulatorProHero
        hasAccess={hasAccess}
        expiryFormatted={expiryFormatted}
        onCTA={handleCTA}
      />

      <SimulatorProContent
        quoteIdx={quoteIdx}
        onQuoteChange={setQuoteIdx}
      />

      <SimulatorProPricing
        hasAccess={hasAccess}
        expiryFormatted={expiryFormatted}
        isLoggedIn={isLoggedIn}
        onCTA={handleCTA}
      />

      <SimulatorProPaymentModal
        showPayment={showPayment}
        paying={paying}
        balance={balance}
        showTopUp={showTopUp}
        onPaymentConfirm={handlePaymentConfirm}
        onPaymentClose={() => setShowPayment(false)}
        onTopUpClose={() => setShowTopUp(false)}
        onTopUpSuccess={() => {
          setShowTopUp(false);
          refreshBalance();
          setShowPayment(true);
        }}
      />

      <InstallPWA />
    </div>
  );
}
