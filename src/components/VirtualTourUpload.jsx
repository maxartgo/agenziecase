import { useState, useEffect } from 'react';

/**
 * Componente per upload foto Virtual Tour
 * Partner seleziona una property e carica le foto
 * Admin riceve notifica e crea tour su Kuula
 */
const VirtualTourUpload = ({ token }) => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [photos, setPhotos] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [credits, setCredits] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carica properties del partner
      const propsResponse = await fetch('http://localhost:3001/api/properties', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const propsData = await propsResponse.json();
      if (propsData.success) {
        setProperties(propsData.properties || []);
      }

      // Carica richieste esistenti
      const reqResponse = await fetch('http://localhost:3001/api/virtual-tour-requests/partner', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const reqData = await reqResponse.json();
      if (reqData.success) {
        setRequests(reqData.requests || []);
      }

      // Carica crediti
      const creditsResponse = await fetch('http://localhost:3001/api/virtual-tour-packs/credits', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const creditsData = await creditsResponse.json();
      if (creditsData.success) {
        setCredits(creditsData.credits);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
  };

  const handleUpload = async () => {
    if (!selectedProperty) {
      alert('Seleziona un immobile');
      return;
    }

    if (photos.length === 0) {
      alert('Carica almeno una foto');
      return;
    }

    if (photos.length > 30) {
      alert('Massimo 30 foto per virtual tour');
      return;
    }

    if (!credits || credits.current < 1) {
      alert('Crediti insufficienti. Acquista un pack Virtual Tour per continuare.');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('propertyId', selectedProperty);
      formData.append('notes', notes);

      photos.forEach((photo, index) => {
        formData.append('photos', photo);
      });

      const response = await fetch('http://localhost:3001/api/virtual-tour-requests/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Richiesta virtual tour inviata con successo!\\n\\nL\'admin creerà il tour su Kuula e lo pubblicherà sul tuo annuncio.');

        // Reset form
        setSelectedProperty('');
        setPhotos([]);
        setNotes('');

        // Reload data
        loadData();
      } else {
        alert('❌ ' + data.message);
      }

    } catch (error) {
      console.error('Error uploading:', error);
      alert('Errore durante l\'upload. Riprova.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'In attesa', color: '#f39c12', icon: '⏳' },
      processing: { text: 'In lavorazione', color: '#3498db', icon: '🔄' },
      completed: { text: 'Completato', color: '#2ecc71', icon: '✅' },
      rejected: { text: 'Rifiutato', color: '#e74c3c', icon: '❌' }
    };
    return badges[status] || badges.pending;
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
    creditsCard: {
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '2rem',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    creditsInfo: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center'
    },
    creditsValue: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#d4af37'
    },
    uploadSection: {
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      borderRadius: '16px',
      padding: '2rem',
      marginBottom: '2rem',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      marginBottom: '1.5rem',
      color: '#fff'
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
    select: {
      width: '100%',
      padding: '0.75rem',
      background: '#0a0a0a',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '1rem'
    },
    fileInput: {
      display: 'none'
    },
    fileButton: {
      width: '100%',
      padding: '1.5rem',
      background: 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)',
      border: '2px dashed rgba(212, 175, 55, 0.5)',
      borderRadius: '12px',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      color: 'rgba(255, 255, 255, 0.8)'
    },
    fileButtonHover: {
      borderColor: '#d4af37',
      background: 'linear-gradient(135deg, #3a3a3a 0%, #4a4a4a 100%)'
    },
    photosGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
      gap: '0.5rem',
      marginTop: '1rem'
    },
    photoPreview: {
      width: '100%',
      height: '100px',
      objectFit: 'cover',
      borderRadius: '8px',
      border: '2px solid rgba(212, 175, 55, 0.3)'
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
      minHeight: '100px',
      resize: 'vertical'
    },
    uploadButton: {
      width: '100%',
      padding: '1rem',
      background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
      color: '#0a0a0a',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1.1rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    uploadButtonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    requestsSection: {
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      borderRadius: '16px',
      padding: '2rem',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    requestCard: {
      background: '#0a0a0a',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1rem',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    requestHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    requestTitle: {
      fontSize: '1.1rem',
      fontWeight: '700',
      color: '#fff'
    },
    statusBadge: {
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: '700',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    requestInfo: {
      fontSize: '0.9rem',
      color: 'rgba(255, 255, 255, 0.7)',
      marginBottom: '0.5rem'
    },
    tourLink: {
      color: '#d4af37',
      textDecoration: 'none',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginTop: '1rem'
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
        <div style={styles.loading}>⏳ Caricamento...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📸 Richiedi Virtual Tour</h1>
        <p style={styles.subtitle}>
          Carica le foto del tuo immobile. Il nostro team creerà il virtual tour professionale su Kuula.
        </p>
      </div>

      {/* Crediti */}
      {credits && (
        <div style={styles.creditsCard}>
          <div style={styles.creditsInfo}>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.25rem' }}>
                Crediti disponibili
              </div>
              <div style={styles.creditsValue}>{credits.current}</div>
            </div>
            {credits.plan && (
              <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                Piano: <strong>{credits.planName}</strong>
              </div>
            )}
          </div>
          {(!credits.plan || credits.current < 1) && (
            <button
              onClick={() => window.location.href = '/virtual-tour-packs'}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                color: '#0a0a0a',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Acquista Crediti
            </button>
          )}
        </div>
      )}

      {/* Form Upload */}
      <div style={styles.uploadSection}>
        <h2 style={styles.sectionTitle}>📤 Nuova Richiesta</h2>

        <div style={styles.formGroup}>
          <label style={styles.label}>Seleziona Immobile *</label>
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            style={styles.select}
          >
            <option value="">-- Scegli un immobile --</option>
            {properties.map(prop => (
              <option key={prop.id} value={prop.id}>
                {prop.title} - {prop.address}, {prop.city}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Foto (min 5, max 30) * - {photos.length} foto selezionate
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            multiple
            onChange={handlePhotoSelect}
            style={styles.fileInput}
          />
          <label
            htmlFor="photo-upload"
            style={styles.fileButton}
            onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.fileButtonHover)}
            onMouseOut={(e) => Object.assign(e.currentTarget.style, styles.fileButton)}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
              {photos.length > 0 ? `${photos.length} foto selezionate` : 'Clicca per selezionare foto'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              JPG o PNG, max 10MB per foto
            </div>
          </label>

          {photos.length > 0 && (
            <div style={styles.photosGrid}>
              {photos.map((photo, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(photo)}
                  alt={`Preview ${index + 1}`}
                  style={styles.photoPreview}
                />
              ))}
            </div>
          )}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Note (opzionale)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Eventuali istruzioni o note per la creazione del virtual tour..."
            style={styles.textarea}
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading || !selectedProperty || photos.length === 0}
          style={{
            ...styles.uploadButton,
            ...(uploading || !selectedProperty || photos.length === 0 ? styles.uploadButtonDisabled : {})
          }}
          onMouseOver={(e) => {
            if (!uploading && selectedProperty && photos.length > 0) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.4)';
            }
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          {uploading ? '⏳ Caricamento in corso...' : '📸 Invia Richiesta Virtual Tour'}
        </button>
      </div>

      {/* Richieste Esistenti */}
      {requests.length > 0 && (
        <div style={styles.requestsSection}>
          <h2 style={styles.sectionTitle}>📋 Le Tue Richieste</h2>

          {requests.map(request => {
            const badge = getStatusBadge(request.status);
            return (
              <div key={request.id} style={styles.requestCard}>
                <div style={styles.requestHeader}>
                  <div style={styles.requestTitle}>{request.property_title}</div>
                  <div style={{ ...styles.statusBadge, background: badge.color }}>
                    {badge.icon} {badge.text}
                  </div>
                </div>

                <div style={styles.requestInfo}>
                  📍 {request.property_address}
                </div>
                <div style={styles.requestInfo}>
                  📸 {request.photos_count} foto caricate
                </div>
                <div style={styles.requestInfo}>
                  📅 Richiesto il {new Date(request.requested_at).toLocaleDateString('it-IT')}
                </div>

                {request.notes && (
                  <div style={{ ...styles.requestInfo, marginTop: '0.5rem', fontStyle: 'italic' }}>
                    💬 {request.notes}
                  </div>
                )}

                {request.status === 'completed' && request.kuula_url && (
                  <a
                    href={request.kuula_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.tourLink}
                  >
                    🌐 Visualizza Virtual Tour ➜
                  </a>
                )}

                {request.status === 'rejected' && request.admin_notes && (
                  <div style={{ ...styles.requestInfo, color: '#e74c3c', marginTop: '0.5rem' }}>
                    ❌ Motivo: {request.admin_notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VirtualTourUpload;
