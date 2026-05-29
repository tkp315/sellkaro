import { useParams, Link } from 'react-router-dom';
import { useMyAdById } from '@/modules/seller/ads/hooks/useSellerAds';
import { useTheme } from '@/hooks/useTheme';
import AdForm from '@/modules/seller/ads/components/AdForm';

export default function EditAdPage() {
  const { id } = useParams<{ id: string }>();
  const { data: ad, isLoading, isError } = useMyAdById(id!);
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 h-7 w-48 animate-pulse rounded-xl bg-gray-200" />
        <div className="card p-6 space-y-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-10 w-full animate-pulse rounded-xl bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !ad) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-xl font-semibold text-gray-800">Ad not found</h2>
        <Link to="/seller" className="mt-4 text-sm font-medium hover:underline" style={{ color: theme.colors.brand.DEFAULT }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link to="/seller" className="hover:text-gray-700 transition">Dashboard</Link>
        <span>›</span>
        <span className="text-gray-800 font-medium truncate max-w-[200px]">{ad.title}</span>
        <span>›</span>
        <span className="text-gray-800 font-medium">Edit</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Ad</h1>
        <p className="mt-1 text-sm text-gray-500">Update your listing details</p>
      </div>

      <div className="card p-6">
        <AdForm mode="edit" ad={ad} />
      </div>
    </div>
  );
}
