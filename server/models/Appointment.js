import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Titolo appuntamento
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  // Descrizione
  description: {
    type: DataTypes.TEXT,
    comment: 'Descrizione dettagliata dell\'appuntamento'
  },

  // Data e ora
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Data e ora inizio appuntamento'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Data e ora fine appuntamento'
  },

  // Tipologia appuntamento
  type: {
    type: DataTypes.ENUM('viewing', 'meeting', 'call', 'video_call', 'signing', 'other'),
    defaultValue: 'viewing',
    comment: 'viewing: visita immobile, meeting: incontro, call: chiamata, video_call: video chiamata, signing: firma contratto, other: altro'
  },

  // Stato appuntamento
  status: {
    type: DataTypes.ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'),
    defaultValue: 'scheduled',
    comment: 'scheduled: programmato, confirmed: confermato, completed: completato, cancelled: cancellato, no_show: cliente assente'
  },

  // Luogo (se applicabile)
  location: {
    type: DataTypes.STRING(500),
    comment: 'Indirizzo o luogo dell\'appuntamento'
  },

  // Link meeting online (se video_call)
  meetingLink: {
    type: DataTypes.STRING(500),
    comment: 'Link per meeting online (Zoom, Teams, ecc.)'
  },

  // Promemoria
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Se è stato inviato il promemoria'
  },
  reminderSentAt: {
    type: DataTypes.DATE,
    comment: 'Quando è stato inviato il promemoria'
  },

  // Note post-appuntamento
  notes: {
    type: DataTypes.TEXT,
    comment: 'Note post appuntamento (esito, feedback, ecc.)'
  },

  // Valutazione cliente (dopo appuntamento)
  clientRating: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5
    },
    comment: 'Valutazione interesse cliente da 1 a 5'
  },

  // Esito
  outcome: {
    type: DataTypes.ENUM('interested', 'very_interested', 'not_interested', 'need_followup', 'offer_made'),
    comment: 'Esito dell\'appuntamento'
  },

  // Relazioni
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Cliente coinvolto'
  },
  propertyId: {
    type: DataTypes.INTEGER,
    comment: 'Immobile coinvolto (se viewing)'
  },
  agentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Agente che gestisce l\'appuntamento'
  },
  partnerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Agenzia'
  }
}, {
  timestamps: true,
  tableName: 'appointments',
  indexes: [
    { fields: ['clientId'] },
    { fields: ['propertyId'] },
    { fields: ['agentId'] },
    { fields: ['partnerId'] },
    { fields: ['startDate'] },
    { fields: ['status'] },
    { fields: ['type'] }
  ]
});

export default Appointment;
