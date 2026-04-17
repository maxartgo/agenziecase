import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Agent = sequelize.define('Agent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Informazioni professionali
  position: {
    type: DataTypes.STRING(100),
    comment: 'Ruolo/posizione (es. Agente Senior, Junior, etc.)'
  },

  // Contatti professionali
  professionalPhone: {
    type: DataTypes.STRING(50),
    comment: 'Telefono professionale (può essere diverso da quello personale)'
  },
  professionalEmail: {
    type: DataTypes.STRING(255),
    comment: 'Email professionale (può essere diversa da quella personale)'
  },

  // Bio e informazioni
  bio: {
    type: DataTypes.TEXT,
    comment: 'Biografia/presentazione dell\'agente'
  },
  photo: {
    type: DataTypes.STRING(500),
    comment: 'URL foto profilo professionale'
  },

  // Stato agente
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active'
  },

  // Date
  hireDate: {
    type: DataTypes.DATE,
    comment: 'Data di assunzione/inizio collaborazione'
  },
  terminationDate: {
    type: DataTypes.DATE,
    comment: 'Data di fine collaborazione'
  },

  // Permessi
  canCreateProperties: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Può creare nuovi immobili'
  },
  canEditAllProperties: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Può modificare tutti gli immobili dell\'agenzia o solo i propri'
  },
  canDeleteProperties: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Può eliminare immobili'
  },

  // Note interne
  internalNotes: {
    type: DataTypes.TEXT,
    comment: 'Note interne visibili solo al partner'
  }
}, {
  timestamps: true,
  tableName: 'agents',
  indexes: [
    { fields: ['userId'] },
    { fields: ['partnerId'] },
    { fields: ['status'] }
  ]
});

export default Agent;
