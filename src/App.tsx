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
import ManageUsers from "./pages/admin/ManageUsers";
import ManageCompanies from "./pages/admin/ManageCompanies";
import ManageProducts from "./pages/admin/ManageProducts";
import AdvancedReports from "./pages/admin/AdvancedReports";

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
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/companies" element={<ManageCompanies />} />
          <Route path="/admin/products" element={<ManageProducts />} />
          <Route path="/admin/reports" element={<AdvancedReports />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
