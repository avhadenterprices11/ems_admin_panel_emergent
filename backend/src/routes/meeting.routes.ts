import { Router } from 'express';
import { MeetingController } from '../controllers/meeting.controller';

const router = Router();
const meetingController = new MeetingController();

// Get integration status
router.get('/status', (req, res) => meetingController.getStatus(req, res));

// Generate meeting link
router.post('/generate', (req, res) => meetingController.generateMeeting(req, res));

// Delete meeting
router.delete('/:platform/:meetingId', (req, res) => meetingController.deleteMeeting(req, res));

export default router;
