import { useState } from 'react';
import { API_BASE_URL } from '../config/api';


const API_URL = '${API_BASE_URL}/api';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Reset errore quando l'utente digita
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        // Salva il token in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Chiama il callback di successo
        onSuccess(data.user, data.token);

        // Chiudi il modal
        onClose();

        // Reset form
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          phone: ''
        });
      } else {
        setError(data.error || 'Errore durante l\'autenticazione');
      }
    } catch (err) {
      setError('Errore di connessione al server');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose}>
          ✕
        </button>

        <div style={styles.header}>
          <h2 style={styles.title}>
            {isLogin ? 'Accedi' : 'Registrati'}
          </h2>
          <p style={styles.subtitle}>
            {isLogin ? 'Bentornato su AgenzieCase' : 'Crea il tuo account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <>
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nome</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    style={styles.input}
                    required={!isLogin}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Cognome</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    style={styles.input}
                    required={!isLogin}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Telefono (opzionale)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Attendere...' : (isLogin ? 'Accedi' : 'Registrati')}
          </button>
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>
            {isLogin ? 'Non hai un account?' : 'Hai già un account?'}
          </span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            style={styles.switchButton}
          >
            {isLogin ? 'Registrati' : 'Accedi'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(10px)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    animation: 'fadeIn 0.3s ease'
  },
  modal: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%)',
    borderRadius: '24px',
    maxWidth: '500px',
    width: '100%',
    padding: '2.5rem',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
    position: 'relative',
    animation: 'slideDown 0.3s ease'
  },
  closeButton: {
    position: 'absolute',
    top: '1.5rem',
    right: '1.5rem',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.05)',
    border: 'none',
    color: '#999',
    fontSize: '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center'
  },
  title: {
    fontFamily: '"Playfair Display", serif',
    fontSize: '2rem',
    fontWeight: '500',
    background: 'linear-gradient(135deg, #d4af37 0%, #f5e7a3 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.5rem'
  },
  subtitle: {
    color: '#999',
    fontSize: '0.95rem'
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
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    color: '#d4af37',
    fontSize: '0.85rem',
    fontWeight: '500',
    letterSpacing: '0.05em',
    textTransform: 'uppercase'
  },
  input: {
    padding: '0.875rem 1.125rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit'
  },
  error: {
    padding: '0.875rem 1.125rem',
    background: 'rgba(244, 67, 54, 0.1)',
    border: '1px solid rgba(244, 67, 54, 0.3)',
    borderRadius: '12px',
    color: '#ff6b6b',
    fontSize: '0.9rem'
  },
  submitButton: {
    padding: '1rem',
    background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
    border: 'none',
    borderRadius: '12px',
    color: '#0a0a0a',
    fontSize: '1.05rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
    letterSpacing: '0.05em',
    marginTop: '0.5rem'
  },
  footer: {
    marginTop: '1.5rem',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  },
  footerText: {
    color: '#999',
    fontSize: '0.9rem'
  },
  switchButton: {
    background: 'none',
    border: 'none',
    color: '#d4af37',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontFamily: 'inherit'
  }
};

export default AuthModal;
