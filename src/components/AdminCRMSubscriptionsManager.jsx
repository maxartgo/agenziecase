import { useState, useEffect } from 'react';

/**
 * Admin CRM Subscriptions Manager
 * Gestione completa abbonamenti CRM dei partner
 */
const AdminCRMSubscriptionsManager = ({ token }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, expired, none
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    revenue: 0
  });
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, [filter]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/admin/crm-subscriptions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setSubscriptions(data.subscriptions);
        calculateStats(data.subscriptions);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (subs) => {
    const active = subs.filter(s => s.crmSubscriptionActive && (!s.crmSubscriptionEnd || new Date(s.crmSubscriptionEnd) > new Date()));
    const expired = subs.filter(s => s.crmSubscriptionEnd && new Date(s.crmSubscriptionEnd) < new Date());
    const revenue = active.reduce((sum, s) => sum + (s.crmPaymentType === 'annual' ? s.crmAnnualPrice : s.crmMonthlyPrice), 0);

    setStats({
      total: subs.length,
      active: active.length,
      expired: expired.length,
      revenue: revenue || 0
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getPlanName = (plan) => {
    const plans = {
      'single': 'Singolo',
      'team_5': 'Team 5',
      'team_10': 'Team 10',
      'team_15_plus': 'Team 15+',
      'custom': 'Personalizzato'
    };
    return plans[plan] || plan;
  };

  const handleActivateSubscription = async (teamSize) => {
    if (!selectedPartner) return;

    try {
      setActivating(true);

      const response = await fetch(`http://localhost:3001/api/admin/crm-subscriptions/${selectedPartner.id}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teamSize,
          paymentType: 'annual'
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Abbonamento attivato con successo!');
        setShowActivateModal(false);
        setSelectedPartner(null);
        loadSubscriptions(); // Ricarica la lista
      } else {
        alert('Errore: ' + data.message);
      }
    } catch (error) {
      console.error('Error activating subscription:', error);
      alert('Errore durante l\'attivazione');
    } finally {
      setActivating(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (filter === 'all') return true;
    if (filter === 'active') return sub.crmSubscriptionActive && (!sub.crmSubscriptionEnd || new Date(sub.crmSubscriptionEnd) > new Date());
    if (filter === 'expired') return sub.crmSubscriptionEnd && new Date(sub.crmSubscriptionEnd) < new Date();
    if (filter === 'none') return !sub.crmSubscriptionActive;
    return true;
  });

  const styles = {
    container: {
      padding: '2rem'
    },
    header: {
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#fff',
      marginBottom: '0.5rem'
    },
    subtitle: {
      fontSize: '1rem',
      color: 'rgba(255, 255, 255, 0.7)'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    statCard: {
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      border: '1px solid rgba(22, 160, 133, 0.3)',
      borderRadius: '12px',
      padding: '1.5rem',
      textAlign: 'center'
    },
    statValue: {
      fontSize: '2.5rem',
      fontWeight: '700',
      color: '#16a085',
      marginBottom: '0.5rem'
    },
    statLabel: {
      fontSize: '0.9rem',
      color: 'rgba(255, 255, 255, 0.7)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    filters: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem'
    },
    filterButton: {
      padding: '0.75rem 1.5rem',
      background: 'rgba(22, 160, 133, 0.1)',
      border: '1px solid rgba(22, 160, 133, 0.3)',
      borderRadius: '8px',
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s'
    },
    filterButtonActive: {
      background: '#16a085',
      color: '#fff',
      borderColor: '#16a085'
    },
    table: {
      width: '100%',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid rgba(22, 160, 133, 0.3)'
    },
    tableHeader: {
      background: 'rgba(22, 160, 133, 0.2)',
      borderBottom: '1px solid rgba(22, 160, 133, 0.3)'
    },
    th: {
      padding: '1rem',
      textAlign: 'left',
      fontSize: '0.85rem',
      fontWeight: '600',
      color: '#16a085',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    td: {
      padding: '1rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      fontSize: '0.9rem',
      color: 'rgba(255, 255, 255, 0.9)'
    },
    badge: {
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase'
    },
    badgeActive: {
      background: 'rgba(22, 160, 133, 0.2)',
      color: '#16a085',
      border: '1px solid #16a085'
    },
    badgeExpired: {
      background: 'rgba(231, 76, 60, 0.2)',
      color: '#e74c3c',
      border: '1px solid #e74c3c'
    },
    badgeNone: {
      background: 'rgba(149, 165, 166, 0.2)',
      color: '#95a5a6',
      border: '1px solid #95a5a6'
    },
    loading: {
      textAlign: 'center',
      padding: '3rem',
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '1.1rem'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      color: 'rgba(255, 255, 255, 0.7)'
    },
    actionButton: {
      padding: '0.5rem 1rem',
      background: 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)',
      border: 'none',
      borderRadius: '6px',
      color: '#fff',
      fontSize: '0.85rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modal: {
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      borderRadius: '16px',
      padding: '2rem',
      maxWidth: '600px',
      width: '90%',
      border: '1px solid rgba(22, 160, 133, 0.3)',
      maxHeight: '80vh',
      overflowY: 'auto'
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#16a085',
      marginBottom: '1rem'
    },
    plansGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '1rem',
      marginTop: '1.5rem'
    },
    planCard: {
      background: 'rgba(22, 160, 133, 0.1)',
      border: '2px solid rgba(22, 160, 133, 0.3)',
      borderRadius: '12px',
      padding: '1.5rem 1rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s'
    },
    planCardHover: {
      borderColor: '#16a085',
      transform: 'scale(1.05)',
      background: 'rgba(22, 160, 133, 0.2)'
    },
    planTeamSize: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#16a085',
      marginBottom: '0.5rem'
    },
    planPrice: {
      fontSize: '0.9rem',
      color: 'rgba(255, 255, 255, 0.7)',
      marginBottom: '0.25rem'
    },
    cancelButton: {
      padding: '0.75rem 1.5rem',
      background: 'rgba(231, 76, 60, 0.2)',
      border: '1px solid #e74c3c',
      borderRadius: '8px',
      color: '#e74c3c',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '1.5rem',
      width: '100%'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Caricamento abbonamenti...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>💳 Gestione Abbonamenti CRM</h1>
        <p style={styles.subtitle}>
          Monitora e gestisci tutti gli abbonamenti CRM dei partner
        </p>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>Partner Totali</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.active}</div>
          <div style={styles.statLabel}>Abbonamenti Attivi</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.expired}</div>
          <div style={styles.statLabel}>Scaduti</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>€{stats.revenue.toLocaleString()}</div>
          <div style={styles.statLabel}>Revenue Mensile</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        {[
          { id: 'all', label: 'Tutti' },
          { id: 'active', label: 'Attivi' },
          { id: 'expired', label: 'Scaduti' },
          { id: 'none', label: 'Nessun abbonamento' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              ...styles.filterButton,
              ...(filter === f.id ? styles.filterButtonActive : {})
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {filteredSubscriptions.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <div>Nessun abbonamento trovato</div>
        </div>
      ) : (
        <div style={styles.table}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.th}>Partner</th>
                <th style={styles.th}>Piano</th>
                <th style={styles.th}>Team Size</th>
                <th style={styles.th}>Prezzo</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Inizio</th>
                <th style={styles.th}>Fine</th>
                <th style={styles.th}>Giorni Rimasti</th>
                <th style={styles.th}>Stato</th>
                <th style={styles.th}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((sub) => {
                const daysRemaining = getDaysRemaining(sub.crmSubscriptionEnd);
                const isActive = sub.crmSubscriptionActive && (!sub.crmSubscriptionEnd || daysRemaining > 0);
                const isExpired = sub.crmSubscriptionEnd && daysRemaining <= 0;

                return (
                  <tr key={sub.id}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: '600' }}>{sub.companyName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                        {sub.email}
                      </div>
                    </td>
                    <td style={styles.td}>
                      {sub.crmSubscriptionPlan ? getPlanName(sub.crmSubscriptionPlan) : '-'}
                    </td>
                    <td style={styles.td}>
                      {sub.crmTeamSize ? `${sub.crmTeamSize} ${sub.crmTeamSize === 1 ? 'persona' : 'persone'}` : '-'}
                    </td>
                    <td style={styles.td}>
                      {sub.crmPaymentType === 'annual'
                        ? `€${sub.crmAnnualPrice || 0}/anno`
                        : sub.crmPaymentType === 'monthly'
                        ? `€${sub.crmMonthlyPrice || 0}/mese`
                        : '-'}
                    </td>
                    <td style={styles.td}>
                      {sub.crmPaymentType === 'annual' ? 'Annuale' :
                       sub.crmPaymentType === 'monthly' ? 'Mensile' : '-'}
                    </td>
                    <td style={styles.td}>
                      {formatDate(sub.crmSubscriptionStart)}
                    </td>
                    <td style={styles.td}>
                      {formatDate(sub.crmSubscriptionEnd)}
                    </td>
                    <td style={styles.td}>
                      {daysRemaining !== null ? (
                        <span style={{ color: daysRemaining < 30 ? '#f39c12' : '#16a085' }}>
                          {daysRemaining > 0 ? `${daysRemaining} giorni` : 'Scaduto'}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={styles.td}>
                      {isActive ? (
                        <span style={{ ...styles.badge, ...styles.badgeActive }}>
                          Attivo
                        </span>
                      ) : isExpired ? (
                        <span style={{ ...styles.badge, ...styles.badgeExpired }}>
                          Scaduto
                        </span>
                      ) : (
                        <span style={{ ...styles.badge, ...styles.badgeNone }}>
                          Nessuno
                        </span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {!isActive && (
                        <button
                          onClick={() => {
                            setSelectedPartner(sub);
                            setShowActivateModal(true);
                          }}
                          style={styles.actionButton}
                          onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(22, 160, 133, 0.4)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          Attiva
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Activate Subscription Modal */}
      {showActivateModal && selectedPartner && (
        <div style={styles.modalOverlay} onClick={() => !activating && setShowActivateModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              Attiva Abbonamento CRM
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1rem' }}>
              Partner: <strong>{selectedPartner.companyName}</strong>
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem' }}>
              Seleziona il piano da attivare:
            </p>

            <div style={styles.plansGrid}>
              {[
                { teamSize: 1, price: 264 },
                { teamSize: 5, price: 660 },
                { teamSize: 10, price: 1200 },
                { teamSize: 15, price: 1620 },
                { teamSize: 20, price: 2160 },
                { teamSize: 30, price: 3240 },
                { teamSize: 40, price: 4320 },
                { teamSize: 50, price: 5400 }
              ].map((plan) => (
                <div
                  key={plan.teamSize}
                  onClick={() => !activating && handleActivateSubscription(plan.teamSize)}
                  style={styles.planCard}
                  onMouseOver={(e) => {
                    if (!activating) {
                      e.currentTarget.style.borderColor = '#16a085';
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.background = 'rgba(22, 160, 133, 0.2)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!activating) {
                      e.currentTarget.style.borderColor = 'rgba(22, 160, 133, 0.3)';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.background = 'rgba(22, 160, 133, 0.1)';
                    }
                  }}
                >
                  <div style={styles.planTeamSize}>{plan.teamSize}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>
                    {plan.teamSize === 1 ? 'persona' : 'persone'}
                  </div>
                  <div style={styles.planPrice}>€{plan.price}/anno</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                    €{Math.round(plan.price / 12)}/mese
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowActivateModal(false)}
              disabled={activating}
              style={styles.cancelButton}
              onMouseOver={(e) => {
                if (!activating) {
                  e.target.style.background = 'rgba(231, 76, 60, 0.3)';
                }
              }}
              onMouseOut={(e) => {
                if (!activating) {
                  e.target.style.background = 'rgba(231, 76, 60, 0.2)';
                }
              }}
            >
              {activating ? 'Attivazione in corso...' : 'Annulla'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCRMSubscriptionsManager;
