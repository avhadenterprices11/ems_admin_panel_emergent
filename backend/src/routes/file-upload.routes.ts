import { Router } from 'express';
import { FileUploadController } from '../controllers/file-upload.controller';
import { upload } from '../services/s3.service';

const router = Router();
const fileUploadController = new FileUploadController();

router.post('/single', upload.single('file'), (req, res) => 
  fileUploadController.uploadSingle(req, res)
);

router.post('/multiple', upload.array('files', 10), (req, res) => 
  fileUploadController.uploadMultiple(req, res)
);

export default router;
