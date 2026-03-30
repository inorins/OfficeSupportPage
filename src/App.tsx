import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ApiModeProvider } from "@/context/ApiModeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LoginPage } from "@/pages/LoginPage";
import { ClientPortal } from "@/pages/ClientPortal";
import Index from "./pages/Index.tsx";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  if (user.role === 'client') return <ClientPortal />;
  return <Index />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ApiModeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </ApiModeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
