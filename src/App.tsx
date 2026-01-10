import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { UpgradePage } from "./pages/UpgradePage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { QuizBuilderPage } from "./pages/admin/QuizBuilderPage";
import { QuizAnalyticsPage } from "./pages/admin/QuizAnalyticsPage";
import { QuizPage } from "./pages/QuizPage";
import { PublicQuizPage } from "./pages/PublicQuizPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/upgrade" element={<UpgradePage />} />
            
            {/* Public Quiz Routes (by slug) */}
            <Route path="/v/:slug" element={<PublicQuizPage />} />
            
            {/* Protected Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/quiz/new" element={<QuizBuilderPage />} />
            <Route path="/admin/quiz/:quizId/edit" element={<QuizBuilderPage />} />
            <Route path="/admin/quiz/:quizId/analytics" element={<QuizAnalyticsPage />} />
            
            {/* Legacy Quiz Route (redirect to admin) */}
            <Route path="/quiz/:quizId" element={<Navigate to="/admin" replace />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
