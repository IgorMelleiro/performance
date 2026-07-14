import { Navigate, Route, Routes } from 'react-router-dom';
import { PERMISSIONS } from '@/auth/permissions';
import { ROLES } from '@/auth/roles';
import GuestRoute from './GuestRoute';
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import EmployeesPage from '@/pages/EmployeesPage';
import EvaluationDetailPage from '@/pages/EvaluationDetailPage';
import EvaluationWizardPage from '@/pages/EvaluationWizardPage';
import EvaluationsPage from '@/pages/EvaluationsPage';
import SettingsPage from '@/pages/SettingsPage';
import TeamsPage from '@/pages/TeamsPage';
import TemplatesPage from '@/pages/TemplatesPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route
          element={<RoleGuard permissions={[PERMISSIONS.DASHBOARD_VIEW]} />}
        >
          <Route path="/" element={<DashboardPage />} />
        </Route>

        <Route
          element={
            <RoleGuard
              permissions={[
                PERMISSIONS.EMPLOYEES_VIEW_ALL,
                PERMISSIONS.EMPLOYEES_VIEW_TEAM,
                PERMISSIONS.EMPLOYEES_VIEW_SELF,
              ]}
            />
          }
        >
          <Route path="/colaboradores" element={<EmployeesPage />} />
        </Route>

        <Route element={<RoleGuard permissions={[PERMISSIONS.TEAMS_VIEW]} />}>
          <Route path="/times" element={<TeamsPage />} />
        </Route>

        <Route
          element={
            <RoleGuard
              permissions={[
                PERMISSIONS.EVALUATIONS_VIEW_ALL,
                PERMISSIONS.EVALUATIONS_VIEW_TEAM,
                PERMISSIONS.EVALUATIONS_VIEW_SELF,
              ]}
            />
          }
        >
          <Route path="/avaliacoes" element={<EvaluationsPage />} />
          <Route path="/avaliacoes/:id" element={<EvaluationDetailPage />} />
        </Route>

        <Route
          element={
            <RoleGuard
              permissions={[
                PERMISSIONS.EVALUATIONS_CREATE,
                PERMISSIONS.EVALUATIONS_CREATE_TEAM,
              ]}
            />
          }
        >
          <Route path="/avaliacoes/nova" element={<EvaluationWizardPage />} />
        </Route>

        <Route
          element={
            <RoleGuard
              permissions={[
                PERMISSIONS.EVALUATIONS_UPDATE,
                PERMISSIONS.EVALUATIONS_UPDATE_TEAM,
                PERMISSIONS.EVALUATIONS_UPDATE_SELF,
              ]}
            />
          }
        >
          <Route
            path="/avaliacoes/:id/edit"
            element={<EvaluationWizardPage />}
          />
        </Route>

        <Route
          element={
            <RoleGuard permissions={[PERMISSIONS.EVALUATIONS_CREATE_SELF]} />
          }
        >
          <Route
            path="/autoavaliacao"
            element={<EvaluationWizardPage mode="self" />}
          />
        </Route>

        <Route
          element={
            <RoleGuard permissions={[PERMISSIONS.EVALUATIONS_UPDATE_SELF]} />
          }
        >
          <Route
            path="/autoavaliacao/:id/edit"
            element={<EvaluationWizardPage mode="self" />}
          />
        </Route>

        <Route
          element={
            <RoleGuard
              permissions={[PERMISSIONS.TEMPLATES_MANAGE]}
              roles={[ROLES.RH]}
            />
          }
        >
          <Route path="/templates" element={<TemplatesPage />} />
        </Route>

        <Route
          element={
            <RoleGuard
              permissions={[PERMISSIONS.PROFILE_VIEW_SELF]}
              roles={[ROLES.RH]}
            />
          }
        >
          <Route path="/configuracoes" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
