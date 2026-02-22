
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
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

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
          <Route path="/admin" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;