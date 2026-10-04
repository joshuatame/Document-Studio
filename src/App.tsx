import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { AdminShell } from "@/components/layout/admin-shell";
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "@/components/auth/protected-route";
import { AdminRoute } from "@/components/auth/admin-route";
import DashboardPage from "@/routes/dashboard";
import SelectPage from "@/routes/select";
import IntakePage from "@/routes/intake";
import ReviewPage from "@/routes/review";
import PaymentPage from "@/routes/payment";
import PaymentSuccessPage from "@/routes/payment-success";
import PaymentCancelledPage from "@/routes/payment-cancelled";
import GeneratingPage from "@/routes/generating";
import DownloadPage from "@/routes/download";
import HistoryPage from "@/routes/history";
import SettingsPage from "@/routes/settings";
import LoginPage from "@/routes/login";
import RegisterPage from "@/routes/register";
import NotFoundPage from "@/routes/not-found";
import AdminDashboardPage from "@/routes/admin/index";
import AdminTemplatesPage from "@/routes/admin/templates";
import AdminTemplateFormPage from "@/routes/admin/template-form";
import AdminCategoriesPage from "@/routes/admin/categories";
import AdminPricingPage from "@/routes/admin/pricing";
import AdminProviderSettingsPage from "@/routes/admin/provider-settings";
import AdminStripePage from "@/routes/admin/stripe";
import AdminOrdersPage from "@/routes/admin/orders";
import AdminGenerationLogsPage from "@/routes/admin/generation-logs";

const basename =
  import.meta.env.VITE_APP_BASE_PATH || "/document-studio";

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="select" element={<SelectPage />} />
            <Route path="intake/:documentType" element={<IntakePage />} />
            <Route path="review/:documentId" element={<ReviewPage />} />
            <Route path="payment/:documentId" element={<PaymentPage />} />
            <Route path="payment/:documentId/success" element={<PaymentSuccessPage />} />
            <Route path="payment/:documentId/cancelled" element={<PaymentCancelledPage />} />
            <Route path="generating/:documentId" element={<GeneratingPage />} />
            <Route path="download/:documentId" element={<DownloadPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route element={<AdminShell />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/templates" element={<AdminTemplatesPage />} />
            <Route path="/admin/templates/new" element={<AdminTemplateFormPage />} />
            <Route path="/admin/templates/:id" element={<AdminTemplateFormPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/pricing" element={<AdminPricingPage />} />
            <Route path="/admin/provider-settings" element={<AdminProviderSettingsPage />} />
            <Route path="/admin/stripe" element={<AdminStripePage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/generation-logs" element={<AdminGenerationLogsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
