
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Cabinet from "./pages/Cabinet";
import Test from "./pages/Test";
import Results from "./pages/Results";
import IncomeBot from "./pages/IncomeBot";
import Diary from "./pages/Diary";
import Progress from "./pages/Progress";
import PsychBot from "./pages/PsychBot";
import PlanBot from "./pages/PlanBot";
import BarrierBot from "./pages/BarrierBot";
import Admin from "./pages/Admin";
import AdminArticles from "./pages/AdminArticles";
import AdminBanners from "./pages/AdminBanners";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import CareerTest from "./pages/CareerTest";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Oferta from "./pages/Oferta";
import Pricing from "./pages/Pricing";
import Partner from "./pages/Partner";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFail from "./pages/PaymentFail";
import Trainers from "./pages/Trainers";
import TrainersLanding from "./pages/TrainersLanding";
import TrainerStats from "./pages/TrainerStats";
import StrategicThinkingLanding from "./pages/StrategicThinkingLanding";
import StrategicThinking from "./pages/StrategicThinking";
import FinancialThinkingLanding from "./pages/FinancialThinkingLanding";
import FinancialThinking from "./pages/FinancialThinking";
import LogicThinkingLanding from "./pages/LogicThinkingLanding";
import LogicThinking from "./pages/LogicThinking";
import PsychAnalysisLanding from "./pages/PsychAnalysisLanding";
import BarrierLanding from "./pages/BarrierLanding";
import IncomeLanding from "./pages/IncomeLanding";
import PlanLanding from "./pages/PlanLanding";
import NotFound from "./pages/NotFoundPage";
import useAutoLogout from "./hooks/useAutoLogout";
import CookieBanner from "./components/CookieBanner";
import SimulatorDashboard from "./pages/SimulatorDashboard";
import SimulatorCreate from "./pages/SimulatorCreate";
import SimulatorEdit from "./pages/SimulatorEdit";
import SimulatorResult from "./pages/SimulatorResult";

const queryClient = new QueryClient();

function AutoLogoutGuard({ children }: { children: React.ReactNode }) {
  useAutoLogout();
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CookieBanner />
        <AutoLogoutGuard>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/cabinet" element={<Cabinet />} />
          <Route path="/test/:type" element={<Test />} />
          <Route path="/results/:id" element={<Results />} />
          <Route path="/income-bot" element={<IncomeBot />} />
          <Route path="/diary" element={<Diary />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/psych-bot" element={<PsychBot />} />
          <Route path="/plan-bot" element={<PlanBot />} />
          <Route path="/barrier-bot" element={<BarrierBot />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/articles" element={<AdminArticles />} />
          <Route path="/admin/banners" element={<AdminBanners />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogArticle />} />
          <Route path="/career-test" element={<CareerTest />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/oferta" element={<Oferta />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/fail" element={<PaymentFail />} />
          <Route path="/trainers-info" element={<TrainersLanding />} />
          <Route path="/trainers" element={<Trainers />} />
          <Route path="/trainers/stats" element={<TrainerStats />} />
          <Route path="/strategic-thinking-info" element={<StrategicThinkingLanding />} />
          <Route path="/strategic-thinking" element={<StrategicThinking />} />
          <Route path="/financial-thinking-info" element={<FinancialThinkingLanding />} />
          <Route path="/financial-thinking" element={<FinancialThinking />} />
          <Route path="/logic-thinking-info" element={<LogicThinkingLanding />} />
          <Route path="/logic-thinking" element={<LogicThinking />} />
          <Route path="/pro/simulator" element={<SimulatorDashboard />} />
          <Route path="/pro/simulator/create" element={<SimulatorCreate />} />
          <Route path="/pro/simulator/edit" element={<SimulatorEdit />} />
          <Route path="/pro/simulator/result" element={<SimulatorResult />} />
          <Route path="/psych-analysis-info" element={<PsychAnalysisLanding />} />
          <Route path="/barrier-info" element={<BarrierLanding />} />
          <Route path="/income-info" element={<IncomeLanding />} />
          <Route path="/plan-info" element={<PlanLanding />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AutoLogoutGuard>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;