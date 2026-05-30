import { createBrowserRouter } from 'react-router-dom';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';
import NotFoundPage from '@/pages/NotFoundPage';
import ProfilePage from '@/pages/ProfilePage';
import SellerPublicProfilePage from '@/pages/seller/SellerPublicProfilePage';
import NotificationsPage from '@/pages/NotificationsPage';
import AboutPage from '@/pages/static/AboutPage';
import ContactPage from '@/pages/static/ContactPage';
import TermsPage from '@/pages/static/TermsPage';
import PrivacyPage from '@/pages/static/PrivacyPage';
import HelpPage from '@/pages/static/HelpPage';
import SafetyPage from '@/pages/static/SafetyPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminListingsPage from '@/pages/admin/AdminListingsPage';
import AdminReportsPage from '@/pages/admin/AdminReportsPage';
import AdminCategoriesPage from '@/pages/admin/AdminCategoriesPage';
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
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'help', element: <HelpPage /> },
      { path: 'safety', element: <SafetyPage /> },
      {
        element: <ProtectedRoute />,
        children: [{ path: 'notifications', element: <NotificationsPage /> }],
      },
      {
        path: 'seller',
        element: <ProtectedRoute roles={['SELLER', 'ADMIN']} />,
        children: sellerRoutes,
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/auth',
    children: authRoutes,
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
          { path: 'categories', element: <AdminCategoriesPage /> },
          { path: 'reports', element: <AdminReportsPage /> },
        ],
      },
    ],
  },
]);

export default router;
