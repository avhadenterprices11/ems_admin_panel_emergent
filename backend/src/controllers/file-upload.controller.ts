import { Request, Response } from 'express';
import { S3Service } from '../services/s3.service';

export class FileUploadController {
  private s3Service: S3Service;

  constructor() {
    this.s3Service = new S3Service();
  }

  async uploadSingle(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      const folder = req.body.folder || 'events';
      const fileUrl = await this.s3Service.uploadFile(req.file, folder);

      res.status(200).json({ url: fileUrl });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ message: 'Failed to upload file' });
    }
  }

  async uploadMultiple(req: Request, res: Response): Promise<void> {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        res.status(400).json({ message: 'No files uploaded' });
        return;
      }

      const folder = req.body.folder || 'events';
      const fileUrls = await this.s3Service.uploadMultipleFiles(req.files, folder);

      res.status(200).json({ urls: fileUrls });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ message: 'Failed to upload files' });
    }
  }
}
