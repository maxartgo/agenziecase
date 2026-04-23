import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';


/**
 * Componente per gestire i lead generati da collaborazioni MLS
 * Permette di tracciare i contatti portati da altri partner
 */
const MLSLeads = ({ token }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Nuovo lead form
  const [newLead, setNewLead] = useState({
    propertyId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: '',
    leadQuality: 'medium'
  });

  const [properties, setProperties] = useState([]);

  useEffect(() => {
    if (token) {
      loadLeads();
      loadMyProperties();
    }
  }, [token, filterStatus]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/mls/leads${filterStatus !== 'all' ? `?status=${filterStatus}` : ''}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error('Error loading MLS leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyProperties = async () => {
    try {
      const response = await fetch('${API_BASE_URL}/api/properties?my=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success || data.properties) {
        setProperties(data.properties || data.results || []);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('${API_BASE_URL}/api/mls/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newLead)
      });

      const data = await response.json();
      if (data.success) {
        setShowAddModal(false);
        setNewLead({
          propertyId: '',
          clientName: '',
          clientEmail: '',
          clientPhone: '',
          notes: '',
          leadQuality: 'medium'
        });
        loadLeads();
      }
    } catch (error) {
      console.error('Error adding lead:', error);
    }
  };

  const handleUpdateLeadStatus = async (leadId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/mls/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        loadLeads();
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: '#3498db',
      contacted: '#9b59b6',
      qualified: '#f39c12',
      visit_scheduled: '#e67e22',
      offer_made: '#16a085',
      closed_won: '#27ae60',
      closed_lost: '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  const getStatusLabel = (status) => {
    const labels = {
      new: 'Nuovo',
      contacted: 'Contattato',
      qualified: 'Qualificato',
      visit_scheduled: 'Visita Programmata',
      offer_made: 'Offerta Fatta',
      closed_won: 'Venduto',
      closed_lost: 'Perso'
    };
    return labels[status] || status;
  };

  const getQualityColor = (quality) => {
    const colors = {
      high: '#27ae60',
      medium: '#f39c12',
      low: '#e74c3c'
    };
    return colors[quality] || '#95a5a6';
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
    leadsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '1.5rem'
    },
    leadCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '15px',
      padding: '1.5rem',
      border: '2px solid rgba(212, 175, 55, 0.2)',
      transition: 'all 0.3s',
      cursor: 'pointer'
    },
    leadCardHover: {
      transform: 'translateY(-5px)',
      borderColor: '#d4af37',
      boxShadow: '0 10px 30px rgba(212, 175, 55, 0.3)'
    },
    leadHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem'
    },
    leadTitle: {
      fontSize: '1.1rem',
      fontWeight: '700',
      color: '#fff',
      marginBottom: '0.25rem'
    },
    statusBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600',
      whiteSpace: 'nowrap'
    },
    qualityBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
      marginTop: '0.5rem',
      display: 'inline-block'
    },
    leadInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      marginTop: '1rem'
    },
    infoRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: '0.9rem'
    },
    leadActions: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem',
      flexWrap: 'wrap'
    },
    actionButton: {
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.85rem',
      fontWeight: '600',
      transition: 'all 0.2s'
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
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📋 Lead MLS</h1>
        <p style={styles.subtitle}>
          Gestisci i contatti generati dalle collaborazioni MLS
        </p>
      </div>

      <div style={styles.filters}>
        <div style={styles.filterButtons}>
          {['all', 'new', 'contacted', 'qualified', 'visit_scheduled', 'offer_made', 'closed_won', 'closed_lost'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                ...styles.filterButton,
                ...(filterStatus === status ? styles.filterButtonActive : {})
              }}
            >
              {status === 'all' ? 'Tutti' : getStatusLabel(status)}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={styles.addButton}
        >
          + Aggiungi Lead
        </button>
      </div>

      {loading ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <div>Caricamento lead...</div>
        </div>
      ) : leads.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Nessun lead trovato</div>
          <div>I lead generati dalle collaborazioni appariranno qui</div>
        </div>
      ) : (
        <div style={styles.leadsGrid}>
          {leads.map(lead => (
            <div
              key={lead.id}
              style={styles.leadCard}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.leadCardHover);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onClick={() => {
                setSelectedLead(lead);
                setShowDetailModal(true);
              }}
            >
              <div style={styles.leadHeader}>
                <div>
                  <div style={styles.leadTitle}>{lead.client_name}</div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>
                    {lead.property_title || `Immobile #${lead.property_id}`}
                  </div>
                </div>
                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(lead.status),
                    color: '#fff'
                  }}
                >
                  {getStatusLabel(lead.status)}
                </span>
              </div>

              {lead.lead_quality && (
                <span
                  style={{
                    ...styles.qualityBadge,
                    backgroundColor: getQualityColor(lead.lead_quality),
                    color: '#fff'
                  }}
                >
                  {lead.lead_quality === 'high' ? '⭐ Alta Qualità' : lead.lead_quality === 'medium' ? '📊 Media Qualità' : '📉 Bassa Qualità'}
                </span>
              )}

              <div style={styles.leadInfo}>
                {lead.client_email && (
                  <div style={styles.infoRow}>
                    <span>📧</span>
                    <span>{lead.client_email}</span>
                  </div>
                )}
                {lead.client_phone && (
                  <div style={styles.infoRow}>
                    <span>📞</span>
                    <span>{lead.client_phone}</span>
                  </div>
                )}
                {lead.source_partner_name && (
                  <div style={styles.infoRow}>
                    <span>🤝</span>
                    <span>Da: {lead.source_partner_name}</span>
                  </div>
                )}
                {lead.created_at && (
                  <div style={styles.infoRow}>
                    <span>📅</span>
                    <span>{new Date(lead.created_at).toLocaleDateString('it-IT')}</span>
                  </div>
                )}
              </div>

              <div style={styles.leadActions} onClick={(e) => e.stopPropagation()}>
                {lead.status !== 'closed_won' && lead.status !== 'closed_lost' && (
                  <>
                    {lead.status === 'new' && (
                      <button
                        onClick={() => handleUpdateLeadStatus(lead.id, 'contacted')}
                        style={{
                          ...styles.actionButton,
                          background: '#3498db',
                          color: '#fff'
                        }}
                      >
                        Segna Contattato
                      </button>
                    )}
                    {lead.status === 'contacted' && (
                      <button
                        onClick={() => handleUpdateLeadStatus(lead.id, 'qualified')}
                        style={{
                          ...styles.actionButton,
                          background: '#9b59b6',
                          color: '#fff'
                        }}
                      >
                        Qualifica
                      </button>
                    )}
                    {(lead.status === 'qualified' || lead.status === 'contacted') && (
                      <button
                        onClick={() => handleUpdateLeadStatus(lead.id, 'visit_scheduled')}
                        style={{
                          ...styles.actionButton,
                          background: '#e67e22',
                          color: '#fff'
                        }}
                      >
                        Programma Visita
                      </button>
                    )}
                    {['qualified', 'visit_scheduled'].includes(lead.status) && (
                      <button
                        onClick={() => handleUpdateLeadStatus(lead.id, 'offer_made')}
                        style={{
                          ...styles.actionButton,
                          background: '#16a085',
                          color: '#fff'
                        }}
                      >
                        Offerta Fatta
                      </button>
                    )}
                    {lead.status === 'offer_made' && (
                      <>
                        <button
                          onClick={() => handleUpdateLeadStatus(lead.id, 'closed_won')}
                          style={{
                            ...styles.actionButton,
                            background: '#27ae60',
                            color: '#fff'
                          }}
                        >
                          ✅ Venduto
                        </button>
                        <button
                          onClick={() => handleUpdateLeadStatus(lead.id, 'closed_lost')}
                          style={{
                            ...styles.actionButton,
                            background: '#e74c3c',
                            color: '#fff'
                          }}
                        >
                          ❌ Perso
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div style={styles.modal} onClick={() => setShowAddModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>➕ Aggiungi Nuovo Lead</h2>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={handleAddLead} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Immobile *</label>
                  <select
                    value={newLead.propertyId}
                    onChange={(e) => setNewLead({ ...newLead, propertyId: e.target.value })}
                    style={styles.select}
                    required
                  >
                    <option value="">Seleziona immobile...</option>
                    {properties.map(prop => (
                      <option key={prop.id} value={prop.id}>
                        {prop.title} - {prop.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Nome Cliente *</label>
                  <input
                    type="text"
                    value={newLead.clientName}
                    onChange={(e) => setNewLead({ ...newLead, clientName: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    value={newLead.clientEmail}
                    onChange={(e) => setNewLead({ ...newLead, clientEmail: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Telefono</label>
                  <input
                    type="tel"
                    value={newLead.clientPhone}
                    onChange={(e) => setNewLead({ ...newLead, clientPhone: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Qualità Lead</label>
                  <select
                    value={newLead.leadQuality}
                    onChange={(e) => setNewLead({ ...newLead, leadQuality: e.target.value })}
                    style={styles.select}
                  >
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Bassa</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Note</label>
                  <textarea
                    value={newLead.notes}
                    onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                    style={styles.textarea}
                    placeholder="Note aggiuntive sul lead..."
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    type="submit"
                    style={{
                      ...styles.addButton,
                      flex: 1
                    }}
                  >
                    Aggiungi Lead
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

export default MLSLeads;
