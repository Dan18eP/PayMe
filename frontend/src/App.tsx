import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout, AuthLayout } from "./layouts/MainLayout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DebtorsPage } from "./pages/DebtorsPage";
import { DebtorDetailPage } from "./pages/DebtorDetailPage";
import { DebtsPage } from "./pages/DebtsPage";
import { CreateDebtPage } from "./pages/CreateDebtPage";
import { DebtDetailPage } from "./pages/DebtDetailPage";
import { RegisterPaymentPage } from "./pages/RegisterPaymentPage";
import { RemindersPage } from "./pages/RemindersPage";
import { HistoryPage } from "./pages/HistoryPage";
import { AgreementsPage } from "./pages/AgreementsPage";
import { useAuthStore } from "./store/authStore";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
        </Route>
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/debtors" element={<DebtorsPage />} />
          <Route path="/debtors/:id" element={<DebtorDetailPage />} />
          <Route path="/debts" element={<DebtsPage />} />
          <Route path="/debts/create" element={<CreateDebtPage />} />
          <Route path="/debts/:id" element={<DebtDetailPage />} />
          <Route path="/payments/register" element={<RegisterPaymentPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/agreements" element={<AgreementsPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
