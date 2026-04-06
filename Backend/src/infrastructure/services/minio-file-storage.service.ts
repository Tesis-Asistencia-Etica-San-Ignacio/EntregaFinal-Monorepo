import { minioClient } from '../config/minioClient';
import type { IFileStorage, StoredFileDescriptor } from '../../application/ports/file-storage.port';

export function buildMinioPublicFileUrl(fileName: string, bucket = 'uploads'): string {
  return `http://minio:9000/${bucket}/${fileName}`;
}

export function extractObjectNameFromMinioFileUrl(fileUrl: string, bucket = 'uploads'): string | null {
  try {
    const url = new URL(fileUrl);
    const normalizedPath = url.pathname.replace(/\/+$/, '');
    const expectedPrefix = `/${bucket}/`;

    if (!normalizedPath.startsWith(expectedPrefix)) {
      return null;
    }

    const objectName = normalizedPath.slice(expectedPrefix.length).trim();
    return objectName.length > 0 ? decodeURIComponent(objectName) : null;
  } catch {
    return null;
  }
}

export class MinioFileStorageService implements IFileStorage {
  public async upload(file: Express.Multer.File, bucket = 'uploads'): Promise<void> {
    const metaData = {
      'Content-Type': file.mimetype,
    };

    await minioClient.putObject(
      bucket,
      file.originalname,
      file.buffer,
      file.size,
      metaData
    );
  }

  public async list(bucket = 'uploads'): Promise<StoredFileDescriptor[]> {
    return new Promise((resolve, reject) => {
      const files: StoredFileDescriptor[] = [];
      const stream = minioClient.listObjectsV2(bucket, '', true);

      stream.on('data', (obj) => files.push(obj as StoredFileDescriptor));
      stream.on('end', () => resolve(files));
      stream.on('error', (err) => reject(err));
    });
  }

  public async getBuffer(fileName: string, bucket = 'uploads'): Promise<Buffer> {
    const fileStream = await minioClient.getObject(bucket, fileName);
    const chunks: Buffer[] = [];

    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }

  public async getStream(fileName: string, bucket = 'uploads'): Promise<NodeJS.ReadableStream> {
    return minioClient.getObject(bucket, fileName);
  }

  public buildPublicUrl(fileName: string, bucket = 'uploads'): string {
    return buildMinioPublicFileUrl(fileName, bucket);
  }

  public extractObjectName(fileUrl: string, bucket = 'uploads'): string | null {
    return extractObjectNameFromMinioFileUrl(fileUrl, bucket);
  }

  public async delete(fileName: string, bucket = 'uploads'): Promise<void> {
    await minioClient.removeObject(bucket, fileName);
  }
}
