import { v2 as cloudinary } from 'cloudinary';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import path from 'path';

function isProd(): boolean {
  return process.env.NODE_ENV === 'prod';
}

// ─── Cloudinary ────────────────────────────────────────────────────────────────

function getCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    api_key: process.env.CLOUDINARY_API_KEY ?? '',
    api_secret: process.env.CLOUDINARY_API_SECRET ?? '',
  });
  return cloudinary;
}

async function uploadToCloudinary(
  buffer: Buffer,
  mimetype: string,
  folder = 'olx',
): Promise<{ url: string; publicId: string }> {
  const resourceType = mimetype.startsWith('video/') ? 'video' : 'image';
  return new Promise((resolve, reject) => {
    const stream = getCloudinary().uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error('Cloudinary upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    Readable.from(buffer).pipe(stream);
  });
}

async function deleteFromCloudinary(publicId: string, mimetype?: string): Promise<void> {
  const resourceType = mimetype?.startsWith('video/') ? 'video' : 'image';
  await getCloudinary().uploader.destroy(publicId, { resource_type: resourceType });
}

// ─── AWS S3 ────────────────────────────────────────────────────────────────────

function getS3Client(): S3Client {
  return new S3Client({
    region: process.env.AWS_REGION ?? 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    },
  });
}

async function uploadToS3(
  buffer: Buffer,
  mimetype: string,
  originalName: string,
  folder = 'olx',
): Promise<{ url: string; publicId: string }> {
  const bucket = process.env.AWS_S3_BUCKET ?? '';
  const region = process.env.AWS_REGION ?? 'ap-south-1';
  const ext = path.extname(originalName) || `.${mimetype.split('/')[1]}`;
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

  const upload = new Upload({
    client: getS3Client(),
    params: { Bucket: bucket, Key: key, Body: buffer, ContentType: mimetype },
  });

  await upload.done();
  return { url: `https://${bucket}.s3.${region}.amazonaws.com/${key}`, publicId: key };
}

async function deleteFromS3(publicId: string): Promise<void> {
  const bucket = process.env.AWS_S3_BUCKET ?? '';
  await getS3Client().send(new DeleteObjectCommand({ Bucket: bucket, Key: publicId }));
}

// ─── Unified API ───────────────────────────────────────────────────────────────

const CLOUDINARY_MAX = 10 * 1024 * 1024; // 10 MB

export async function uploadFile(
  buffer: Buffer,
  mimetype: string,
  originalName: string,
  folder = 'olx',
): Promise<{ url: string; publicId: string; awsUrl?: string }> {
  if (buffer.length >= CLOUDINARY_MAX) {
    // >= 10 MB → AWS S3 only
    const result = await uploadToS3(buffer, mimetype, originalName, folder);
    return { url: result.url, publicId: result.publicId, awsUrl: result.url };
  }

  // < 10 MB → Cloudinary (primary) + AWS S3 (backup), parallel
  const [cdn, s3] = await Promise.allSettled([
    uploadToCloudinary(buffer, mimetype, folder),
    uploadToS3(buffer, mimetype, originalName, folder),
  ]);

  const cdnOk = cdn.status === 'fulfilled';
  const s3Ok = s3.status === 'fulfilled';

  return {
    url: cdnOk ? cdn.value.url : s3Ok ? (s3.value as { url: string }).url : '',
    publicId: cdnOk ? cdn.value.publicId : s3Ok ? (s3.value as { publicId: string }).publicId : '',
    awsUrl: s3Ok ? (s3.value as { url: string }).url : undefined,
  };
}

export async function deleteFile(publicId: string, mimetype?: string): Promise<void> {
  await Promise.allSettled([
    deleteFromCloudinary(publicId, mimetype),
    deleteFromS3(publicId),
  ]);
}
