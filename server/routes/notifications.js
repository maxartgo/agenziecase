import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as notificationService from '../services/notificationService.js';
import * as emailService from '../services/emailService.js';

const router = express.Router();

/**
 * GET /api/notifications
 * Ottieni le notifiche dell'utente autenticato
 * Query params:
 *   - isRead: true|false (filtra per lette/non lette)
 *   - type: string (filtra per tipo)
 *   - priority: low|normal|high|urgent
 *   - limit: number (default 50)
 *   - offset: number (default 0)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { isRead, type, priority, limit, offset } = req.query;

    const filters = {};
    if (isRead !== undefined) filters.isRead = isRead === 'true';
    if (type) filters.type = type;
    if (priority) filters.priority = priority;
    if (limit) filters.limit = parseInt(limit);
    if (offset) filters.offset = parseInt(offset);

    const result = await notificationService.getUserNotifications(userId, filters);

    if (result.success) {
      res.json({
        success: true,
        notifications: result.notifications
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il recupero delle notifiche'
    });
  }
});

/**
 * GET /api/notifications/unread/count
 * Ottieni il conteggio delle notifiche non lette
 */
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await notificationService.getUnreadCount(userId);

    if (result.success) {
      res.json({
        success: true,
        count: result.count
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il conteggio delle notifiche'
    });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Segna una notifica come letta
 */
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const result = await notificationService.markAsRead(notificationId, userId);

    if (result.success) {
      res.json({
        success: true,
        notification: result.notification
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'aggiornamento della notifica'
    });
  }
});

/**
 * PATCH /api/notifications/read-all
 * Segna tutte le notifiche come lette
 */
router.patch('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await notificationService.markAllAsRead(userId);

    if (result.success) {
      res.json({
        success: true,
        message: 'Tutte le notifiche sono state segnate come lette'
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'aggiornamento delle notifiche'
    });
  }
});

/**
 * DELETE /api/notifications/:id
 * Elimina una notifica
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const result = await notificationService.deleteNotification(notificationId, userId);

    if (result.success) {
      res.json({
        success: true,
        message: 'Notifica eliminata con successo'
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'eliminazione della notifica'
    });
  }
});

/**
 * POST /api/notifications/test-email
 * Invia email di test (solo per testing)
 */
router.post('/test-email', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const result = await emailService.sendTestEmail(userEmail);

    if (result.success) {
      res.json({
        success: true,
        message: `Email di test inviata a ${userEmail}`
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'invio dell\'email di test'
    });
  }
});

export default router;
