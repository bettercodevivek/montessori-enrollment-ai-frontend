import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ProtectedRoute } from './ProtectedRoute';
import { Login } from '../pages/Login';
import { SchoolLayout } from '../layouts/SchoolLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { SchoolDashboard } from '../pages/school/Dashboard';
import { SchoolIntegrations } from '../pages/school/Integrations';
import { SchoolSettings } from '../pages/school/Settings';
import { SchoolFollowups } from '../pages/school/Followups';
import { SchoolForms } from '../pages/school/Forms';
import { SchoolReferrals } from '../pages/school/Referrals';
import { AdminDashboard } from '../pages/admin/Dashboard';
import { AdminSchools } from '../pages/admin/Schools';
import { AdminAnalytics } from '../pages/admin/Analytics';
import { AdminIntegrations } from '../pages/admin/Integrations';
import { AdminReferrals } from '../pages/admin/Referrals';

const RootRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/school/dashboard';
  return <Navigate to={redirectPath} replace />;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/school',
    element: (
      <ProtectedRoute requiredRole="school">
        <SchoolLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <SchoolDashboard />,
      },
      {
        path: 'integrations',
        element: <SchoolIntegrations />,
      },
      {
        path: 'settings',
        element: <SchoolSettings />,
      },
      {
        path: 'followups',
        element: <SchoolFollowups />,
      },
      {
        path: 'forms',
        element: <SchoolForms />,
      },
      {
        path: 'referrals',
        element: <SchoolReferrals />,
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'schools',
        element: <AdminSchools />,
      },
      {
        path: 'analytics',
        element: <AdminAnalytics />,
      },
      {
        path: 'integrations',
        element: <AdminIntegrations />,
      },
      {
        path: 'referrals',
        element: <AdminReferrals />,
      },
    ],
  },
]);

