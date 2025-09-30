import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import fs from 'fs';
import path from 'path';

export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'eu-west-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET_NAME!;
  }

  async uploadFile(
    filePath: string,
    key: string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    try {
      const fileStream = fs.createReadStream(filePath);
      const fileStats = fs.statSync(filePath);

      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: fileStream,
          ContentType: contentType,
          Metadata: metadata,
        },
      });

      await upload.done();

      return `${process.env.CDN_BASE}${key}`;
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting from S3:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  generateKey(userId: string, assetType: string, filename: string): string {
    const timestamp = Date.now();
    const extension = path.extname(filename);
    return `assets/${assetType}/${userId}/${timestamp}${extension}`;
  }
}
