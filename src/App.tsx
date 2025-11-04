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
import ManageCompanies from "./pages/admin/ManageCompanies";
import { UserProvider } from "./contexts/UserContext";
import AddCompany from "./pages/admin/AddCompany";
import EditCompany from "./pages/admin/EditCompany";
import ManageProducts from "./pages/admin/ManageProducts";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import ManageUsers from "./pages/admin/ManageUsers";
import AddUser from "./pages/admin/AddUser";
import EditUser from "./pages/admin/EditUser";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <UserProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/new-list" element={<NewShoppingList />} />
            <Route path="/list/:id" element={<ViewShoppingList />} />
            <Route path="/email-verification" element={<EmailConfirmationScreen />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/admin/companies" element={<ManageCompanies />} />

            {/* ROTAS DE ADMIN */}
            <Route path="/admin/companies" element={<ManageCompanies />} />
            <Route path="/admin/companies/new" element={<AddCompany />} />
            <Route path="/admin/companies/edit/:id" element={<EditCompany />} />

            {/* ROTAS DE PRODUTOS */}
            <Route path="/admin/products" element={<ManageProducts />} />
            <Route path="/admin/products/new" element={<AddProduct />} />
            <Route path="/admin/products/edit/:id" element={<EditProduct />} />
            {/* <Route path="/admin/companies/new" element={<AddCompany />} />
            <Route path="/admin/companies/edit/:id" element={<EditCompany />} /> */}

            {/* ROTAS DE USUÁRIOS */}
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/users/new" element={<AddUser />} />
            <Route path="/admin/users/edit/:id" element={<EditUser />} />
            {/* <Route path="/admin/companies/new" element={<AddCompany />} />
            <Route path="/admin/companies/edit/:id" element={<EditCompany />} /> */}

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </UserProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
