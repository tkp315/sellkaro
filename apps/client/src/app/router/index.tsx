import { createBrowserRouter } from 'react-router-dom';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';
import NotFoundPage from '@/pages/NotFoundPage';
import ProfilePage from '@/pages/ProfilePage';
import SellerPublicProfilePage from '@/pages/seller/SellerPublicProfilePage';
import NotificationsPage from '@/pages/NotificationsPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminListingsPage from '@/pages/admin/AdminListingsPage';
import AdminReportsPage from '@/pages/admin/AdminReportsPage';
import { authRoutes } from './authRoutes';
import { buyerRoutes } from './buyerRoutes';
import { sellerRoutes } from './sellerRoutes';

const router = createBrowserRouter([
  {
    path: '/',
    element: <PageWrapper />,
    children: [
      ...buyerRoutes,
      {
        path: 'profile',
        element: <ProtectedRoute />,
        children: [{ index: true, element: <ProfilePage /> }],
      },
      { path: 'users/:userId', element: <SellerPublicProfilePage /> },
      {
        element: <ProtectedRoute />,
        children: [{ path: 'notifications', element: <NotificationsPage /> }],
      },
    ],
  },
  {
    path: '/auth',
    children: authRoutes,
  },
  {
    path: '/seller',
    element: <ProtectedRoute roles={['SELLER', 'ADMIN']} />,
    children: sellerRoutes,
  },
  {
    path: '/admin',
    element: <ProtectedRoute roles={['ADMIN', 'MODERATOR']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'users', element: <AdminUsersPage /> },
          { path: 'listings', element: <AdminListingsPage /> },
          { path: 'reports', element: <AdminReportsPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
