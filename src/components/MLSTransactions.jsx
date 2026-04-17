import { useState, useEffect } from 'react';

/**
 * Componente per gestire le transazioni MLS completate
 * Permette di registrare vendite e calcolare split commissioni
 */
const MLSTransactions = ({ token }) => {
  const [transactions, setTransactions] = useState([]);
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const [newTransaction, setNewTransaction] = useState({
    collaborationId: '',
    salePrice: '',
    totalCommission: '',
    saleDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (token) {
      loadTransactions();
      loadActiveCollaborations();
    }
  }, [token, filterStatus]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/mls/transactions${filterStatus !== 'all' ? `?status=${filterStatus}` : ''}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveCollaborations = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/mls/collaborations/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setCollaborations(data.collaborations || []);
      }
    } catch (error) {
      console.error('Error loading collaborations:', error);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/api/mls/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTransaction)
      });

      const data = await response.json();
      if (data.success) {
        setShowAddModal(false);
        setNewTransaction({
          collaborationId: '',
          salePrice: '',
          totalCommission: '',
          saleDate: new Date().toISOString().split('T')[0],
          notes: ''
        });
        loadTransactions();
        loadActiveCollaborations();
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const handleMarkAsPaid = async (transactionId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/mls/transactions/${transactionId}/mark-paid`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        loadTransactions();
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      completed: '#27ae60',
      cancelled: '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: '#e67e22',
      paid: '#27ae60',
      partial: '#f39c12'
    };
    return colors[status] || '#95a5a6';
  };

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#d4af37',
      marginBottom: '0.5rem',
      fontFamily: "'Playfair Display', serif"
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '1rem'
    },
    filters: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    filterButtons: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap'
    },
    filterButton: {
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      border: '2px solid rgba(212, 175, 55, 0.3)',
      background: 'rgba(255, 255, 255, 0.05)',
      color: 'rgba(255, 255, 255, 0.7)',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontSize: '0.9rem',
      fontWeight: '600'
    },
    filterButtonActive: {
      background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
      color: '#0a0a0a',
      borderColor: '#d4af37'
    },
    addButton: {
      padding: '0.75rem 1.5rem',
      borderRadius: '10px',
      background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
      color: '#0a0a0a',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.95rem',
      transition: 'all 0.3s'
    },
    transactionsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    transactionCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '15px',
      padding: '2rem',
      border: '2px solid rgba(212, 175, 55, 0.2)',
      transition: 'all 0.3s'
    },
    transactionCardHover: {
      borderColor: '#d4af37',
      boxShadow: '0 10px 30px rgba(212, 175, 55, 0.3)'
    },
    transactionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    transactionTitle: {
      fontSize: '1.3rem',
      fontWeight: '700',
      color: '#fff',
      marginBottom: '0.5rem'
    },
    badges: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap'
    },
    badge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600'
    },
    transactionDetails: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '1.5rem'
    },
    detailCard: {
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '10px',
      padding: '1rem',
      border: '1px solid rgba(212, 175, 55, 0.1)'
    },
    detailLabel: {
      fontSize: '0.8rem',
      color: 'rgba(255, 255, 255, 0.6)',
      marginBottom: '0.5rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    detailValue: {
      fontSize: '1.2rem',
      fontWeight: '700',
      color: '#d4af37'
    },
    commissionBreakdown: {
      background: 'rgba(212, 175, 55, 0.1)',
      borderRadius: '10px',
      padding: '1.5rem',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      marginTop: '1rem'
    },
    breakdownTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#d4af37',
      marginBottom: '1rem'
    },
    breakdownRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.75rem 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    breakdownLabel: {
      color: 'rgba(255, 255, 255, 0.8)'
    },
    breakdownValue: {
      fontWeight: '600',
      color: '#fff'
    },
    actions: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1.5rem',
      flexWrap: 'wrap'
    },
    actionButton: {
      padding: '0.75rem 1.5rem',
      borderRadius: '10px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.9rem',
      transition: 'all 0.3s'
    },
    emptyState: {
      textAlign: 'center',
      padding: '4rem 2rem',
      color: 'rgba(255, 255, 255, 0.5)'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      padding: '1rem'
    },
    modalContent: {
      backgroundColor: '#1a1a2e',
      borderRadius: '20px',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 20px 60px rgba(212, 175, 55, 0.3)',
      border: '2px solid #d4af37'
    },
    modalHeader: {
      background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
      padding: '2rem',
      borderRadius: '20px 20px 0 0',
      color: '#0a0a0a'
    },
    modalBody: {
      padding: '2rem'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    label: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#d4af37'
    },
    input: {
      padding: '0.75rem',
      borderRadius: '10px',
      border: '2px solid rgba(212, 175, 55, 0.3)',
      background: 'rgba(255, 255, 255, 0.05)',
      color: '#fff',
      fontSize: '1rem'
    },
    select: {
      padding: '0.75rem',
      borderRadius: '10px',
      border: '2px solid rgba(212, 175, 55, 0.3)',
      background: 'rgba(255, 255, 255, 0.05)',
      color: '#fff',
      fontSize: '1rem',
      cursor: 'pointer'
    },
    textarea: {
      padding: '0.75rem',
      borderRadius: '10px',
      border: '2px solid rgba(212, 175, 55, 0.3)',
      background: 'rgba(255, 255, 255, 0.05)',
      color: '#fff',
      fontSize: '1rem',
      minHeight: '100px',
      resize: 'vertical'
    },
    infoBox: {
      background: 'rgba(52, 152, 219, 0.1)',
      border: '1px solid rgba(52, 152, 219, 0.3)',
      borderRadius: '10px',
      padding: '1rem',
      marginTop: '1rem',
      fontSize: '0.85rem',
      color: 'rgba(255, 255, 255, 0.7)',
      lineHeight: '1.6'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>💰 Transazioni MLS</h1>
        <p style={styles.subtitle}>
          Gestisci le vendite completate e il calcolo delle commissioni
        </p>
      </div>

      <div style={styles.filters}>
        <div style={styles.filterButtons}>
          {['all', 'pending', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                ...styles.filterButton,
                ...(filterStatus === status ? styles.filterButtonActive : {})
              }}
            >
              {status === 'all' ? 'Tutte' : status === 'pending' ? 'In Attesa' : status === 'completed' ? 'Completate' : 'Annullate'}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={styles.addButton}
        >
          + Registra Vendita
        </button>
      </div>

      {loading ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <div>Caricamento transazioni...</div>
        </div>
      ) : transactions.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Nessuna transazione trovata</div>
          <div>Le vendite completate appariranno qui con il calcolo automatico delle commissioni</div>
        </div>
      ) : (
        <div style={styles.transactionsList}>
          {transactions.map(tx => (
            <div
              key={tx.id}
              style={styles.transactionCard}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.transactionCardHover);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={styles.transactionHeader}>
                <div>
                  <div style={styles.transactionTitle}>
                    {tx.property_title || `Immobile #${tx.property_id}`}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
                    {tx.property_city && `${tx.property_city} • `}
                    Venduto il {new Date(tx.sale_date).toLocaleDateString('it-IT')}
                  </div>
                </div>
                <div style={styles.badges}>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: getStatusColor(tx.status),
                      color: '#fff'
                    }}
                  >
                    {tx.status === 'pending' ? 'In Attesa' : tx.status === 'completed' ? 'Completata' : 'Annullata'}
                  </span>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: getPaymentStatusColor(tx.payment_status),
                      color: '#fff'
                    }}
                  >
                    {tx.payment_status === 'pending' ? '💳 Da Pagare' : tx.payment_status === 'paid' ? '✅ Pagato' : '⏱️ Parziale'}
                  </span>
                </div>
              </div>

              <div style={styles.transactionDetails}>
                <div style={styles.detailCard}>
                  <div style={styles.detailLabel}>Prezzo di Vendita</div>
                  <div style={styles.detailValue}>{formatCurrency(tx.sale_price)}</div>
                </div>

                <div style={styles.detailCard}>
                  <div style={styles.detailLabel}>Commissione Totale</div>
                  <div style={styles.detailValue}>{formatCurrency(tx.total_commission)}</div>
                </div>

                <div style={styles.detailCard}>
                  <div style={styles.detailLabel}>% Commissione</div>
                  <div style={styles.detailValue}>
                    {((tx.total_commission / tx.sale_price) * 100).toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Commission Breakdown */}
              <div style={styles.commissionBreakdown}>
                <div style={styles.breakdownTitle}>📊 Ripartizione Commissioni</div>

                <div style={styles.breakdownRow}>
                  <span style={styles.breakdownLabel}>
                    🏢 {tx.listing_partner_name || 'Partner Listing'}
                  </span>
                  <span style={styles.breakdownValue}>
                    {formatCurrency(tx.listing_agent_commission)}
                  </span>
                </div>

                {tx.collaborating_partner_name && (
                  <div style={styles.breakdownRow}>
                    <span style={styles.breakdownLabel}>
                      🤝 {tx.collaborating_partner_name}
                    </span>
                    <span style={styles.breakdownValue}>
                      {formatCurrency(tx.collaborating_agent_commission)}
                    </span>
                  </div>
                )}

                <div style={{ ...styles.breakdownRow, borderBottom: 'none', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '2px solid rgba(212, 175, 55, 0.5)' }}>
                  <span style={{ ...styles.breakdownLabel, fontWeight: '700', color: '#d4af37' }}>
                    Totale
                  </span>
                  <span style={{ ...styles.breakdownValue, fontSize: '1.1rem', color: '#d4af37' }}>
                    {formatCurrency(tx.total_commission)}
                  </span>
                </div>
              </div>

              {tx.notes && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>Note:</div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>{tx.notes}</div>
                </div>
              )}

              <div style={styles.actions}>
                {tx.payment_status === 'pending' && (
                  <button
                    onClick={() => handleMarkAsPaid(tx.id)}
                    style={{
                      ...styles.actionButton,
                      background: '#27ae60',
                      color: '#fff'
                    }}
                  >
                    ✅ Segna come Pagato
                  </button>
                )}

                {tx.payment_date && (
                  <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                    💳 Pagato il {new Date(tx.payment_date).toLocaleDateString('it-IT')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div style={styles.modal} onClick={() => setShowAddModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>💰 Registra Nuova Vendita</h2>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={handleAddTransaction} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Collaborazione *</label>
                  <select
                    value={newTransaction.collaborationId}
                    onChange={(e) => setNewTransaction({ ...newTransaction, collaborationId: e.target.value })}
                    style={styles.select}
                    required
                  >
                    <option value="">Seleziona collaborazione...</option>
                    {collaborations.map(collab => (
                      <option key={collab.id} value={collab.id}>
                        {collab.property_title} - {collab.collaborating_partner_name} ({collab.commission_split}% split)
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Prezzo di Vendita (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTransaction.salePrice}
                    onChange={(e) => setNewTransaction({ ...newTransaction, salePrice: e.target.value })}
                    style={styles.input}
                    placeholder="250000"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Commissione Totale (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTransaction.totalCommission}
                    onChange={(e) => setNewTransaction({ ...newTransaction, totalCommission: e.target.value })}
                    style={styles.input}
                    placeholder="7500"
                    required
                  />
                  {newTransaction.salePrice && newTransaction.totalCommission && (
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.5rem' }}>
                      {((parseFloat(newTransaction.totalCommission) / parseFloat(newTransaction.salePrice)) * 100).toFixed(2)}% del prezzo di vendita
                    </div>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Data di Vendita *</label>
                  <input
                    type="date"
                    value={newTransaction.saleDate}
                    onChange={(e) => setNewTransaction({ ...newTransaction, saleDate: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Note</label>
                  <textarea
                    value={newTransaction.notes}
                    onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                    style={styles.textarea}
                    placeholder="Note aggiuntive sulla vendita..."
                  />
                </div>

                <div style={styles.infoBox}>
                  <div style={{ fontWeight: '600', color: '#3498db', marginBottom: '0.5rem' }}>ℹ️ Calcolo Automatico Commissioni</div>
                  <div>
                    Il sistema calcolerà automaticamente lo split delle commissioni in base alla percentuale
                    concordata nella collaborazione. Entrambi i partner riceveranno la loro quota secondo l'accordo.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    type="submit"
                    style={{
                      ...styles.addButton,
                      flex: 1
                    }}
                  >
                    💰 Registra Vendita
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{
                      ...styles.actionButton,
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      flex: 1
                    }}
                  >
                    Annulla
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MLSTransactions;
