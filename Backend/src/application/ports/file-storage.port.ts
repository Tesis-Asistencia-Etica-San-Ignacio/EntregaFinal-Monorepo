export interface StoredFileDescriptor {
  name?: string;
  [key: string]: unknown;
}

export interface IFileStorage {
  upload(file: Express.Multer.File, bucket?: string): Promise<void>;
  list(bucket?: string): Promise<StoredFileDescriptor[]>;
  getBuffer(fileName: string, bucket?: string): Promise<Buffer>;
  getStream(fileName: string, bucket?: string): Promise<NodeJS.ReadableStream>;
  buildPublicUrl(fileName: string, bucket?: string): string;
  extractObjectName(fileUrl: string, bucket?: string): string | null;
  delete(fileName: string, bucket?: string): Promise<void>;
}
