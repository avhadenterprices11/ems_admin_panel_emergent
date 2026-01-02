import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import * as dotenv from 'dotenv';
import { connectToMongo } from './database/mongo';
import authRoutes from './routes/auth.routes';
import eventsRoutes from './routes/events.routes';
import savedViewsRoutes from './routes/saved-views.routes';
import fileUploadRoutes from './routes/file-upload.routes';
import { AuthService } from './services/auth.service';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8001;

// Serve uploaded files
app.use('/uploads', express.static('/app/uploads'));

app.use(cors({
  origin: process.env.CORS_ORIGINS === '*' ? '*' : process.env.CORS_ORIGINS?.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api', (req, res) => {
  res.json({ message: 'Hello World', status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/saved-views', savedViewsRoutes);
app.use('/api/upload', fileUploadRoutes);

async function startServer() {
  try {
    // Connect to MongoDB
    await connectToMongo();
    
    // Create default user
    const authService = new AuthService();
    await authService.createDefaultUser();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
