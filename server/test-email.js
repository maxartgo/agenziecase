#!/usr/bin/env node
// 📧 Simple Email Test Script - OVH SMTP

import nodemailer from 'nodemailer';

console.log('🔧 Testing OVH SMTP Configuration...\n');

// Configurazione SMTP OVH
const transporter = nodemailer.createTransporter({
  host: 'ssl0.ovh.net',
  port: 465,
  secure: true,
  auth: {
    user: 'info@agenziecase.com',
    pass: 'Maxzxcvbnm75@'
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test connessione SMTP
console.log('1️⃣ Testing SMTP connection...');
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ SMTP Connection Error:', error.message);
    process.exit(1);
  } else {
    console.log('✅ SMTP Server is ready!\n');

    // Test invio email
    console.log('2️⃣ Sending test email...');
    const mailOptions = {
      from: 'AgenzieCase <info@agenziecase.com>',
      to: 'test@example.com', // Sostituisci con la tua email
      subject: '✅ Test Email OVH - AgenzieCase',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #27ae60;">🎉 Test Email Riuscito!</h1>
          <p>Congratulazioni!</p>
          <p>La configurazione SMTP OVH funziona perfettamente.</p>
          <div style="background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #3498db;">✅ Sistema Email Attivo</h3>
            <p><strong>Servizio:</strong> OVH SMTP</p>
            <p><strong>Server:</strong> AgenzieCase</p>
            <p><strong>Data:</strong> ${new Date().toLocaleString('it-IT')}</p>
          </div>
          <p>Il tuo sito è pronto per inviare email transazionali!</p>
        </div>
      `,
      text: 'Test email from AgenzieCase - OVH SMTP configuration successful!'
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('❌ Email Error:', error.message);
        process.exit(1);
      } else {
        console.log('✅ Email sent successfully!');
        console.log('📧 Message ID:', info.messageId);
        console.log('📨 To:', mailOptions.to);
        console.log('\n🎉 Email system is working perfectly!');
        process.exit(0);
      }
    });
  }
});