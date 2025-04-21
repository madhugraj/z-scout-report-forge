
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import UploadPanel from "./components/UploadPanel";
import ResearchDashboard from "./components/ResearchDashboard";
import WorkspaceHistory from "./components/WorkspaceHistory";
import TrustSafetyDashboard from "./components/TrustSafetyDashboard";
import AboutPage from "./components/AboutPage";
import ProPage from "./components/ProPage";
import NotFound from "./pages/NotFound";

// Create a client
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/upload" element={<UploadPanel />} />
            <Route path="/dashboard" element={<ResearchDashboard />} />
            <Route path="/workspace" element={<WorkspaceHistory />} />
            <Route path="/trust-safety" element={<TrustSafetyDashboard projectTitle={window.document.title || undefined} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/pro" element={<ProPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
