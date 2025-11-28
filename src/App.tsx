import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import Documents from "./pages/Documents";
import Upload from "./pages/Upload";
import Verification from "./pages/Verification";
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
          <Route path="/documents" element={<DashboardLayout><Documents /></DashboardLayout>} />
          <Route path="/upload" element={<DashboardLayout><Upload /></DashboardLayout>} />
          <Route path="/verification" element={<DashboardLayout><Verification /></DashboardLayout>} />
          <Route path="/verify" element={<DashboardLayout><Verification /></DashboardLayout>} />
          <Route path="/shared" element={<DashboardLayout><Documents /></DashboardLayout>} />
          <Route path="/audit" element={<DashboardLayout><Documents /></DashboardLayout>} />
          <Route path="/next-of-kin" element={<DashboardLayout><Documents /></DashboardLayout>} />
          <Route path="/settings" element={<DashboardLayout><Documents /></DashboardLayout>} />
          <Route path="/admin" element={<DashboardLayout><Documents /></DashboardLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
