import sequelize from '../config/database.js';
import Property from './Property.js';
import User from './User.js';
import Favorite from './Favorite.js';
import Partner from './Partner.js';
import Agent from './Agent.js';
import Subscription from './Subscription.js';
import Client from './Client.js';
import Appointment from './Appointment.js';
import Deal from './Deal.js';
import Activity from './Activity.js';
import Document from './Document.js';

// ============================================
// RELAZIONI USER - FAVORITES - PROPERTY
// ============================================
User.belongsToMany(Property, {
  through: Favorite,
  as: 'favoriteProperties',
  foreignKey: 'userId',
  otherKey: 'propertyId'
});

Property.belongsToMany(User, {
  through: Favorite,
  as: 'favoritedBy',
  foreignKey: 'propertyId',
  otherKey: 'userId'
});

Favorite.belongsTo(User, { foreignKey: 'userId' });
Favorite.belongsTo(Property, { foreignKey: 'propertyId' });

User.hasMany(Favorite, { foreignKey: 'userId' });
Property.hasMany(Favorite, { foreignKey: 'propertyId' });

// ============================================
// RELAZIONI PARTNER - USER
// ============================================
// Un Partner è collegato a un User (il proprietario dell'agenzia)
Partner.belongsTo(User, {
  as: 'owner',
  foreignKey: 'userId'
});
User.hasOne(Partner, {
  as: 'partnerProfile',
  foreignKey: 'userId'
});

// ============================================
// RELAZIONI PARTNER - SUBSCRIPTION
// ============================================
// Un Partner ha una Subscription attiva
Partner.belongsTo(Subscription, {
  as: 'activeSubscription',
  foreignKey: 'subscriptionId'
});
Subscription.hasOne(Partner, {
  foreignKey: 'subscriptionId'
});

// Un Partner può avere più Subscriptions nel tempo (storico)
Partner.hasMany(Subscription, {
  as: 'subscriptionHistory',
  foreignKey: 'partnerId'
});
Subscription.belongsTo(Partner, {
  foreignKey: 'partnerId'
});

// ============================================
// RELAZIONI AGENT - USER - PARTNER
// ============================================
// Un Agent è collegato a un User
Agent.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId'
});
User.hasOne(Agent, {
  as: 'agentProfile',
  foreignKey: 'userId'
});

// Un Agent appartiene a un Partner (agenzia)
Agent.belongsTo(Partner, {
  as: 'agency',
  foreignKey: 'partnerId'
});
Partner.hasMany(Agent, {
  as: 'agents',
  foreignKey: 'partnerId'
});

// ============================================
// RELAZIONI PROPERTY - PARTNER - AGENT
// ============================================
// Un Property appartiene a un Partner (agenzia)
Property.belongsTo(Partner, {
  as: 'agency',
  foreignKey: 'partnerId'
});
Partner.hasMany(Property, {
  as: 'properties',
  foreignKey: 'partnerId'
});

// Un Property è gestito da un Agent
Property.belongsTo(Agent, {
  as: 'agent',
  foreignKey: 'agentId'
});
Agent.hasMany(Property, {
  as: 'properties',
  foreignKey: 'agentId'
});

// ============================================
// RELAZIONI CRM - CLIENT
// ============================================
// Un Client appartiene a un Partner
Client.belongsTo(Partner, {
  as: 'agency',
  foreignKey: 'partnerId'
});
Partner.hasMany(Client, {
  as: 'clients',
  foreignKey: 'partnerId'
});

// Un Client è assegnato a un Agent
Client.belongsTo(Agent, {
  as: 'assignedAgent',
  foreignKey: 'agentId'
});
Agent.hasMany(Client, {
  as: 'clients',
  foreignKey: 'agentId'
});

// ============================================
// RELAZIONI CRM - APPOINTMENT
// ============================================
// Un Appointment è collegato a un Client
Appointment.belongsTo(Client, {
  as: 'client',
  foreignKey: 'clientId'
});
Client.hasMany(Appointment, {
  as: 'appointments',
  foreignKey: 'clientId'
});

// Un Appointment è collegato a una Property (opzionale)
Appointment.belongsTo(Property, {
  as: 'property',
  foreignKey: 'propertyId'
});
Property.hasMany(Appointment, {
  as: 'appointments',
  foreignKey: 'propertyId'
});

// Un Appointment è gestito da un Agent
Appointment.belongsTo(Agent, {
  as: 'agent',
  foreignKey: 'agentId'
});
Agent.hasMany(Appointment, {
  as: 'appointments',
  foreignKey: 'agentId'
});

// Un Appointment appartiene a un Partner
Appointment.belongsTo(Partner, {
  as: 'agency',
  foreignKey: 'partnerId'
});
Partner.hasMany(Appointment, {
  as: 'appointments',
  foreignKey: 'partnerId'
});

// ============================================
// RELAZIONI CRM - DEAL
// ============================================
// Un Deal è collegato a un Client
Deal.belongsTo(Client, {
  as: 'client',
  foreignKey: 'clientId'
});
Client.hasMany(Deal, {
  as: 'deals',
  foreignKey: 'clientId'
});

// Un Deal è collegato a una Property (opzionale)
Deal.belongsTo(Property, {
  as: 'property',
  foreignKey: 'propertyId'
});
Property.hasMany(Deal, {
  as: 'deals',
  foreignKey: 'propertyId'
});

// Un Deal è gestito da un Agent
Deal.belongsTo(Agent, {
  as: 'agent',
  foreignKey: 'agentId'
});
Agent.hasMany(Deal, {
  as: 'deals',
  foreignKey: 'agentId'
});

// Un Deal appartiene a un Partner
Deal.belongsTo(Partner, {
  as: 'agency',
  foreignKey: 'partnerId'
});
Partner.hasMany(Deal, {
  as: 'deals',
  foreignKey: 'partnerId'
});

// ============================================
// RELAZIONI CRM - ACTIVITY
// ============================================
// Un'Activity è collegata a un Client (opzionale)
Activity.belongsTo(Client, {
  as: 'client',
  foreignKey: 'clientId'
});
Client.hasMany(Activity, {
  as: 'activities',
  foreignKey: 'clientId'
});

// Un'Activity è collegata a un Deal (opzionale)
Activity.belongsTo(Deal, {
  as: 'deal',
  foreignKey: 'dealId'
});
Deal.hasMany(Activity, {
  as: 'activities',
  foreignKey: 'dealId'
});

// Un'Activity è collegata a una Property (opzionale)
Activity.belongsTo(Property, {
  as: 'property',
  foreignKey: 'propertyId'
});
Property.hasMany(Activity, {
  as: 'activities',
  foreignKey: 'propertyId'
});

// Un'Activity è collegata a un Appointment (opzionale)
Activity.belongsTo(Appointment, {
  as: 'appointment',
  foreignKey: 'appointmentId'
});
Appointment.hasMany(Activity, {
  as: 'activities',
  foreignKey: 'appointmentId'
});

// Un'Activity è creata da un Agent
Activity.belongsTo(Agent, {
  as: 'agent',
  foreignKey: 'agentId'
});
Agent.hasMany(Activity, {
  as: 'activities',
  foreignKey: 'agentId'
});

// Un'Activity appartiene a un Partner
Activity.belongsTo(Partner, {
  as: 'agency',
  foreignKey: 'partnerId'
});
Partner.hasMany(Activity, {
  as: 'activities',
  foreignKey: 'partnerId'
});

// ============================================
// RELAZIONI CRM - DOCUMENT
// ============================================
// Un Document è collegato a un Client (opzionale)
Document.belongsTo(Client, {
  as: 'client',
  foreignKey: 'clientId'
});
Client.hasMany(Document, {
  as: 'documents',
  foreignKey: 'clientId'
});

// Un Document è collegato a un Deal (opzionale)
Document.belongsTo(Deal, {
  as: 'deal',
  foreignKey: 'dealId'
});
Deal.hasMany(Document, {
  as: 'documents',
  foreignKey: 'dealId'
});

// Un Document è collegato a una Property (opzionale)
Document.belongsTo(Property, {
  as: 'property',
  foreignKey: 'propertyId'
});
Property.hasMany(Document, {
  as: 'documents',
  foreignKey: 'propertyId'
});

// Un Document è caricato da un Agent
Document.belongsTo(Agent, {
  as: 'uploadedByAgent',
  foreignKey: 'uploadedBy'
});
Agent.hasMany(Document, {
  as: 'uploadedDocuments',
  foreignKey: 'uploadedBy'
});

// Un Document appartiene a un Partner
Document.belongsTo(Partner, {
  as: 'agency',
  foreignKey: 'partnerId'
});
Partner.hasMany(Document, {
  as: 'documents',
  foreignKey: 'partnerId'
});

export {
  sequelize,
  Property,
  User,
  Favorite,
  Partner,
  Agent,
  Subscription,
  Client,
  Appointment,
  Deal,
  Activity,
  Document
};

// Funzione per sincronizzare il database
export const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force }); // force: true = DROP e RICREA tutte le tabelle
    console.log('✅ Database sincronizzato con successo!');
    return true;
  } catch (error) {
    console.error('❌ Errore sincronizzazione database:', error);
    return false;
  }
};
