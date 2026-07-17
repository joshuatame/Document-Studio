import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import DashboardPage from "@/routes/dashboard";
import SelectPage from "@/routes/select";
import IntakePage from "@/routes/intake";
import ReviewPage from "@/routes/review";
import PaymentPage from "@/routes/payment";
import GeneratingPage from "@/routes/generating";
import DownloadPage from "@/routes/download";
import HistoryPage from "@/routes/history";
import SettingsPage from "@/routes/settings";
import NotFoundPage from "@/routes/not-found";

const basename =
  import.meta.env.VITE_APP_BASE_PATH || "/document-studio";

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="select" element={<SelectPage />} />
          <Route path="intake/:documentType" element={<IntakePage />} />
          <Route path="review/:documentId" element={<ReviewPage />} />
          <Route path="payment/:documentId" element={<PaymentPage />} />
          <Route path="generating/:documentId" element={<GeneratingPage />} />
          <Route path="download/:documentId" element={<DownloadPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
