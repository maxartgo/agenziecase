import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  sqm: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rooms: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  floor: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('Vendita', 'Affitto'),
    allowNull: false,
    defaultValue: 'Vendita'
  },
  propertyType: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Appartamento, Villa, Loft, etc.'
  },
  highlight: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  energyClass: {
    type: DataTypes.ENUM('A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'),
    allowNull: true,
    defaultValue: 'C'
  },
  hasParking: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hasElevator: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hasGarden: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hasBalcony: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  yearBuilt: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: [],
    comment: 'Array di URL immagini'
  },
  mainImage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'URL immagine principale'
  },
  status: {
    type: DataTypes.ENUM('disponibile', 'prenotato', 'venduto', 'affittato'),
    defaultValue: 'disponibile'
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Immobile in evidenza'
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Relazioni con Partner e Agent
  partnerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID del Partner/Agenzia proprietario dell\'immobile'
  },
  agentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID dell\'Agente che gestisce l\'immobile'
  }
}, {
  tableName: 'properties',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['city'] },
    { fields: ['price'] },
    { fields: ['status'] },
    { fields: ['featured'] },
    { fields: ['partnerId'] },
    { fields: ['agentId'] },
    { fields: ['type'] },
    { fields: ['propertyType'] },
    {
      name: 'properties_city_price',
      fields: ['city', 'price']
    },
    {
      name: 'properties_featured_status',
      fields: ['featured', 'status']
    },
    {
      name: 'properties_type_status',
      fields: ['type', 'status']
    },
    {
      name: 'properties_partner_featured',
      fields: ['partnerId', 'featured']
    },
    // Performance optimization indexes for common queries
    {
      name: 'properties_city_type_status',
      fields: ['city', 'type', 'status']
    },
    {
      name: 'properties_price_range',
      fields: ['price', 'type']
    },
    {
      name: 'properties_view_count',
      fields: ['viewCount']
    },
    {
      name: 'properties_search_fulltext',
      fields: ['title', 'description'],
      type: 'FULLTEXT'
    },
    {
      name: 'properties_created_at',
      fields: ['created_at']
    }
  ]
});

// Define associations
Property.associate = (models) => {
  Property.belongsTo(models.Partner, {
    foreignKey: 'partnerId',
    as: 'agency'
  });

  Property.belongsTo(models.Agent, {
    foreignKey: 'agentId',
    as: 'agent'
  });
};

export default Property;
