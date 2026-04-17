import { useState, useEffect } from 'react';
import AdminVirtualTourManager from './AdminVirtualTourManager';
import AdminCRMManager from './AdminCRMManager';
import AdminPartnersManager from './AdminPartnersManager';
import AdminPropertiesManager from './AdminPropertiesManager';
import AdminCRMSubscriptionsManager from './AdminCRMSubscriptionsManager';
import AdminSupportTicketsManager from './AdminSupportTicketsManager';

/**
 * Dashboard Admin Completa
 * Gestione Virtual Tour + CRM + Partners + Properties + Stats
 */
const AdminDashboard = ({ token, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [partners, setPartners] = useState([]);
  const [properties, setProperties] = useState([]);
  const [vtRequests, setVtRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Carica statistiche generali
      const statsResponse = await fetch('http://localhost:3001/api/properties/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Carica partners
      const partnersResponse = await fetch('http://localhost:3001/api/partners', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Note: Need to create this endpoint or fetch from database

      // Carica properties
      const propsResponse = await fetch('http://localhost:3001/api/properties?limit=10', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const propsData = await propsResponse.json();
      if (propsData.success) {
        setProperties(propsData.properties || []);
      }

      // Carica richieste VT pending
      const vtResponse = await fetch('http://localhost:3001/api/virtual-tour-requests/admin/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const vtData = await vtResponse.json();
      if (vtData.success) {
        setVtRequests(vtData.requests || []);
      }

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
      color: '#fff'
    },
    header: {
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      padding: '1.5rem 2rem',
      borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #d4af37 0%, #f9d276 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    logoutButton: {
      padding: '0.5rem 1.5rem',
      background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    tabsContainer: {
      background: '#1a1a1a',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      gap: '0.5rem',
      padding: '0 2rem',
      overflowX: 'auto'
    },
    tab: {
      padding: '1rem 1.5rem',
      background: 'transparent',
      border: 'none',
      borderBottom: '3px solid transparent',
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap'
    },
    tabActive: {
      color: '#d4af37',
      borderBottomColor: '#d4af37'
    },
    content: {
      padding: '2rem'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    statCard: {
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'all 0.3s ease'
    },
    statIcon: {
      fontSize: '2rem',
      marginBottom: '0.5rem'
    },
    statLabel: {
      fontSize: '0.85rem',
      color: 'rgba(255, 255, 255, 0.6)',
      marginBottom: '0.5rem'
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#d4af37'
    },
    section: {
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      borderRadius: '16px',
      padding: '2rem',
      marginBottom: '2rem',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    sectionTitle: {
      fontSize: '1.3rem',
      fontWeight: '700',
      marginBottom: '1.5rem',
      color: '#fff'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      textAlign: 'left',
      padding: '1rem',
      borderBottom: '2px solid rgba(212, 175, 55, 0.3)',
      fontSize: '0.85rem',
      fontWeight: '700',
      color: 'rgba(255, 255, 255, 0.8)',
      textTransform: 'uppercase'
    },
    td: {
      padding: '1rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      fontSize: '0.9rem'
    },
    badge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '700',
      display: 'inline-block'
    },
    loading: {
      textAlign: 'center',
      padding: '4rem',
      fontSize: '1.2rem',
      color: 'rgba(255, 255, 255, 0.7)'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>⏳ Caricamento dashboard...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'virtual-tours', label: '🌐 Virtual Tours', icon: '🌐' },
    { id: 'properties', label: '🏠 Properties', icon: '🏠' },
    { id: 'partners', label: '🤝 Partners', icon: '🤝' },
    { id: 'crm', label: '📇 CRM', icon: '📇' },
    { id: 'subscriptions', label: '💳 Abbonamenti CRM', icon: '💳' },
    { id: 'support', label: '🎫 Ticket Supporto', icon: '🎫' }
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>⚙️ Admin Dashboard - AgenzieCase</h1>
        <button
          onClick={onLogout}
          style={styles.logoutButton}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {})
            }}
            onMouseOver={(e) => {
              if (activeTab !== tab.id) {
                e.target.style.color = 'rgba(255, 255, 255, 0.9)';
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== tab.id) {
                e.target.style.color = 'rgba(255, 255, 255, 0.6)';
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: '700' }}>
              Dashboard Overview
            </h2>

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>🏠</div>
                <div style={styles.statLabel}>Total Properties</div>
                <div style={styles.statValue}>{stats?.totalProperties || 0}</div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>🤝</div>
                <div style={styles.statLabel}>Active Partners</div>
                <div style={styles.statValue}>{partners.length || 0}</div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>🌐</div>
                <div style={styles.statLabel}>VT Requests Pending</div>
                <div style={styles.statValue}>{vtRequests.length || 0}</div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>💰</div>
                <div style={styles.statLabel}>Avg Property Price</div>
                <div style={styles.statValue}>
                  €{stats?.avgPrice ? Math.round(stats.avgPrice).toLocaleString() : 0}
                </div>
              </div>
            </div>

            {/* Recent Properties */}
            {properties.length > 0 && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📋 Recent Properties</h3>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Title</th>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Price</th>
                      <th style={styles.th}>City</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.slice(0, 5).map(prop => (
                      <tr key={prop.id}>
                        <td style={styles.td}>#{prop.id}</td>
                        <td style={styles.td}>{prop.title}</td>
                        <td style={styles.td}>{prop.type}</td>
                        <td style={styles.td}>€{prop.price?.toLocaleString()}</td>
                        <td style={styles.td}>{prop.city}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            background: prop.status === 'available' ? '#2ecc71' : '#95a5a6',
                            color: '#fff'
                          }}>
                            {prop.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Quick Actions */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>⚡ Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <button
                  onClick={() => setActiveTab('virtual-tours')}
                  style={{
                    padding: '1rem',
                    background: vtRequests.length > 0
                      ? 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
                      : 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  🌐 Virtual Tours {vtRequests.length > 0 && `(${vtRequests.length})`}
                </button>

                <button
                  onClick={() => setActiveTab('properties')}
                  style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🏠 Manage Properties
                </button>

                <button
                  onClick={() => setActiveTab('partners')}
                  style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🤝 Manage Partners
                </button>

                <button
                  onClick={() => setActiveTab('crm')}
                  style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  📇 CRM Dashboard
                </button>

                <button
                  onClick={() => setActiveTab('subscriptions')}
                  style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  💳 Abbonamenti CRM
                </button>
              </div>
            </div>
          </>
        )}

        {/* VIRTUAL TOURS TAB */}
        {activeTab === 'virtual-tours' && (
          <AdminVirtualTourManager token={token} />
        )}

        {/* PROPERTIES TAB */}
        {activeTab === 'properties' && (
          <AdminPropertiesManager token={token} />
        )}

        {/* PARTNERS TAB */}
        {activeTab === 'partners' && (
          <AdminPartnersManager token={token} />
        )}

        {/* CRM TAB */}
        {activeTab === 'crm' && (
          <AdminCRMManager token={token} />
        )}

        {/* SUBSCRIPTIONS TAB */}
        {activeTab === 'subscriptions' && (
          <AdminCRMSubscriptionsManager token={token} />
        )}

        {/* SUPPORT TICKETS TAB */}
        {activeTab === 'support' && (
          <AdminSupportTicketsManager />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
