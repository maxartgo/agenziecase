import { useState, useEffect } from 'react';
import AgentRegistrationModal from './AgentRegistrationModal';
import PropertyCreateModal from './PropertyCreateModal';
import PropertyList from './PropertyList';
import VirtualTourPacks from './VirtualTourPacks';
import CRMSubscriptionPlans from './CRMSubscriptionPlans';
import CRMDataManager from './CRMDataManager';
import SupportTickets from './SupportTickets';
import MLSBrowser from './MLSBrowser';
import MLSCollaborations from './MLSCollaborations';
import MLSLeads from './MLSLeads';
import MLSTransactions from './MLSTransactions';
import NotificationBell from './NotificationBell';
import NotificationCenter from './NotificationCenter';
import { API_BASE_URL } from '../config/api';

/**
 * Dashboard CRM per agenti immobiliari
 */
const CRMDashboard = ({ user, token, onLogout }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState(null);
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [partnerData, setPartnerData] = useState(null);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [properties, setProperties] = useState([]);
  const [crmSubscription, setCrmSubscription] = useState(null);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Determina se l'utente è Partner o Agent
  const isPartner = user.role === 'partner';
  const isAgent = user.role === 'agent';

  // Recupera dati CRM all'avvio
  useEffect(() => {
    loadDashboardData();
    if (isPartner) {
      loadPartnerData();
      loadCRMSubscriptionStatus();
    }
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // TODO: Implementare chiamate API reali
      // Per ora usiamo dati mock
      setStats({
        totalClients: 12,
        newLeads: 5,
        appointments: 8,
        dealsInProgress: 3
      });
      setClients([]);
      setAppointments([]);

      // Carica agenti se Partner
      if (isPartner) {
        await loadAgents();
      }
    } catch (error) {
      console.error('Errore caricamento dati:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPartnerData = async () => {
    try {
      const response = await fetch('${API_BASE_URL}/api/partners/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setPartnerData(data.partner);
      }
    } catch (error) {
      console.error('Errore caricamento partner:', error);
    }
  };

  const loadCRMSubscriptionStatus = async () => {
    try {
      const response = await fetch('${API_BASE_URL}/api/crm-subscriptions/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('📊 CRM Subscription Status:', data);
      if (data.success) {
        setCrmSubscription(data.subscription);
        console.log('✅ Subscription active:', data.subscription.active);

        // Se non ha abbonamento attivo, mostra i piani
        if (!data.subscription.active) {
          console.log('🔒 Abbonamento non attivo, mostro piani');
          setShowSubscriptionPlans(true);
        }
      }
    } catch (error) {
      console.error('❌ Errore caricamento abbonamento CRM:', error);
      // In caso di errore, assumiamo che non ci sia abbonamento
      setCrmSubscription({ active: false });
    }
  };

  const loadAgents = async () => {
    try {
      const response = await fetch('${API_BASE_URL}/api/agents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAgents(data.agents || []);
      }
    } catch (error) {
      console.error('Errore caricamento agenti:', error);
    }
  };

  const handleAgentRegistered = (newAgent) => {
    console.log('Nuovo agente registrato:', newAgent);
    // Ricarica lista agenti
    loadAgents();
  };

  const handlePropertyCreated = () => {
    console.log('Nuovo annuncio creato');
    // Chiudi modal e ricarica lista
    setIsPropertyModalOpen(false);
    // Il PropertyList si ricaricherà automaticamente
  };

  const handleEditProperty = (property) => {
    console.log('Modifica annuncio:', property);
    // TODO: aprire PropertyEditModal quando sarà creato
    alert('Funzione modifica in arrivo!');
  };

  const handleSubscriptionComplete = (subscription) => {
    console.log('Abbonamento completato:', subscription);
    setCrmSubscription(subscription);
    setShowSubscriptionPlans(false);
    loadCRMSubscriptionStatus();
  };

  // Se il partner deve sottoscrivere l'abbonamento CRM, mostra i piani
  if (isPartner && showSubscriptionPlans) {
    return (
      <CRMSubscriptionPlans
        token={token}
        onSubscribe={handleSubscriptionComplete}
      />
    );
  }

  // Menu items
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: '📊', roles: ['partner', 'agent'] },
    ...(isPartner ? [{ id: 'agents', label: 'Agenti', icon: '👨‍💼', roles: ['partner'] }] : []),
    { id: 'properties', label: 'Annunci', icon: '🏠', roles: ['partner', 'agent'] },
    ...(isPartner ? [{ id: 'virtualtour', label: 'Virtual Tour', icon: '🌐', roles: ['partner'] }] : []),
    { id: 'mls-network', label: 'Network MLS', icon: '🔗', roles: ['partner', 'agent'] },
    { id: 'mls-collaborations', label: 'Collaborazioni', icon: '🤝', roles: ['partner', 'agent'] },
    { id: 'mls-leads', label: 'Lead MLS', icon: '📋', roles: ['partner', 'agent'] },
    { id: 'mls-transactions', label: 'Transazioni MLS', icon: '💰', roles: ['partner', 'agent'] },
    { id: 'notifications', label: 'Notifiche', icon: '🔔', roles: ['partner', 'agent'] },
    { id: 'clients', label: 'Clienti', icon: '👥', roles: ['partner', 'agent'] },
    { id: 'appointments', label: 'Appuntamenti', icon: '📅', roles: ['partner', 'agent'] },
    { id: 'deals', label: 'Trattative', icon: '💼', roles: ['partner', 'agent'] },
    { id: 'activities', label: 'Attività', icon: '📝', roles: ['partner', 'agent'] },
    { id: 'support', label: 'Supporto', icon: '🎫', roles: ['partner', 'agent'] }
  ];

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    },
    header: {
      background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
      padding: '1.5rem 2rem',
      color: '#0a0a0a',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      position: 'relative',
      zIndex: 100
    },
    headerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logo: {
      fontSize: '1.8rem',
      fontWeight: '700',
      fontFamily: "'Playfair Display', serif",
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem'
    },
    userName: {
      fontSize: '1rem',
      fontWeight: '600'
    },
    logoutButton: {
      padding: '0.5rem 1.25rem',
      background: 'rgba(255, 255, 255, 0.2)',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '8px',
      color: '#0a0a0a',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    mainWrapper: {
      display: 'flex',
      flex: 1,
      position: 'relative',
      overflow: 'hidden'
    },
    sidebar: {
      width: isSidebarOpen ? '280px' : '0',
      backgroundColor: 'rgba(26, 26, 26, 0.95)',
      borderRight: isSidebarOpen ? '1px solid rgba(212, 175, 55, 0.2)' : 'none',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease-in-out',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 50
    },
    sidebarContent: {
      width: '280px',
      padding: isSidebarOpen ? '1.5rem 0' : '1.5rem 0',
      opacity: isSidebarOpen ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out'
    },
    menuItem: {
      padding: '1rem 1.5rem',
      cursor: 'pointer',
      fontSize: '0.95rem',
      fontWeight: '600',
      color: '#999',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      transition: 'all 0.2s',
      borderLeft: '3px solid transparent',
      whiteSpace: 'nowrap'
    },
    menuItemActive: {
      color: '#d4af37',
      backgroundColor: 'rgba(212, 175, 55, 0.1)',
      borderLeftColor: '#d4af37'
    },
    menuIcon: {
      fontSize: '1.2rem',
      minWidth: '1.2rem',
      textAlign: 'center'
    },
    toggleButton: {
      position: 'absolute',
      left: isSidebarOpen ? '280px' : '0',
      top: '100px',
      width: '32px',
      height: '32px',
      backgroundColor: '#d4af37',
      border: 'none',
      borderRadius: '0 8px 8px 0',
      color: '#0a0a0a',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      transition: 'all 0.3s ease-in-out',
      zIndex: 60,
      boxShadow: '2px 2px 10px rgba(0,0,0,0.3)'
    },
    mainContent: {
      flex: 1,
      padding: '2rem',
      overflowY: 'auto',
      transition: 'margin-left 0.3s ease-in-out'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    statCard: {
      backgroundColor: 'rgba(26, 26, 26, 0.7)',
      border: '1px solid rgba(212, 175, 55, 0.2)',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(10px)',
      transition: 'transform 0.2s, boxShadow 0.2s, border-color 0.2s'
    },
    statIcon: {
      fontSize: '2rem',
      marginBottom: '0.5rem'
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#d4af37',
      marginBottom: '0.25rem'
    },
    statLabel: {
      fontSize: '0.9rem',
      color: '#999',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    contentCard: {
      backgroundColor: 'rgba(26, 26, 26, 0.7)',
      border: '1px solid rgba(212, 175, 55, 0.2)',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(10px)'
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#d4af37',
      marginBottom: '1.5rem',
      fontFamily: "'Playfair Display', serif"
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      color: '#999'
    },
    emptyIcon: {
      fontSize: '3rem',
      marginBottom: '1rem'
    },
    emptyText: {
      fontSize: '1.1rem',
      marginBottom: '0.5rem'
    },
    comingSoon: {
      display: 'inline-block',
      backgroundColor: '#d4af37',
      color: '#0a0a0a',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600',
      marginLeft: '1rem'
    },
    addButton: {
      padding: '0.75rem 1.5rem',
      background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
      border: 'none',
      borderRadius: '12px',
      color: '#0a0a0a',
      fontSize: '1rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s',
      boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
      marginBottom: '1.5rem'
    },
    agentsList: {
      display: 'grid',
      gap: '1rem'
    },
    agentCard: {
      backgroundColor: 'rgba(26, 26, 26, 0.5)',
      border: '1px solid rgba(212, 175, 55, 0.2)',
      borderRadius: '12px',
      padding: '1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'all 0.2s'
    },
    agentInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    agentName: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#d4af37'
    },
    agentDetail: {
      fontSize: '0.9rem',
      color: '#999'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            🏠 AgenzieCase CRM
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>
              Ciao, {user.firstName} {user.lastName}
            </div>
            <NotificationBell
              token={token}
              onNotificationClick={(notification) => {
                // Naviga alla sezione appropriata in base al link della notifica
                if (notification.link === '/notifications') {
                  setActiveSection('notifications');
                } else if (notification.link === '/mls-collaborations') {
                  setActiveSection('mls-collaborations');
                } else if (notification.link === '/mls-leads') {
                  setActiveSection('mls-leads');
                } else if (notification.link === '/mls-transactions') {
                  setActiveSection('mls-transactions');
                }
              }}
            />
            <button
              onClick={onLogout}
              style={styles.logoutButton}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Wrapper with Sidebar */}
      <div style={styles.mainWrapper}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarContent}>
            {menuItems.map(item => (
              <div
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                style={{
                  ...styles.menuItem,
                  ...(activeSection === item.id ? styles.menuItemActive : {})
                }}
                onMouseOver={(e) => {
                  if (activeSection !== item.id) {
                    e.currentTarget.style.color = '#d4af37';
                    e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.05)';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeSection !== item.id) {
                    e.currentTarget.style.color = '#999';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={styles.menuIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={styles.toggleButton}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#b8860b';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#d4af37';
          }}
          title={isSidebarOpen ? 'Chiudi menu' : 'Apri menu'}
        >
          {isSidebarOpen ? '◀' : '▶'}
        </button>

        {/* Main Content */}
        <main style={styles.mainContent}>
          {activeSection === 'overview' && (
            <>
              {/* CRM Subscription Banner */}
              {isPartner && (!crmSubscription || !crmSubscription.active) && (
                <div style={{
                  backgroundColor: 'rgba(22, 160, 133, 0.1)',
                  border: '2px solid #16a085',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{ color: '#16a085', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                      🔒 Abbonamento CRM Non Attivo
                    </h3>
                    <p style={{ color: '#999', fontSize: '0.95rem' }}>
                      Attiva l'abbonamento per sbloccare tutte le funzionalità CRM
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSubscriptionPlans(true)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '1rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 15px rgba(22, 160, 133, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(22, 160, 133, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(22, 160, 133, 0.3)';
                    }}
                  >
                    Vedi Piani
                  </button>
                </div>
              )}

              {/* Stats Cards */}
              <div style={styles.statsGrid}>
                <div
                  style={styles.statCard}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(212, 175, 55, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4)';
                  }}
                >
                  <div style={styles.statIcon}>👥</div>
                  <div style={styles.statValue}>{stats?.totalClients || 0}</div>
                  <div style={styles.statLabel}>Clienti Totali</div>
                </div>
                <div
                  style={styles.statCard}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(212, 175, 55, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4)';
                  }}
                >
                  <div style={styles.statIcon}>🎯</div>
                  <div style={styles.statValue}>{stats?.newLeads || 0}</div>
                  <div style={styles.statLabel}>Nuovi Lead</div>
                </div>
                <div
                  style={styles.statCard}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(212, 175, 55, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4)';
                  }}
                >
                  <div style={styles.statIcon}>📅</div>
                  <div style={styles.statValue}>{stats?.appointments || 0}</div>
                  <div style={styles.statLabel}>Appuntamenti</div>
                </div>
                <div
                  style={styles.statCard}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(212, 175, 55, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4)';
                  }}
                >
                  <div style={styles.statIcon}>💼</div>
                  <div style={styles.statValue}>{stats?.dealsInProgress || 0}</div>
                  <div style={styles.statLabel}>Trattative Attive</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div style={styles.contentCard}>
                <h2 style={styles.cardTitle}>
                  Attività Recenti
                  <span style={styles.comingSoon}>Coming Soon</span>
                </h2>
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>🚀</div>
                  <div style={styles.emptyText}>Dashboard in sviluppo</div>
                  <p style={{ fontSize: '0.9rem', color: '#bbb' }}>
                    Presto potrai gestire clienti, appuntamenti e trattative direttamente da qui
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Sezione Gestione Agenti (solo Partner) */}
          {activeSection === 'agents' && isPartner && (
            <div style={styles.contentCard}>
              <h2 style={styles.cardTitle}>👨‍💼 Gestione Agenti</h2>

              {/* Subscription Info */}
              {crmSubscription && crmSubscription.active && (
                <div style={{
                  backgroundColor: 'rgba(22, 160, 133, 0.1)',
                  border: '1px solid rgba(22, 160, 133, 0.3)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#16a085', fontWeight: '600', marginBottom: '0.25rem' }}>
                      Piano {crmSubscription.plan === 'single' ? 'Singolo' :
                            crmSubscription.plan === 'team_5' ? 'Team 5' :
                            crmSubscription.plan === 'team_10' ? 'Team 10' :
                            `Team ${crmSubscription.teamSize}+`}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                      {agents.length} / {crmSubscription.teamSize - 1} agenti registrati
                      {agents.length >= crmSubscription.teamSize - 1 && (
                        <span style={{ color: '#f39c12', marginLeft: '0.5rem' }}>• Limite raggiunto</span>
                      )}
                    </div>
                  </div>
                  {agents.length >= crmSubscription.teamSize - 1 && (
                    <button
                      onClick={() => setShowSubscriptionPlans(true)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Passa a piano superiore
                    </button>
                  )}
                </div>
              )}

              {crmSubscription && crmSubscription.active ? (
                <button
                  onClick={() => setIsAgentModalOpen(true)}
                  disabled={agents.length >= crmSubscription.teamSize - 1}
                  style={{
                    ...styles.addButton,
                    ...(agents.length >= crmSubscription.teamSize - 1 ? {
                      opacity: 0.5,
                      cursor: 'not-allowed'
                    } : {})
                  }}
                  onMouseOver={(e) => {
                    if (!(agents.length >= crmSubscription.teamSize - 1)) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.4)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!(agents.length >= crmSubscription.teamSize - 1)) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
                    }
                  }}
                >
                  + Aggiungi Nuovo Agente
                </button>
              ) : (
                <div style={{
                  background: 'rgba(231, 76, 60, 0.1)',
                  border: '1px solid rgba(231, 76, 60, 0.3)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  color: '#e74c3c',
                  fontSize: '0.95rem'
                }}>
                  🔒 Abbonamento CRM richiesto. <button onClick={() => setShowSubscriptionPlans(true)} style={{background: 'transparent', border: 'none', color: '#d4af37', cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit'}}>Attiva ora</button>
                </div>
              )}

              {agents.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>👨‍💼</div>
                  <div style={styles.emptyText}>Nessun agente registrato</div>
                  <p style={{ fontSize: '0.9rem', color: '#bbb' }}>
                    Clicca il pulsante sopra per aggiungere il tuo primo agente
                  </p>
                </div>
              ) : (
                <div style={styles.agentsList}>
                  {agents.map((agent) => (
                    <div
                      key={agent.id}
                      style={styles.agentCard}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(26, 26, 26, 0.7)';
                        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(26, 26, 26, 0.5)';
                        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                      }}
                    >
                      <div style={styles.agentInfo}>
                        <div style={styles.agentName}>
                          {agent.user?.firstName} {agent.user?.lastName}
                        </div>
                        <div style={styles.agentDetail}>
                          📧 {agent.user?.email}
                        </div>
                        <div style={styles.agentDetail}>
                          📱 {agent.phone}
                        </div>
                        {agent.position && (
                          <div style={styles.agentDetail}>
                            💼 {agent.position}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sezione Annunci */}
          {activeSection === 'properties' && (
            <div style={styles.contentCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={styles.cardTitle}>🏠 Annunci Immobiliari</h2>
                {crmSubscription && crmSubscription.active ? (
                  <button
                    onClick={() => setIsPropertyModalOpen(true)}
                    style={styles.addButton}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
                    }}
                  >
                    + Nuovo Annuncio
                  </button>
                ) : (
                  <div style={{
                    background: 'rgba(231, 76, 60, 0.1)',
                    border: '1px solid rgba(231, 76, 60, 0.3)',
                    borderRadius: '12px',
                    padding: '0.75rem 1rem',
                    color: '#e74c3c',
                    fontSize: '0.9rem'
                  }}>
                    🔒 Abbonamento CRM richiesto per pubblicare annunci
                  </div>
                )}
              </div>

              <PropertyList
                partnerId={partnerData?.id}
                token={token}
                onEdit={handleEditProperty}
              />
            </div>
          )}

          {/* Sezione Virtual Tour */}
          {activeSection === 'virtualtour' && (
            <VirtualTourPacks token={token} />
          )}

          {/* Support Tickets */}
          {activeSection === 'support' && (
            <SupportTickets />
          )}

          {/* MLS Network */}
          {activeSection === 'mls-network' && (
            <MLSBrowser token={token} />
          )}

          {/* MLS Collaborations */}
          {activeSection === 'mls-collaborations' && (
            <MLSCollaborations token={token} />
          )}

          {/* MLS Leads */}
          {activeSection === 'mls-leads' && (
            <MLSLeads token={token} />
          )}

          {/* MLS Transactions */}
          {activeSection === 'mls-transactions' && (
            <MLSTransactions token={token} />
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <NotificationCenter
              token={token}
              onNavigate={(link) => {
                // Naviga alla sezione in base al link
                if (link === '/mls-collaborations') {
                  setActiveSection('mls-collaborations');
                } else if (link === '/mls-leads') {
                  setActiveSection('mls-leads');
                } else if (link === '/mls-transactions') {
                  setActiveSection('mls-transactions');
                } else if (link === '/mls-network') {
                  setActiveSection('mls-network');
                }
              }}
            />
          )}

          {/* CRM Sections */}
          {activeSection === 'clients' && (
            <CRMDataManager
              endpoint="/api/crm/clients"
              title="Clienti"
              token={token}
              partnerId={partnerData?.id}
              columns={[
                { key: 'firstName', label: 'Nome' },
                { key: 'lastName', label: 'Cognome' },
                { key: 'email', label: 'Email' },
                { key: 'phone', label: 'Telefono' },
                { key: 'status', label: 'Stato' },
                { key: 'type', label: 'Tipo' }
              ]}
              formFields={[
                { name: 'firstName', label: 'Nome', type: 'text', required: true },
                { name: 'lastName', label: 'Cognome', type: 'text', required: true },
                { name: 'email', label: 'Email', type: 'email', required: true },
                { name: 'phone', label: 'Telefono', type: 'tel', required: true },
                { name: 'type', label: 'Tipo', type: 'select', options: [{ value: 'buyer', label: 'Acquirente' }, { value: 'seller', label: 'Venditore' }, { value: 'renter', label: 'Inquilino' }, { value: 'landlord', label: 'Proprietario' }, { value: 'both', label: 'Entrambi' }] },
                { name: 'status', label: 'Stato', type: 'select', options: [{ value: 'active', label: 'Attivo' }, { value: 'contacted', label: 'Contattato' }, { value: 'converted', label: 'Convertito' }, { value: 'inactive', label: 'Inattivo' }] },
                { name: 'budgetMin', label: 'Budget Min', type: 'number' },
                { name: 'budgetMax', label: 'Budget Max', type: 'number' },
                { name: 'notes', label: 'Note', type: 'textarea' }
              ]}
            />
          )}
          {activeSection === 'appointments' && (
            <CRMDataManager
              endpoint="/api/crm/appointments"
              title="Appuntamenti"
              token={token}
              partnerId={partnerData?.id}
              columns={[
                { key: 'title', label: 'Titolo' },
                { key: 'date', label: 'Data', type: 'date' },
                { key: 'status', label: 'Stato' },
                { key: 'propertyId', label: 'ID Immobile' },
                { key: 'clientId', label: 'ID Cliente' }
              ]}
              formFields={[
                { name: 'title', label: 'Titolo', type: 'text', required: true },
                { name: 'date', label: 'Data e Ora', type: 'datetime-local', required: true },
                { name: 'type', label: 'Tipo', type: 'select', options: [{ value: 'viewing', label: 'Visita' }, { value: 'meeting', label: 'Incontro' }, { value: 'call', label: 'Telefonata' }, { value: 'valuation', label: 'Valutazione' }] },
                { name: 'status', label: 'Stato', type: 'select', options: [{ value: 'scheduled', label: 'Pianificato' }, { value: 'confirmed', label: 'Confermato' }, { value: 'completed', label: 'Completato' }, { value: 'cancelled', label: 'Annullato' }] },
                { name: 'propertyId', label: 'ID Immobile', type: 'number' },
                { name: 'clientId', label: 'ID Cliente', type: 'number' },
                { name: 'notes', label: 'Note', type: 'textarea' }
              ]}
            />
          )}
          {activeSection === 'deals' && (
            <CRMDataManager
              endpoint="/api/crm/deals"
              title="Trattative"
              token={token}
              partnerId={partnerData?.id}
              columns={[
                { key: 'title', label: 'Titolo' },
                { key: 'value', label: 'Valore', type: 'currency' },
                { key: 'status', label: 'Stato' },
                { key: 'stage', label: 'Fase' },
                { key: 'clientId', label: 'ID Cliente' }
              ]}
              formFields={[
                { name: 'title', label: 'Titolo', type: 'text', required: true },
                { name: 'value', label: 'Valore', type: 'number' },
                { name: 'status', label: 'Stato', type: 'select', options: [{ value: 'open', label: 'Aperta' }, { value: 'won', label: 'Vinta' }, { value: 'lost', label: 'Persa' }, { value: 'on_hold', label: 'In Attesa' }] },
                { name: 'stage', label: 'Fase', type: 'select', options: [{ value: 'lead', label: 'Lead' }, { value: 'contact', label: 'Contatto' }, { value: 'visit', label: 'Visita' }, { value: 'negotiation', label: 'Trattativa' }, { value: 'closing', label: 'Chiusura' }] },
                { name: 'clientId', label: 'ID Cliente', type: 'number' },
                { name: 'propertyId', label: 'ID Immobile', type: 'number' },
                { name: 'notes', label: 'Note', type: 'textarea' }
              ]}
            />
          )}
          {activeSection === 'activities' && (
            <CRMDataManager
              endpoint="/api/crm/activities"
              title="Attività"
              token={token}
              partnerId={partnerData?.id}
              columns={[
                { key: 'type', label: 'Tipo' },
                { key: 'description', label: 'Descrizione' },
                { key: 'dueDate', label: 'Scadenza', type: 'date' },
                { key: 'status', label: 'Stato' },
                { key: 'clientId', label: 'ID Cliente' }
              ]}
              formFields={[
                { name: 'type', label: 'Tipo', type: 'select', options: [{ value: 'call', label: 'Telefonata' }, { value: 'email', label: 'Email' }, { value: 'visit', label: 'Visita' }, { value: 'meeting', label: 'Incontro' }, { value: 'task', label: 'Task' }, { value: 'note', label: 'Nota' }] },
                { name: 'description', label: 'Descrizione', type: 'textarea', required: true },
                { name: 'dueDate', label: 'Scadenza', type: 'datetime-local' },
                { name: 'status', label: 'Stato', type: 'select', options: [{ value: 'pending', label: 'In Sospeso' }, { value: 'completed', label: 'Completata' }, { value: 'cancelled', label: 'Annullata' }] },
                { name: 'clientId', label: 'ID Cliente', type: 'number' },
                { name: 'dealId', label: 'ID Trattativa', type: 'number' },
                { name: 'propertyId', label: 'ID Immobile', type: 'number' }
              ]}
            />
          )}

          {/* Altre sezioni */}
          {activeSection !== 'overview' && activeSection !== 'agents' && activeSection !== 'properties' && activeSection !== 'virtualtour' && activeSection !== 'support' && activeSection !== 'mls-network' && activeSection !== 'mls-collaborations' && activeSection !== 'mls-leads' && activeSection !== 'mls-transactions' && activeSection !== 'notifications' && activeSection !== 'clients' && activeSection !== 'appointments' && activeSection !== 'deals' && activeSection !== 'activities' && (
            <div style={styles.contentCard}>
              <h2 style={styles.cardTitle}>
                <span style={styles.comingSoon}>Coming Soon</span>
              </h2>
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🚧</div>
                <div style={styles.emptyText}>Sezione in costruzione</div>
                <p style={{ fontSize: '0.9rem', color: '#bbb' }}>
                  Questa funzionalità sarà disponibile a breve
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal Registrazione Agente */}
      {isPartner && (
        <AgentRegistrationModal
          isOpen={isAgentModalOpen}
          onClose={() => setIsAgentModalOpen(false)}
          onSuccess={handleAgentRegistered}
          partnerId={partnerData?.id}
        />
      )}

      {/* Modal Creazione Annuncio */}
      <PropertyCreateModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        onSuccess={handlePropertyCreated}
        partnerId={partnerData?.id}
      />
    </div>
  );
};

export default CRMDashboard;
