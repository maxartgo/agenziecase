// Test app creator for integration tests
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';

// Import routes
import authRoutes from '../../routes/authRoutes.js';
import propertyRoutes from '../../routes/propertyRoutes.js';
import partnerRoutes from '../../routes/partners.js';
import agentRoutes from '../../routes/agentRoutes.js';
import crmSubscriptionsRoutes from '../../routes/crmSubscriptions.js';
import adminCrmSubscriptionsRoutes from '../../routes/admin/crmSubscriptions.js';
import supportTicketsRoutes from '../../routes/supportTickets.js';
import adminSupportTicketsRoutes from '../../routes/admin/supportTickets.js';
import mlsRoutes from '../../routes/mls.js';
import notificationsRoutes from '../../routes/notifications.js';
import performanceRoutes from '../../routes/performance.js';

// CRM routes (commented out in main index)
import appointmentsRoutes from '../../routes/crm/appointments.js';
import activitiesRoutes from '../../routes/crm/activities.js';
import documentsRoutes from '../../routes/crm/documents.js';

// AI & Communications
import aiCrmRoutes from '../../routes/ai-crm.js';
import communicationsRoutes from '../../routes/communications.js';

/**
 * Creates a test Express app with all routes
 * This is used for integration testing
 */
export function createTestApp() {
  const app = express();

  // Basic middleware
  app.use(helmet());
  app.use(compression());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mount all routes
  app.use('/api/auth', authRoutes);
  app.use('/api/properties', propertyRoutes);
  app.use('/api/partners', partnerRoutes);
  app.use('/api/agents', agentRoutes);
  app.use('/api/crm/subscriptions', crmSubscriptionsRoutes);
  app.use('/api/admin/crm/subscriptions', adminCrmSubscriptionsRoutes);
  app.use('/api/support-tickets', supportTicketsRoutes);
  app.use('/api/admin/support-tickets', adminSupportTicketsRoutes);
  app.use('/api/mls', mlsRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/performance', performanceRoutes);

  // CRM routes
  app.use('/api/crm/appointments', appointmentsRoutes);
  app.use('/api/crm/activities', activitiesRoutes);
  app.use('/api/crm/documents', documentsRoutes);

  // AI & Communications
  app.use('/api/ai-crm', aiCrmRoutes);
  app.use('/api/communications', communicationsRoutes);

  // Error handling
  app.use((err, req, res, next) => {
    console.error('Test app error:', err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  });

  return app;
}

export default createTestApp;
