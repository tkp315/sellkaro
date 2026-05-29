import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';
import { useUpdateProfile } from '@/modules/shared/auth/hooks/useAuth';
import { useUIStore } from '@/store/uiStore';
import { useTheme } from '@/hooks/useTheme';
import { getApiError } from '@/utils/apiError';
import { uploadFiles } from '@/lib/uploadApi';
import type { UpdateProfileDto } from '@/modules/shared/auth/types';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { mutateAsync, isPending, error } = useUpdateProfile();
  const { showToast } = useUIStore();
  const { theme } = useTheme();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<UpdateProfileDto>();

  useEffect(() => {
    if (user) {
      reset({
        name: user.profile?.name ?? '',
        phone: user.phone ?? '',
        city: user.profile?.city ?? '',
        area: user.profile?.area ?? '',
        bio: user.profile?.bio ?? '',
      });
    }
  }, [user, reset]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      showToast('Only images allowed for avatar', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Avatar must be under 5 MB', 'error');
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    try {
      const [result] = await uploadFiles([file]);
      setAvatarUrl(result!.url);
      showToast('Photo uploaded — save to apply', 'success');
    } catch {
      showToast('Upload failed, try again', 'error');
      setAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
    }
  };

  const onSubmit = async (data: UpdateProfileDto) => {
    await mutateAsync({ ...data, ...(avatarUrl ? { avatar: avatarUrl } : {}) });
    setAvatarUrl(null);
    showToast('Profile updated!', 'success');
  };

  const currentAvatar = avatarPreview ?? user?.profile?.avatar ?? null;
  const initials = (user?.profile?.name ?? user?.email ?? 'U')[0]!.toUpperCase();
  const hasChanges = isDirty || !!avatarUrl;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Profile</h1>

      {/* Avatar section */}
      <div className="card p-6 mb-5">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt="avatar"
                className="h-20 w-20 rounded-full object-cover ring-2 ring-offset-2"
                style={{ ringColor: theme.colors.brand.DEFAULT }}
              />
            ) : (
              <div
                className="h-20 w-20 rounded-full flex items-center justify-center text-3xl font-bold"
                style={{ backgroundColor: theme.colors.brand.DEFAULT, color: theme.colors.accent.DEFAULT }}
              >
                {initials}
              </div>
            )}

            {/* Upload button overlay */}
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-700 text-white shadow-md hover:bg-gray-600 disabled:opacity-60 transition"
              title="Change photo"
            >
              {avatarUploading ? (
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleAvatarChange}
            />
          </div>

          <div>
            <p className="text-lg font-bold text-gray-900">{user?.profile?.name ?? 'No name set'}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span
                className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold"
                style={{ backgroundColor: theme.colors.brand.DEFAULT + '1a', color: theme.colors.brand.DEFAULT }}
              >
                {user?.role}
              </span>
              {user?.isVerified && (
                <span
                  className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: theme.colors.status.successBg, color: theme.colors.status.successText }}
                >
                  ✓ Verified
                </span>
              )}
            </div>
            {avatarUrl && (
              <p className="mt-1 text-xs text-amber-600 font-medium">New photo ready — save to apply</p>
            )}
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

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Phone Number
              <span className="ml-1 text-xs font-normal text-gray-400">(shown to buyers on your ads)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 select-none">+91</span>
              <input
                {...register('phone')}
                type="tel"
                className="input-field pl-10"
                placeholder="98765 43210"
                maxLength={10}
              />
            </div>
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
            disabled={isPending || !hasChanges}
            className="btn-primary w-full"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
