import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Email Service con Nodemailer
 * Configurato per OVH/Zimbra SMTP
 */

// Configurazione transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true', // true per porta 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    // Non rifiutare certificati non autorizzati (utile per alcuni provider)
    rejectUnauthorized: false
  }
});

// Verifica configurazione al caricamento
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service configuration error:', error);
  } else {
    console.log('✅ Email service ready to send messages');
  }
});

/**
 * Template HTML base per email
 */
const getEmailTemplate = (content) => {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgenzieCASE Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a2e; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(212, 175, 55, 0.3); border: 2px solid #d4af37;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #0a0a0a; font-size: 32px; font-weight: 700; font-family: 'Playfair Display', Georgia, serif;">
                🏡 AgenzieCASE
              </h1>
              <p style="margin: 10px 0 0 0; color: #0a0a0a; font-size: 14px; opacity: 0.8;">
                Il tuo partner immobiliare
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: rgba(212, 175, 55, 0.1); padding: 30px; text-align: center; border-top: 1px solid rgba(212, 175, 55, 0.3);">
              <p style="margin: 0 0 10px 0; color: rgba(255, 255, 255, 0.6); font-size: 12px;">
                Questa email è stata generata automaticamente dal sistema AgenzieCASE
              </p>
              <p style="margin: 0; color: rgba(255, 255, 255, 0.4); font-size: 11px;">
                © ${new Date().getFullYear()} AgenzieCASE - Tutti i diritti riservati
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Stile button per CTA
 */
const getButtonStyle = () => {
  return `
    display: inline-block;
    padding: 15px 40px;
    background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
    color: #0a0a0a;
    text-decoration: none;
    border-radius: 12px;
    font-weight: 600;
    font-size: 16px;
    margin: 20px 0;
  `;
};

/**
 * ========================================
 * MLS COLLABORATION EMAILS
 * ========================================
 */

/**
 * Email: Nuova richiesta di collaborazione ricevuta
 */
export const sendCollaborationRequest = async ({
  to,
  recipientName,
  requesterName,
  propertyTitle,
  propertyCity,
  commissionSplit,
  link
}) => {
  try {
    const content = `
      <h2 style="color: #d4af37; margin: 0 0 20px 0; font-size: 24px;">
        🤝 Nuova Richiesta di Collaborazione
      </h2>
      <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 0 0 15px 0;">
        Ciao <strong>${recipientName}</strong>,
      </p>
      <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 0 0 15px 0;">
        <strong>${requesterName}</strong> ha richiesto di collaborare su uno dei tuoi immobili nel network MLS:
      </p>
      <div style="background-color: rgba(212, 175, 55, 0.1); border-left: 4px solid #d4af37; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <p style="margin: 0 0 10px 0; color: #d4af37; font-weight: 600;">📍 Immobile</p>
        <p style="margin: 0 0 5px 0; color: #fff; font-size: 18px; font-weight: 600;">${propertyTitle}</p>
        <p style="margin: 0; color: rgba(255, 255, 255, 0.6);">${propertyCity}</p>
        <p style="margin: 15px 0 0 0; color: rgba(255, 255, 255, 0.7);">
          💰 Split commissione: <strong>${commissionSplit}%</strong> al collaboratore
        </p>
      </div>
      <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 20px 0;">
        Rivedi i dettagli e approva o rifiuta questa richiesta accedendo alla tua dashboard:
      </p>
      <div style="text-align: center;">
        <a href="${link}" style="${getButtonStyle()}">
          📋 Gestisci Collaborazione
        </a>
      </div>
      <p style="color: rgba(255, 255, 255, 0.5); font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
        ⏰ Rispondere tempestivamente aumenta le possibilità di chiudere l'affare con successo.
      </p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: `🤝 Nuova richiesta collaborazione MLS - ${propertyTitle}`,
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Collaboration request email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending collaboration request email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Email: Collaborazione approvata
 */
export const sendCollaborationApproved = async ({
  to,
  recipientName,
  approverName,
  propertyTitle,
  propertyCity,
  commissionSplit,
  link
}) => {
  try {
    const content = `
      <h2 style="color: #34c759; margin: 0 0 20px 0; font-size: 24px;">
        ✅ Collaborazione Approvata!
      </h2>
      <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 0 0 15px 0;">
        Ottima notizia <strong>${recipientName}</strong>!
      </p>
      <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 0 0 15px 0;">
        <strong>${approverName}</strong> ha approvato la tua richiesta di collaborazione per:
      </p>
      <div style="background-color: rgba(52, 199, 89, 0.1); border-left: 4px solid #34c759; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <p style="margin: 0 0 10px 0; color: #34c759; font-weight: 600;">📍 Immobile</p>
        <p style="margin: 0 0 5px 0; color: #fff; font-size: 18px; font-weight: 600;">${propertyTitle}</p>
        <p style="margin: 0; color: rgba(255, 255, 255, 0.6);">${propertyCity}</p>
        <p style="margin: 15px 0 0 0; color: rgba(255, 255, 255, 0.7);">
          💰 La tua commissione: <strong>${commissionSplit}%</strong>
        </p>
      </div>
      <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 20px 0;">
        Ora puoi iniziare a portare clienti interessati. Ogni lead generato sarà tracciato automaticamente nel sistema.
      </p>
      <div style="text-align: center;">
        <a href="${link}" style="${getButtonStyle()}">
          🚀 Inizia a Collaborare
        </a>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: `✅ Collaborazione approvata - ${propertyTitle}`,
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Collaboration approved email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending collaboration approved email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Email: Collaborazione rifiutata
 */
export const sendCollaborationRejected = async ({
  to,
  recipientName,
  rejectorName,
  propertyTitle,
  reason
}) => {
  try {
    const content = `
      <h2 style="color: #ff3b30; margin: 0 0 20px 0; font-size: 24px;">
        ❌ Collaborazione Non Approvata
      </h2>
      <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 0 0 15px 0;">
        Ciao <strong>${recipientName}</strong>,
      </p>
      <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 0 0 15px 0;">
        <strong>${rejectorName}</strong> ha rifiutato la tua richiesta di collaborazione per <strong>${propertyTitle}</strong>.
      </p>
      ${reason ? `
        <div style="background-color: rgba(255, 59, 48, 0.1); border-left: 4px solid #ff3b30; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <p style="margin: 0 0 10px 0; color: #ff3b30; font-weight: 600;">💬 Motivo</p>
          <p style="margin: 0; color: rgba(255, 255, 255, 0.8);">${reason}</p>
        </div>
      ` : ''}
      <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 20px 0;">
        Non preoccuparti! Ci sono tante altre opportunità nel network MLS. Continua a cercare immobili su cui collaborare.
      </p>
      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL}/mls-network" style="${getButtonStyle()}">
          🔍 Esplora Network MLS
        </a>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: `Aggiornamento collaborazione - ${propertyTitle}`,
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Collaboration rejected email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending collaboration rejected email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ========================================
 * MLS LEAD EMAILS
 * ========================================
 */

/**
 * Email: Nuovo lead generato da collaborazione
 */
export const sendNewLead = async ({
  to,
  recipientName,
  partnerName,
  propertyTitle,
  clientName,
  clientEmail,
  clientPhone,
  leadQuality,
  link
}) => {
  try {
    const qualityEmoji = {
      high: '🔥',
      medium: '⭐',
      low: '💼'
    };

    const qualityLabel = {
      high: 'Alta qualità',
      medium: 'Media qualità',
      low: 'Da qualificare'
    };

    const content = `
      <h2 style="color: #d4af37; margin: 0 0 20px 0; font-size: 24px;">
        📋 Nuovo Lead MLS Ricevuto
      </h2>
      <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 0 0 15px 0;">
        Ciao <strong>${recipientName}</strong>,
      </p>
      <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 0 0 15px 0;">
        <strong>${partnerName}</strong> ha generato un nuovo lead per la tua proprietà:
      </p>
      <div style="background-color: rgba(212, 175, 55, 0.1); border-left: 4px solid #d4af37; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <p style="margin: 0 0 15px 0; color: #d4af37; font-weight: 600;">📍 ${propertyTitle}</p>
        <p style="margin: 0 0 10px 0; color: rgba(255, 255, 255, 0.7);">
          👤 <strong>Cliente:</strong> ${clientName}
        </p>
        ${clientEmail ? `<p style="margin: 0 0 10px 0; color: rgba(255, 255, 255, 0.7);">📧 ${clientEmail}</p>` : ''}
        ${clientPhone ? `<p style="margin: 0 0 10px 0; color: rgba(255, 255, 255, 0.7);">📞 ${clientPhone}</p>` : ''}
        <p style="margin: 15px 0 0 0; color: rgba(255, 255, 255, 0.7);">
          ${qualityEmoji[leadQuality]} <strong>Qualità:</strong> ${qualityLabel[leadQuality]}
        </p>
      </div>
      <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 20px 0;">
        Gestisci questo lead e aggiorna il suo stato man mano che avanza nel processo di vendita.
      </p>
      <div style="text-align: center;">
        <a href="${link}" style="${getButtonStyle()}">
          📋 Gestisci Lead
        </a>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: `📋 Nuovo lead MLS - ${propertyTitle}`,
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ New lead email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending new lead email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ========================================
 * MLS TRANSACTION EMAILS
 * ========================================
 */

/**
 * Email: Transazione completata
 */
export const sendTransactionCompleted = async ({
  to,
  recipientName,
  propertyTitle,
  salePrice,
  yourCommission,
  partnerName,
  saleDate,
  link
}) => {
  try {
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount);
    };

    const content = `
      <h2 style="color: #34c759; margin: 0 0 20px 0; font-size: 24px;">
        🎉 Vendita Completata!
      </h2>
      <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 0 0 15px 0;">
        Congratulazioni <strong>${recipientName}</strong>!
      </p>
      <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 0 0 15px 0;">
        La vendita in collaborazione con <strong>${partnerName}</strong> è stata registrata con successo:
      </p>
      <div style="background-color: rgba(52, 199, 89, 0.1); border-left: 4px solid #34c759; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <p style="margin: 0 0 15px 0; color: #34c759; font-weight: 600; font-size: 18px;">📍 ${propertyTitle}</p>
        <p style="margin: 0 0 10px 0; color: rgba(255, 255, 255, 0.7);">
          💰 <strong>Prezzo di vendita:</strong> ${formatCurrency(salePrice)}
        </p>
        <p style="margin: 0 0 10px 0; color: rgba(255, 255, 255, 0.7);">
          🤝 <strong>Collaborazione con:</strong> ${partnerName}
        </p>
        <p style="margin: 0; color: rgba(255, 255, 255, 0.7);">
          📅 <strong>Data vendita:</strong> ${new Date(saleDate).toLocaleDateString('it-IT')}
        </p>
      </div>
      <div style="background-color: rgba(212, 175, 55, 0.2); padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
        <p style="margin: 0 0 10px 0; color: #d4af37; font-size: 14px;">💵 La tua commissione</p>
        <p style="margin: 0; color: #fff; font-size: 32px; font-weight: 700;">${formatCurrency(yourCommission)}</p>
      </div>
      <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 20px 0;">
        Il pagamento è stato registrato come pendente. Una volta ricevuto, aggiorna lo stato nella dashboard.
      </p>
      <div style="text-align: center;">
        <a href="${link}" style="${getButtonStyle()}">
          💰 Vedi Dettagli Transazione
        </a>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: `🎉 Vendita completata - ${propertyTitle}`,
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Transaction completed email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending transaction completed email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Email: Pagamento ricevuto
 */
export const sendPaymentReceived = async ({
  to,
  recipientName,
  propertyTitle,
  commissionAmount,
  paymentDate
}) => {
  try {
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount);
    };

    const content = `
      <h2 style="color: #34c759; margin: 0 0 20px 0; font-size: 24px;">
        💵 Pagamento Confermato!
      </h2>
      <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 0 0 15px 0;">
        Ciao <strong>${recipientName}</strong>,
      </p>
      <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 0 0 15px 0;">
        Il pagamento della commissione per <strong>${propertyTitle}</strong> è stato confermato:
      </p>
      <div style="background-color: rgba(52, 199, 89, 0.2); padding: 30px; margin: 20px 0; border-radius: 12px; text-align: center;">
        <p style="margin: 0 0 10px 0; color: #34c759; font-size: 16px;">💰 Importo ricevuto</p>
        <p style="margin: 0 0 15px 0; color: #fff; font-size: 36px; font-weight: 700;">${formatCurrency(commissionAmount)}</p>
        <p style="margin: 0; color: rgba(255, 255, 255, 0.7);">
          📅 Data: ${new Date(paymentDate).toLocaleDateString('it-IT')}
        </p>
      </div>
      <p style="color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 20px 0;">
        La transazione è stata completata con successo. Grazie per la collaborazione!
      </p>
      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL}/mls-transactions" style="${getButtonStyle()}">
          📊 Vedi Tutte le Transazioni
        </a>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: `💵 Pagamento confermato - ${propertyTitle}`,
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Payment received email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending payment received email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ========================================
 * UTILITY FUNCTIONS
 * ========================================
 */

/**
 * Email generica per testing
 */
export const sendTestEmail = async (to) => {
  try {
    const content = `
      <h2 style="color: #d4af37; margin: 0 0 20px 0;">Test Email</h2>
      <p style="color: rgba(255, 255, 255, 0.8);">
        Questa è un'email di test dal sistema AgenzieCASE.
      </p>
      <p style="color: rgba(255, 255, 255, 0.8);">
        Se ricevi questa email, la configurazione SMTP funziona correttamente! ✅
      </p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Test Email - AgenzieCASE',
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Test email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending test email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ============================================
 * AI-CRM EMAILS
 * ============================================
 */

/**
 * Email: Conferma appuntamento creato da AI al cliente
 */
export const sendAIAppointmentConfirmation = async ({ to, clientName, agentName, propertyTitle, appointmentDate, appointmentType }) => {
  try {
    const content = `
      <h2 style="color: #d4af37;">📅 Appuntamento Confermato</h2>
      <p>Gentile <strong>${clientName}</strong>,</p>
      <p>Il tuo appuntamento è stato confermato con successo!</p>

      <div style="${getInfoBoxStyle()}">
        <p style="margin: 0.5rem 0;"><strong>Tipo:</strong> ${appointmentType === 'viewing' ? 'Visita immobile' : appointmentType === 'videocall' ? 'Videochiamata' : 'Incontro in agenzia'}</p>
        ${propertyTitle ? `<p style="margin: 0.5rem 0;"><strong>Immobile:</strong> ${propertyTitle}</p>` : ''}
        <p style="margin: 0.5rem 0;"><strong>Data e Ora:</strong> ${new Date(appointmentDate).toLocaleString('it-IT', { dateStyle: 'full', timeStyle: 'short' })}</p>
        <p style="margin: 0.5rem 0;"><strong>Agente:</strong> ${agentName}</p>
      </div>

      <p>L'agente ti contatterà a breve per confermare i dettagli.</p>
      <p>Riceverai un promemoria 24 ore prima dell'appuntamento.</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: `📅 Appuntamento Confermato - ${new Date(appointmentDate).toLocaleDateString('it-IT')}`,
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ AI appointment confirmation sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending AI appointment confirmation:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Email: Notifica agente nuovo appuntamento da AI
 */
export const sendAgentNewAppointment = async ({ to, agentName, clientName, clientPhone, clientEmail, propertyTitle, appointmentDate, appointmentType }) => {
  try {
    const content = `
      <h2 style="color: #d4af37;">🔔 Nuovo Appuntamento da Assistente AI</h2>
      <p>Ciao <strong>${agentName}</strong>,</p>
      <p>L'assistente AI ha creato un nuovo appuntamento per te:</p>

      <div style="${getInfoBoxStyle()}">
        <p style="margin: 0.5rem 0;"><strong>Cliente:</strong> ${clientName}</p>
        <p style="margin: 0.5rem 0;"><strong>Email:</strong> ${clientEmail}</p>
        <p style="margin: 0.5rem 0;"><strong>Telefono:</strong> ${clientPhone}</p>
        ${propertyTitle ? `<p style="margin: 0.5rem 0;"><strong>Immobile:</strong> ${propertyTitle}</p>` : ''}
        <p style="margin: 0.5rem 0;"><strong>Tipo:</strong> ${appointmentType === 'viewing' ? 'Visita immobile' : appointmentType === 'videocall' ? 'Videochiamata' : 'Incontro in agenzia'}</p>
        <p style="margin: 0.5rem 0;"><strong>Data e Ora:</strong> ${new Date(appointmentDate).toLocaleString('it-IT', { dateStyle: 'full', timeStyle: 'short' })}</p>
      </div>

      <a href="${process.env.FRONTEND_URL}/crm/appointments" style="${getButtonStyle()}">📋 Gestisci Appuntamento</a>
      <p style="color: #999; font-size: 0.9rem; margin-top: 1.5rem;">Ricordati di contattare il cliente per confermare!</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: `🔔 Nuovo Appuntamento - ${clientName}`,
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Agent appointment notification sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending agent appointment notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Email: Conferma richiesta valutazione al cliente
 */
export const sendValuationRequestConfirmation = async ({ to, clientName, propertyLocation, propertySize, agentName }) => {
  try {
    const content = `
      <h2 style="color: #d4af37;">🏠 Richiesta Valutazione Ricevuta</h2>
      <p>Gentile <strong>${clientName}</strong>,</p>
      <p>Abbiamo ricevuto la tua richiesta di valutazione per il tuo immobile.</p>

      <div style="${getInfoBoxStyle()}">
        <p style="margin: 0.5rem 0;"><strong>Ubicazione:</strong> ${propertyLocation}</p>
        <p style="margin: 0.5rem 0;"><strong>Superficie:</strong> ${propertySize} mq</p>
        <p style="margin: 0.5rem 0;"><strong>Agente Assegnato:</strong> ${agentName}</p>
      </div>

      <p><strong>${agentName}</strong> ti contatterà entro 24 ore per fissare un sopralluogo e fornirti una valutazione professionale gratuita del tuo immobile.</p>
      <p>Il servizio di valutazione AgenzieCASE è:</p>
      <ul>
        <li>✓ Completamente gratuito</li>
        <li>✓ Senza impegno</li>
        <li>✓ Basato su analisi di mercato</li>
        <li>✓ Effettuato da professionisti esperti</li>
      </ul>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: '🏠 Richiesta Valutazione Ricevuta - AgenzieCASE',
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Valuation request confirmation sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending valuation confirmation:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Email: Notifica agente nuova richiesta valutazione
 */
export const sendAgentValuationRequest = async ({ to, agentName, clientName, clientPhone, clientEmail, propertyLocation, propertySize, propertyType }) => {
  try {
    const content = `
      <h2 style="color: #d4af37;">🏠 Nuova Richiesta Valutazione</h2>
      <p>Ciao <strong>${agentName}</strong>,</p>
      <p>Hai ricevuto una nuova richiesta di valutazione dall'assistente AI:</p>

      <div style="${getInfoBoxStyle()}">
        <p style="margin: 0.5rem 0;"><strong>Cliente:</strong> ${clientName}</p>
        <p style="margin: 0.5rem 0;"><strong>Email:</strong> ${clientEmail}</p>
        <p style="margin: 0.5rem 0;"><strong>Telefono:</strong> ${clientPhone}</p>
        <p style="margin: 0.5rem 0;"><strong>Tipo Immobile:</strong> ${propertyType}</p>
        <p style="margin: 0.5rem 0;"><strong>Ubicazione:</strong> ${propertyLocation}</p>
        <p style="margin: 0.5rem 0;"><strong>Superficie:</strong> ${propertySize} mq</p>
      </div>

      <a href="${process.env.FRONTEND_URL}/crm/clients" style="${getButtonStyle()}">📋 Vai al CRM</a>
      <p style="color: #999; font-size: 0.9rem; margin-top: 1.5rem;">Contatta il cliente entro 24 ore per fissare il sopralluogo!</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: `🏠 Nuova Richiesta Valutazione - ${clientName}`,
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Agent valuation notification sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending agent valuation notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ============================================
 * CRM EMAILS
 * ============================================
 */

/**
 * Email: Appuntamento modificato
 */
export const sendAppointmentUpdated = async ({ to, recipientName, appointmentType, oldDate, newDate, propertyTitle }) => {
  try {
    const content = `
      <h2 style="color: #f39c12;">📅 Appuntamento Modificato</h2>
      <p>Gentile <strong>${recipientName}</strong>,</p>
      <p>Il tuo appuntamento è stato modificato:</p>

      <div style="${getInfoBoxStyle()}">
        ${propertyTitle ? `<p style="margin: 0.5rem 0;"><strong>Immobile:</strong> ${propertyTitle}</p>` : ''}
        <p style="margin: 0.5rem 0;"><strong>Tipo:</strong> ${appointmentType}</p>
        <p style="margin: 0.5rem 0; text-decoration: line-through; color: #999;"><strong>Data Precedente:</strong> ${new Date(oldDate).toLocaleString('it-IT', { dateStyle: 'full', timeStyle: 'short' })}</p>
        <p style="margin: 0.5rem 0; color: #16a085;"><strong>Nuova Data:</strong> ${new Date(newDate).toLocaleString('it-IT', { dateStyle: 'full', timeStyle: 'short' })}</p>
      </div>

      <p>Per qualsiasi domanda, non esitare a contattarci.</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: '📅 Appuntamento Modificato - AgenzieCASE',
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Appointment updated email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending appointment updated email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Email: Appuntamento cancellato
 */
export const sendAppointmentCancelled = async ({ to, recipientName, appointmentType, appointmentDate, propertyTitle, reason }) => {
  try {
    const content = `
      <h2 style="color: #e74c3c;">❌ Appuntamento Cancellato</h2>
      <p>Gentile <strong>${recipientName}</strong>,</p>
      <p>Il seguente appuntamento è stato cancellato:</p>

      <div style="${getInfoBoxStyle()}">
        ${propertyTitle ? `<p style="margin: 0.5rem 0;"><strong>Immobile:</strong> ${propertyTitle}</p>` : ''}
        <p style="margin: 0.5rem 0;"><strong>Tipo:</strong> ${appointmentType}</p>
        <p style="margin: 0.5rem 0;"><strong>Data:</strong> ${new Date(appointmentDate).toLocaleString('it-IT', { dateStyle: 'full', timeStyle: 'short' })}</p>
        ${reason ? `<p style="margin: 0.5rem 0;"><strong>Motivo:</strong> ${reason}</p>` : ''}
      </div>

      <p>Per fissare un nuovo appuntamento, contattaci o usa l'assistente AI sul nostro sito.</p>
      <a href="${process.env.FRONTEND_URL}" style="${getButtonStyle()}">🏠 Vai al Sito</a>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: '❌ Appuntamento Cancellato - AgenzieCASE',
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Appointment cancelled email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending appointment cancelled email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Email: Reminder appuntamento (24h prima)
 */
export const sendAppointmentReminder = async ({ to, recipientName, appointmentType, appointmentDate, propertyTitle, agentName, agentPhone }) => {
  try {
    const content = `
      <h2 style="color: #f39c12;">⏰ Promemoria Appuntamento</h2>
      <p>Gentile <strong>${recipientName}</strong>,</p>
      <p>Ti ricordiamo il tuo appuntamento programmato per domani:</p>

      <div style="${getInfoBoxStyle()}">
        ${propertyTitle ? `<p style="margin: 0.5rem 0;"><strong>Immobile:</strong> ${propertyTitle}</p>` : ''}
        <p style="margin: 0.5rem 0;"><strong>Tipo:</strong> ${appointmentType}</p>
        <p style="margin: 0.5rem 0; color: #16a085; font-size: 1.1rem;"><strong>Data e Ora:</strong> ${new Date(appointmentDate).toLocaleString('it-IT', { dateStyle: 'full', timeStyle: 'short' })}</p>
        <p style="margin: 0.5rem 0;"><strong>Agente:</strong> ${agentName}</p>
        ${agentPhone ? `<p style="margin: 0.5rem 0;"><strong>Telefono Agente:</strong> ${agentPhone}</p>` : ''}
      </div>

      <p>Ci vediamo domani!</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: '⏰ Promemoria: Appuntamento Domani',
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Appointment reminder sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending appointment reminder:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ============================================
 * SUPPORT TICKETS EMAILS
 * ============================================
 */

/**
 * Email: Nuovo ticket supporto (al cliente)
 */
export const sendTicketCreatedConfirmation = async ({ to, clientName, ticketId, subject }) => {
  try {
    const content = `
      <h2 style="color: #d4af37;">🎫 Ticket Supporto Creato</h2>
      <p>Gentile <strong>${clientName}</strong>,</p>
      <p>Abbiamo ricevuto la tua richiesta di supporto.</p>

      <div style="${getInfoBoxStyle()}">
        <p style="margin: 0.5rem 0;"><strong>Numero Ticket:</strong> #${ticketId}</p>
        <p style="margin: 0.5rem 0;"><strong>Oggetto:</strong> ${subject}</p>
      </div>

      <p>Il nostro team risponderà entro 24 ore.</p>
      <p>Puoi seguire lo stato del tuo ticket accedendo al tuo account.</p>
      <a href="${process.env.FRONTEND_URL}/support" style="${getButtonStyle()}">📋 I Miei Ticket</a>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: `🎫 Ticket #${ticketId} - Richiesta Ricevuta`,
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Ticket creation confirmation sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending ticket confirmation:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Email: Risposta a ticket supporto
 */
export const sendTicketReply = async ({ to, clientName, ticketId, subject, replyMessage }) => {
  try {
    const content = `
      <h2 style="color: #d4af37;">💬 Nuova Risposta al Tuo Ticket</h2>
      <p>Gentile <strong>${clientName}</strong>,</p>
      <p>Abbiamo risposto al tuo ticket di supporto:</p>

      <div style="${getInfoBoxStyle()}">
        <p style="margin: 0.5rem 0;"><strong>Numero Ticket:</strong> #${ticketId}</p>
        <p style="margin: 0.5rem 0;"><strong>Oggetto:</strong> ${subject}</p>
      </div>

      <div style="background: #f5f5f5; padding: 1rem; border-left: 4px solid #d4af37; margin: 1.5rem 0;">
        <p style="color: #333; margin: 0;">${replyMessage}</p>
      </div>

      <a href="${process.env.FRONTEND_URL}/support" style="${getButtonStyle()}">📋 Visualizza Ticket</a>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: `💬 Risposta Ticket #${ticketId} - ${subject}`,
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Ticket reply sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending ticket reply:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Email: Ticket risolto
 */
export const sendTicketResolved = async ({ to, clientName, ticketId, subject }) => {
  try {
    const content = `
      <h2 style="color: #16a085;">✅ Ticket Risolto</h2>
      <p>Gentile <strong>${clientName}</strong>,</p>
      <p>Il tuo ticket di supporto è stato risolto:</p>

      <div style="${getInfoBoxStyle()}">
        <p style="margin: 0.5rem 0;"><strong>Numero Ticket:</strong> #${ticketId}</p>
        <p style="margin: 0.5rem 0;"><strong>Oggetto:</strong> ${subject}</p>
        <p style="margin: 0.5rem 0; color: #16a085;"><strong>Stato:</strong> Risolto</p>
      </div>

      <p>Se il problema persiste o hai altre domande, non esitare ad aprire un nuovo ticket.</p>
      <p>Ci auguriamo di averti aiutato!</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: `✅ Ticket #${ticketId} Risolto`,
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Ticket resolved email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending ticket resolved email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ============================================
 * VIRTUAL TOUR EMAILS
 * ============================================
 */

/**
 * Email: Virtual tour completato
 */
export const sendVirtualTourCompleted = async ({ to, partnerName, propertyTitle, tourUrl }) => {
  try {
    const content = `
      <h2 style="color: #16a085;">✅ Virtual Tour Completato!</h2>
      <p>Ciao <strong>${partnerName}</strong>,</p>
      <p>Il virtual tour per <strong>${propertyTitle}</strong> è pronto!</p>

      <div style="${getInfoBoxStyle()}">
        <p style="margin: 0.5rem 0;"><strong>Immobile:</strong> ${propertyTitle}</p>
        <p style="margin: 0.5rem 0; color: #16a085;"><strong>Stato:</strong> Completato</p>
      </div>

      <p>Il tour è ora disponibile sul tuo annuncio e può essere visualizzato da tutti i visitatori.</p>
      <a href="${tourUrl}" style="${getButtonStyle()}">🌐 Visualizza Virtual Tour</a>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: `✅ Virtual Tour Completato - ${propertyTitle}`,
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ VT completed email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending VT completed email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Email: Virtual tour rifiutato
 */
export const sendVirtualTourRejected = async ({ to, partnerName, propertyTitle, reason }) => {
  try {
    const content = `
      <h2 style="color: #e74c3c;">❌ Richiesta Virtual Tour Non Approvata</h2>
      <p>Ciao <strong>${partnerName}</strong>,</p>
      <p>La richiesta di virtual tour per <strong>${propertyTitle}</strong> non è stata approvata.</p>

      <div style="${getInfoBoxStyle()}">
        <p style="margin: 0.5rem 0;"><strong>Immobile:</strong> ${propertyTitle}</p>
        <p style="margin: 0.5rem 0;"><strong>Motivo:</strong> ${reason}</p>
      </div>

      <p>Ti preghiamo di verificare la qualità delle foto e inviare nuovamente la richiesta.</p>
      <a href="${process.env.FRONTEND_URL}/virtual-tours" style="${getButtonStyle()}">🔄 Nuova Richiesta</a>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: `❌ Richiesta Virtual Tour Non Approvata - ${propertyTitle}`,
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ VT rejected email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending VT rejected email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ============================================
 * SUBSCRIPTIONS & AGENTS EMAILS
 * ============================================
 */

/**
 * Email: Abbonamento attivato
 */
export const sendSubscriptionActivated = async ({ to, partnerName, planName, teamSize, price, expiryDate }) => {
  try {
    const content = `
      <h2 style="color: #16a085;">✅ Abbonamento CRM Attivato!</h2>
      <p>Ciao <strong>${partnerName}</strong>,</p>
      <p>Il tuo abbonamento CRM è stato attivato con successo!</p>

      <div style="${getInfoBoxStyle()}">
        <p style="margin: 0.5rem 0;"><strong>Piano:</strong> ${planName}</p>
        <p style="margin: 0.5rem 0;"><strong>Team Size:</strong> ${teamSize} persone</p>
        <p style="margin: 0.5rem 0;"><strong>Prezzo:</strong> €${price}/anno</p>
        <p style="margin: 0.5rem 0;"><strong>Scadenza:</strong> ${new Date(expiryDate).toLocaleDateString('it-IT')}</p>
      </div>

      <p>Ora puoi accedere a tutte le funzionalità CRM premium!</p>
      <a href="${process.env.FRONTEND_URL}/crm" style="${getButtonStyle()}">📊 Accedi al CRM</a>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: '✅ Abbonamento CRM Attivato - AgenzieCASE',
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Subscription activated email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending subscription activated email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Email: Abbonamento in scadenza
 */
export const sendSubscriptionExpiring = async ({ to, partnerName, expiryDate, renewUrl }) => {
  try {
    const daysLeft = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));

    const content = `
      <h2 style="color: #f39c12;">⏰ Abbonamento CRM in Scadenza</h2>
      <p>Ciao <strong>${partnerName}</strong>,</p>
      <p>Il tuo abbonamento CRM scadrà tra <strong>${daysLeft} giorni</strong>.</p>

      <div style="${getInfoBoxStyle()}">
        <p style="margin: 0.5rem 0;"><strong>Data Scadenza:</strong> ${new Date(expiryDate).toLocaleDateString('it-IT')}</p>
        <p style="margin: 0.5rem 0; color: #f39c12;"><strong>Giorni Rimanenti:</strong> ${daysLeft}</p>
      </div>

      <p>Rinnova ora per non perdere l'accesso alle funzionalità CRM!</p>
      <a href="${renewUrl || process.env.FRONTEND_URL + '/crm/subscriptions'}" style="${getButtonStyle()}">🔄 Rinnova Abbonamento</a>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: '⏰ Abbonamento CRM in Scadenza - AgenzieCASE',
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Subscription expiring email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending subscription expiring email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Email: Abbonamento scaduto
 */
export const sendSubscriptionExpired = async ({ to, partnerName, expiredDate }) => {
  try {
    const content = `
      <h2 style="color: #e74c3c;">❌ Abbonamento CRM Scaduto</h2>
      <p>Ciao <strong>${partnerName}</strong>,</p>
      <p>Il tuo abbonamento CRM è scaduto il <strong>${new Date(expiredDate).toLocaleDateString('it-IT')}</strong>.</p>

      <p>Le funzionalità CRM sono ora limitate. Rinnova l'abbonamento per ripristinare l'accesso completo.</p>
      <a href="${process.env.FRONTEND_URL}/crm/subscriptions" style="${getButtonStyle()}">🔄 Rinnova Ora</a>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: '❌ Abbonamento CRM Scaduto - AgenzieCASE',
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Subscription expired email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending subscription expired email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Email: Benvenuto nuovo agente
 */
export const sendAgentWelcome = async ({ to, agentName, partnerName, loginUrl }) => {
  try {
    const content = `
      <h2 style="color: #d4af37;">🎉 Benvenuto in AgenzieCASE!</h2>
      <p>Ciao <strong>${agentName}</strong>,</p>
      <p>Sei stato registrato come agente per <strong>${partnerName}</strong>.</p>

      <div style="${getInfoBoxStyle()}">
        <p style="margin: 0.5rem 0;"><strong>Agenzia:</strong> ${partnerName}</p>
        <p style="margin: 0.5rem 0;"><strong>Email:</strong> ${to}</p>
      </div>

      <p>Hai accesso a:</p>
      <ul>
        <li>✓ CRM completo per gestire clienti e appuntamenti</li>
        <li>✓ Calendario condiviso</li>
        <li>✓ Gestione trattative</li>
        <li>✓ Storico attività</li>
        <li>✓ Network MLS per collaborazioni</li>
      </ul>

      <a href="${loginUrl || process.env.FRONTEND_URL + '/login'}" style="${getButtonStyle()}">🔐 Accedi al CRM</a>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: '🎉 Benvenuto in AgenzieCASE!',
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Agent welcome email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending agent welcome email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Email: Conferma richiesta di contatto (lead generico)
 */
export const sendLeadConfirmation = async ({ to, clientName, leadType, propertyType, budget, location }) => {
  try {
    const leadTypeLabels = {
      buyer: 'Acquisto',
      renter: 'Affitto',
      landlord: 'Affittare Immobile'
    };

    const content = `
      <h2 style="color: #d4af37;">✅ Richiesta Ricevuta!</h2>
      <p>Gentile <strong>${clientName}</strong>,</p>
      <p>Grazie per averci contattato! Abbiamo ricevuto la tua richiesta per <strong>${leadTypeLabels[leadType] || leadType}</strong>.</p>

      <div style="${getInfoBoxStyle()}">
        ${propertyType ? `<p style="margin: 0.5rem 0;"><strong>Tipo Immobile:</strong> ${propertyType}</p>` : ''}
        ${budget ? `<p style="margin: 0.5rem 0;"><strong>Budget:</strong> €${budget.toLocaleString('it-IT')}</p>` : ''}
        ${location ? `<p style="margin: 0.5rem 0;"><strong>Zona:</strong> ${location}</p>` : ''}
      </div>

      <p>Un nostro consulente ti contatterà entro <strong>24 ore</strong> per discutere le tue esigenze e trovare la soluzione perfetta per te.</p>

      <p>Nel frattempo, puoi navigare i nostri immobili disponibili:</p>
      <a href="${process.env.FRONTEND_URL}/properties" style="${getButtonStyle()}">🏠 Esplora Immobili</a>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: `✅ Richiesta Ricevuta - ${leadTypeLabels[leadType] || 'Contatto'} - AgenzieCASE`,
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Lead confirmation sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending lead confirmation:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Email: Notifica agente nuovo lead generico
 */
export const sendAgentNewLead = async ({ to, agentName, clientName, clientEmail, clientPhone, leadType, propertyType, budget, location }) => {
  try {
    const leadTypeLabels = {
      buyer: 'Acquisto',
      renter: 'Affitto',
      landlord: 'Affittare Immobile'
    };

    const content = `
      <h2 style="color: #d4af37;">🎯 Nuovo Lead da AI Assistant</h2>
      <p>Ciao <strong>${agentName}</strong>,</p>
      <p>Hai un nuovo lead <strong>${leadTypeLabels[leadType] || leadType}</strong> generato dall'assistente AI!</p>

      <div style="${getInfoBoxStyle()}">
        <p style="margin: 0.5rem 0;"><strong>Cliente:</strong> ${clientName}</p>
        <p style="margin: 0.5rem 0;"><strong>Email:</strong> ${clientEmail}</p>
        ${clientPhone ? `<p style="margin: 0.5rem 0;"><strong>Telefono:</strong> ${clientPhone}</p>` : ''}
        <p style="margin: 0.5rem 0;"><strong>Tipo Richiesta:</strong> ${leadTypeLabels[leadType] || leadType}</p>
        ${propertyType ? `<p style="margin: 0.5rem 0;"><strong>Tipo Immobile:</strong> ${propertyType}</p>` : ''}
        ${budget ? `<p style="margin: 0.5rem 0;"><strong>Budget:</strong> €${budget.toLocaleString('it-IT')}</p>` : ''}
        ${location ? `<p style="margin: 0.5rem 0;"><strong>Zona:</strong> ${location}</p>` : ''}
      </div>

      <p>Il lead è stato creato nel CRM con <strong>priorità ALTA</strong>. Contatta il cliente entro 24 ore!</p>
      <a href="${process.env.FRONTEND_URL}/crm/clients" style="${getButtonStyle()}">📋 Visualizza nel CRM</a>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: `🎯 Nuovo Lead AI - ${leadTypeLabels[leadType]} - ${clientName}`,
      html: getEmailTemplate(content)
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Agent lead notification sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending agent lead notification:', error);
    return { success: false, error: error.message };
  }
};

export default {
  // MLS
  sendCollaborationRequest,
  sendCollaborationApproved,
  sendCollaborationRejected,
  sendNewLead,
  sendTransactionCompleted,
  sendPaymentReceived,
  // AI-CRM
  sendAIAppointmentConfirmation,
  sendAgentNewAppointment,
  sendValuationRequestConfirmation,
  sendAgentValuationRequest,
  sendLeadConfirmation,
  sendAgentNewLead,
  // CRM
  sendAppointmentUpdated,
  sendAppointmentCancelled,
  sendAppointmentReminder,
  // Support
  sendTicketCreatedConfirmation,
  sendTicketReply,
  sendTicketResolved,
  // Virtual Tour
  sendVirtualTourCompleted,
  sendVirtualTourRejected,
  // Subscriptions & Agents
  sendSubscriptionActivated,
  sendSubscriptionExpiring,
  sendSubscriptionExpired,
  sendAgentWelcome,
  // Test
  sendTestEmail
};
