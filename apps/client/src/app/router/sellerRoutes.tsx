import type { RouteObject } from 'react-router-dom';
import SellerDashboardPage from '@/pages/seller/DashboardPage';
import CreateAdPage from '@/pages/seller/CreateAdPage';
import EditAdPage from '@/pages/seller/EditAdPage';

export const sellerRoutes: RouteObject[] = [
  { index: true, element: <SellerDashboardPage /> },
  { path: 'ads/new', element: <CreateAdPage /> },
  { path: 'ads/:id/edit', element: <EditAdPage /> },
];
