import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4 bg-gray-50">
      <span className="text-8xl font-black text-gray-100">404</span>
      <div className="-mt-4">
        <h1 className="text-2xl font-bold text-gray-800">Page not found</h1>
        <p className="mt-2 text-sm text-gray-500">The page you're looking for doesn't exist or was removed.</p>
      </div>
      <Link
        to="/"
        className="btn-primary mt-2 px-8"
      >
        Back to Home
      </Link>
    </div>
  );
}
