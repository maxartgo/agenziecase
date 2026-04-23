import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DiscountCoupon = sequelize.define('DiscountCoupon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      upperCase: true // Il codice sarà sempre in maiuscolo
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  discountType: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: false,
    defaultValue: 'percentage'
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  maxDiscount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Massimo sconto applicabile per i coupon percentuali'
  },
  minPurchase: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Importo minimo di acquisto per utilizzare il coupon'
  },
  applicablePlans: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Piani a cui si applica il coupon (vuoto = tutti i piani)'
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    defaultValue: null,
    comment: 'Numero massimo di utilizzi (null = illimitato)'
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Numero di volte che il coupon è stato utilizzato'
  },
  userUsageLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Numero massimo di utilizzi per singolo utente'
  },
  validFrom: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  validUntil: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data di scadenza del coupon (null = nessuna scadenza)'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Se il coupon è attivo'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID dell\'admin che ha creato il coupon'
  }
}, {
  tableName: 'discount_coupons',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['code'] },
    { fields: ['isActive'] },
    { fields: ['validFrom', 'validUntil'] },
    {
      name: 'coupons_active_dates',
      fields: ['isActive', 'validFrom', 'validUntil']
    }
  ]
});

export default DiscountCoupon;