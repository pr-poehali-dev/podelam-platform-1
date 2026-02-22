import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, TestResult, PsychResult } from "@/components/cabinet/cabinetTypes";
import CabinetSidebar, { CabinetMobileNav } from "@/components/cabinet/CabinetSidebar";
import CabinetHomeTab from "@/components/cabinet/CabinetHomeTab";
import CabinetTestsTab from "@/components/cabinet/CabinetTestsTab";
import CabinetToolsTab from "@/components/cabinet/CabinetToolsTab";

type Tab = "home" | "tests" | "tools";

export default function Cabinet() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [psychResult, setPsychResult] = useState<PsychResult | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("home");

  useEffect(() => {
    const u = localStorage.getItem("pdd_user");
    if (!u) { navigate("/auth"); return; }
    const userData: User = JSON.parse(u);
    setUser(userData);
    const t = localStorage.getItem("pdd_tests");
    if (t) setTests(JSON.parse(t));
    const pr = localStorage.getItem(`psych_result_${userData.email}`);
    if (pr) setPsychResult(JSON.parse(pr));
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("pdd_user");
    navigate("/");
  };

  if (!user) return null;

  const psychTest = tests.find((t) => t.type === "Психологический тест");
  const profileComplete = psychTest ? 85 : 15;

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

          <div className="p-6 md:p-8 max-w-4xl">
            {activeTab === "home" && (
              <CabinetHomeTab
                user={user}
                psychTest={psychTest}
                psychResult={psychResult}
                profileComplete={profileComplete}
                onNavigate={navigate}
              />
            )}

            {activeTab === "tests" && (
              <CabinetTestsTab
                psychTest={psychTest}
                psychResult={psychResult}
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
        </main>

      </div>
    </div>
  );
}