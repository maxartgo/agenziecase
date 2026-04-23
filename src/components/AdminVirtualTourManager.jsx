import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';


/**
 * Dashboard Admin per gestire richieste Virtual Tour
 * Admin vede foto caricate, crea tour su Kuula, incolla URL
 */
const AdminVirtualTourManager = ({ token }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [kууlaUrl, setKууlaUrl] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);

      const response = await fetch('${API_BASE_URL}/api/virtual-tour-requests/admin/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setRequests(data.requests || []);
      }

    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (requestId) => {
    if (!kууlaUrl) {
      alert('Inserisci l\'URL del virtual tour Kuula');
      return;
    }

    if (!confirm('Confermi il completamento di questa richiesta? Verrà scalato 1 credito al partner.')) {
      return;
    }

    try {
      setProcessing(true);

      const response = await fetch('${API_BASE_URL}/api/virtual-tour-requests/admin/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId,
          kууlaUrl,
          adminNotes
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Virtual tour pubblicato con successo!');
        setSelectedRequest(null);
        setKууlaUrl('');
        setAdminNotes('');
        loadRequests();
      } else {
        alert('❌ ' + data.message);
      }

    } catch (error) {
      console.error('Error completing request:', error);
      alert('Errore durante il completamento. Riprova.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (requestId) => {
    const reason = prompt('Inserisci il motivo del rifiuto:');

    if (!reason) {
      return;
    }

    try {
      setProcessing(true);

      const response = await fetch('${API_BASE_URL}/api/virtual-tour-requests/admin/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId,
          reason
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Richiesta rifiutata');
        setSelectedRequest(null);
        loadRequests();
      } else {
        alert('❌ ' + data.message);
      }

    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Errore durante il rifiuto. Riprova.');
    } finally {
      setProcessing(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
      padding: '2rem',
      color: '#fff'
    },
    header: {
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #d4af37 0%, #f9d276 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '0.5rem'
    },
    subtitle: {
      fontSize: '1rem',
      color: 'rgba(255, 255, 255, 0.7)'
    },
    requestCard: {
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      borderRadius: '16px',
      padding: '2rem',
      marginBottom: '2rem',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    requestHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    requestTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#fff',
      marginBottom: '0.5rem'
    },
    requestInfo: {
      fontSize: '0.9rem',
      color: 'rgba(255, 255, 255, 0.7)',
      marginBottom: '0.5rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    infoBox: {
      background: '#0a0a0a',
      padding: '1rem',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    infoLabel: {
      fontSize: '0.85rem',
      color: 'rgba(255, 255, 255, 0.6)',
      marginBottom: '0.5rem'
    },
    infoValue: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#fff'
    },
    photosSection: {
      marginTop: '1.5rem',
      padding: '1.5rem',
      background: '#0a0a0a',
      borderRadius: '12px',
      border: '1px solid rgba(212, 175, 55, 0.3)'
    },
    photosTitle: {
      fontSize: '1.1rem',
      fontWeight: '700',
      marginBottom: '1rem',
      color: '#d4af37'
    },
    photoPath: {
      fontSize: '0.9rem',
      color: 'rgba(255, 255, 255, 0.7)',
      background: '#1a1a1a',
      padding: '0.75rem',
      borderRadius: '6px',
      fontFamily: 'monospace',
      marginBottom: '0.5rem'
    },
    actionSection: {
      marginTop: '2rem',
      padding: '1.5rem',
      background: 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)',
      borderRadius: '12px',
      border: '2px solid rgba(212, 175, 55, 0.3)'
    },
    actionTitle: {
      fontSize: '1.2rem',
      fontWeight: '700',
      marginBottom: '1.5rem',
      color: '#d4af37'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontSize: '0.9rem',
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '600'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      background: '#0a0a0a',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '1rem'
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      background: '#0a0a0a',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '1rem',
      fontFamily: 'inherit',
      minHeight: '80px',
      resize: 'vertical'
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem'
    },
    buttonPrimary: {
      flex: 1,
      padding: '1rem',
      background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    buttonDanger: {
      flex: 1,
      padding: '1rem',
      background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    emptyState: {
      textAlign: 'center',
      padding: '4rem',
      fontSize: '1.1rem',
      color: 'rgba(255, 255, 255, 0.6)',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    loading: {
      textAlign: 'center',
      padding: '4rem',
      fontSize: '1.2rem',
      color: 'rgba(255, 255, 255, 0.7)'
    },
    instructions: {
      background: 'linear-gradient(135deg, #3498db22 0%, #2980b922 100%)',
      border: '1px solid #3498db',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '2rem',
      color: 'rgba(255, 255, 255, 0.9)'
    },
    instructionsTitle: {
      fontSize: '1.1rem',
      fontWeight: '700',
      marginBottom: '1rem',
      color: '#3498db'
    },
    instructionsList: {
      paddingLeft: '1.5rem',
      margin: 0
    },
    instructionsItem: {
      marginBottom: '0.5rem',
      lineHeight: '1.6'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>⏳ Caricamento richieste...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🎬 Gestione Virtual Tour</h1>
        <p style={styles.subtitle}>
          Gestisci le richieste di virtual tour dei partner. Crea i tour su Kuula e incolla l'URL qui.
        </p>
      </div>

      {/* Istruzioni */}
      <div style={styles.instructions}>
        <div style={styles.instructionsTitle}>📖 Come funziona:</div>
        <ol style={styles.instructionsList}>
          <li style={styles.instructionsItem}>
            Il partner carica le foto del suo immobile
          </li>
          <li style={styles.instructionsItem}>
            Tu scarichi le foto dalla cartella indicata sotto
          </li>
          <li style={styles.instructionsItem}>
            Vai su <a href="https://kuula.co" target="_blank" rel="noopener noreferrer" style={{ color: '#3498db', fontWeight: '600' }}>kuula.co</a> e crea il virtual tour
          </li>
          <li style={styles.instructionsItem}>
            Copia l'URL del tour e incollalo nel form qui sotto
          </li>
          <li style={styles.instructionsItem}>
            Clicca "Pubblica" - il tour sarà aggiunto all'annuncio e verrà scalato 1 credito
          </li>
        </ol>
      </div>

      {/* Richieste Pending */}
      {requests.length === 0 ? (
        <div style={styles.emptyState}>
          ✅ Nessuna richiesta in attesa
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Tutte le richieste sono state elaborate
          </div>
        </div>
      ) : (
        requests.map(request => (
          <div key={request.id} style={styles.requestCard}>
            <div style={styles.requestHeader}>
              <div>
                <div style={styles.requestTitle}>{request.property_title}</div>
                <div style={styles.requestInfo}>
                  📍 {request.property_address}, {request.property_city}
                </div>
                <div style={styles.requestInfo}>
                  👤 Partner: <strong>{request.partner_name}</strong> ({request.partner_email})
                </div>
              </div>
              <div style={{
                padding: '0.5rem 1rem',
                background: '#f39c12',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: '700',
                color: '#0a0a0a'
              }}>
                ⏳ In attesa
              </div>
            </div>

            <div style={styles.grid}>
              <div style={styles.infoBox}>
                <div style={styles.infoLabel}>Richiesta ID</div>
                <div style={styles.infoValue}>#{request.id}</div>
              </div>
              <div style={styles.infoBox}>
                <div style={styles.infoLabel}>Property ID</div>
                <div style={styles.infoValue}>#{request.property_id}</div>
              </div>
              <div style={styles.infoBox}>
                <div style={styles.infoLabel}>Foto caricate</div>
                <div style={styles.infoValue}>{request.photos_count} foto</div>
              </div>
              <div style={styles.infoBox}>
                <div style={styles.infoLabel}>Data richiesta</div>
                <div style={styles.infoValue}>
                  {new Date(request.requested_at).toLocaleDateString('it-IT')}
                </div>
              </div>
            </div>

            {request.notes && (
              <div style={{
                background: '#0a0a0a',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '1rem'
              }}>
                <div style={styles.infoLabel}>💬 Note del partner:</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.9)', marginTop: '0.5rem' }}>
                  {request.notes}
                </div>
              </div>
            )}

            {/* Foto Path */}
            <div style={styles.photosSection}>
              <div style={styles.photosTitle}>📁 Percorso Foto</div>
              <div style={styles.photoPath}>
                server/uploads/{request.photos_folder}/
              </div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.5rem' }}>
                Scarica le {request.photos_count} foto da questa cartella per creare il virtual tour
              </div>
            </div>

            {/* Action Section */}
            <div style={styles.actionSection}>
              <div style={styles.actionTitle}>🎬 Pubblica Virtual Tour</div>

              <div style={styles.formGroup}>
                <label style={styles.label}>URL Kuula * (dopo aver creato il tour)</label>
                <input
                  type="url"
                  value={selectedRequest === request.id ? kууlaUrl : ''}
                  onChange={(e) => {
                    setSelectedRequest(request.id);
                    setKууlaUrl(e.target.value);
                  }}
                  placeholder="https://kuula.co/share/..."
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Note admin (opzionale)</label>
                <textarea
                  value={selectedRequest === request.id ? adminNotes : ''}
                  onChange={(e) => {
                    setSelectedRequest(request.id);
                    setAdminNotes(e.target.value);
                  }}
                  placeholder="Eventuali note sull'elaborazione..."
                  style={styles.textarea}
                />
              </div>

              <div style={styles.buttonGroup}>
                <button
                  onClick={() => handleComplete(request.id)}
                  disabled={processing || !kууlaUrl}
                  style={{
                    ...styles.buttonPrimary,
                    ...(processing || !kууlaUrl ? styles.buttonDisabled : {})
                  }}
                  onMouseOver={(e) => {
                    if (!processing && kууlaUrl) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(46, 204, 113, 0.4)';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {processing ? '⏳ Pubblicazione...' : '✅ Pubblica Virtual Tour'}
                </button>

                <button
                  onClick={() => handleReject(request.id)}
                  disabled={processing}
                  style={{
                    ...styles.buttonDanger,
                    ...(processing ? styles.buttonDisabled : {})
                  }}
                  onMouseOver={(e) => {
                    if (!processing) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(231, 76, 60, 0.4)';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  ❌ Rifiuta
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminVirtualTourManager;
