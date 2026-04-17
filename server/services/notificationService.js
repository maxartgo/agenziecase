import sequelize from '../config/database.js';
import * as emailService from './emailService.js';

/**
 * Notification Service
 * Servizio centralizzato per la gestione delle notifiche
 * Gestisce sia notifiche in-app che invio email
 */

/**
 * Crea una notifica in-app e opzionalmente invia email
 *
 * @param {Object} params
 * @param {number} params.userId - ID utente destinatario
 * @param {string} params.type - Tipo notifica (es: mls_collaboration_request)
 * @param {string} params.title - Titolo notifica
 * @param {string} params.message - Messaggio notifica
 * @param {Object} params.data - Dati aggiuntivi JSON
 * @param {string} params.link - Link relativo per redirect
 * @param {string} params.priority - Priorità: low|normal|high|urgent (default: normal)
 * @param {boolean} params.sendEmail - Se true, invia anche email (default: true)
 * @param {Object} params.emailData - Dati aggiuntivi per email (variabile per tipo)
 * @returns {Promise<Object>} Notification creata
 */
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  data = {},
  link = null,
  priority = 'normal',
  sendEmail = true,
  emailData = {}
}) => {
  try {
    // Crea notifica in-app nel database
    const [result] = await sequelize.query(`
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        data,
        link,
        priority,
        is_email_sent
      ) VALUES (
        :userId,
        :type,
        :title,
        :message,
        :data,
        :link,
        :priority,
        FALSE
      ) RETURNING *
    `, {
      replacements: {
        userId,
        type,
        title,
        message,
        data: JSON.stringify(data),
        link,
        priority
      }
    });

    const notification = result[0];

    // Invia email se richiesto
    if (sendEmail) {
      await sendNotificationEmail(type, userId, emailData);

      // Aggiorna flag email_sent
      await sequelize.query(`
        UPDATE notifications
        SET is_email_sent = TRUE
        WHERE id = :notificationId
      `, {
        replacements: { notificationId: notification.id }
      });
    }

    return { success: true, notification };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Invia email in base al tipo di notifica
 */
const sendNotificationEmail = async (type, userId, emailData) => {
  try {
    // Ottieni email utente
    const [users] = await sequelize.query(`
      SELECT email, name FROM users WHERE id = :userId
    `, { replacements: { userId } });

    if (users.length === 0) {
      console.error('User not found for email notification');
      return;
    }

    const userEmail = users[0].email;
    const userName = users[0].name;

    // Invia email appropriata in base al tipo
    switch (type) {
      case 'mls_collaboration_request':
        await emailService.sendCollaborationRequest({
          to: userEmail,
          recipientName: userName,
          ...emailData
        });
        break;

      case 'mls_collaboration_approved':
        await emailService.sendCollaborationApproved({
          to: userEmail,
          recipientName: userName,
          ...emailData
        });
        break;

      case 'mls_collaboration_rejected':
        await emailService.sendCollaborationRejected({
          to: userEmail,
          recipientName: userName,
          ...emailData
        });
        break;

      case 'mls_new_lead':
        await emailService.sendNewLead({
          to: userEmail,
          recipientName: userName,
          ...emailData
        });
        break;

      case 'mls_transaction_completed':
        await emailService.sendTransactionCompleted({
          to: userEmail,
          recipientName: userName,
          ...emailData
        });
        break;

      case 'mls_payment_received':
        await emailService.sendPaymentReceived({
          to: userEmail,
          recipientName: userName,
          ...emailData
        });
        break;

      // AI-CRM notifications
      case 'ai_appointment_created':
        await emailService.sendAIAppointmentConfirmation({
          to: userEmail,
          ...emailData
        });
        break;

      case 'ai_appointment_agent':
        await emailService.sendAgentNewAppointment({
          to: userEmail,
          ...emailData
        });
        break;

      case 'ai_valuation_request':
        await emailService.sendValuationRequestConfirmation({
          to: userEmail,
          ...emailData
        });
        break;

      case 'ai_valuation_agent':
        await emailService.sendAgentValuationRequest({
          to: userEmail,
          ...emailData
        });
        break;

      // CRM notifications
      case 'appointment_updated':
        await emailService.sendAppointmentUpdated({
          to: userEmail,
          ...emailData
        });
        break;

      case 'appointment_cancelled':
        await emailService.sendAppointmentCancelled({
          to: userEmail,
          ...emailData
        });
        break;

      case 'appointment_reminder':
        await emailService.sendAppointmentReminder({
          to: userEmail,
          ...emailData
        });
        break;

      // Support notifications
      case 'ticket_created':
        await emailService.sendTicketCreatedConfirmation({
          to: userEmail,
          ...emailData
        });
        break;

      case 'ticket_replied':
        await emailService.sendTicketReply({
          to: userEmail,
          ...emailData
        });
        break;

      case 'ticket_resolved':
        await emailService.sendTicketResolved({
          to: userEmail,
          ...emailData
        });
        break;

      // Virtual Tour notifications
      case 'vt_completed':
        await emailService.sendVirtualTourCompleted({
          to: userEmail,
          ...emailData
        });
        break;

      case 'vt_rejected':
        await emailService.sendVirtualTourRejected({
          to: userEmail,
          ...emailData
        });
        break;

      // Subscription notifications
      case 'subscription_activated':
        await emailService.sendSubscriptionActivated({
          to: userEmail,
          ...emailData
        });
        break;

      case 'subscription_expiring':
        await emailService.sendSubscriptionExpiring({
          to: userEmail,
          ...emailData
        });
        break;

      case 'subscription_expired':
        await emailService.sendSubscriptionExpired({
          to: userEmail,
          ...emailData
        });
        break;

      // Agent notifications
      case 'agent_welcome':
        await emailService.sendAgentWelcome({
          to: userEmail,
          ...emailData
        });
        break;

      // Generic lead notifications
      case 'ai_lead_created':
        await emailService.sendLeadConfirmation({
          to: userEmail,
          ...emailData
        });
        break;

      case 'ai_lead_agent':
        await emailService.sendAgentNewLead({
          to: userEmail,
          ...emailData
        });
        break;

      default:
        console.log(`No email template for notification type: ${type}`);
    }
  } catch (error) {
    console.error('Error sending notification email:', error);
  }
};

/**
 * Ottieni notifiche di un utente
 */
export const getUserNotifications = async (userId, filters = {}) => {
  try {
    let whereClause = 'WHERE user_id = :userId';
    const replacements = { userId };

    if (filters.isRead !== undefined) {
      whereClause += ' AND is_read = :isRead';
      replacements.isRead = filters.isRead;
    }

    if (filters.type) {
      whereClause += ' AND type = :type';
      replacements.type = filters.type;
    }

    if (filters.priority) {
      whereClause += ' AND priority = :priority';
      replacements.priority = filters.priority;
    }

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const [notifications] = await sequelize.query(`
      SELECT *
      FROM notifications
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT :limit OFFSET :offset
    `, {
      replacements: { ...replacements, limit, offset }
    });

    return { success: true, notifications };
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Conta notifiche non lette
 */
export const getUnreadCount = async (userId) => {
  try {
    const [result] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = :userId AND is_read = FALSE
    `, { replacements: { userId } });

    return { success: true, count: parseInt(result[0].count) };
  } catch (error) {
    console.error('Error getting unread count:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Segna notifica come letta
 */
export const markAsRead = async (notificationId, userId) => {
  try {
    const [result] = await sequelize.query(`
      UPDATE notifications
      SET is_read = TRUE, read_at = NOW()
      WHERE id = :notificationId AND user_id = :userId
      RETURNING *
    `, {
      replacements: { notificationId, userId }
    });

    if (result.length === 0) {
      return { success: false, error: 'Notification not found' };
    }

    return { success: true, notification: result[0] };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Segna tutte le notifiche come lette
 */
export const markAllAsRead = async (userId) => {
  try {
    await sequelize.query(`
      UPDATE notifications
      SET is_read = TRUE, read_at = NOW()
      WHERE user_id = :userId AND is_read = FALSE
    `, { replacements: { userId } });

    return { success: true };
  } catch (error) {
    console.error('Error marking all as read:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Elimina notifica
 */
export const deleteNotification = async (notificationId, userId) => {
  try {
    const [result] = await sequelize.query(`
      DELETE FROM notifications
      WHERE id = :notificationId AND user_id = :userId
      RETURNING id
    `, {
      replacements: { notificationId, userId }
    });

    if (result.length === 0) {
      return { success: false, error: 'Notification not found' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ============================================
 * HELPER FUNCTIONS PER TIPI DI NOTIFICA
 * ============================================
 */

/**
 * Notifica: Richiesta collaborazione MLS
 */
export const notifyCollaborationRequest = async ({
  listingPartnerUserId,
  collaboratingPartnerName,
  propertyTitle,
  propertyCity,
  propertyId,
  collaborationId,
  commissionSplit
}) => {
  return await createNotification({
    userId: listingPartnerUserId,
    type: 'mls_collaboration_request',
    title: 'Nuova Richiesta Collaborazione MLS',
    message: `${collaboratingPartnerName} vuole collaborare su "${propertyTitle}"`,
    data: { propertyId, collaborationId },
    link: '/mls-collaborations',
    priority: 'high',
    sendEmail: true,
    emailData: {
      requesterName: collaboratingPartnerName,
      propertyTitle,
      propertyCity,
      commissionSplit,
      link: `${process.env.FRONTEND_URL}/mls-collaborations`
    }
  });
};

/**
 * Notifica: Collaborazione approvata
 */
export const notifyCollaborationApproved = async ({
  collaboratingPartnerUserId,
  approverName,
  propertyTitle,
  propertyCity,
  propertyId,
  collaborationId,
  commissionSplit
}) => {
  return await createNotification({
    userId: collaboratingPartnerUserId,
    type: 'mls_collaboration_approved',
    title: 'Collaborazione Approvata!',
    message: `${approverName} ha approvato la tua richiesta per "${propertyTitle}"`,
    data: { propertyId, collaborationId },
    link: '/mls-collaborations',
    priority: 'high',
    sendEmail: true,
    emailData: {
      approverName,
      propertyTitle,
      propertyCity,
      commissionSplit,
      link: `${process.env.FRONTEND_URL}/mls-collaborations`
    }
  });
};

/**
 * Notifica: Collaborazione rifiutata
 */
export const notifyCollaborationRejected = async ({
  collaboratingPartnerUserId,
  rejectorName,
  propertyTitle,
  propertyId,
  reason
}) => {
  return await createNotification({
    userId: collaboratingPartnerUserId,
    type: 'mls_collaboration_rejected',
    title: 'Collaborazione Non Approvata',
    message: `${rejectorName} ha rifiutato la tua richiesta per "${propertyTitle}"`,
    data: { propertyId, reason },
    link: '/mls-network',
    priority: 'normal',
    sendEmail: true,
    emailData: {
      rejectorName,
      propertyTitle,
      reason
    }
  });
};

/**
 * Notifica: Nuovo lead MLS
 */
export const notifyNewLead = async ({
  listingPartnerUserId,
  partnerName,
  propertyTitle,
  clientName,
  clientEmail,
  clientPhone,
  leadQuality,
  leadId,
  propertyId
}) => {
  return await createNotification({
    userId: listingPartnerUserId,
    type: 'mls_new_lead',
    title: 'Nuovo Lead MLS',
    message: `${partnerName} ha generato un lead per "${propertyTitle}"`,
    data: { leadId, propertyId },
    link: '/mls-leads',
    priority: 'high',
    sendEmail: true,
    emailData: {
      partnerName,
      propertyTitle,
      clientName,
      clientEmail,
      clientPhone,
      leadQuality,
      link: `${process.env.FRONTEND_URL}/mls-leads`
    }
  });
};

/**
 * Notifica: Transazione completata (a entrambi i partner)
 */
export const notifyTransactionCompleted = async ({
  listingPartnerUserId,
  collaboratingPartnerUserId,
  propertyTitle,
  salePrice,
  listingCommission,
  collaboratingCommission,
  transactionId,
  saleDate
}) => {
  // Notifica al listing partner
  await createNotification({
    userId: listingPartnerUserId,
    type: 'mls_transaction_completed',
    title: 'Vendita Completata!',
    message: `La vendita di "${propertyTitle}" è stata completata con successo`,
    data: { transactionId, salePrice, yourCommission: listingCommission },
    link: '/mls-transactions',
    priority: 'urgent',
    sendEmail: true,
    emailData: {
      propertyTitle,
      salePrice,
      yourCommission: listingCommission,
      partnerName: 'Collaboratore',
      saleDate,
      link: `${process.env.FRONTEND_URL}/mls-transactions`
    }
  });

  // Notifica al collaborating partner
  await createNotification({
    userId: collaboratingPartnerUserId,
    type: 'mls_transaction_completed',
    title: 'Vendita Completata!',
    message: `La vendita di "${propertyTitle}" è stata completata con successo`,
    data: { transactionId, salePrice, yourCommission: collaboratingCommission },
    link: '/mls-transactions',
    priority: 'urgent',
    sendEmail: true,
    emailData: {
      propertyTitle,
      salePrice,
      yourCommission: collaboratingCommission,
      partnerName: 'Listing Partner',
      saleDate,
      link: `${process.env.FRONTEND_URL}/mls-transactions`
    }
  });
};

/**
 * Notifica: Pagamento ricevuto
 */
export const notifyPaymentReceived = async ({
  recipientUserId,
  propertyTitle,
  commissionAmount,
  transactionId,
  paymentDate
}) => {
  return await createNotification({
    userId: recipientUserId,
    type: 'mls_payment_received',
    title: 'Pagamento Confermato',
    message: `Il pagamento per "${propertyTitle}" è stato confermato`,
    data: { transactionId, commissionAmount },
    link: '/mls-transactions',
    priority: 'high',
    sendEmail: true,
    emailData: {
      propertyTitle,
      commissionAmount,
      paymentDate
    }
  });
};

/**
 * ============================================
 * AI-CRM NOTIFICATIONS
 * ============================================
 */

/**
 * Notifica: Appuntamento creato da AI (al cliente)
 */
export const notifyAIAppointmentCreated = async ({
  clientUserId,
  clientName,
  clientEmail,
  agentName,
  propertyTitle,
  appointmentDate,
  appointmentType,
  appointmentId
}) => {
  return await createNotification({
    userId: clientUserId,
    type: 'ai_appointment_created',
    title: 'Appuntamento Confermato',
    message: `Il tuo appuntamento per ${appointmentType === 'viewing' ? 'visita' : appointmentType === 'videocall' ? 'videochiamata' : 'incontro'} è stato confermato`,
    data: { appointmentId, appointmentType },
    link: '/my-appointments',
    priority: 'high',
    sendEmail: true,
    emailData: {
      to: clientEmail,
      clientName,
      agentName,
      propertyTitle,
      appointmentDate,
      appointmentType
    }
  });
};

/**
 * Notifica: Nuovo appuntamento AI (all'agente)
 */
export const notifyAgentNewAIAppointment = async ({
  agentUserId,
  agentName,
  agentEmail,
  clientName,
  clientEmail,
  clientPhone,
  propertyTitle,
  appointmentDate,
  appointmentType,
  notes,
  appointmentId
}) => {
  return await createNotification({
    userId: agentUserId,
    type: 'ai_appointment_agent',
    title: 'Nuovo Appuntamento AI',
    message: `L'AI ha fissato un appuntamento con ${clientName}`,
    data: { appointmentId, clientName, appointmentType },
    link: '/crm-appointments',
    priority: 'urgent',
    sendEmail: true,
    emailData: {
      to: agentEmail,
      agentName,
      clientName,
      clientEmail,
      clientPhone,
      propertyTitle,
      appointmentDate,
      appointmentType,
      notes
    }
  });
};

/**
 * Notifica: Richiesta valutazione da AI (al cliente)
 */
export const notifyValuationRequestCreated = async ({
  clientUserId,
  clientName,
  clientEmail,
  propertyAddress,
  propertyType,
  valuationId
}) => {
  return await createNotification({
    userId: clientUserId,
    type: 'ai_valuation_request',
    title: 'Richiesta Valutazione Ricevuta',
    message: `Abbiamo ricevuto la tua richiesta di valutazione per ${propertyAddress}`,
    data: { valuationId },
    link: '/my-valuations',
    priority: 'normal',
    sendEmail: true,
    emailData: {
      to: clientEmail,
      clientName,
      propertyAddress,
      propertyType
    }
  });
};

/**
 * Notifica: Richiesta valutazione da AI (all'agente)
 */
export const notifyAgentValuationRequest = async ({
  agentUserId,
  agentName,
  agentEmail,
  clientName,
  clientEmail,
  clientPhone,
  propertyAddress,
  propertyType,
  propertySize,
  notes,
  valuationId
}) => {
  return await createNotification({
    userId: agentUserId,
    type: 'ai_valuation_agent',
    title: 'Nuova Richiesta Valutazione',
    message: `${clientName} ha richiesto una valutazione tramite AI`,
    data: { valuationId, clientName, propertyAddress },
    link: '/crm-valuations',
    priority: 'high',
    sendEmail: true,
    emailData: {
      to: agentEmail,
      agentName,
      clientName,
      clientEmail,
      clientPhone,
      propertyAddress,
      propertyType,
      propertySize,
      notes
    }
  });
};

/**
 * Notifica: Richiesta lead generico da AI (al cliente)
 */
export const notifyLeadCreated = async ({
  clientUserId,
  clientName,
  clientEmail,
  leadType,
  propertyType,
  budget,
  location
}) => {
  return await createNotification({
    userId: clientUserId,
    type: 'ai_lead_created',
    title: 'Richiesta Ricevuta',
    message: `Abbiamo ricevuto la tua richiesta. Ti contatteremo entro 24 ore.`,
    data: { leadType, propertyType, budget, location },
    link: '/my-requests',
    priority: 'normal',
    sendEmail: true,
    emailData: {
      to: clientEmail,
      clientName,
      leadType,
      propertyType,
      budget,
      location
    }
  });
};

/**
 * Notifica: Nuovo lead generico da AI (all'agente)
 */
export const notifyAgentNewLead = async ({
  agentUserId,
  agentName,
  agentEmail,
  clientName,
  clientEmail,
  clientPhone,
  leadType,
  propertyType,
  budget,
  location
}) => {
  return await createNotification({
    userId: agentUserId,
    type: 'ai_lead_agent',
    title: 'Nuovo Lead da AI',
    message: `${clientName} ha richiesto informazioni tramite AI Assistant`,
    data: { clientName, leadType, propertyType },
    link: '/crm/clients',
    priority: 'high',
    sendEmail: true,
    emailData: {
      to: agentEmail,
      agentName,
      clientName,
      clientEmail,
      clientPhone,
      leadType,
      propertyType,
      budget,
      location
    }
  });
};

/**
 * ============================================
 * CRM NOTIFICATIONS
 * ============================================
 */

/**
 * Notifica: Appuntamento modificato
 */
export const notifyAppointmentUpdated = async ({
  recipientUserId,
  recipientName,
  recipientEmail,
  appointmentType,
  propertyTitle,
  newDate,
  reason,
  appointmentId
}) => {
  return await createNotification({
    userId: recipientUserId,
    type: 'appointment_updated',
    title: 'Appuntamento Modificato',
    message: `Il tuo appuntamento è stato riprogrammato`,
    data: { appointmentId, newDate },
    link: '/my-appointments',
    priority: 'high',
    sendEmail: true,
    emailData: {
      to: recipientEmail,
      recipientName,
      appointmentType,
      propertyTitle,
      newDate,
      reason
    }
  });
};

/**
 * Notifica: Appuntamento cancellato
 */
export const notifyAppointmentCancelled = async ({
  recipientUserId,
  recipientName,
  recipientEmail,
  appointmentType,
  propertyTitle,
  appointmentDate,
  reason,
  appointmentId
}) => {
  return await createNotification({
    userId: recipientUserId,
    type: 'appointment_cancelled',
    title: 'Appuntamento Cancellato',
    message: `L'appuntamento del ${new Date(appointmentDate).toLocaleDateString('it-IT')} è stato cancellato`,
    data: { appointmentId },
    link: '/my-appointments',
    priority: 'high',
    sendEmail: true,
    emailData: {
      to: recipientEmail,
      recipientName,
      appointmentType,
      propertyTitle,
      appointmentDate,
      reason
    }
  });
};

/**
 * Notifica: Promemoria appuntamento (24h prima)
 */
export const notifyAppointmentReminder = async ({
  recipientUserId,
  recipientName,
  recipientEmail,
  appointmentType,
  propertyTitle,
  appointmentDate,
  appointmentLocation,
  agentName,
  agentPhone,
  appointmentId
}) => {
  return await createNotification({
    userId: recipientUserId,
    type: 'appointment_reminder',
    title: 'Promemoria Appuntamento',
    message: `Il tuo appuntamento è domani alle ${new Date(appointmentDate).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`,
    data: { appointmentId },
    link: '/my-appointments',
    priority: 'normal',
    sendEmail: true,
    emailData: {
      to: recipientEmail,
      recipientName,
      appointmentType,
      propertyTitle,
      appointmentDate,
      appointmentLocation,
      agentName,
      agentPhone
    }
  });
};

/**
 * ============================================
 * SUPPORT TICKET NOTIFICATIONS
 * ============================================
 */

/**
 * Notifica: Ticket creato
 */
export const notifyTicketCreated = async ({
  userId,
  userName,
  userEmail,
  ticketNumber,
  subject,
  ticketId
}) => {
  return await createNotification({
    userId,
    type: 'ticket_created',
    title: 'Ticket di Supporto Creato',
    message: `Il tuo ticket #${ticketNumber} è stato ricevuto`,
    data: { ticketId, ticketNumber },
    link: '/support-tickets',
    priority: 'normal',
    sendEmail: true,
    emailData: {
      to: userEmail,
      userName,
      ticketNumber,
      subject
    }
  });
};

/**
 * Notifica: Risposta a ticket
 */
export const notifyTicketReplied = async ({
  userId,
  userName,
  userEmail,
  ticketNumber,
  subject,
  replyMessage,
  ticketId
}) => {
  return await createNotification({
    userId,
    type: 'ticket_replied',
    title: 'Nuova Risposta al Ticket',
    message: `Il team ha risposto al tuo ticket #${ticketNumber}`,
    data: { ticketId, ticketNumber },
    link: '/support-tickets',
    priority: 'high',
    sendEmail: true,
    emailData: {
      to: userEmail,
      userName,
      ticketNumber,
      subject,
      replyMessage
    }
  });
};

/**
 * Notifica: Ticket risolto
 */
export const notifyTicketResolved = async ({
  userId,
  userName,
  userEmail,
  ticketNumber,
  subject,
  resolutionMessage,
  ticketId
}) => {
  return await createNotification({
    userId,
    type: 'ticket_resolved',
    title: 'Ticket Risolto',
    message: `Il tuo ticket #${ticketNumber} è stato risolto`,
    data: { ticketId, ticketNumber },
    link: '/support-tickets',
    priority: 'normal',
    sendEmail: true,
    emailData: {
      to: userEmail,
      userName,
      ticketNumber,
      subject,
      resolutionMessage
    }
  });
};

/**
 * ============================================
 * VIRTUAL TOUR NOTIFICATIONS
 * ============================================
 */

/**
 * Notifica: Virtual Tour completato
 */
export const notifyVirtualTourCompleted = async ({
  partnerUserId,
  partnerName,
  partnerEmail,
  propertyTitle,
  propertyAddress,
  tourUrl,
  tourId
}) => {
  return await createNotification({
    userId: partnerUserId,
    type: 'vt_completed',
    title: 'Virtual Tour Pronto',
    message: `Il tour virtuale di "${propertyTitle}" è pronto`,
    data: { tourId, tourUrl },
    link: '/virtual-tours',
    priority: 'high',
    sendEmail: true,
    emailData: {
      to: partnerEmail,
      partnerName,
      propertyTitle,
      propertyAddress,
      tourUrl
    }
  });
};

/**
 * Notifica: Virtual Tour rifiutato
 */
export const notifyVirtualTourRejected = async ({
  partnerUserId,
  partnerName,
  partnerEmail,
  propertyTitle,
  reason,
  tourId
}) => {
  return await createNotification({
    userId: partnerUserId,
    type: 'vt_rejected',
    title: 'Richiesta Virtual Tour Rifiutata',
    message: `La richiesta per "${propertyTitle}" non è stata approvata`,
    data: { tourId },
    link: '/virtual-tours',
    priority: 'normal',
    sendEmail: true,
    emailData: {
      to: partnerEmail,
      partnerName,
      propertyTitle,
      reason
    }
  });
};

/**
 * ============================================
 * SUBSCRIPTION & AGENT NOTIFICATIONS
 * ============================================
 */

/**
 * Notifica: Abbonamento attivato
 */
export const notifySubscriptionActivated = async ({
  partnerUserId,
  partnerName,
  partnerEmail,
  planName,
  teamSize,
  expiryDate,
  subscriptionId
}) => {
  return await createNotification({
    userId: partnerUserId,
    type: 'subscription_activated',
    title: 'Abbonamento Attivato',
    message: `Il tuo piano ${planName} è ora attivo`,
    data: { subscriptionId, planName, expiryDate },
    link: '/crm-subscription',
    priority: 'high',
    sendEmail: true,
    emailData: {
      to: partnerEmail,
      partnerName,
      planName,
      teamSize,
      expiryDate
    }
  });
};

/**
 * Notifica: Abbonamento in scadenza (7 giorni)
 */
export const notifySubscriptionExpiring = async ({
  partnerUserId,
  partnerName,
  partnerEmail,
  planName,
  expiryDate,
  subscriptionId
}) => {
  return await createNotification({
    userId: partnerUserId,
    type: 'subscription_expiring',
    title: 'Abbonamento in Scadenza',
    message: `Il tuo piano ${planName} scade tra 7 giorni`,
    data: { subscriptionId, expiryDate },
    link: '/crm-subscription',
    priority: 'urgent',
    sendEmail: true,
    emailData: {
      to: partnerEmail,
      partnerName,
      planName,
      expiryDate
    }
  });
};

/**
 * Notifica: Abbonamento scaduto
 */
export const notifySubscriptionExpired = async ({
  partnerUserId,
  partnerName,
  partnerEmail,
  planName,
  subscriptionId
}) => {
  return await createNotification({
    userId: partnerUserId,
    type: 'subscription_expired',
    title: 'Abbonamento Scaduto',
    message: `Il tuo piano ${planName} è scaduto`,
    data: { subscriptionId },
    link: '/crm-subscription',
    priority: 'urgent',
    sendEmail: true,
    emailData: {
      to: partnerEmail,
      partnerName,
      planName
    }
  });
};

/**
 * Notifica: Benvenuto nuovo agente
 */
export const notifyAgentWelcome = async ({
  agentUserId,
  agentName,
  agentEmail,
  partnerName,
  partnerAgency
}) => {
  return await createNotification({
    userId: agentUserId,
    type: 'agent_welcome',
    title: 'Benvenuto in AgenzieCase',
    message: `Sei stato aggiunto al team di ${partnerAgency}`,
    data: { partnerName },
    link: '/dashboard',
    priority: 'normal',
    sendEmail: true,
    emailData: {
      to: agentEmail,
      agentName,
      partnerName,
      partnerAgency
    }
  });
};

export default {
  // Core functions
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  // MLS notifications
  notifyCollaborationRequest,
  notifyCollaborationApproved,
  notifyCollaborationRejected,
  notifyNewLead,
  notifyTransactionCompleted,
  notifyPaymentReceived,
  // AI-CRM notifications
  notifyAIAppointmentCreated,
  notifyAgentNewAIAppointment,
  notifyValuationRequestCreated,
  notifyAgentValuationRequest,
  // CRM notifications
  notifyAppointmentUpdated,
  notifyAppointmentCancelled,
  notifyAppointmentReminder,
  // Support notifications
  notifyTicketCreated,
  notifyTicketReplied,
  notifyTicketResolved,
  // Virtual Tour notifications
  notifyVirtualTourCompleted,
  notifyVirtualTourRejected,
  // Subscription & Agent notifications
  notifySubscriptionActivated,
  notifySubscriptionExpiring,
  notifySubscriptionExpired,
  notifyAgentWelcome
};
