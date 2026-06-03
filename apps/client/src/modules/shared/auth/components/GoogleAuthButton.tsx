import { GoogleLogin } from '@react-oauth/google';
import { useGoogleAuth } from '../hooks/useAuth';
import { getApiError } from '@/utils/apiError';

export function GoogleAuthButton() {
  const { mutate, isPending, error } = useGoogleAuth();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={isPending ? 'opacity-60 pointer-events-none w-full' : 'w-full'}>
        <GoogleLogin
          onSuccess={(response) => {
            if (response.credential) mutate(response.credential);
          }}
          onError={() => {}}
          size="large"
          theme="outline"
          text="continue_with"
          width="100%"
        />
      </div>
      {isPending && (
        <p className="text-xs text-gray-500">Signing in...</p>
      )}
      {error && (
        <p className="text-center text-xs text-red-500">{getApiError(error)}</p>
      )}
    </div>
  );
}
