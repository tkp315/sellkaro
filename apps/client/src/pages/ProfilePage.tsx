import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';
import { useUpdateProfile } from '@/modules/shared/auth/hooks/useAuth';
import { useUIStore } from '@/store/uiStore';
import { useTheme } from '@/hooks/useTheme';
import { getApiError } from '@/utils/apiError';
import type { UpdateProfileDto } from '@/modules/shared/auth/types';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { mutateAsync, isPending, error } = useUpdateProfile();
  const { showToast } = useUIStore();
  const { theme } = useTheme();

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<UpdateProfileDto>();

  useEffect(() => {
    if (user?.profile) {
      reset({
        name: user.profile.name ?? '',
        city: user.profile.city ?? '',
        area: user.profile.area ?? '',
        bio: user.profile.bio ?? '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UpdateProfileDto) => {
    await mutateAsync(data);
    showToast('Profile updated!', 'success');
  };

  const initials = (user?.profile?.name ?? user?.email ?? 'U')[0]!.toUpperCase();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Profile</h1>

      {/* Avatar section */}
      <div className="card p-6 mb-5">
        <div className="flex items-center gap-5">
          <div
            className="h-20 w-20 rounded-full flex items-center justify-center text-3xl font-bold"
            style={{
              backgroundColor: theme.colors.brand.DEFAULT,
              color: theme.colors.accent.DEFAULT,
            }}
          >
            {initials}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{user?.profile?.name ?? 'No name set'}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="mt-2 flex gap-2">
              <span
                className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold"
                style={{
                  backgroundColor: theme.colors.brand.DEFAULT + '1a',
                  color: theme.colors.brand.DEFAULT,
                }}
              >
                {user?.role}
              </span>
              {user?.isVerified && (
                <span
                  className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold"
                  style={{
                    backgroundColor: theme.colors.status.successBg,
                    color: theme.colors.status.successText,
                  }}
                >
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="card p-6">
        <h2 className="mb-5 text-base font-semibold text-gray-800">Edit Information</h2>

        {error && (
          <div
            className="mb-4 rounded-xl border px-4 py-3 text-sm"
            style={{
              backgroundColor: theme.colors.status.errorBg,
              borderColor: theme.colors.status.errorText + '33',
              color: theme.colors.status.errorText,
            }}
          >
            {getApiError(error)}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Full Name</label>
            <input {...register('name')} className="input-field" placeholder="Rahul Sharma" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">City</label>
              <input {...register('city')} className="input-field" placeholder="Mumbai" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Area</label>
              <input {...register('area')} className="input-field" placeholder="Andheri West" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              {...register('bio')}
              rows={3}
              className="input-field resize-none"
              placeholder="Tell buyers a little about yourself..."
            />
          </div>

          <button
            type="submit"
            disabled={isPending || !isDirty}
            className="btn-primary w-full"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
