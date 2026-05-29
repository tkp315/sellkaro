import { Link } from 'react-router-dom';
import CreateAdForm from '@/modules/seller/ads/components/CreateAdForm';

export default function CreateAdPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link to="/seller" className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#002f34] transition">
          ← Dashboard
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-lg font-bold text-gray-900">Post a New Ad</h1>
      </div>

      <div className="card p-6">
        <CreateAdForm />
      </div>
    </div>
  );
}
