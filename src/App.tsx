
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import UploadPanel from "./components/UploadPanel";
import ResearchDashboard from "./components/ResearchDashboard";
import WorkspaceHistory from "./components/WorkspaceHistory";
import TrustSafetyDashboard from "./components/TrustSafetyDashboard";
import NotFound from "./pages/NotFound";
import React from "react";

// Create a client
const queryClient = new QueryClient();

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/upload" element={<UploadPanel />} />
              <Route path="/dashboard" element={<ResearchDashboard />} />
              <Route path="/workspace" element={<WorkspaceHistory />} />
              <Route path="/trust-safety" element={<TrustSafetyDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
