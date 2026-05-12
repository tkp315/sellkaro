// import multer from 'multer';
// import sharp from 'sharp';
// import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
// // import { env } from '../../app/env/index.js';
// import type { S3Client } from '@aws-sdk/client-s3';

// // Memory storage — file compress karke S3 pe bhejenge
// export const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
//   fileFilter: (_req, file, cb) => {
//     if (!file.mimetype.startsWith('image/')) {
//       cb(new Error('Only image files are allowed'));
//       return;
//     }
//     cb(null, true);
//   },
// });

// export async function uploadToS3(
//   s3: S3Client,
//   file: Express.Multer.File,
//   folder: string
// ): Promise<string> {
//   const compressed = await sharp(file.buffer)
//     .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
//     .jpeg({ quality: 80 })
//     .toBuffer();

//   const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;

//   await s3.send(
//     new PutObjectCommand({
//       Bucket: process.env.AWS_S3_BUCKET,
//       Key: key,
//       Body: compressed,
//       ContentType: 'image/jpeg',
//     })
//   );

//   return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
// }

// export async function deleteFromS3(s3: S3Client, url: string): Promise<void> {
//   const key = url.split('.amazonaws.com/')[1];
//   if (!key) return;

//   await s3.send(
//     new DeleteObjectCommand({
//       Bucket: env.AWS_S3_BUCKET,
//       Key: key,
//     })
//   );
// }
