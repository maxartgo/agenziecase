import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

/**
 * Generic CRM Data Manager
 * Handles list, create, delete for any CRM entity
 */
const CRMDataManager = ({ endpoint, title, columns, formFields, token, partnerId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);

  const apiUrl = `${API_BASE_URL}${endpoint}`;

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = partnerId ? `${apiUrl}?partnerId=${partnerId}` : apiUrl;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setItems(data.clients || data.appointments || data.deals || data.activities || data.rows || []);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error(`Error loading ${endpoint}:`, err);
      setError('Errore caricamento dati');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (partnerId) payload.partnerId = partnerId;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        setShowForm(false);
        setFormData({});
        loadItems();
      } else {
        alert('Errore: ' + (data.error || data.message));
      }
    } catch (err) {
      console.error('Create error:', err);
      alert('Errore durante la creazione');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminare questo elemento?')) return;
    try {
      const response = await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        loadItems();
      } else {
        alert('Errore: ' + (data.error || data.message));
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Errore durante l\'eliminazione');
    }
  };

  const filteredItems = items.filter(item => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return columns.some(col => {
      const val = getNestedValue(item, col.key);
      return val && String(val).toLowerCase().includes(searchLower);
    });
  });

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const formatValue = (val, type) => {
    if (val === null || val === undefined) return '-';
    if (type === 'date' && val) {
      return new Date(val).toLocaleDateString('it-IT', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    }
    if (type === 'currency' && val) {
      return '€' + Number(val).toLocaleString('it-IT');
    }
    return String(val);
  };

  const styles = {
    container: { width: '100%' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    title: { fontSize: '1.5rem', fontWeight: '700', color: '#d4af37', fontFamily: "'Playfair Display', serif" },
    searchBox: {
      padding: '0.75rem 1rem',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(212,175,55,0.2)',
      borderRadius: '10px',
      color: '#fff',
      fontSize: '0.95rem',
      width: '250px',
      outline: 'none'
    },
    addButton: {
      padding: '0.75rem 1.5rem',
      background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
      border: 'none',
      borderRadius: '10px',
      color: '#0a0a0a',
      fontWeight: '700',
      cursor: 'pointer',
      fontSize: '0.95rem'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      background: 'rgba(26,26,26,0.7)',
      borderRadius: '12px',
      overflow: 'hidden'
    },
    th: {
      padding: '1rem',
      textAlign: 'left',
      borderBottom: '2px solid rgba(212,175,55,0.3)',
      color: '#d4af37',
      fontSize: '0.8rem',
      textTransform: 'uppercase',
      fontWeight: '700'
    },
    td: {
      padding: '1rem',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      color: 'rgba(255,255,255,0.9)',
      fontSize: '0.9rem'
    },
    deleteBtn: {
      background: 'rgba(231,76,60,0.2)',
      border: 'none',
      color: '#e74c3c',
      padding: '0.3rem 0.7rem',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.8rem'
    },
    empty: { textAlign: 'center', padding: '3rem', color: '#999' },
    formOverlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
    },
    formPanel: {
      background: '#1a1a1a',
      borderRadius: '16px',
      padding: '2rem',
      maxWidth: '500px',
      width: '100%',
      border: '1px solid rgba(212,175,55,0.2)',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    formField: {
      marginBottom: '1rem'
    },
    formLabel: {
      display: 'block',
      color: '#999',
      fontSize: '0.85rem',
      marginBottom: '0.5rem',
      textTransform: 'uppercase'
    },
    formInput: {
      width: '100%',
      padding: '0.75rem',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '0.95rem',
      outline: 'none',
      boxSizing: 'border-box'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>{title}</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Cerca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchBox}
          />
          <button onClick={() => setShowForm(true)} style={styles.addButton}>
            + Nuovo
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error}</div>
      )}

      {loading ? (
        <div style={styles.empty}>⏳ Caricamento...</div>
      ) : filteredItems.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
          <div>Nessun elemento trovato</div>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} style={styles.th}>{col.label}</th>
              ))}
              <th style={styles.th}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, idx) => (
              <tr key={item.id || idx}>
                {columns.map(col => (
                  <td key={col.key} style={styles.td}>
                    {formatValue(getNestedValue(item, col.key), col.type)}
                  </td>
                ))}
                <td style={styles.td}>
                  <button onClick={() => handleDelete(item.id)} style={styles.deleteBtn}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Create Form Modal */}
      {showForm && (
        <div style={styles.formOverlay} onClick={() => setShowForm(false)}>
          <div style={styles.formPanel} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#d4af37', margin: 0 }}>Nuovo {title}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              {formFields.map(field => (
                <div key={field.name} style={styles.formField}>
                  <label style={styles.formLabel}>{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      style={styles.formInput}
                      required={field.required}
                    >
                      <option value="">Seleziona...</option>
                      {field.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      style={{ ...styles.formInput, minHeight: '80px', resize: 'vertical' }}
                      required={field.required}
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      style={styles.formInput}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
              <button type="submit" style={{ ...styles.addButton, width: '100%', marginTop: '1rem' }}>
                Salva
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMDataManager;
