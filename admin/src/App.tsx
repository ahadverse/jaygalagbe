import { Navigate, Route, Routes } from 'react-router';
import { AdminShell } from '@/components/layout/admin-shell';
import { RequireAdmin } from '@/components/layout/require-admin';
import { LoginPage } from '@/pages/login/login-page';
import { DashboardPage } from '@/pages/dashboard/dashboard-page';
import { AnalyticsPage } from '@/pages/analytics/analytics-page';
import { ReviewQueuePage } from '@/pages/review-queue/review-queue-page';
import { AdsPage } from '@/pages/ads/ads-page';
import { ReportsPage } from '@/pages/reports/reports-page';
import { ReviewsPage } from '@/pages/reviews/reviews-page';
import { UsersPage } from '@/pages/users/users-page';
import { TransactionsPage } from '@/pages/transactions/transactions-page';
import { BoostsPage } from '@/pages/boosts/boosts-page';
import { AuditLogPage } from '@/pages/audit-log/audit-log-page';

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
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="review-queue" element={<ReviewQueuePage />} />
        <Route path="ads" element={<AdsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="boosts" element={<BoostsPage />} />
        <Route path="audit-log" element={<AuditLogPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
