import { Navigate, Route, Routes } from 'react-router-dom';
import GuestRoute from './GuestRoute';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import EmployeesPage from '@/pages/EmployeesPage';
import EvaluationDetailPage from '@/pages/EvaluationDetailPage';
import EvaluationWizardPage from '@/pages/EvaluationWizardPage';
import EvaluationsPage from '@/pages/EvaluationsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/colaboradores" element={<EmployeesPage />} />
        <Route path="/avaliacoes" element={<EvaluationsPage />} />
        <Route path="/avaliacoes/nova" element={<EvaluationWizardPage />} />
        <Route path="/avaliacoes/:id/edit" element={<EvaluationWizardPage />} />
        <Route path="/avaliacoes/:id" element={<EvaluationDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
