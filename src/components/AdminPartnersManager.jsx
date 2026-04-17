import { useState, useEffect } from 'react';

/**
 * Admin Partners Manager
 * Gestione partners: Approve/Reject, Subscriptions, Stats
 */
const AdminPartnersManager = ({ token }) => {
  const [partners, setPartners] = useState([]);
  const [pendingPartners, setPendingPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('all'); // all, pending, approved

  useEffect(() => {
    loadPartners();
  }, [activeView]);

  const loadPartners = async () => {
    try {
      setLoading(true);

      // Load all partners
      const response = await fetch('http://localhost:3001/api/partners', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        const allPartners = data.partners || [];
        setPartners(allPartners);

        // Filter pending partners
        const pending = allPartners.filter(p => p.status === 'pending');
        setPendingPartners(pending);
      }
    } catch (error) {
      console.error('Error loading partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (partnerId) => {
    if (!confirm('Approvare questo partner?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/partners/${partnerId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('Partner approvato con successo!');
        loadPartners();
      } else {
        alert('Errore: ' + data.message);
      }
    } catch (error) {
      console.error('Error approving partner:', error);
      alert('Errore durante l\'approvazione');
    }
  };

  const handleReject = async (partnerId) => {
    const reason = prompt('Motivo del rifiuto:');
    if (!reason) return;

    try {
      const response = await fetch(`http://localhost:3001/api/partners/${partnerId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();
      if (data.success) {
        alert('Partner rifiutato');
        loadPartners();
      } else {
        alert('Errore: ' + data.message);
      }
    } catch (error) {
      console.error('Error rejecting partner:', error);
      alert('Errore durante il rifiuto');
    }
  };

  const handleSuspend = async (partnerId) => {
    if (!confirm('Sospendere questo partner?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/partners/${partnerId}/suspend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('Partner sospeso');
        loadPartners();
      } else {
        alert('Errore: ' + data.message);
      }
    } catch (error) {
      console.error('Error suspending partner:', error);
      alert('Errore durante la sospensione');
    }
  };

  const handleActivate = async (partnerId) => {
    if (!confirm('Riattivare questo partner?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/partners/${partnerId}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('Partner riattivato');
        loadPartners();
      } else {
        alert('Errore: ' + data.message);
      }
    } catch (error) {
      console.error('Error activating partner:', error);
      alert('Errore durante l\'attivazione');
    }
  };

  const styles = {
    container: {
      width: '100%'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem'
    },
    title: {
      fontSize: '1.8rem',
      fontWeight: '700',
      color: '#fff'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    statCard: {
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      textAlign: 'center'
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
      color: '#9b59b6'
    },
    viewButtons: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
      paddingBottom: '0.5rem'
    },
    viewButton: {
      padding: '0.75rem 1.5rem',
      background: 'transparent',
      border: 'none',
      borderBottom: '3px solid transparent',
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    viewButtonActive: {
      color: '#9b59b6',
      borderBottomColor: '#9b59b6'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      borderRadius: '12px',
      overflow: 'hidden'
    },
    th: {
      textAlign: 'left',
      padding: '1rem',
      borderBottom: '2px solid rgba(155, 89, 182, 0.3)',
      fontSize: '0.85rem',
      fontWeight: '700',
      color: 'rgba(255, 255, 255, 0.8)',
      textTransform: 'uppercase'
    },
    td: {
      padding: '1rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      fontSize: '0.9rem',
      color: 'rgba(255, 255, 255, 0.9)'
    },
    actionButton: {
      padding: '0.4rem 0.8rem',
      margin: '0 0.25rem',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.8rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    approveButton: {
      background: '#2ecc71',
      color: '#fff'
    },
    rejectButton: {
      background: '#e74c3c',
      color: '#fff'
    },
    suspendButton: {
      background: '#f39c12',
      color: '#fff'
    },
    activateButton: {
      background: '#3498db',
      color: '#fff'
    },
    badge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '700',
      display: 'inline-block'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '1.1rem'
    },
    loading: {
      textAlign: 'center',
      padding: '2rem',
      fontSize: '1.1rem',
      color: 'rgba(255, 255, 255, 0.7)'
    }
  };

  const getBadgeStyle = (status) => {
    const colors = {
      active: '#2ecc71',
      pending: '#f39c12',
      suspended: '#e74c3c',
      rejected: '#95a5a6'
    };
    return {
      ...styles.badge,
      background: colors[status] || '#95a5a6',
      color: '#fff'
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getPlanBadge = (plan) => {
    const colors = {
      starter: '#3498db',
      business: '#9b59b6',
      professional: '#d4af37',
      free: '#95a5a6'
    };
    return {
      ...styles.badge,
      background: colors[plan] || '#95a5a6',
      color: '#fff'
    };
  };

  const getFilteredPartners = () => {
    if (activeView === 'pending') {
      return partners.filter(p => p.status === 'pending');
    } else if (activeView === 'approved') {
      return partners.filter(p => p.status === 'active');
    }
    return partners;
  };

  const filteredPartners = getFilteredPartners();

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>🤝 Partners Management</h2>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statLabel}>Total Partners</div>
          <div style={styles.statValue}>{partners.length}</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>⏳</div>
          <div style={styles.statLabel}>Pending Approval</div>
          <div style={styles.statValue}>{pendingPartners.length}</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statLabel}>Active Partners</div>
          <div style={styles.statValue}>
            {partners.filter(p => p.status === 'active').length}
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>⭐</div>
          <div style={styles.statLabel}>Premium Plans</div>
          <div style={styles.statValue}>
            {partners.filter(p => ['business', 'professional'].includes(p.vtPlan)).length}
          </div>
        </div>
      </div>

      {/* View Filters */}
      <div style={styles.viewButtons}>
        <button
          onClick={() => setActiveView('all')}
          style={{
            ...styles.viewButton,
            ...(activeView === 'all' ? styles.viewButtonActive : {})
          }}
        >
          Tutti ({partners.length})
        </button>
        <button
          onClick={() => setActiveView('pending')}
          style={{
            ...styles.viewButton,
            ...(activeView === 'pending' ? styles.viewButtonActive : {})
          }}
        >
          In Attesa ({pendingPartners.length})
        </button>
        <button
          onClick={() => setActiveView('approved')}
          style={{
            ...styles.viewButton,
            ...(activeView === 'approved' ? styles.viewButtonActive : {})
          }}
        >
          Approvati ({partners.filter(p => p.status === 'active').length})
        </button>
      </div>

      {/* Partners Table */}
      {loading ? (
        <div style={styles.loading}>⏳ Caricamento partners...</div>
      ) : filteredPartners.length === 0 ? (
        <div style={styles.emptyState}>
          Nessun partner trovato in questa categoria.
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Agenzia</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Città</th>
              <th style={styles.th}>Piano VT</th>
              <th style={styles.th}>Crediti</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Registrato</th>
              <th style={styles.th}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredPartners.map(partner => (
              <tr key={partner.id}>
                <td style={styles.td}>#{partner.id}</td>
                <td style={styles.td}>
                  <div style={{ fontWeight: '600' }}>{partner.agencyName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    {partner.contactName}
                  </div>
                </td>
                <td style={styles.td}>{partner.email}</td>
                <td style={styles.td}>{partner.city || '-'}</td>
                <td style={styles.td}>
                  <span style={getPlanBadge(partner.vtPlan || 'free')}>
                    {(partner.vtPlan || 'free').toUpperCase()}
                  </span>
                </td>
                <td style={styles.td}>
                  {partner.vtCreditsRemaining !== undefined
                    ? `${partner.vtCreditsRemaining} / ${partner.vtCreditsMonthly || 0}`
                    : '-'}
                </td>
                <td style={styles.td}>
                  <span style={getBadgeStyle(partner.status)}>
                    {partner.status}
                  </span>
                </td>
                <td style={styles.td}>{formatDate(partner.createdAt)}</td>
                <td style={styles.td}>
                  {partner.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(partner.id)}
                        style={{...styles.actionButton, ...styles.approveButton}}
                      >
                        Approva
                      </button>
                      <button
                        onClick={() => handleReject(partner.id)}
                        style={{...styles.actionButton, ...styles.rejectButton}}
                      >
                        Rifiuta
                      </button>
                    </>
                  )}
                  {partner.status === 'active' && (
                    <button
                      onClick={() => handleSuspend(partner.id)}
                      style={{...styles.actionButton, ...styles.suspendButton}}
                    >
                      Sospendi
                    </button>
                  )}
                  {partner.status === 'suspended' && (
                    <button
                      onClick={() => handleActivate(partner.id)}
                      style={{...styles.actionButton, ...styles.activateButton}}
                    >
                      Riattiva
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPartnersManager;
