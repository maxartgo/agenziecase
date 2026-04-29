// Email configuration with OVH SMTP
import nodemailer from 'nodemailer';

const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'ssl0.ovh.net',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE !== 'false', // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    },
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false
    }
  });
};

const sendEmail = async (options) => {
  try {
    const transporter = createEmailTransporter();

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'AgenzieCase'} <${process.env.EMAIL_FROM || 'info@agenziecase.com'}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  welcome: (userName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2c3e50;">🏠 Benvenuto su AgenzieCase!</h1>
      <p>Ciao <strong>${userName}</strong>,</p>
      <p>Grazie per esserti registrato su <strong>AgenzieCase</strong>!</p>
      <p>Il tuo account è stato creato con successo e sei pronto per iniziare.</p>
      <div style="background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p>✅ Account verificato</p>
        <p>✅ Profilo completato</p>
        <p>✅ Pronto a cercare immobili</p>
      </div>
      <p>Puoi accedere subito:</p>
      <p><a href="${process.env.FRONTEND_URL || 'https://agenziecase.com'}/login" style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accedi al tuo account</a></p>
      <br>
      <p>Se hai domande, contattaci:</p>
      <p>📧 Email: info@agenziecase.com</p>
      <br>
      <p>Cordiali saluti,<br><strong>Il team di AgenzieCase</strong></p>
    </div>
  `,

  passwordReset: (resetToken) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #e74c3c;">🔑 Reset Password</h1>
      <p>Hai richiesto di resettare la tua password.</p>
      <p>Clicca sul link sottostante per procedere:</p>
      <p><a href="${process.env.FRONTEND_URL || 'https://agenziecase.com'}/reset-password?token=${resetToken}" style="background: #e74c3c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Resetta Password</a></p>
      <p>Oppure copia questo link nel browser:</p>
      <p style="background: #ecf0f1; padding: 10px; border-radius: 5px; word-break: break-all;">${process.env.FRONTEND_URL || 'https://agenziecase.com'}/reset-password?token=${resetToken}</p>
      <br>
      <p>⚠️ <strong>Questo link scade tra 1 ora.</strong></p>
      <p>Se non hai richiesto il reset, ignora questa email.</p>
      <br>
      <p>Cordiali saluti,<br><strong>Il team di AgenzieCase</strong></p>
    </div>
  `,

  contactNotification: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #3498db;">📬 Nuovo Contatto dal Sito</h1>
      <p>Hai ricevuto un nuovo messaggio dal form di contatto:</p>
      <div style="background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Nome:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Telefono:</strong> ${data.phone || 'Non fornito'}</p>
        <p><strong>Messaggio:</strong></p>
        <p style="font-style: italic;">${data.message}</p>
      </div>
      <p>Rispondi il prima possibile!</p>
      <br>
      <p>Data: ${new Date().toLocaleString('it-IT')}</p>
    </div>
  `,

  propertyInquiry: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #27ae60;">🏠 Richiesta Informazioni Immobile</h1>
      <p>Un utente è interessato a un immobile:</p>
      <div style="background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Immobile:</strong> ${data.propertyTitle || 'N/D'}</p>
        <p><strong>Riferimento:</strong> ${data.propertyId || 'N/D'}</p>
        <p><strong>Nome:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Telefono:</strong> ${data.phone || 'Non fornito'}</p>
        <p><strong>Messaggio:</strong></p>
        <p style="font-style: italic;">${data.message}</p>
      </div>
      <p>Contatta l'interessato al più presto!</p>
      <br>
      <p>Data: ${new Date().toLocaleString('it-IT')}</p>
    </div>
  `,

  partnerRegistration: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #d4af37;">🏢 Benvenuto Partner AgenzieCase!</h1>
      <p>Ciao <strong>${data.companyName}</strong>,</p>
      <p>La tua registrazione come partner su <strong>AgenzieCase</strong> è stata completata con successo!</p>
      <div style="background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p>✅ Account attivato</p>
        <p>✅ Profilo partner creato</p>
        <p>✅ Accesso alla dashboard CRM</p>
      </div>
      <p>Puoi accedere subito alla tua area riservata:</p>
      <p><a href="${process.env.FRONTEND_URL || 'https://agenziecase.com'}/login" style="background: #d4af37; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accedi al Partner Dashboard</a></p>
      <br>
      <p>Se hai domande, contattaci:</p>
      <p>📧 Email: info@agenziecase.com</p>
      <br>
      <p>Cordiali saluti,<br><strong>Il team di AgenzieCase</strong></p>
    </div>
  `,

  partnerStatusChange: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #3498db;">📢 Aggiornamento Stato Account</h1>
      <p>Ciao <strong>${data.companyName}</strong>,</p>
      <p>Lo stato del tuo account partner su <strong>AgenzieCase</strong> è stato aggiornato.</p>
      <div style="background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Nuovo stato:</strong> <span style="color: ${data.status === 'active' ? '#27ae60' : '#e74c3c'}; text-transform: uppercase;">${data.status}</span></p>
      </div>
      <p>Se hai domande, contattaci:</p>
      <p>📧 Email: info@agenziecase.com</p>
      <br>
      <p>Cordiali saluti,<br><strong>Il team di AgenzieCase</strong></p>
    </div>
  `
};

export {
  sendEmail,
  createEmailTransporter,
  emailTemplates
};
