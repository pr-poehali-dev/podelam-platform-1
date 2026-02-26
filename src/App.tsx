
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
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import CareerTest from "./pages/CareerTest";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Oferta from "./pages/Oferta";
import Pricing from "./pages/Pricing";
import Partner from "./pages/Partner";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFail from "./pages/PaymentFail";
import NotFound from "./pages/NotFoundPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogArticle />} />
          <Route path="/career-test" element={<CareerTest />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/oferta" element={<Oferta />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/fail" element={<PaymentFail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;