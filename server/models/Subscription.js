import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Piano di abbonamento
  plan: {
    type: DataTypes.ENUM('starter', 'professional', 'enterprise'),
    allowNull: false,
    defaultValue: 'starter',
    comment: 'starter: base, professional: medio, enterprise: completo'
  },

  // Dettagli piano
  planName: {
    type: DataTypes.STRING(100),
    comment: 'Nome del piano'
  },

  // Prezzo
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Prezzo annuale in Euro'
  },

  // Limiti del piano
  maxAgents: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Numero massimo di agenti'
  },
  maxProperties: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
    comment: 'Numero massimo di immobili'
  },

  // Date abbonamento
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Data di scadenza (1 anno da startDate)'
  },

  // Stato abbonamento
  status: {
    type: DataTypes.ENUM('pending', 'active', 'expired', 'cancelled'),
    defaultValue: 'pending',
    comment: 'pending: in attesa pagamento, active: attivo, expired: scaduto, cancelled: cancellato'
  },

  // Informazioni pagamento
  paymentMethod: {
    type: DataTypes.STRING(50),
    comment: 'Metodo di pagamento utilizzato'
  },
  paymentId: {
    type: DataTypes.STRING(255),
    comment: 'ID transazione dal gateway di pagamento'
  },
  paymentDate: {
    type: DataTypes.DATE,
    comment: 'Data del pagamento'
  },

  // Rinnovo automatico
  autoRenew: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  // Note
  notes: {
    type: DataTypes.TEXT,
    comment: 'Note interne'
  },

  // Cancellazione
  cancelledAt: {
    type: DataTypes.DATE
  },
  cancelReason: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  tableName: 'subscriptions',
  indexes: [
    { fields: ['partnerId'] },
    { fields: ['status'] },
    { fields: ['endDate'] }
  ]
});

export default Subscription;
