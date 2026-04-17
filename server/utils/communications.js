// ============================================
// UTILITY PER COMUNICAZIONI
// Email Templates & WhatsApp Messages
// ============================================

/**
 * Genera template email per conferma appuntamento
 */
export function generateAppointmentEmail(appointment, client, agent, property) {
  const subject = `Conferma Appuntamento - ${appointment.title}`;

  const body = `
Gentile ${client.firstName} ${client.lastName},

La tua richiesta di appuntamento è stata confermata!

📅 DETTAGLI APPUNTAMENTO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Data e Ora: ${new Date(appointment.startDate).toLocaleString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}
Tipo: ${getAppointmentTypeLabel(appointment.type)}
${appointment.location ? `Luogo: ${appointment.location}` : ''}
${appointment.meetingLink ? `Link Meeting: ${appointment.meetingLink}` : ''}

${property ? `
🏠 IMMOBILE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${property.title}
${property.address}, ${property.city}
Prezzo: €${property.price?.toLocaleString()}
${property.propertyType} - ${property.squareMeters}mq - ${property.rooms} locali
` : ''}

👤 AGENTE DI RIFERIMENTO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${agent.firstName} ${agent.lastName}
Email: ${agent.email}
Telefono: ${agent.phone}

${appointment.notes ? `
📝 NOTE:
${appointment.notes}
` : ''}

Ti aspettiamo!

Se hai bisogno di modificare o cancellare l'appuntamento, contattaci.

Cordiali saluti,
Il Team di AgenzieCase

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AgenzieCase - Il tuo partner immobiliare
www.agenziecase.it
  `.trim();

  return { subject, body };
}

/**
 * Genera template email per nuovo lead
 */
export function generateLeadEmail(lead, client, agent) {
  const subject = `Nuova Richiesta Ricevuta - ${lead.title}`;

  const body = `
Gentile ${client.firstName} ${client.lastName},

Abbiamo ricevuto la tua richiesta e la stiamo processando!

📋 LA TUA RICHIESTA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tipo: ${getDealTypeLabel(lead.type)}
${client.preferredPropertyType ? `Tipologia Immobile: ${getPropertyTypeLabel(client.preferredPropertyType)}` : ''}
${client.budgetMin || client.budgetMax ? `Budget: €${client.budgetMin?.toLocaleString() || '0'} - €${client.budgetMax?.toLocaleString() || 'N/A'}` : ''}
${client.preferredLocations ? `Zone di Interesse: ${JSON.parse(client.preferredLocations).join(', ')}` : ''}

👤 AGENTE ASSEGNATO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${agent.firstName} ${agent.lastName}
Email: ${agent.email}
Telefono: ${agent.phone}

Il tuo agente ti contatterà entro 24 ore per discutere le tue esigenze nel dettaglio.

Nel frattempo, puoi:
- Visitare il nostro sito per vedere gli immobili disponibili
- Preparare eventuali domande per l'agente
- Inviarci documentazione utile (se hai immobili da vendere)

Grazie per averci scelto!

Cordiali saluti,
Il Team di AgenzieCase

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AgenzieCase - Il tuo partner immobiliare
www.agenziecase.it
  `.trim();

  return { subject, body };
}

/**
 * Genera template email per valutazione immobile
 */
export function generateValuationEmail(client, agent, propertyDetails) {
  const subject = `Richiesta Valutazione Immobile - ${propertyDetails.location}`;

  const body = `
Gentile ${client.firstName} ${client.lastName},

Abbiamo ricevuto la tua richiesta di valutazione immobile.

🏠 IMMOBILE DA VALUTARE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Zona: ${propertyDetails.location}
Tipologia: ${propertyDetails.propertyType || 'Da definire'}
Superficie: ${propertyDetails.size ? propertyDetails.size + 'mq' : 'Da definire'}

👤 ESPERTO VALUTAZIONI:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${agent.firstName} ${agent.lastName}
Email: ${agent.email}
Telefono: ${agent.phone}

📅 PROSSIMI PASSI:
1. L'agente ti contatterà per fissare un sopralluogo
2. Verranno analizzate le caratteristiche dell'immobile
3. Riceverai una valutazione di mercato dettagliata
4. Discuteremo insieme la migliore strategia di vendita

Il servizio di valutazione è GRATUITO e senza impegno.

Cordiali saluti,
Il Team di AgenzieCase

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AgenzieCase - Il tuo partner immobiliare
www.agenziecase.it
  `.trim();

  return { subject, body };
}

/**
 * Genera messaggio WhatsApp per conferma appuntamento
 */
export function generateAppointmentWhatsApp(appointment, client, agent, property) {
  const message = `
🏠 *AgenzieCase - Conferma Appuntamento*

Ciao ${client.firstName}! ✨

Il tuo appuntamento è confermato:

📅 *${new Date(appointment.startDate).toLocaleDateString('it-IT', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  })} alle ${new Date(appointment.startDate).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit'
  })}*

${property ? `🏡 *Immobile:* ${property.title}
📍 ${property.address}, ${property.city}
💰 €${property.price?.toLocaleString()}
` : ''}
👤 *Agente:* ${agent.firstName} ${agent.lastName}
📞 ${agent.phone}

${appointment.location ? `📍 *Dove:* ${appointment.location}` : ''}
${appointment.meetingLink ? `🔗 *Link:* ${appointment.meetingLink}` : ''}

Ci vediamo! 😊

_Messaggio automatico da AgenzieCase_
  `.trim();

  return message;
}

/**
 * Genera messaggio WhatsApp per nuovo lead
 */
export function generateLeadWhatsApp(client, agent) {
  const message = `
🏠 *AgenzieCase - Richiesta Ricevuta*

Ciao ${client.firstName}! 👋

Abbiamo ricevuto la tua richiesta e ti abbiamo assegnato un agente dedicato:

👤 *${agent.firstName} ${agent.lastName}*
📧 ${agent.email}
📞 ${agent.phone}

Ti contatterà entro 24 ore per aiutarti a trovare la casa dei tuoi sogni! 🏡✨

Nel frattempo, se hai domande urgenti, chiamaci pure!

A presto! 😊

_Messaggio automatico da AgenzieCase_
  `.trim();

  return message;
}

/**
 * Genera messaggio WhatsApp per preventivo mutuo
 */
export function generateMortgageWhatsApp(client, calculation) {
  const message = `
💰 *AgenzieCase - Preventivo Mutuo*

Ciao ${client.firstName}!

Ecco il preventivo per il mutuo richiesto:

🏦 *DETTAGLI:*
Importo: €${calculation.loanAmount.toLocaleString()}
Durata: ${calculation.years} anni
Tasso: ${calculation.annualRate}%

💳 *RATA MENSILE: €${calculation.monthlyPayment.toLocaleString()}*

📊 Totale da restituire: €${calculation.totalAmount.toLocaleString()}
(di cui €${calculation.totalInterest.toLocaleString()} di interessi)

Vuoi che ti mettiamo in contatto con un consulente mutui? Possiamo aiutarti a trovare le migliori condizioni! 🤝

_Messaggio automatico da AgenzieCase_
  `.trim();

  return message;
}

/**
 * Genera URL WhatsApp pronto per l'invio
 */
export function generateWhatsAppLink(phoneNumber, message) {
  // Rimuovi spazi e caratteri speciali dal numero
  const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');

  // Encode messaggio per URL
  const encodedMessage = encodeURIComponent(message);

  // Genera link WhatsApp
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Helper: Traduce tipo appuntamento
 */
function getAppointmentTypeLabel(type) {
  const labels = {
    viewing: 'Visita Immobile',
    meeting: 'Incontro in Agenzia',
    call: 'Chiamata Telefonica',
    video_call: 'Videochiamata',
    signing: 'Firma Contratto',
    other: 'Altro'
  };
  return labels[type] || type;
}

/**
 * Helper: Traduce tipo trattativa
 */
function getDealTypeLabel(type) {
  const labels = {
    sale: 'Vendita',
    rent: 'Affitto (come proprietario)',
    buy: 'Acquisto',
    lease: 'Affitto (come inquilino)'
  };
  return labels[type] || type;
}

/**
 * Helper: Traduce tipo immobile
 */
function getPropertyTypeLabel(type) {
  const labels = {
    apartment: 'Appartamento',
    house: 'Casa',
    villa: 'Villa',
    commercial: 'Commerciale',
    land: 'Terreno',
    other: 'Altro'
  };
  return labels[type] || type;
}

/**
 * Genera template email per notifica agenzia - Nuovo appuntamento
 */
export function generateAgentAppointmentNotification(appointment, client, agent, property) {
  const subject = `🏠 Nuovo Appuntamento da AgenzieCase AI - ${client.firstName} ${client.lastName}`;

  const body = `
Ciao ${agent.firstName}! 👋

Hai un nuovo appuntamento fissato tramite l'assistente AI di AgenzieCase!

📅 DETTAGLI APPUNTAMENTO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Data e Ora: ${new Date(appointment.startDate).toLocaleString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}
Tipo: ${getAppointmentTypeLabel(appointment.type)}
${appointment.location ? `Luogo: ${appointment.location}` : ''}
${appointment.meetingLink ? `Link Meeting: ${appointment.meetingLink}` : ''}
Status: ${appointment.status === 'scheduled' ? 'Da confermare' : appointment.status}

👤 CLIENTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nome: ${client.firstName} ${client.lastName}
Email: ${client.email}
Telefono: ${client.phone}
${client.type ? `Tipo: ${getDealTypeLabel(client.type)}` : ''}
${client.priority ? `Priorità: ${client.priority.toUpperCase()}` : ''}

${property ? `
🏡 IMMOBILE DI INTERESSE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${property.title}
${property.address}, ${property.city}
Prezzo: €${property.price?.toLocaleString()}
${property.propertyType} - ${property.squareMeters}mq - ${property.rooms} locali
` : ''}

${appointment.notes ? `
📝 NOTE:
${appointment.notes}
` : ''}

⚡ AZIONI RAPIDE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 Chiama ora: ${client.phone}
📧 Rispondi via email: ${client.email}
💬 WhatsApp: https://wa.me/${client.phone.replace(/[^\d+]/g, '')}

Ricordati di confermare l'appuntamento con il cliente!

Buon lavoro! 💪

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AgenzieCase - Sistema CRM Intelligente
Dashboard: [URL_DASHBOARD_CRM]
  `.trim();

  return { subject, body };
}

/**
 * Genera template email per notifica agenzia - Nuovo lead
 */
export function generateAgentLeadNotification(lead, client, agent, property) {
  const subject = `🎯 Nuovo Lead da AgenzieCase AI - ${client.firstName} ${client.lastName}`;

  const body = `
Ciao ${agent.firstName}! 👋

Hai un nuovo lead qualificato dall'assistente AI di AgenzieCase!

🎯 DETTAGLI LEAD:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tipo: ${getDealTypeLabel(lead.type)}
Stage: ${lead.stage === 'lead' ? 'Nuovo Lead' : lead.stage}
Priorità: ${lead.priority ? lead.priority.toUpperCase() : 'ALTA'}
${lead.value ? `Valore Stimato: €${lead.value.toLocaleString()}` : ''}

👤 CLIENTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nome: ${client.firstName} ${client.lastName}
Email: ${client.email}
Telefono: ${client.phone}
${client.type ? `Profilo: ${getDealTypeLabel(client.type)}` : ''}

💰 BUDGET E PREFERENZE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${client.budgetMin || client.budgetMax ? `Budget: €${client.budgetMin?.toLocaleString() || '0'} - €${client.budgetMax?.toLocaleString() || 'N/A'}` : 'Budget: Da definire'}
${client.preferredPropertyType ? `Tipologia: ${getPropertyTypeLabel(client.preferredPropertyType)}` : ''}
${client.preferredLocations ? `Zone: ${JSON.parse(client.preferredLocations).join(', ')}` : ''}

${property ? `
🏡 IMMOBILE DI INTERESSE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${property.title}
${property.address}, ${property.city}
Prezzo: €${property.price?.toLocaleString()}
` : ''}

${lead.description ? `
📝 NOTE:
${lead.description}
` : ''}

⚡ AZIONI CONSIGLIATE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Contattare il cliente entro 24 ore (lead da AI = priorità alta!)
2. Qualificare ulteriormente esigenze e budget
3. Preparare una selezione di immobili compatibili
4. Fissare un appuntamento per visita/incontro

⚡ CONTATTI RAPIDI:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 Chiama ora: ${client.phone}
📧 Email: ${client.email}
💬 WhatsApp: https://wa.me/${client.phone.replace(/[^\d+]/g, '')}

Non perdere questa opportunità! 🚀

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AgenzieCase - Sistema CRM Intelligente
Dashboard: [URL_DASHBOARD_CRM]
  `.trim();

  return { subject, body };
}

/**
 * Invia email (placeholder - da integrare con servizio email reale)
 */
export async function sendEmail(to, subject, body) {
  // TODO: Integrare con servizio email (SendGrid, AWS SES, Mailgun, etc.)
  console.log('📧 EMAIL DA INVIARE:');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${body}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return {
    success: true,
    message: 'Email would be sent (service not configured)',
    data: { to, subject, body }
  };
}

/**
 * Genera link per inviare WhatsApp
 */
export function prepareWhatsAppMessage(phoneNumber, messageType, data) {
  let message;

  switch (messageType) {
    case 'appointment':
      message = generateAppointmentWhatsApp(data.appointment, data.client, data.agent, data.property);
      break;
    case 'lead':
      message = generateLeadWhatsApp(data.client, data.agent);
      break;
    case 'mortgage':
      message = generateMortgageWhatsApp(data.client, data.calculation);
      break;
    default:
      message = data.customMessage || 'Messaggio da AgenzieCase';
  }

  return {
    message,
    whatsappLink: generateWhatsAppLink(phoneNumber, message),
    phoneNumber
  };
}
