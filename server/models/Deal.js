import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Deal = sequelize.define('Deal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Titolo trattativa
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Es: "Vendita Villa Roma - Mario Rossi"'
  },

  // Descrizione
  description: {
    type: DataTypes.TEXT,
    comment: 'Descrizione dettagliata della trattativa'
  },

  // Tipo trattativa
  type: {
    type: DataTypes.ENUM('sale', 'rent', 'buy', 'lease'),
    allowNull: false,
    comment: 'sale: vendita, rent: affitto (dare), buy: acquisto, lease: affitto (prendere)'
  },

  // Stadio della trattativa (Sales Pipeline)
  stage: {
    type: DataTypes.ENUM('lead', 'qualification', 'proposal', 'negotiation', 'closing', 'won', 'lost'),
    defaultValue: 'lead',
    comment: 'Stadio nel funnel di vendita'
  },

  // Valore trattativa
  value: {
    type: DataTypes.DECIMAL(12, 2),
    comment: 'Valore stimato della trattativa in euro'
  },

  // Commissione prevista
  expectedCommission: {
    type: DataTypes.DECIMAL(10, 2),
    comment: 'Commissione attesa in euro'
  },

  // Probabilità chiusura (%)
  probability: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0,
      max: 100
    },
    defaultValue: 50,
    comment: 'Probabilità di chiusura da 0 a 100%'
  },

  // Data chiusura prevista
  expectedCloseDate: {
    type: DataTypes.DATE,
    comment: 'Data prevista di chiusura'
  },

  // Data chiusura effettiva
  actualCloseDate: {
    type: DataTypes.DATE,
    comment: 'Data effettiva di chiusura'
  },

  // Motivo perdita (se lost)
  lostReason: {
    type: DataTypes.ENUM('price', 'competition', 'no_response', 'timing', 'financing', 'other'),
    comment: 'Motivo per cui la trattativa è andata persa'
  },

  // Note motivo perdita
  lostNotes: {
    type: DataTypes.TEXT,
    comment: 'Dettagli sul motivo della perdita'
  },

  // Competitor (se perso per concorrenza)
  competitor: {
    type: DataTypes.STRING(255),
    comment: 'Nome competitor che ha vinto'
  },

  // Note generali
  notes: {
    type: DataTypes.TEXT,
    comment: 'Note generali sulla trattativa'
  },

  // Tags
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Tags per categorizzare'
  },

  // Priorità
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },

  // Relazioni
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Cliente principale della trattativa'
  },
  propertyId: {
    type: DataTypes.INTEGER,
    comment: 'Immobile coinvolto'
  },
  agentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Agente responsabile'
  },
  partnerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Agenzia'
  }
}, {
  timestamps: true,
  tableName: 'deals',
  indexes: [
    { fields: ['clientId'] },
    { fields: ['propertyId'] },
    { fields: ['agentId'] },
    { fields: ['partnerId'] },
    { fields: ['stage'] },
    { fields: ['type'] },
    { fields: ['expectedCloseDate'] }
  ]
});

export default Deal;
