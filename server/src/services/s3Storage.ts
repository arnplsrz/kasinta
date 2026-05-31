import crypto from "crypto";
import path from "path";
import { Readable } from "stream";
import { Response } from "express";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION || "ap-southeast-1";
const bucketName = process.env.S3_BUCKET_NAME;

const s3 = new S3Client({ region });

const uploadPathPrefix = "/uploads/";

const extensionByMimeType: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const requireBucketName = (): string => {
  if (!bucketName) {
    throw new Error("S3_BUCKET_NAME is required for file uploads");
  }

  return bucketName;
};

export const getPublicUploadPath = (key: string): string => {
  return `${uploadPathPrefix}${key}`;
};

export const getUploadKeyFromPath = (uploadPath: string): string | null => {
  if (!uploadPath.startsWith(uploadPathPrefix)) {
    return null;
  }

  const key = uploadPath.slice(uploadPathPrefix.length);
  return key || null;
};

export const uploadProfilePhoto = async (
  userId: string,
  file: Express.Multer.File
): Promise<string> => {
  const extension =
    extensionByMimeType[file.mimetype] || path.extname(file.originalname);
  const key = `profiles/${userId}/${crypto.randomUUID()}${extension}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: requireBucketName(),
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return getPublicUploadPath(key);
};

export const deleteUploadedFile = async (
  uploadPath: string | null
): Promise<void> => {
  if (!uploadPath) {
    return;
  }

  const key = getUploadKeyFromPath(uploadPath);
  if (!key) {
    return;
  }

  await s3.send(
    new DeleteObjectCommand({
      Bucket: requireBucketName(),
      Key: key,
    })
  );
};

export const streamUploadedFile = async (
  key: string,
  res: Response
): Promise<boolean> => {
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: requireBucketName(),
      Key: key,
    })
  );

  if (!response.Body) {
    return false;
  }

  if (response.ContentType) {
    res.setHeader("Content-Type", response.ContentType);
  }

  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  (response.Body as Readable).pipe(res);
  return true;
};
