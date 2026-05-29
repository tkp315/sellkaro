import multer from 'multer';

const ALLOWED = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-msvideo',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type "${file.mimetype}" not allowed. Use images (jpg, png, webp, gif) or videos (mp4, webm, mov).`));
    }
  },
}).array('files', 10);
