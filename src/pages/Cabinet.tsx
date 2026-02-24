import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { User, TestResult, PsychResult } from "@/components/cabinet/cabinetTypes";
import CabinetSidebar, { CabinetMobileNav } from "@/components/cabinet/CabinetSidebar";
import CabinetHomeTab from "@/components/cabinet/CabinetHomeTab";
import CabinetTestsTab from "@/components/cabinet/CabinetTestsTab";
import CabinetToolsTab from "@/components/cabinet/CabinetToolsTab";
import { getLatestCareerResult, CareerResult, wasEverDone } from "@/lib/access";
import InstallPWA from "@/components/InstallPWA";
import useToolSync from "@/hooks/useToolSync";

type Tab = "home" | "tests" | "tools" | "blog";

export default function Cabinet() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [psychResult, setPsychResult] = useState<PsychResult | null>(null);
  const [careerResult, setCareerResult] = useState<CareerResult | null>(null);
  const initialTab = (searchParams.get("tab") as Tab) || "home";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const { sessions: psychSessions } = useToolSync<PsychResult>("psych-bot", "psych_result_history");
  const { sessions: careerSessions } = useToolSync<CareerResult>("career-test", "career_sessions");

  useEffect(() => {
    if (psychSessions.length > 0) {
      const latest = psychSessions[psychSessions.length - 1];
      setPsychResult(latest);
      const email = user?.email;
      if (email) {
        localStorage.setItem(`psych_result_${email}`, JSON.stringify(latest));
      }
    }
  }, [psychSessions, user?.email]);

  useEffect(() => {
    if (careerSessions.length > 0) {
      const email = user?.email;
      if (email) {
        localStorage.setItem(`career_result_${email}`, JSON.stringify(careerSessions.slice(-5).reverse()));
      }
      setCareerResult(careerSessions[careerSessions.length - 1]);
    }
  }, [careerSessions, user?.email]);

  const handleTabChange = (tab: Tab) => {
    if (tab === "blog") { navigate("/blog"); return; }
    setActiveTab(tab);
  };

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) { navigate("/auth"); return; }
    const userData: User = JSON.parse(u);
    setUser(userData);

    const t = localStorage.getItem(`pdd_tests_${userData.email}`);
    if (t) setTests(JSON.parse(t));

    const pr = localStorage.getItem(`psych_result_${userData.email}`);
    if (pr) setPsychResult(JSON.parse(pr));

    const cr = getLatestCareerResult();
    setCareerResult(cr);
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("pdd_user");
    navigate("/");
  };

  if (!user) return null;

  let psychTest = tests.find((t) => t.type === "Тест на призвание");
  if (!psychTest && psychResult) {
    psychTest = {
      id: Date.now().toString(),
      type: "Тест на призвание",
      date: new Date().toLocaleDateString("ru-RU"),
      score: psychResult.topSegScore ?? 0,
    };
  }

  // Профиль: 20% за career-тест + 45% за psych-bot + 20% за barrier + 15% за 3+ инструмента
  let profileComplete = 0;
  if (careerResult) profileComplete += 20;
  if (psychResult) profileComplete += 45;
  if (wasEverDone("barrier-bot")) profileComplete += 20;
  const completionsCount = JSON.parse(localStorage.getItem(`pdd_completions_${user.email}`) || "[]").length;
  if (completionsCount >= 3) profileComplete += 15;

  return (
    <div className="min-h-screen font-golos" style={{ background: "hsl(248, 50%, 98%)" }}>
      <div className="flex min-h-screen">
        <CabinetSidebar
          user={user}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLogoClick={() => navigate("/")}
          onLogout={logout}
        />

        <main className="flex-1 overflow-auto">
          <CabinetMobileNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onLogoClick={() => navigate("/")}
            onLogout={logout}
          />

          <div className="p-6 md:p-8 max-w-4xl mx-auto">
            {activeTab === "home" && (
              <CabinetHomeTab
                user={user}
                psychTest={psychTest}
                psychResult={psychResult}
                careerResult={careerResult}
                profileComplete={profileComplete}
                onNavigate={navigate}
                onTabChange={handleTabChange}
              />
            )}

            {activeTab === "tests" && (
              <CabinetTestsTab
                psychTest={psychTest}
                psychResult={psychResult}
                careerResult={careerResult}
                onNavigate={navigate}
              />
            )}

            {activeTab === "tools" && (
              <CabinetToolsTab
                hasPsychTest={!!psychTest}
                onNavigate={navigate}
                onGoToTests={() => handleTabChange("tests")}
              />
            )}
          </div>
          <footer className="border-t border-border/40 py-4 px-6 md:px-8 mt-16">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground/50">
              <div className="text-center md:text-left space-y-0.5">
                <p>© 2025 ПоДелам · ИП Уварова А. С. · ОГРНИП 322508100398078</p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <InstallPWA />
                <a href="/privacy" className="hover:text-muted-foreground transition-colors">Политика конфиденциальности</a>
                <a href="/oferta" className="hover:text-muted-foreground transition-colors">Оферта</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}