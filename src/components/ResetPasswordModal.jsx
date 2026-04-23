import { useState } from 'react';
import { API_BASE_URL } from '../config/api';


/**
 * Modal per il reset della password (per agenti al primo accesso)
 */
const ResetPasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1 = verifica email, 2 = imposta nuova password
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('${API_BASE_URL}/api/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setStep(2); // Passa al secondo step
      } else {
        setError(data.error || 'Email non trovata');
      }
    } catch (err) {
      console.error('Errore verifica email:', err);
      setError('Errore durante la verifica. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    // Validazione password
    if (newPassword !== confirmPassword) {
      setError('Le password non corrispondono');
      return;
    }

    if (newPassword.length < 6) {
      setError('La password deve essere di almeno 6 caratteri');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('${API_BASE_URL}/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        // Chiama callback di successo
        if (onSuccess) {
          onSuccess();
        }

        // Reset form
        setEmail('');
        setNewPassword('');
        setConfirmPassword('');
        setStep(1);
        onClose();

        alert('Password aggiornata con successo! Puoi ora effettuare il login.');
      } else {
        setError(data.error || 'Errore durante il reset della password');
      }
    } catch (err) {
      console.error('Errore reset password:', err);
      setError('Errore durante il reset. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setStep(1);
    onClose();
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
      maxWidth: '500px',
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
    info: {
      backgroundColor: '#e7f3ff',
      border: '1px solid #b3d9ff',
      borderRadius: '8px',
      padding: '0.75rem 1rem',
      color: '#004085',
      fontSize: '0.9rem',
      marginBottom: '1rem'
    }
  };

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <button
            onClick={handleClose}
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
          <h2 style={styles.title}>🔑 Reimposta Password</h2>
          <p style={styles.subtitle}>
            {step === 1
              ? 'Inserisci la tua email per reimpostare la password'
              : 'Crea la tua nuova password'}
          </p>
        </div>

        <div style={styles.body}>
          {step === 1 ? (
            // Step 1: Verifica Email
            <form onSubmit={handleVerifyEmail} style={styles.form}>
              <div style={styles.info}>
                Se sei un agente e non hai ancora impostato la tua password, inserisci l'email
                che il tuo Partner ha utilizzato per registrarti.
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="tuaemail@esempio.it"
                  style={styles.input}
                  required
                  disabled={loading}
                  onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              {error && <div style={styles.error}>{error}</div>}

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
                {loading ? 'Verifica in corso...' : 'Verifica Email'}
              </button>
            </form>
          ) : (
            // Step 2: Imposta Nuova Password
            <form onSubmit={handleResetPassword} style={styles.form}>
              <div style={styles.info}>
                Email verificata: <strong>{email}</strong>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Nuova Password *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError('');
                  }}
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

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Conferma Password *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  style={styles.input}
                  required
                  minLength={6}
                  disabled={loading}
                  onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              {error && <div style={styles.error}>{error}</div>}

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
                {loading ? 'Aggiornamento in corso...' : 'Imposta Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
