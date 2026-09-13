import { Navigate, Route, Routes } from 'react-router';
import { AdminShell } from '@/components/layout/admin-shell';
import { RequireAdmin } from '@/components/layout/require-admin';
import { LoginPage } from '@/pages/login/login-page';
import { DashboardPage } from '@/pages/dashboard/dashboard-page';
import { ReviewQueuePage } from '@/pages/review-queue/review-queue-page';
import { AdsPage } from '@/pages/ads/ads-page';
import { ReportsPage } from '@/pages/reports/reports-page';
import { UsersPage } from '@/pages/users/users-page';
import { TransactionsPage } from '@/pages/transactions/transactions-page';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAdmin>
            <AdminShell />
          </RequireAdmin>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="review-queue" element={<ReviewQueuePage />} />
        <Route path="ads" element={<AdsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
