import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from '@/app/router';
import { useAuthStore } from '@/store/authStore';
import { connectSocket, disconnectSocket } from '@/lib/socket';

export default function App() {
  const accessToken = useAuthStore((s) => s.accessToken);

  // Keep socket connected whenever logged in (survives page refresh + token refresh)
  useEffect(() => {
    if (!accessToken) return;
    connectSocket(accessToken);
    return () => disconnectSocket();
  }, [accessToken]);

  return <RouterProvider router={router} />;
}
