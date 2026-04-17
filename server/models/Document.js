import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Nome file
  fileName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nome originale del file'
  },

  // Titolo/Descrizione
  title: {
    type: DataTypes.STRING(255),
    comment: 'Titolo documento'
  },

  // URL file
  fileUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'URL del file caricato'
  },

  // Tipo file
  fileType: {
    type: DataTypes.STRING(50),
    comment: 'MIME type (application/pdf, image/jpeg, ecc.)'
  },

  // Dimensione file (bytes)
  fileSize: {
    type: DataTypes.INTEGER,
    comment: 'Dimensione in bytes'
  },

  // Categoria documento
  category: {
    type: DataTypes.ENUM(
      'identity',
      'contract',
      'certificate',
      'inspection',
      'appraisal',
      'proposal',
      'invoice',
      'receipt',
      'photo',
      'plan',
      'other'
    ),
    defaultValue: 'other',
    comment: 'Categoria del documento'
  },

  // Note
  notes: {
    type: DataTypes.TEXT,
    comment: 'Note sul documento'
  },

  // Tags
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Tags per categorizzare'
  },

  // Visibilità
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Se il documento è pubblico (visibile al cliente)'
  },

  // Data scadenza (se applicabile)
  expiresAt: {
    type: DataTypes.DATE,
    comment: 'Data scadenza documento (es: certificato energetico)'
  },

  // Relazioni - Il documento può essere collegato a diverse entità
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

  // Caricato da
  uploadedBy: {
    type: DataTypes.INTEGER,
    comment: 'ID agente che ha caricato il documento'
  },
  partnerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Agenzia'
  }
}, {
  timestamps: true,
  tableName: 'documents',
  indexes: [
    { fields: ['clientId'] },
    { fields: ['dealId'] },
    { fields: ['propertyId'] },
    { fields: ['uploadedBy'] },
    { fields: ['partnerId'] },
    { fields: ['category'] }
  ]
});

export default Document;
