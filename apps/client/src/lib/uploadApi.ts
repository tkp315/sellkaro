import api from '@/lib/axios';

export interface UploadResult {
  url: string;
  publicId: string;
}

export async function uploadFiles(files: File[]): Promise<UploadResult[]> {
  const form = new FormData();
  files.forEach((f) => form.append('files', f));
  // Remove Content-Type so browser sets multipart/form-data with correct boundary
  const res = await api.post<{ data: UploadResult[] }>('/upload', form, {
    headers: { 'Content-Type': undefined },
  });
  return res.data.data;
}
