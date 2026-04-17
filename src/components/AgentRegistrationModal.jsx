import { useState } from 'react';

/**
 * Modal per la registrazione di un nuovo agente (solo Partner)
 */
const AgentRegistrationModal = ({ isOpen, onClose, onSuccess, partnerId }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    position: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/register-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          partnerId
        })
      });

      const data = await response.json();

      if (data.success) {
        // Chiama callback di successo
        if (onSuccess) {
          onSuccess(data.agent);
        }

        // Reset form e chiudi modal
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          phone: '',
          position: ''
        });
        onClose();
      } else {
        setError(data.error || 'Errore durante la registrazione. Riprova.');
      }
    } catch (err) {
      console.error('Errore registrazione agente:', err);
      setError('Errore durante la registrazione. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      padding: '1rem'
    },
    modal: {
      backgroundColor: '#fff',
      borderRadius: '20px',
      maxWidth: '550px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      position: 'relative'
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
      fontSize: '1.8rem',
      fontWeight: '700',
      fontFamily: "'Playfair Display', serif"
    },
    subtitle: {
      margin: '0.5rem 0 0 0',
      fontSize: '0.95rem',
      opacity: 0.9,
      fontFamily: "'DM Sans', sans-serif"
    },
    body: {
      padding: '2rem'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem'
    },
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    label: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#0a0a0a',
      fontFamily: "'DM Sans', sans-serif"
    },
    input: {
      padding: '0.875rem 1rem',
      fontSize: '1rem',
      border: '2px solid #e0e0e0',
      borderRadius: '12px',
      fontFamily: "'DM Sans', sans-serif",
      transition: 'all 0.2s',
      outline: 'none'
    },
    error: {
      backgroundColor: '#fee',
      border: '1px solid #fcc',
      borderRadius: '8px',
      padding: '0.75rem 1rem',
      color: '#c33',
      fontSize: '0.9rem',
      marginTop: '0.5rem'
    },
    submitButton: {
      padding: '1rem',
      background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
      border: 'none',
      borderRadius: '12px',
      color: '#0a0a0a',
      fontSize: '1.1rem',
      fontWeight: '700',
      cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif",
      letterSpacing: '0.05em',
      transition: 'all 0.3s',
      boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
      marginTop: '0.5rem'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <button
            onClick={onClose}
            style={styles.closeButton}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ×
          </button>
          <h2 style={styles.title}>👨‍💼 Registra Nuovo Agente</h2>
          <p style={styles.subtitle}>Aggiungi un nuovo agente alla tua agenzia</p>
        </div>

        <div style={styles.body}>
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Nome e Cognome */}
            <div style={styles.row}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Nome *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Mario"
                  style={styles.input}
                  required
                  disabled={loading}
                  onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Cognome *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Rossi"
                  style={styles.input}
                  required
                  disabled={loading}
                  onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
            </div>

            {/* Email */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="mario.rossi@agenzia.it"
                style={styles.input}
                required
                disabled={loading}
                onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            {/* Password */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="••••••••"
                style={styles.input}
                required
                minLength={6}
                disabled={loading}
                onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
              <small style={{ color: '#666', fontSize: '0.85rem' }}>
                Minimo 6 caratteri
              </small>
            </div>

            {/* Telefono */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Telefono *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+39 333 123 4567"
                style={styles.input}
                required
                disabled={loading}
                onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            {/* Posizione */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Posizione</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => handleChange('position', e.target.value)}
                placeholder="es. Agente Immobiliare Senior"
                style={styles.input}
                disabled={loading}
                onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            {/* Errore */}
            {error && (
              <div style={styles.error}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              style={styles.submitButton}
              disabled={loading}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
              }}
            >
              {loading ? 'Registrazione in corso...' : 'Registra Agente'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgentRegistrationModal;
