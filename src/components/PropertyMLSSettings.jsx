import { useState, useEffect } from 'react';

/**
 * Modal per gestire le impostazioni MLS di una proprietà esistente
 * Permette ai partner di abilitare/disabilitare la condivisione MLS
 */
const PropertyMLSSettings = ({ isOpen, onClose, property, token, onUpdate }) => {
  const [formData, setFormData] = useState({
    mlsEnabled: false,
    mlsVisibility: 'private',
    allowCollaboration: true,
    commissionSplitPercentage: 50
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Carica i dati attuali della proprietà quando il modal si apre
  useEffect(() => {
    if (property && isOpen) {
      setFormData({
        mlsEnabled: property.mls_enabled || property.mlsEnabled || false,
        mlsVisibility: property.mls_visibility || property.mlsVisibility || 'private',
        allowCollaboration: property.allow_collaboration !== undefined
          ? property.allow_collaboration
          : property.allowCollaboration !== undefined
            ? property.allowCollaboration
            : true,
        commissionSplitPercentage: property.commission_split_percentage || property.commissionSplitPercentage || 50
      });
    }
  }, [property, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleCheckbox = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://localhost:3001/api/properties/${property.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mlsEnabled: formData.mlsEnabled,
          mlsVisibility: formData.mlsEnabled ? formData.mlsVisibility : 'private',
          allowCollaboration: formData.mlsEnabled ? formData.allowCollaboration : false,
          commissionSplitPercentage: formData.mlsEnabled ? parseFloat(formData.commissionSplitPercentage) : null
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Impostazioni MLS aggiornate con successo!');
        setTimeout(() => {
          if (onUpdate) onUpdate(data.property);
          onClose();
        }, 1500);
      } else {
        setError(data.error || 'Errore durante l\'aggiornamento delle impostazioni MLS');
      }
    } catch (err) {
      console.error('Errore aggiornamento MLS:', err);
      setError('Errore durante l\'aggiornamento delle impostazioni MLS');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !property) return null;

  const styles = {
    overlay: {
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
    modal: {
      backgroundColor: '#1a1a2e',
      borderRadius: '20px',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 20px 60px rgba(212, 175, 55, 0.3)',
      border: '2px solid #d4af37'
    },
    header: {
      background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
      padding: '2rem',
      borderRadius: '20px 20px 0 0',
      color: '#0a0a0a',
      position: 'relative'
    },
    closeButton: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: 'rgba(255, 255, 255, 0.3)',
      border: 'none',
      borderRadius: '50%',
      width: '36px',
      height: '36px',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s'
    },
    title: {
      margin: 0,
      fontSize: '1.5rem',
      fontWeight: '700',
      fontFamily: "'Playfair Display', serif"
    },
    subtitle: {
      marginTop: '0.5rem',
      fontSize: '0.9rem',
      opacity: 0.8,
      fontFamily: "'DM Sans', sans-serif"
    },
    body: {
      padding: '2rem'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    section: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid rgba(212, 175, 55, 0.2)'
    },
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    label: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#d4af37',
      fontFamily: "'DM Sans', sans-serif"
    },
    input: {
      padding: '0.875rem 1rem',
      fontSize: '1rem',
      border: '2px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#fff',
      fontFamily: "'DM Sans', sans-serif",
      transition: 'all 0.3s'
    },
    select: {
      padding: '0.875rem 1rem',
      fontSize: '1rem',
      border: '2px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#fff',
      fontFamily: "'DM Sans', sans-serif",
      cursor: 'pointer'
    },
    checkboxGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer'
    },
    checkbox: {
      width: '20px',
      height: '20px',
      cursor: 'pointer'
    },
    error: {
      backgroundColor: 'rgba(255, 59, 48, 0.1)',
      border: '1px solid rgba(255, 59, 48, 0.3)',
      borderRadius: '10px',
      padding: '1rem',
      color: '#ff3b30',
      fontSize: '0.9rem'
    },
    success: {
      backgroundColor: 'rgba(52, 199, 89, 0.1)',
      border: '1px solid rgba(52, 199, 89, 0.3)',
      borderRadius: '10px',
      padding: '1rem',
      color: '#34c759',
      fontSize: '0.9rem'
    },
    button: {
      padding: '1rem 2rem',
      fontSize: '1.1rem',
      fontWeight: '600',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif",
      transition: 'all 0.3s'
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
      color: '#0a0a0a'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <button
            onClick={onClose}
            style={styles.closeButton}
            onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.5)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
          >
            ×
          </button>
          <h2 style={styles.title}>🔗 Impostazioni MLS</h2>
          <p style={styles.subtitle}>{property.title}</p>
        </div>

        <div style={styles.body}>
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* MLS Enabled Toggle */}
            <div style={styles.section}>
              <div style={styles.checkboxGroup} onClick={() => handleCheckbox('mlsEnabled')}>
                <input
                  type="checkbox"
                  checked={formData.mlsEnabled}
                  onChange={() => {}}
                  style={styles.checkbox}
                />
                <label style={styles.label}>Abilita condivisione MLS</label>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.5rem', lineHeight: '1.6' }}>
                Condividi questo immobile con altri partner del network per aumentare le possibilità di vendita/affitto tramite collaborazioni.
              </div>
            </div>

            {/* Mostra opzioni MLS solo se abilitato */}
            {formData.mlsEnabled && (
              <div style={styles.section}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Visibilità MLS</label>
                  <select
                    value={formData.mlsVisibility}
                    onChange={(e) => handleChange('mlsVisibility', e.target.value)}
                    style={styles.select}
                  >
                    <option value="private">Privato (solo tu)</option>
                    <option value="mls_only">Solo Network MLS</option>
                    <option value="public">Pubblico (tutti)</option>
                  </select>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.5rem' }}>
                    {formData.mlsVisibility === 'private' && '🔒 Visibile solo a te'}
                    {formData.mlsVisibility === 'mls_only' && '🤝 Condiviso con partner del network'}
                    {formData.mlsVisibility === 'public' && '🌍 Visibile pubblicamente'}
                  </div>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Percentuale Split Commissione (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.commissionSplitPercentage}
                    onChange={(e) => handleChange('commissionSplitPercentage', e.target.value)}
                    style={styles.input}
                  />
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.5rem' }}>
                    💰 Tu: {100 - formData.commissionSplitPercentage}% | Collaboratore: {formData.commissionSplitPercentage}%
                  </div>
                </div>

                <div style={styles.checkboxGroup} onClick={() => handleCheckbox('allowCollaboration')}>
                  <input
                    type="checkbox"
                    checked={formData.allowCollaboration}
                    onChange={() => {}}
                    style={styles.checkbox}
                  />
                  <label style={styles.label}>Consenti richieste di collaborazione</label>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.5rem' }}>
                  {formData.allowCollaboration
                    ? '✅ Altri partner possono richiedere di collaborare su questo immobile'
                    : '🚫 Le richieste di collaborazione sono disabilitate'}
                </div>

                {/* Info Box */}
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'rgba(52, 152, 219, 0.1)',
                  border: '1px solid rgba(52, 152, 219, 0.3)',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: '1.6'
                }}>
                  <div style={{ fontWeight: '600', color: '#3498db', marginBottom: '0.5rem' }}>ℹ️ Come funziona:</div>
                  <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                    <li>L'immobile sarà visibile agli altri partner del network</li>
                    <li>Altri agenti possono portare clienti interessati</li>
                    <li>Le commissioni vengono automaticamente divise</li>
                    <li>Devi approvare ogni richiesta di collaborazione</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Messages */}
            {error && (
              <div style={styles.error}>
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div style={styles.success}>
                ✅ {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.button, ...styles.primaryButton, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? '⏳ Salvataggio...' : '✅ Salva Impostazioni'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyMLSSettings;
