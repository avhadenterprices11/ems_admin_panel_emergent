import AWS from 'aws-sdk';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'event-management-uploads';
const USE_LOCAL_STORAGE = !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY;
const LOCAL_UPLOAD_DIR = '/app/uploads';

// Ensure local upload directory exists
if (USE_LOCAL_STORAGE && !fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

// Multer memory storage
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/webm',
      'application/pdf',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: images, videos, and PDFs.`));
    }
  },
});

export class S3Service {
  async uploadFile(file: Express.Multer.File, folder: string = 'events'): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    if (USE_LOCAL_STORAGE) {
      // Store locally for development/testing
      return this.uploadToLocal(file, fileName);
    }

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read' as const,
    };

    try {
      const result = await s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      console.error('S3 upload error:', error);
      // Fallback to local storage if S3 fails
      return this.uploadToLocal(file, fileName);
    }
  }

  private async uploadToLocal(file: Express.Multer.File, fileName: string): Promise<string> {
    const fullPath = path.join(LOCAL_UPLOAD_DIR, fileName);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, file.buffer);
    
    // Return a URL that can be served
    const baseUrl = process.env.PREVIEW_URL || process.env.APP_URL || 'https://eventpanel-3.preview.emergentagent.com';
    return `${baseUrl}/api/uploads/${fileName}`;
  }

  async uploadMultipleFiles(files: Express.Multer.File[], folder: string = 'events'): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (USE_LOCAL_STORAGE || fileUrl.includes('/uploads/')) {
      // Delete from local storage
      const fileName = fileUrl.split('/uploads/')[1];
      if (fileName) {
        const fullPath = path.join(LOCAL_UPLOAD_DIR, fileName);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      return;
    }

    const key = fileUrl.split('.com/')[1];
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    try {
      await s3.deleteObject(params).promise();
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error('Failed to delete file from S3');
    }
  }
}
