import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

const AdminProfileManager = ({ token, user }) => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('✅ Profilo aggiornato con successo!');
        // Aggiorna i dati utente in localStorage
        const updatedUser = { ...user, ...data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        setError(data.error || 'Errore nell\'aggiornamento del profilo');
      }
    } catch (error) {
      console.error('Errore aggiornamento profilo:', error);
      setError('Errore di comunicazione con il server');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Le nuove password non coincidono');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('La nuova password deve avere almeno 6 caratteri');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('✅ Password cambiata con successo!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(data.error || 'Errore nel cambio password');
      }
    } catch (error) {
      console.error('Errore cambio password:', error);
      setError('Errore di comunicazione con il server');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto'
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
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '1rem'
    },
    tabs: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
    },
    tab: {
      padding: '1rem 1.5rem',
      background: 'transparent',
      border: 'none',
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      borderBottom: '3px solid transparent',
      transition: 'all 0.3s ease'
    },
    tabActive: {
      color: '#d4af37',
      borderBottomColor: '#d4af37'
    },
    form: {
      background: 'rgba(255, 255, 255, 0.05)',
      padding: '2rem',
      borderRadius: '12px',
      border: '1px solid rgba(212, 175, 55, 0.2)'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: '0.95rem',
      fontWeight: '500'
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      background: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '1rem',
      transition: 'all 0.3s ease'
    },
    button: {
      padding: '0.75rem 2rem',
      background: 'linear-gradient(135deg, #d4af37 0%, #f9d276 100%)',
      color: '#000',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    error: {
      padding: '1rem',
      background: 'rgba(231, 76, 60, 0.1)',
      border: '1px solid rgba(231, 76, 60, 0.3)',
      borderRadius: '8px',
      color: '#e74c3c',
      marginBottom: '1rem'
    },
    success: {
      padding: '1rem',
      background: 'rgba(46, 204, 113, 0.1)',
      border: '1px solid rgba(46, 204, 113, 0.3)',
      borderRadius: '8px',
      color: '#2ecc71',
      marginBottom: '1rem'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👤 Gestione Profilo</h1>
        <p style={styles.subtitle}>Aggiorna i tuoi dati e cambia la password</p>
      </div>

      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeSection === 'profile' ? styles.tabActive : {}) }}
          onClick={() => setActiveSection('profile')}
        >
          📋 Dati Profilo
        </button>
        <button
          style={{ ...styles.tab, ...(activeSection === 'password' ? styles.tabActive : {}) }}
          onClick={() => setActiveSection('password')}
        >
          🔐 Cambia Password
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {activeSection === 'profile' && (
        <form style={styles.form} onSubmit={handleProfileUpdate}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nome</label>
            <input
              style={styles.input}
              type="text"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Cognome</label>
            <input
              style={styles.input}
              type="text"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Telefono</label>
            <input
              style={styles.input}
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>

          <button
            style={styles.button}
            type="submit"
            disabled={loading}
          >
            {loading ? '⏳ Salvamento...' : '💾 Salva Modifiche'}
          </button>
        </form>
      )}

      {activeSection === 'password' && (
        <form style={styles.form} onSubmit={handlePasswordChange}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password Corrente</label>
            <input
              style={styles.input}
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nuova Password</label>
            <input
              style={styles.input}
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Conferma Nuova Password</label>
            <input
              style={styles.input}
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <button
            style={styles.button}
            type="submit"
            disabled={loading}
          >
            {loading ? '⏳ Cambio in corso...' : '🔐 Cambia Password'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AdminProfileManager;