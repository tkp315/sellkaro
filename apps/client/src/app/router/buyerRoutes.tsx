import type { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import FeedPage from '@/pages/buyer/FeedPage';
import ProductDetailPage from '@/pages/buyer/ProductDetailPage';
import SavedPage from '@/pages/buyer/SavedPage';
import CartPage from '@/pages/buyer/CartPage';
import ChatInboxPage from '@/pages/buyer/ChatInboxPage';
import ChatConversationPage from '@/pages/buyer/ChatConversationPage';

export const buyerRoutes: RouteObject[] = [
  { index: true, element: <FeedPage /> },
  { path: 'product/:id', element: <ProductDetailPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: 'saved', element: <SavedPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'chats', element: <ChatInboxPage /> },
      { path: 'chats/:chatId', element: <ChatConversationPage /> },
    ],
  },
];
