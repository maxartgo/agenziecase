import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';


/**
 * MLS Collaborations - Gestisci le tue collaborazioni MLS
 */
const MLSCollaborations = ({ token }) => {
  const [myRequests, setMyRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('incoming'); // incoming o my-requests
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollaborations();
  }, []);

  const loadCollaborations = async () => {
    try {
      setLoading(true);

      // Carica richieste ricevute
      const incomingResponse = await fetch('${API_BASE_URL}/api/mls/collaborations/incoming', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const incomingData = await incomingResponse.json();
      if (incomingData.success) {
        setIncomingRequests(incomingData.collaborations || []);
      }

      // Carica le mie richieste
      const myResponse = await fetch('${API_BASE_URL}/api/mls/collaborations/my-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const myData = await myResponse.json();
      if (myData.success) {
        setMyRequests(myData.collaborations || []);
      }

    } catch (error) {
      console.error('Error loading collaborations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (collaborationId) => {
    if (!confirm('Vuoi approvare questa richiesta di collaborazione?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/mls/collaborations/${collaborationId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Collaborazione approvata!');
        loadCollaborations();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error approving collaboration:', error);
      alert('Errore durante l\'approvazione');
    }
  };

  const handleReject = async (collaborationId) => {
    if (!confirm('Vuoi rifiutare questa richiesta di collaborazione?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/mls/collaborations/${collaborationId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('Collaborazione rifiutata');
        loadCollaborations();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error rejecting collaboration:', error);
      alert('Errore durante il rifiuto');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'approved': return '#3498db';
      case 'active': return '#16a085';
      case 'completed': return '#27ae60';
      case 'rejected': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'In attesa';
      case 'approved': return 'Approvata';
      case 'active': return 'Attiva';
      case 'completed': return 'Completata';
      case 'rejected': return 'Rifiutata';
      default: return status;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
        Caricamento collaborazioni...
      </div>
    );
  }

  const pendingCount = incomingRequests.filter(r => r.status === 'pending').length;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#2c3e50', marginBottom: '0.5rem' }}>
          🤝 Le Mie Collaborazioni MLS
        </h1>
        <p style={{ color: '#7f8c8d', fontSize: '0.95rem' }}>
          Gestisci le richieste di collaborazione ricevute e monitora quelle inviate
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '2px solid #ecf0f1'
      }}>
        <button
          onClick={() => setActiveTab('incoming')}
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: 'transparent',
            color: activeTab === 'incoming' ? '#16a085' : '#7f8c8d',
            border: 'none',
            borderBottom: activeTab === 'incoming' ? '3px solid #16a085' : '3px solid transparent',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          📥 Richieste Ricevute
          {pendingCount > 0 && (
            <span style={{
              backgroundColor: '#e74c3c',
              color: 'white',
              padding: '0.15rem 0.5rem',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '700'
            }}>
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('my-requests')}
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: 'transparent',
            color: activeTab === 'my-requests' ? '#16a085' : '#7f8c8d',
            border: 'none',
            borderBottom: activeTab === 'my-requests' ? '3px solid #16a085' : '3px solid transparent',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          📤 Le Mie Richieste
        </button>
      </div>

      {/* Incoming Requests */}
      {activeTab === 'incoming' && (
        <div>
          {incomingRequests.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              padding: '3rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#2c3e50', marginBottom: '0.5rem' }}>
                Nessuna richiesta ricevuta
              </h3>
              <p style={{ color: '#7f8c8d' }}>
                Le richieste di collaborazione da altri partner appariranno qui
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {incomingRequests.map((collab) => (
                <div
                  key={collab.id}
                  style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: collab.status === 'pending' ? '2px solid #f39c12' : '1px solid #ecf0f1'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'start' }}>
                    {/* Left Side - Property Info */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: getStatusColor(collab.status) + '20',
                          color: getStatusColor(collab.status),
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}>
                          {getStatusLabel(collab.status)}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                          Richiesta: {new Date(collab.requested_at).toLocaleDateString('it-IT')}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50', marginBottom: '0.5rem' }}>
                        {collab.property_title}
                      </h3>
                      <p style={{ fontSize: '0.95rem', color: '#7f8c8d', marginBottom: '1rem' }}>
                        📍 {collab.property_city} • {formatPrice(collab.property_price)}
                      </p>

                      <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1rem'
                      }}>
                        <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '0.5rem' }}>
                          Richiesta da
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: '600', color: '#2c3e50' }}>
                          {collab.collaborating_partner_company}
                        </div>
                        {collab.collaborating_agent_name && (
                          <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.25rem' }}>
                            👤 Agente: {collab.collaborating_agent_name}
                          </div>
                        )}
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '0.25rem' }}>
                          Split Commissione
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#16a085' }}>
                          {collab.commission_split}% / {100 - collab.commission_split}%
                        </div>
                      </div>

                      {collab.notes && (
                        <div style={{
                          backgroundColor: '#fff9e6',
                          padding: '1rem',
                          borderRadius: '8px',
                          borderLeft: '4px solid #f39c12'
                        }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#2c3e50', marginBottom: '0.5rem' }}>
                            Note del Partner:
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#34495e', lineHeight: '1.6' }}>
                            {collab.notes}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Side - Actions */}
                    {collab.status === 'pending' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '150px' }}>
                        <button
                          onClick={() => handleApprove(collab.id)}
                          style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#16a085',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#138d75'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#16a085'}
                        >
                          ✓ Approva
                        </button>
                        <button
                          onClick={() => handleReject(collab.id)}
                          style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#c0392b'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#e74c3c'}
                        >
                          ✕ Rifiuta
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Requests */}
      {activeTab === 'my-requests' && (
        <div>
          {myRequests.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              padding: '3rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📤</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#2c3e50', marginBottom: '0.5rem' }}>
                Nessuna richiesta inviata
              </h3>
              <p style={{ color: '#7f8c8d' }}>
                Esplora il network MLS e richiedi collaborazioni su immobili di altri partner
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myRequests.map((collab) => (
                <div
                  key={collab.id}
                  style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: getStatusColor(collab.status) + '20',
                      color: getStatusColor(collab.status),
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      {getStatusLabel(collab.status)}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                      Richiesta: {new Date(collab.requested_at).toLocaleDateString('it-IT')}
                    </span>
                    {collab.approved_at && (
                      <span style={{ fontSize: '0.85rem', color: '#16a085' }}>
                        ✓ Approvata: {new Date(collab.approved_at).toLocaleDateString('it-IT')}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50', marginBottom: '0.5rem' }}>
                    {collab.property_title}
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: '#7f8c8d', marginBottom: '1rem' }}>
                    📍 {collab.property_city} • {formatPrice(collab.property_price)}
                  </p>

                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '0.5rem' }}>
                      Listing Partner
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: '600', color: '#2c3e50' }}>
                      {collab.listing_partner_company}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '0.25rem' }}>
                      Split Commissione
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#16a085' }}>
                      {collab.commission_split}% / {100 - collab.commission_split}%
                    </div>
                  </div>

                  {collab.status === 'pending' && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      backgroundColor: '#fff9e6',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      color: '#f39c12'
                    }}>
                      ⏱️ In attesa di approvazione dal listing partner
                    </div>
                  )}

                  {collab.status === 'approved' && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      backgroundColor: '#e8f5e9',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      color: '#27ae60'
                    }}>
                      ✅ Collaborazione approvata! Puoi iniziare a lavorare su questo immobile
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MLSCollaborations;
