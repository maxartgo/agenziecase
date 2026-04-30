import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Partner = sequelize.define('Partner', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Informazioni aziendali
  companyName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  vatNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Partita IVA'
  },
  fiscalCode: {
    type: DataTypes.STRING(50),
    comment: 'Codice Fiscale'
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  province: {
    type: DataTypes.STRING(2)
  },
  zipCode: {
    type: DataTypes.STRING(10)
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  website: {
    type: DataTypes.STRING(255)
  },

  // Documenti caricati
  visuraCamerale: {
    type: DataTypes.STRING(500),
    comment: 'URL del file Visura Camerale'
  },
  documentoIdentita: {
    type: DataTypes.STRING(500),
    comment: 'URL del file Documento Identità'
  },

  // Logo agenzia (caricato dopo in area riservata)
  logo: {
    type: DataTypes.STRING(500),
    comment: 'URL del logo aziendale'
  },

  // Accettazione termini
  termsAccepted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  privacyAccepted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  termsAcceptedAt: {
    type: DataTypes.DATE
  },

  // Stato del partner
  status: {
    type: DataTypes.ENUM('pending', 'active', 'suspended', 'cancelled'),
    defaultValue: 'pending'
  },

  // Note interne (solo admin)
  internalNotes: {
    type: DataTypes.TEXT,
    comment: 'Note interne per amministrazione'
  },

  // Data approvazione
  approvedAt: {
    type: DataTypes.DATE
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    comment: 'ID admin che ha approvato'
  },

  // Abbonamento CRM
  crmSubscriptionActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Abbonamento CRM attivo'
  },
  crmSubscriptionPlan: {
    type: DataTypes.STRING(50),
    defaultValue: 'none',
    comment: 'Piano abbonamento: none, single, team_5, team_10, team_15_plus'
  },
  crmTeamSize: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Numero persone team (1, 5, 10, 15-50)'
  },
  crmMonthlyPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: 'Prezzo mensile in euro'
  },
  crmAnnualPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: 'Prezzo annuale in euro'
  },
  crmSubscriptionStart: {
    type: DataTypes.DATE,
    comment: 'Data inizio abbonamento'
  },
  crmSubscriptionEnd: {
    type: DataTypes.DATE,
    comment: 'Data fine abbonamento'
  },
  crmPaymentType: {
    type: DataTypes.STRING(50),
    defaultValue: 'none',
    comment: 'Tipo pagamento: none, monthly, annual'
  },
  crmLastPayment: {
    type: DataTypes.DATE,
    comment: 'Data ultimo pagamento'
  },
  crmAutoRenew: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Rinnovo automatico'
  }
}, {
  timestamps: true, // createdAt, updatedAt
  tableName: 'partners',
  indexes: [
    { unique: true, fields: ['companyName'] },
    { unique: true, fields: ['vatNumber'] },
    { unique: true, fields: ['email'] },
    { fields: ['status'] }
  ]
});

export default Partner;
