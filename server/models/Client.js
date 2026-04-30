import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Informazioni personali
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(50)
  },
  secondaryPhone: {
    type: DataTypes.STRING(50),
    comment: 'Telefono alternativo'
  },

  // Indirizzo
  address: {
    type: DataTypes.STRING(500)
  },
  city: {
    type: DataTypes.STRING(100)
  },
  province: {
    type: DataTypes.STRING(2)
  },
  zipCode: {
    type: DataTypes.STRING(10)
  },

  // Tipologia cliente
  type: {
    type: DataTypes.ENUM('buyer', 'seller', 'renter', 'landlord', 'both'),
    defaultValue: 'buyer',
    comment: 'buyer: acquirente, seller: venditore, renter: affittuario, landlord: locatore, both: entrambi'
  },

  // Stato del lead
  status: {
    type: DataTypes.ENUM('new', 'contacted', 'qualified', 'negotiation', 'won', 'lost'),
    defaultValue: 'new',
    comment: 'new: nuovo lead, contacted: contattato, qualified: qualificato, negotiation: in trattativa, won: cliente acquisito, lost: perso'
  },

  // Sorgente del lead
  source: {
    type: DataTypes.ENUM('website', 'phone', 'email', 'referral', 'social', 'advertising', 'other'),
    defaultValue: 'website',
    comment: 'Origine del contatto'
  },

  // Budget cliente
  budgetMin: {
    type: DataTypes.DECIMAL(12, 2),
    comment: 'Budget minimo in euro'
  },
  budgetMax: {
    type: DataTypes.DECIMAL(12, 2),
    comment: 'Budget massimo in euro'
  },

  // Preferenze immobile
  preferredPropertyType: {
    type: DataTypes.ENUM('apartment', 'house', 'villa', 'commercial', 'land', 'other'),
    comment: 'Tipo immobile preferito'
  },
  preferredCities: {
    type: DataTypes.JSON,
    comment: 'Array delle città preferite',
    defaultValue: []
  },
  preferredRooms: {
    type: DataTypes.INTEGER,
    comment: 'Numero locali preferito'
  },

  // Note e tags
  notes: {
    type: DataTypes.TEXT,
    comment: 'Note interne sul cliente'
  },
  tags: {
    type: DataTypes.JSON,
    comment: 'Tags per categorizzare il cliente',
    defaultValue: []
  },

  // Priorità
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },

  // Rating/Valutazione
  rating: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5
    },
    comment: 'Valutazione del cliente da 1 a 5 stelle'
  },

  // Data ultimo contatto
  lastContactedAt: {
    type: DataTypes.DATE,
    comment: 'Data ultimo contatto con il cliente'
  },

  // Agente assegnato (FK)
  agentId: {
    type: DataTypes.INTEGER,
    comment: 'ID agente assegnato a questo cliente'
  },

  // Partner/Agenzia (FK)
  partnerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID agenzia proprietaria del cliente'
  },

  // GDPR - Consenso privacy
  privacyConsent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Consenso GDPR per trattamento dati personali'
  },
  privacyConsentDate: {
    type: DataTypes.DATE,
    comment: 'Data del consenso privacy'
  },
  privacyConsentSource: {
    type: DataTypes.ENUM('website', 'chat', 'email', 'phone', 'form'),
    defaultValue: 'website',
    comment: 'Fonte del consenso privacy'
  }
}, {
  timestamps: true,
  tableName: 'clients',
  indexes: [
    { fields: ['partnerId'] },
    { fields: ['agentId'] },
    { fields: ['status'] },
    { fields: ['type'] },
    { fields: ['email'] },
    { fields: ['createdAt'] }
  ]
});

export default Client;
