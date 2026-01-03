import { Request, Response } from 'express';
import { RegistrationsService, CreateRegistrationInput, UpdateRegistrationInput } from '../services/registrations.service';

const registrationsService = new RegistrationsService();

export class RegistrationsController {
  async getRegistrations(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const { status, payment_status, search, page, limit } = req.query;

      const result = await registrationsService.getRegistrationsByEventId({
        event_id: eventId,
        status: status as string,
        payment_status: payment_status as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Error fetching registrations:', error);
      return res.status(500).json({ message: 'Failed to fetch registrations' });
    }
  }

  async getRegistrationById(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const registrationId = parseInt(req.params.registrationId, 10);

      if (isNaN(eventId) || isNaN(registrationId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const registration = await registrationsService.getRegistrationById(eventId, registrationId);

      if (!registration) {
        return res.status(404).json({ message: 'Registration not found' });
      }

      return res.status(200).json(registration);
    } catch (error: any) {
      console.error('Error fetching registration:', error);
      return res.status(500).json({ message: 'Failed to fetch registration' });
    }
  }

  async createRegistration(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const { registrant_name, registrant_email, registrant_phone, ticket_id, quantity, status, payment_status, payment_method, total_amount } = req.body;

      // Validation
      if (!registrant_name || !registrant_name.trim()) {
        return res.status(400).json({ message: 'Registrant name is required' });
      }

      if (!registrant_email || !registrant_email.trim()) {
        return res.status(400).json({ message: 'Registrant email is required' });
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registrant_email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      const input: CreateRegistrationInput = {
        event_id: eventId,
        registrant_name: registrant_name.trim(),
        registrant_email: registrant_email.trim().toLowerCase(),
        registrant_phone: registrant_phone?.trim() || undefined,
        ticket_id: ticket_id ? parseInt(ticket_id, 10) : undefined,
        quantity: quantity ? parseInt(quantity, 10) : 1,
        status: status || 'completed',
        payment_status: payment_status || 'pending',
        payment_method: payment_method || 'manual',
        total_amount: total_amount ? parseFloat(total_amount) : undefined,
      };

      const registration = await registrationsService.createRegistration(input);

      return res.status(201).json(registration);
    } catch (error: any) {
      console.error('Error creating registration:', error);
      return res.status(500).json({ message: 'Failed to create registration' });
    }
  }

  async updateRegistration(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const registrationId = parseInt(req.params.registrationId, 10);

      if (isNaN(eventId) || isNaN(registrationId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const input: UpdateRegistrationInput = {};

      if (req.body.registrant_name !== undefined) {
        input.registrant_name = req.body.registrant_name.trim();
      }
      if (req.body.registrant_email !== undefined) {
        input.registrant_email = req.body.registrant_email.trim().toLowerCase();
      }
      if (req.body.registrant_phone !== undefined) {
        input.registrant_phone = req.body.registrant_phone?.trim() || null;
      }
      if (req.body.ticket_id !== undefined) {
        input.ticket_id = req.body.ticket_id ? parseInt(req.body.ticket_id, 10) : null;
      }
      if (req.body.quantity !== undefined) {
        input.quantity = parseInt(req.body.quantity, 10);
      }
      if (req.body.status !== undefined) {
        input.status = req.body.status;
      }
      if (req.body.payment_status !== undefined) {
        input.payment_status = req.body.payment_status;
      }
      if (req.body.payment_method !== undefined) {
        input.payment_method = req.body.payment_method;
      }
      if (req.body.total_amount !== undefined) {
        input.total_amount = parseFloat(req.body.total_amount);
      }

      const registration = await registrationsService.updateRegistration(eventId, registrationId, input);

      return res.status(200).json(registration);
    } catch (error: any) {
      console.error('Error updating registration:', error);
      if (error.message === 'Registration not found') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Failed to update registration' });
    }
  }

  async updateRegistrationStatus(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const registrationId = parseInt(req.params.registrationId, 10);

      if (isNaN(eventId) || isNaN(registrationId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }

      const validStatuses = ['started', 'pending', 'completed', 'approved', 'cancelled', 'refunded', 'expired'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }

      const registration = await registrationsService.updateRegistrationStatus(eventId, registrationId, status);

      return res.status(200).json(registration);
    } catch (error: any) {
      console.error('Error updating registration status:', error);
      if (error.message === 'Registration not found') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Failed to update registration status' });
    }
  }

  async updatePaymentStatus(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const registrationId = parseInt(req.params.registrationId, 10);

      if (isNaN(eventId) || isNaN(registrationId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const { payment_status } = req.body;
      if (!payment_status) {
        return res.status(400).json({ message: 'Payment status is required' });
      }

      const validStatuses = ['pending', 'paid', 'free', 'failed', 'refunded'];
      if (!validStatuses.includes(payment_status)) {
        return res.status(400).json({ message: `Invalid payment status. Must be one of: ${validStatuses.join(', ')}` });
      }

      const registration = await registrationsService.updatePaymentStatus(eventId, registrationId, payment_status);

      return res.status(200).json(registration);
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      if (error.message === 'Registration not found') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Failed to update payment status' });
    }
  }

  async deleteRegistration(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const registrationId = parseInt(req.params.registrationId, 10);

      if (isNaN(eventId) || isNaN(registrationId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      await registrationsService.deleteRegistration(eventId, registrationId);

      return res.status(200).json({ message: 'Registration deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting registration:', error);
      if (error.message === 'Registration not found') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Failed to delete registration' });
    }
  }

  async getRegistrationStats(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const stats = await registrationsService.getRegistrationStats(eventId);

      return res.status(200).json(stats);
    } catch (error: any) {
      console.error('Error fetching registration stats:', error);
      return res.status(500).json({ message: 'Failed to fetch registration stats' });
    }
  }
}
