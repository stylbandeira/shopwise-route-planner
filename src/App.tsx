import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import NewShoppingList from "./pages/NewShoppingList";
import ViewShoppingList from "./pages/ViewShoppingList";
import EmailConfirmationScreen from "./pages/EmailConfirmationScreen";
import EmailVerificationPage from "./pages/EmailVerificationPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/new-list" element={<NewShoppingList />} />
          <Route path="/list/:id" element={<ViewShoppingList />} />
          <Route path="/email-verification" element={<EmailConfirmationScreen />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
