import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { User, TestResult, PsychResult } from "@/components/cabinet/cabinetTypes";
import CabinetSidebar, { CabinetMobileNav } from "@/components/cabinet/CabinetSidebar";
import CabinetHomeTab from "@/components/cabinet/CabinetHomeTab";
import CabinetTestsTab from "@/components/cabinet/CabinetTestsTab";
import CabinetToolsTab from "@/components/cabinet/CabinetToolsTab";
import { getLatestCareerResult, CareerResult } from "@/lib/access";
import InstallPWA from "@/components/InstallPWA";

type Tab = "home" | "tests" | "tools";

export default function Cabinet() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [psychResult, setPsychResult] = useState<PsychResult | null>(null);
  const [careerResult, setCareerResult] = useState<CareerResult | null>(null);
  const initialTab = (searchParams.get("tab") as Tab) || "home";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

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

  // Профиль: 20% за career-тест + 40% за psych-bot + 20% за barrier + 20% за 3+ инструмента
  let profileComplete = 0;
  if (careerResult) profileComplete += 20;
  if (psychResult) profileComplete += 45;
  const barrierRaw = localStorage.getItem(`barrier_results_${user.email}`);
  if (barrierRaw && JSON.parse(barrierRaw).length > 0) profileComplete += 20;
  const completionsCount = JSON.parse(localStorage.getItem(`pdd_completions_${user.email}`) || "[]").length;
  if (completionsCount >= 3) profileComplete += 15;

  return (
    <div className="min-h-screen font-golos" style={{ background: "hsl(248, 50%, 98%)" }}>
      <div className="flex min-h-screen">
        <CabinetSidebar
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogoClick={() => navigate("/")}
          onLogout={logout}
        />

        <main className="flex-1 overflow-auto">
          <CabinetMobileNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
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
                onTabChange={setActiveTab}
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
                onGoToTests={() => setActiveTab("tests")}
              />
            )}
          </div>
          <footer className="border-t border-border py-6 px-6 md:px-8 mt-auto">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
              <div className="text-center md:text-left space-y-0.5">
                <p>© 2025 ПоДелам. Найди своё дело.</p>
                <p>ИП Уварова А. С. · ОГРНИП 322508100398078 · Права защищены</p>
              </div>
              <div className="flex flex-wrap items-center gap-5">
                <InstallPWA />
                <a href="/privacy" className="hover:text-foreground transition-colors">Политика конфиденциальности</a>
                <a href="/oferta" className="hover:text-foreground transition-colors">Оферта</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}