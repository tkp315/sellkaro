export function getApiError(error: unknown): string {
  if (!error) return 'Something went wrong';
  const err = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
  return (
    err.response?.data?.message ??
    err.response?.data?.error ??
    err.message ??
    'Something went wrong'
  );
}
