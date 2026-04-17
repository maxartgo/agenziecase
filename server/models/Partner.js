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
    defaultValue: 'pending',
    comment: 'pending: in attesa approvazione, active: attivo con subscription, suspended: sospeso, cancelled: cancellato'
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
