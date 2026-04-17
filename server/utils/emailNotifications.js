/**
 * Email Notification Helper
 * Per ora usa console.log, facilmente sostituibile con nodemailer/sendgrid
 */

/**
 * Notifica admin quando partner carica foto per virtual tour
 */
export async function notifyAdminNewVTRequest(requestData) {
  try {
    const { requestId, propertyTitle, partnerName, partnerEmail, photosCount } = requestData;

    // TODO: Sostituire con invio email reale (nodemailer/sendgrid)
    console.log('\n🔔 ════════════════════════════════════════════════════');
    console.log('📧 NOTIFICA ADMIN: Nuova Richiesta Virtual Tour');
    console.log('════════════════════════════════════════════════════');
    console.log(`Request ID: ${requestId}`);
    console.log(`Immobile: ${propertyTitle}`);
    console.log(`Partner: ${partnerName} (${partnerEmail})`);
    console.log(`Foto caricate: ${photosCount}`);
    console.log(`\nAzione richiesta: Crea il virtual tour su Kuula e pubblica`);
    console.log('════════════════════════════════════════════════════\n');

    // Quando si implementa l'email reale:
    /*
    const emailContent = {
      to: process.env.ADMIN_EMAIL || 'admin@agenziecase.it',
      subject: `🌐 Nuova Richiesta Virtual Tour - ${propertyTitle}`,
      html: `
        <h2>Nuova Richiesta Virtual Tour</h2>
        <p><strong>Partner:</strong> ${partnerName} (${partnerEmail})</p>
        <p><strong>Immobile:</strong> ${propertyTitle}</p>
        <p><strong>Foto caricate:</strong> ${photosCount}</p>
        <p><strong>Request ID:</strong> #${requestId}</p>

        <h3>Azione richiesta:</h3>
        <ol>
          <li>Scarica le foto dalla cartella uploads</li>
          <li>Crea il virtual tour su Kuula</li>
          <li>Incolla l'URL nel pannello admin</li>
        </ol>

        <a href="http://localhost:3000/admin/virtual-tours">Vai alla Dashboard Admin</a>
      `
    };

    await sendEmail(emailContent);
    */

    return { success: true };
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notifica partner quando virtual tour è completato
 */
export async function notifyPartnerVTCompleted(notificationData) {
  try {
    const { partnerEmail, partnerName, propertyTitle, tourUrl } = notificationData;

    console.log('\n🔔 ════════════════════════════════════════════════════');
    console.log('📧 NOTIFICA PARTNER: Virtual Tour Completato');
    console.log('════════════════════════════════════════════════════');
    console.log(`Partner: ${partnerName} (${partnerEmail})`);
    console.log(`Immobile: ${propertyTitle}`);
    console.log(`Tour URL: ${tourUrl}`);
    console.log('════════════════════════════════════════════════════\n');

    // Quando si implementa l'email reale:
    /*
    const emailContent = {
      to: partnerEmail,
      subject: `✅ Virtual Tour Completato - ${propertyTitle}`,
      html: `
        <h2>Il tuo Virtual Tour è pronto!</h2>
        <p>Ciao ${partnerName},</p>
        <p>Il virtual tour per <strong>${propertyTitle}</strong> è stato creato e pubblicato con successo!</p>

        <p><strong>URL Virtual Tour:</strong><br>
        <a href="${tourUrl}">${tourUrl}</a></p>

        <p>Il tour è ora visibile nell'annuncio del tuo immobile.</p>
        <p>È stato scalato 1 credito dal tuo piano.</p>

        <p>Grazie per aver scelto AgenzieCase!</p>
      `
    };

    await sendEmail(emailContent);
    */

    return { success: true };
  } catch (error) {
    console.error('❌ Error sending partner notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notifica partner quando richiesta è rifiutata
 */
export async function notifyPartnerVTRejected(notificationData) {
  try {
    const { partnerEmail, partnerName, propertyTitle, reason } = notificationData;

    console.log('\n🔔 ════════════════════════════════════════════════════');
    console.log('📧 NOTIFICA PARTNER: Virtual Tour Rifiutato');
    console.log('════════════════════════════════════════════════════');
    console.log(`Partner: ${partnerName} (${partnerEmail})`);
    console.log(`Immobile: ${propertyTitle}`);
    console.log(`Motivo: ${reason}`);
    console.log('════════════════════════════════════════════════════\n');

    // Quando si implementa l'email reale:
    /*
    const emailContent = {
      to: partnerEmail,
      subject: `❌ Richiesta Virtual Tour Rifiutata - ${propertyTitle}`,
      html: `
        <h2>Richiesta Virtual Tour Rifiutata</h2>
        <p>Ciao ${partnerName},</p>
        <p>La richiesta di virtual tour per <strong>${propertyTitle}</strong> è stata rifiutata.</p>

        <p><strong>Motivo:</strong><br>${reason}</p>

        <p>Nessun credito è stato scalato.</p>
        <p>Puoi inviare una nuova richiesta dopo aver risolto il problema indicato.</p>

        <p>Per assistenza, contatta il supporto.</p>
      `
    };

    await sendEmail(emailContent);
    */

    return { success: true };
  } catch (error) {
    console.error('❌ Error sending rejection notification:', error);
    return { success: false, error: error.message };
  }
}

// Helper per inviare email (da implementare con nodemailer o sendgrid)
async function sendEmail(emailData) {
  // Placeholder per implementazione futura
  // const transporter = nodemailer.createTransport({...});
  // await transporter.sendMail(emailData);
  console.log('📧 Email would be sent:', emailData);
}

export default {
  notifyAdminNewVTRequest,
  notifyPartnerVTCompleted,
  notifyPartnerVTRejected
};
