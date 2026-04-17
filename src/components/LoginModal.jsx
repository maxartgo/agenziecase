import { useState } from 'react';
import ResetPasswordModal from './ResetPasswordModal';

/**
 * Modal per il login degli utenti (agenti/partner)
 */
const LoginModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        // Salva token e user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Chiama callback di successo
        if (onSuccess) {
          onSuccess(data.user, data.token);
        }

        // Chiudi modal
        onClose();

        // Redirect a dashboard se è un agent o partner
        if (data.user.role === 'agent' || data.user.role === 'partner') {
          console.log('Redirect to CRM dashboard for', data.user.role);
        }
      } else {
        setError(data.error || 'Errore durante il login. Riprova.');
      }
    } catch (err) {
      console.error('Errore login:', err);
      setError('Errore durante il login. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Reset errore quando l'utente modifica
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
      maxWidth: '450px',
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
    },
    footer: {
      textAlign: 'center',
      marginTop: '1.5rem',
      fontSize: '0.9rem',
      color: '#666'
    },
    link: {
      color: '#d4af37',
      textDecoration: 'none',
      fontWeight: '600',
      cursor: 'pointer'
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
          <h2 style={styles.title}>🔑 Login</h2>
          <p style={styles.subtitle}>Accedi alla tua area riservata</p>
        </div>

        <div style={styles.body}>
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Email */}
            <div style={styles.fieldGroup}>
              <label htmlFor="email" style={styles.label}>Email</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="tua@email.it"
                style={styles.input}
                required
                disabled={loading}
                onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            {/* Password */}
            <div style={styles.fieldGroup}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="••••••••"
                style={styles.input}
                required
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
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </form>

          {/* Footer */}
          <div style={styles.footer}>
            <p>
              Non hai un account?{' '}
              <a style={styles.link} onClick={(e) => {
                e.preventDefault();
                onClose();
                // TODO: Aprire modal registrazione partner
              }}>
                Registrati come Partner
              </a>
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              <a style={styles.link} onClick={(e) => {
                e.preventDefault();
                setShowResetPassword(true);
              }}>
                Password dimenticata?
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={showResetPassword}
        onClose={() => setShowResetPassword(false)}
        onSuccess={() => {
          setShowResetPassword(false);
          // Opzionalmente puoi riaprire il login modal
        }}
      />
    </div>
  );
};

export default LoginModal;
