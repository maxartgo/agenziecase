import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Tipo attività
  type: {
    type: DataTypes.ENUM('call', 'email', 'sms', 'whatsapp', 'meeting', 'note', 'task', 'document', 'other'),
    allowNull: false,
    comment: 'Tipo di attività registrata'
  },

  // Direzione (per call, email, ecc.)
  direction: {
    type: DataTypes.ENUM('inbound', 'outbound'),
    comment: 'inbound: ricevuta, outbound: inviata'
  },

  // Soggetto/Titolo
  subject: {
    type: DataTypes.STRING(255),
    comment: 'Oggetto dell\'attività'
  },

  // Contenuto/Descrizione
  content: {
    type: DataTypes.TEXT,
    comment: 'Contenuto dettagliato dell\'attività'
  },

  // Durata (per chiamate, meeting)
  duration: {
    type: DataTypes.INTEGER,
    comment: 'Durata in minuti'
  },

  // Esito
  outcome: {
    type: DataTypes.ENUM('successful', 'unsuccessful', 'no_answer', 'callback_requested', 'voicemail', 'completed', 'pending'),
    comment: 'Esito dell\'attività'
  },

  // Data attività
  activityDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Data e ora dell\'attività'
  },

  // Follow-up richiesto
  followUpRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Se richiede follow-up'
  },
  followUpDate: {
    type: DataTypes.DATE,
    comment: 'Data prevista per follow-up'
  },

  // Allegati/Documenti
  attachments: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array di URL documenti allegati'
  },

  // Task completato (se type='task')
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Se il task è completato'
  },
  completedAt: {
    type: DataTypes.DATE,
    comment: 'Data completamento task'
  },

  // Relazioni - L'attività può essere collegata a diverse entità
  clientId: {
    type: DataTypes.INTEGER,
    comment: 'Cliente collegato'
  },
  dealId: {
    type: DataTypes.INTEGER,
    comment: 'Trattativa collegata'
  },
  propertyId: {
    type: DataTypes.INTEGER,
    comment: 'Immobile collegato'
  },
  appointmentId: {
    type: DataTypes.INTEGER,
    comment: 'Appuntamento collegato'
  },

  // Creata da
  agentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Agente che ha creato l\'attività'
  },
  partnerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Agenzia'
  }
}, {
  timestamps: true,
  tableName: 'activities',
  indexes: [
    { fields: ['clientId'] },
    { fields: ['dealId'] },
    { fields: ['propertyId'] },
    { fields: ['appointmentId'] },
    { fields: ['agentId'] },
    { fields: ['partnerId'] },
    { fields: ['type'] },
    { fields: ['activityDate'] },
    { fields: ['isCompleted'] }
  ]
});

export default Activity;
