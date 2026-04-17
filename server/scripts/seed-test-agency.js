/**
 * Script per creare account agenzia di test con dati CRM completi
 *
 * Crea:
 * - 1 Partner (agenzia)
 * - 2 Agenti
 * - 1 User (per login)
 * - 5 Clienti
 * - 3 Appuntamenti
 * - 3 Trattative
 * - 8 Attività
 */

import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import {
  sequelize,
  User,
  Partner,
  Agent,
  Client,
  Appointment,
  Deal,
  Activity
} from '../models/index.js';

dotenv.config();

const seedTestAgency = async () => {
  try {
    console.log('🌱 Inizio seeding test agency...\n');

    // Sync database (crea tabelle se non esistono)
    console.log('📦 Sincronizzazione database...');
    await sequelize.sync();
    console.log('✅ Database sincronizzato\n');

    // 1. Crea User per login
    console.log('👤 Creazione utente...');
    const hashedPassword = await bcrypt.hash('test123', 10);

    const user = await User.create({
      email: 'test@agenziatest.it',
      password: hashedPassword,
      firstName: 'Marco',
      lastName: 'Bianchi',
      phone: '+39 333 123 4567',
      role: 'agent',
      isVerified: true
    });
    console.log(`✅ User creato: ${user.email} (ID: ${user.id})`);
    console.log(`   Password: test123`);

    // 2. Crea Partner
    console.log('\n🏢 Creazione partner...');
    const partner = await Partner.create({
      companyName: 'Agenzia Immobiliare Test Milano',
      vatNumber: '12345678901',
      fiscalCode: 'TSTMLN80A01F205X',
      address: 'Via Giuseppe Garibaldi 45',
      city: 'Milano',
      province: 'MI',
      zipCode: '20121',
      phone: '+39 02 1234 5678',
      email: 'info@agenziatest.it',
      website: 'https://www.agenziatest.it',
      termsAccepted: true,
      privacyAccepted: true,
      termsAcceptedAt: new Date(),
      status: 'active',
      approvedAt: new Date(),
      userId: user.id
    });
    console.log(`✅ Partner creato: ${partner.companyName} (ID: ${partner.id})`);

    // 3. Crea Agenti
    console.log('\n👥 Creazione agenti...');

    const agent1 = await Agent.create({
      userId: user.id,
      partnerId: partner.id,
      position: 'Senior Real Estate Agent',
      professionalPhone: '+39 333 123 4567',
      professionalEmail: 'marco.bianchi@agenziatest.it',
      bio: 'Esperto del mercato immobiliare milanese con 10 anni di esperienza. Specializzato in immobili di pregio nel centro città.',
      status: 'active',
      hireDate: new Date('2020-01-15'),
      canCreateProperties: true,
      canEditAllProperties: true,
      canDeleteProperties: false
    });
    console.log(`✅ Agente 1 creato: ${user.firstName} ${user.lastName} - ${agent1.position} (ID: ${agent1.id})`);

    // Crea secondo user per secondo agente
    const user2 = await User.create({
      email: 'giulia.rossi@agenziatest.it',
      password: hashedPassword,
      firstName: 'Giulia',
      lastName: 'Rossi',
      phone: '+39 340 987 6543',
      role: 'agent',
      isVerified: true
    });

    const agent2 = await Agent.create({
      userId: user2.id,
      partnerId: partner.id,
      position: 'Junior Real Estate Agent',
      professionalPhone: '+39 340 987 6543',
      professionalEmail: 'giulia.rossi@agenziatest.it',
      bio: 'Giovane agente dinamica, specializzata in prima casa e immobili per giovani professionisti.',
      status: 'active',
      hireDate: new Date('2023-06-01'),
      canCreateProperties: true,
      canEditAllProperties: false,
      canDeleteProperties: false
    });
    console.log(`✅ Agente 2 creato: ${user2.firstName} ${user2.lastName} - ${agent2.position} (ID: ${agent2.id})`);

    // 4. Crea Clienti
    console.log('\n👤 Creazione clienti...');

    const clients = await Client.bulkCreate([
      {
        firstName: 'Luca',
        lastName: 'Ferrari',
        email: 'luca.ferrari@email.it',
        phone: '+39 345 111 2222',
        type: 'buyer',
        status: 'qualified',
        budgetMin: 300000,
        budgetMax: 450000,
        preferredPropertyType: 'apartment',
        preferredCities: ['Porta Nuova', 'Isola', 'Centrale'],
        source: 'website',
        priority: 'high',
        partnerId: partner.id,
        agentId: agent1.id,
        notes: 'Cliente molto interessato, cerca trilocale zona Porta Nuova. Ha già pre-approvazione mutuo.'
      },
      {
        firstName: 'Sofia',
        lastName: 'Colombo',
        email: 'sofia.colombo@email.it',
        phone: '+39 348 222 3333',
        type: 'renter',
        status: 'contacted',
        budgetMin: 800,
        budgetMax: 1200,
        preferredPropertyType: 'apartment',
        preferredCities: ['Navigli', 'Brera', 'Garibaldi'],
        source: 'social',
        priority: 'medium',
        partnerId: partner.id,
        agentId: agent2.id,
        notes: 'Cerca bilocale in affitto, trasferimento per lavoro da Roma.'
      },
      {
        firstName: 'Alessandro',
        lastName: 'Moretti',
        email: 'a.moretti@email.it',
        phone: '+39 333 444 5555',
        type: 'seller',
        status: 'new',
        budgetMin: null,
        budgetMax: null,
        preferredPropertyType: 'apartment',
        preferredCities: ['Porta Romana'],
        source: 'referral',
        priority: 'high',
        partnerId: partner.id,
        agentId: agent1.id,
        notes: 'Vuole vendere appartamento 120mq zona Porta Romana. Richiede valutazione.'
      },
      {
        firstName: 'Elena',
        lastName: 'Ricci',
        email: 'elena.ricci@email.it',
        phone: '+39 347 666 7777',
        type: 'buyer',
        status: 'negotiation',
        budgetMin: 500000,
        budgetMax: 700000,
        preferredPropertyType: 'house',
        preferredCities: ['CityLife', 'Porta Nuova'],
        source: 'website',
        priority: 'urgent',
        partnerId: partner.id,
        agentId: agent1.id,
        notes: 'Cerca casa con giardino. Ha già fatto offerta su immobile in CityLife.'
      },
      {
        firstName: 'Davide',
        lastName: 'Santoro',
        email: 'davide.santoro@email.it',
        phone: '+39 349 888 9999',
        type: 'both',
        status: 'qualified',
        budgetMin: 250000,
        budgetMax: 350000,
        preferredPropertyType: 'apartment',
        preferredCities: ['Loreto', 'Città Studi', 'Lambrate'],
        source: 'direct_contact',
        priority: 'medium',
        partnerId: partner.id,
        agentId: agent2.id,
        notes: 'Vuole vendere bilocale attuale e acquistare trilocale più grande. Cambio casa.'
      }
    ]);
    console.log(`✅ ${clients.length} clienti creati`);

    // 5. Crea Appuntamenti
    console.log('\n📅 Creazione appuntamenti...');

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const appointments = await Appointment.bulkCreate([
      {
        title: 'Visita appartamento Porta Nuova',
        type: 'property_viewing',
        startDate: tomorrow.setHours(10, 0, 0, 0),
        endDate: tomorrow.setHours(11, 0, 0, 0),
        location: 'Via Melchiorre Gioia 82, Milano',
        status: 'scheduled',
        clientId: clients[0].id,
        agentId: agent1.id,
        partnerId: partner.id,
        propertyId: 1, // Assuming property ID 1 exists
        notes: 'Cliente interessato a trilocale 180mq. Portare planimetrie e documentazione APE.',
        reminder: true,
        reminderMinutes: 60
      },
      {
        title: 'Valutazione immobile Porta Romana',
        type: 'valuation',
        startDate: new Date(today.setDate(today.getDate() + 3)).setHours(15, 0, 0, 0),
        endDate: new Date(today.setDate(today.getDate() + 3)).setHours(16, 0, 0, 0),
        location: 'Via Orti 15, Milano',
        status: 'confirmed',
        clientId: clients[2].id,
        agentId: agent1.id,
        partnerId: partner.id,
        notes: 'Valutazione appartamento 120mq. Cliente vuole vendere entro 3 mesi.',
        reminder: true,
        reminderMinutes: 120
      },
      {
        title: 'Firma preliminare CityLife',
        type: 'contract_signing',
        startDate: nextWeek.setHours(14, 0, 0, 0),
        endDate: nextWeek.setHours(15, 30, 0, 0),
        location: 'Ufficio Agenzia - Via Garibaldi 45',
        status: 'confirmed',
        clientId: clients[3].id,
        agentId: agent1.id,
        partnerId: partner.id,
        notes: 'Firma contratto preliminare per villa CityLife. Presente anche notaio.',
        reminder: true,
        reminderMinutes: 1440 // 24 ore prima
      }
    ]);
    console.log(`✅ ${appointments.length} appuntamenti creati`);

    // 6. Crea Trattative (Deals)
    console.log('\n💼 Creazione trattative...');

    const deals = await Deal.bulkCreate([
      {
        title: 'Vendita Villa CityLife - Elena Ricci',
        type: 'sale',
        stage: 'negotiation',
        value: 650000,
        probability: 75,
        expectedCloseDate: new Date(nextWeek.getTime() + 14 * 24 * 60 * 60 * 1000),
        clientId: clients[3].id,
        agentId: agent1.id,
        partnerId: partner.id,
        propertyId: 3,
        notes: 'Offerta €650k accettata dal venditore. In attesa firma preliminare.',
        status: 'active',
        priority: 'urgent'
      },
      {
        title: 'Acquisto Trilocale Porta Nuova - Luca Ferrari',
        type: 'sale',
        stage: 'qualified',
        value: 425000,
        probability: 60,
        expectedCloseDate: new Date(nextWeek.getTime() + 30 * 24 * 60 * 60 * 1000),
        clientId: clients[0].id,
        agentId: agent1.id,
        partnerId: partner.id,
        propertyId: 1,
        notes: 'Cliente qualificato con mutuo pre-approvato. Visita programmata domani.',
        status: 'active',
        priority: 'high'
      },
      {
        title: 'Permuta appartamento - Davide Santoro',
        type: 'sale',
        stage: 'lead',
        value: 300000,
        probability: 40,
        expectedCloseDate: new Date(nextWeek.getTime() + 60 * 24 * 60 * 60 * 1000),
        clientId: clients[4].id,
        agentId: agent2.id,
        partnerId: partner.id,
        notes: 'Cliente vuole permutare bilocale attuale con trilocale. Valutare immobile attuale.',
        status: 'active',
        priority: 'medium'
      }
    ]);
    console.log(`✅ ${deals.length} trattative create`);

    // 7. Crea Attività
    console.log('\n📝 Creazione attività...');

    const activities = await Activity.bulkCreate([
      {
        type: 'call',
        description: 'Chiamata di qualificazione con Luca Ferrari',
        dueDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 giorni fa
        completedAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        status: 'completed',
        priority: 'high',
        clientId: clients[0].id,
        dealId: deals[1].id,
        agentId: agent1.id,
        partnerId: partner.id,
        notes: 'Cliente molto interessato. Ha già pre-approvazione mutuo €450k. Fissata visita per domani.'
      },
      {
        type: 'email',
        description: 'Invio documentazione APE e planimetrie',
        dueDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        completedAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        status: 'completed',
        priority: 'medium',
        clientId: clients[0].id,
        agentId: agent1.id,
        partnerId: partner.id,
        notes: 'Inviata documentazione completa immobile Porta Nuova. Cliente ha confermato ricezione.'
      },
      {
        type: 'meeting',
        description: 'Incontro con Elena Ricci per offerta',
        dueDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
        completedAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
        status: 'completed',
        priority: 'urgent',
        clientId: clients[3].id,
        dealId: deals[0].id,
        agentId: agent1.id,
        partnerId: partner.id,
        notes: 'Presentata offerta €650k. Cliente ha accettato. Venditore ha contro-offerto €670k. Trattativa in corso.'
      },
      {
        type: 'task',
        description: 'Preparare valutazione per Alessandro Moretti',
        dueDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
        status: 'pending',
        priority: 'high',
        clientId: clients[2].id,
        agentId: agent1.id,
        partnerId: partner.id,
        notes: 'Raccogliere comparabili zona Porta Romana, ultimi 6 mesi, 100-130mq.'
      },
      {
        type: 'call',
        description: 'Follow-up con Sofia Colombo per bilocale Navigli',
        dueDate: new Date(),
        status: 'pending',
        priority: 'medium',
        clientId: clients[1].id,
        agentId: agent2.id,
        partnerId: partner.id,
        notes: 'Proporre nuova disponibilità bilocale Navigli €1.100/mese.'
      },
      {
        type: 'email',
        description: 'Inviare contratto preliminare a Elena Ricci',
        dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        status: 'pending',
        priority: 'urgent',
        clientId: clients[3].id,
        dealId: deals[0].id,
        agentId: agent1.id,
        partnerId: partner.id,
        notes: 'Preparare bozza contratto preliminare per revisione notaio.'
      },
      {
        type: 'meeting',
        description: 'Valutazione immobile attuale Davide Santoro',
        dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
        status: 'pending',
        priority: 'medium',
        clientId: clients[4].id,
        agentId: agent2.id,
        partnerId: partner.id,
        notes: 'Fissare appuntamento per sopralluogo bilocale Lambrate.'
      },
      {
        type: 'task',
        description: 'Aggiornare portfolio immobili disponibili',
        dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: 'pending',
        priority: 'low',
        agentId: agent1.id,
        partnerId: partner.id,
        notes: 'Rimuovere immobili venduti e aggiungere nuove disponibilità.'
      }
    ]);
    console.log(`✅ ${activities.length} attività create`);

    // 8. Riepilogo
    console.log('\n' + '='.repeat(60));
    console.log('✅ SEEDING COMPLETATO CON SUCCESSO!');
    console.log('='.repeat(60));
    console.log('\n📊 RIEPILOGO:');
    console.log(`   👤 Users: 2`);
    console.log(`   🏢 Partner: 1 - ${partner.companyName}`);
    console.log(`   👥 Agenti: 2`);
    console.log(`   💼 Clienti: ${clients.length}`);
    console.log(`   📅 Appuntamenti: ${appointments.length}`);
    console.log(`   💰 Trattative: ${deals.length}`);
    console.log(`   📝 Attività: ${activities.length}`);

    console.log('\n🔑 CREDENZIALI LOGIN:');
    console.log('   Email: test@agenziatest.it');
    console.log('   Password: test123');
    console.log('   Ruolo: agent');

    console.log('\n🏢 DATI AGENZIA:');
    console.log(`   Nome: ${partner.companyName}`);
    console.log(`   ID Partner: ${partner.id}`);
    console.log(`   Email: ${partner.email}`);
    console.log(`   Telefono: ${partner.phone}`);
    console.log(`   Indirizzo: ${partner.address}, ${partner.city}`);

    console.log('\n👥 AGENTI:');
    console.log(`   1. Marco Bianchi (ID: ${agent1.id}) - Senior Agent`);
    console.log(`      Email: marco.bianchi@agenziatest.it`);
    console.log(`   2. Giulia Rossi (ID: ${agent2.id}) - Junior Agent`);
    console.log(`      Email: giulia.rossi@agenziatest.it`);

    console.log('\n💡 PROSSIMI PASSI:');
    console.log('   1. Accedi al sistema con le credenziali sopra');
    console.log('   2. Naviga nell\'area CRM per vedere tutti i dati');
    console.log('   3. Testa le funzionalità: clienti, appuntamenti, trattative, attività');
    console.log('   4. Prova l\'integrazione AI-CRM nella chat');

    console.log('\n📡 URL UTILI:');
    console.log('   Frontend: http://localhost:5173');
    console.log('   Backend: http://localhost:3001');
    console.log('   Login API: POST http://localhost:3001/api/auth/login');
    console.log('   CRM Clienti: GET http://localhost:3001/api/crm/clients?partnerId=' + partner.id);

    console.log('\n✨ Buon test!\n');

  } catch (error) {
    console.error('❌ Errore durante il seeding:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Esegui seeding
seedTestAgency();
