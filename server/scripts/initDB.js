import { sequelize, Property, User, syncDatabase } from '../models/index.js';
import { testConnection } from '../config/database.js';

// Dati mock per inizializzare il database
const mockProperties = [
  {
    title: "Attico con terrazza panoramica",
    location: "Milano, Porta Nuova",
    city: "Milano",
    address: "Via della Liberazione, 15",
    price: 1250000,
    sqm: 180,
    rooms: 4,
    bathrooms: 2,
    mainImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop"
    ],
    type: "Vendita",
    propertyType: "Attico",
    highlight: "Vista Skyline",
    energyClass: "A",
    floor: "15°",
    hasParking: true,
    hasElevator: true,
    hasBalcony: true,
    yearBuilt: 2020,
    status: "disponibile",
    featured: true,
    description: "Splendido attico di design con terrazza di 50mq e vista mozzafiato sullo skyline di Milano. Finiture di pregio, domotica completa."
  },
  {
    title: "Loft industriale ristrutturato",
    location: "Torino, San Salvario",
    city: "Torino",
    address: "Via Nizza, 45",
    price: 320000,
    sqm: 120,
    rooms: 2,
    bathrooms: 1,
    mainImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop"],
    type: "Vendita",
    propertyType: "Loft",
    highlight: "Soffitti 4m",
    energyClass: "B",
    floor: "2°",
    hasParking: false,
    hasElevator: true,
    yearBuilt: 2018,
    status: "disponibile",
    description: "Ex laboratorio tessile trasformato in un loft contemporaneo con soffitti di 4 metri, travi a vista e ampie vetrate."
  },
  {
    title: "Villa con giardino privato",
    location: "Roma, EUR",
    city: "Roma",
    address: "Viale Europa, 88",
    price: 890000,
    sqm: 250,
    rooms: 5,
    bathrooms: 3,
    mainImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop"],
    type: "Vendita",
    propertyType: "Villa",
    highlight: "Giardino 500mq",
    energyClass: "A+",
    floor: "Terra",
    hasParking: true,
    hasElevator: false,
    hasGarden: true,
    yearBuilt: 2019,
    status: "disponibile",
    featured: true,
    description: "Elegante villa su tre livelli con giardino privato, piscina e dependance. Quartiere residenziale esclusivo."
  },
  {
    title: "Bilocale moderno zona università",
    location: "Bologna, Centro",
    city: "Bologna",
    address: "Via Zamboni, 12",
    price: 1200,
    sqm: 55,
    rooms: 2,
    bathrooms: 1,
    mainImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"],
    type: "Affitto",
    propertyType: "Appartamento",
    highlight: "Arredato",
    energyClass: "C",
    floor: "3°",
    hasParking: false,
    hasElevator: true,
    yearBuilt: 2015,
    status: "disponibile",
    description: "Bilocale completamente arredato e ristrutturato, perfetto per studenti o giovani professionisti. A due passi dall'università."
  },
  {
    title: "Appartamento vista mare",
    location: "Genova, Nervi",
    city: "Genova",
    address: "Passeggiata Anita Garibaldi, 22",
    price: 485000,
    sqm: 95,
    rooms: 3,
    bathrooms: 2,
    mainImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop"],
    type: "Vendita",
    propertyType: "Appartamento",
    highlight: "Fronte mare",
    energyClass: "B",
    floor: "5°",
    hasParking: true,
    hasElevator: true,
    hasBalcony: true,
    yearBuilt: 2010,
    status: "disponibile",
    description: "Luminoso appartamento con vista mare spettacolare, doppia esposizione e accesso diretto alla passeggiata Anita Garibaldi."
  },
  {
    title: "Rustico ristrutturato in collina",
    location: "Firenze, Chianti",
    city: "Firenze",
    address: "Località Greve, 1",
    price: 720000,
    sqm: 200,
    rooms: 4,
    bathrooms: 2,
    mainImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop"],
    type: "Vendita",
    propertyType: "Rustico",
    highlight: "Vigneto",
    energyClass: "B",
    floor: "Terra",
    hasParking: true,
    hasElevator: false,
    hasGarden: true,
    yearBuilt: 1800,
    status: "disponibile",
    featured: true,
    description: "Antico casale toscano completamente restaurato con rispetto delle caratteristiche originali. Terreno con vigneto e uliveto."
  },
  {
    title: "Penthouse con piscina privata",
    location: "Napoli, Posillipo",
    city: "Napoli",
    address: "Via Posillipo, 101",
    price: 1850000,
    sqm: 280,
    rooms: 5,
    bathrooms: 4,
    mainImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop"],
    type: "Vendita",
    propertyType: "Penthouse",
    highlight: "Piscina",
    energyClass: "A",
    floor: "Ultimo",
    hasParking: true,
    hasElevator: true,
    hasBalcony: true,
    yearBuilt: 2022,
    status: "disponibile",
    featured: true,
    description: "Esclusivo penthouse con piscina infinity privata e vista sul Golfo di Napoli. Standard di lusso assoluto."
  },
  {
    title: "Monolocale centrale ristrutturato",
    location: "Milano, Navigli",
    city: "Milano",
    address: "Ripa di Porta Ticinese, 8",
    price: 950,
    sqm: 35,
    rooms: 1,
    bathrooms: 1,
    mainImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"],
    type: "Affitto",
    propertyType: "Monolocale",
    highlight: "Sui Navigli",
    energyClass: "C",
    floor: "1°",
    hasParking: false,
    hasElevator: false,
    yearBuilt: 2020,
    status: "disponibile",
    description: "Monolocale di design affacciato sul Naviglio Grande. Zona vivace, ricca di locali e ristoranti."
  }
];

// Script principale
const initializeDatabase = async () => {
  console.log('🚀 Inizializzazione database AgenzieCase...\n');

  // Test connessione
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Impossibile procedere senza connessione al database');
    process.exit(1);
  }

  // Sincronizza il database (crea le tabelle)
  console.log('\n📊 Creazione tabelle...');
  const synced = await syncDatabase(true); // force: true = ricrea tutte le tabelle
  if (!synced) {
    console.error('❌ Errore durante la sincronizzazione del database');
    process.exit(1);
  }

  // Inserisci gli immobili mock
  console.log('\n🏠 Popolamento database con immobili...');
  try {
    await Property.bulkCreate(mockProperties);
    console.log(`✅ Inseriti ${mockProperties.length} immobili nel database`);
  } catch (error) {
    console.error('❌ Errore inserimento immobili:', error.message);
  }

  // Crea un utente admin di test
  console.log('\n👤 Creazione utente admin di test...');
  try {
    await User.create({
      email: 'admin@agenziecase.it',
      password: 'admin123', // In produzione usare bcrypt!
      firstName: 'Max',
      lastName: 'Admin',
      phone: '+39 333 1234567',
      role: 'admin',
      isVerified: true
    });
    console.log('✅ Utente admin creato: admin@agenziecase.it / admin123');
  } catch (error) {
    console.error('❌ Errore creazione utente:', error.message);
  }

  console.log('\n✨ Inizializzazione completata!\n');
  process.exit(0);
};

// Esegui lo script
initializeDatabase();
