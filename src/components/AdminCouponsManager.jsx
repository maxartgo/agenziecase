import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

const AdminCouponsManager = ({ token }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    maxDiscount: '',
    minPurchase: '0',
    applicablePlans: '',
    usageLimit: '',
    userUsageLimit: '1',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    isActive: true
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/coupons?includeInactive=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch (error) {
      console.error('Errore caricamento coupon:', error);
      setError('Errore nel caricamento dei coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const url = editingCoupon
        ? `${API_BASE_URL}/api/admin/coupons/${editingCoupon.id}`
        : `${API_BASE_URL}/api/admin/coupons`;

      const method = editingCoupon ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          discountValue: parseFloat(formData.discountValue),
          maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
          minPurchase: parseFloat(formData.minPurchase),
          applicablePlans: formData.applicablePlans ? formData.applicablePlans.split(',').map(p => p.trim()) : [],
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
          userUsageLimit: parseInt(formData.userUsageLimit)
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(editingCoupon ? '✅ Coupon aggiornato!' : '✅ Coupon creato!');
        setShowModal(false);
        resetForm();
        loadCoupons();
      } else {
        setError(data.error || 'Errore nel salvataggio del coupon');
      }
    } catch (error) {
      console.error('Errore salvataggio coupon:', error);
      setError('Errore di comunicazione con il server');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Sei sicuro di voler eliminare questo coupon?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('✅ Coupon eliminato!');
        loadCoupons();
      } else {
        setError(data.error || 'Errore nell\'eliminazione del coupon');
      }
    } catch (error) {
      console.error('Errore eliminazione coupon:', error);
      setError('Errore di comunicazione con il server');
    }
  };

  const handleToggle = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/coupons/${id}/toggle`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        loadCoupons();
      } else {
        setError(data.error || 'Errore nell\'attivazione/disattivazione');
      }
    } catch (error) {
      console.error('Errore toggle coupon:', error);
      setError('Errore di comunicazione con il server');
    }
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscount: coupon.maxDiscount || '',
      minPurchase: coupon.minPurchase,
      applicablePlans: coupon.applicablePlans ? coupon.applicablePlans.join(', ') : '',
      usageLimit: coupon.usageLimit || '',
      userUsageLimit: coupon.userUsageLimit,
      validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
      isActive: coupon.isActive
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      maxDiscount: '',
      minPurchase: '0',
      applicablePlans: '',
      usageLimit: '',
      userUsageLimit: '1',
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: '',
      isActive: true
    });
    setEditingCoupon(null);
  };

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #d4af37 0%, #f9d276 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    button: {
      padding: '0.75rem 1.5rem',
      background: 'linear-gradient(135deg, #d4af37 0%, #f9d276 100%)',
      color: '#000',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '1.5rem'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(212, 175, 55, 0.2)',
      borderRadius: '12px',
      padding: '1.5rem',
      position: 'relative'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'start',
      marginBottom: '1rem'
    },
    code: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#d4af37',
      fontFamily: 'monospace'
    },
    status: {
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: '600'
    },
    statusActive: {
      background: 'rgba(46, 204, 113, 0.2)',
      color: '#2ecc71'
    },
    statusInactive: {
      background: 'rgba(231, 76, 60, 0.2)',
      color: '#e74c3c'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: '#1a1a1a',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: '0.9rem',
      fontWeight: '500'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      background: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '1rem'
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      background: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '1rem'
    },
    actions: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem'
    },
    actionButton: {
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      border: 'none',
      fontSize: '0.85rem',
      fontWeight: '600',
      cursor: 'pointer'
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
        <h1 style={styles.title}>🎟️ Gestione Coupon Sconto</h1>
        <button
          style={styles.button}
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + Crea Coupon
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>⏳ Caricamento...</div>
      ) : (
        <div style={styles.grid}>
          {coupons.map(coupon => (
            <div key={coupon.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <div style={styles.code}>{coupon.code}</div>
                  <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>
                    {coupon.description || 'Nessuna descrizione'}
                  </div>
                </div>
                <div style={{
                  ...styles.status,
                  ...(coupon.isActive ? styles.statusActive : styles.statusInactive)
                }}>
                  {coupon.isActive ? '✅ Attivo' : '❌ Inattivo'}
                </div>
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Sconto: </strong>
                {coupon.discountType === 'percentage'
                  ? `${coupon.discountValue}%`
                  : `€${coupon.discountValue}`}
                {coupon.maxDiscount && coupon.discountType === 'percentage' && (
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                    (max €{coupon.maxDiscount})
                  </span>
                )}
              </div>

              {coupon.minPurchase > 0 && (
                <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <strong>Minimo: </strong>€{coupon.minPurchase}
                </div>
              )}

              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                <div>Utilizzi: {coupon.usageCount}/{coupon.usageLimit || '∞'}</div>
                <div>
                  Dal: {new Date(coupon.validFrom).toLocaleDateString()}
                  {coupon.validUntil && ` al ${new Date(coupon.validUntil).toLocaleDateString()}`}
                </div>
              </div>

              <div style={styles.actions}>
                <button
                  style={{ ...styles.actionButton, background: 'rgba(52, 152, 219, 0.2)', color: '#3498db' }}
                  onClick={() => openEditModal(coupon)}
                >
                  ✏️ Modifica
                </button>
                <button
                  style={{ ...styles.actionButton, background: 'rgba(155, 89, 182, 0.2)', color: '#9b59b6' }}
                  onClick={() => handleToggle(coupon.id)}
                >
                  {coupon.isActive ? '⏸️ Disattiva' : '▶️ Attiva'}
                </button>
                <button
                  style={{ ...styles.actionButton, background: 'rgba(231, 76, 60, 0.2)', color: '#e74c3c' }}
                  onClick={() => handleDelete(coupon.id)}
                >
                  🗑️ Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem' }}>
              {editingCoupon ? '✏️ Modifica Coupon' : '🎟️ Crea Nuovo Coupon'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Codice Coupon</label>
                <input
                  style={styles.input}
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                  placeholder="ES: PRIMAVERA2025"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Descrizione</label>
                <input
                  style={styles.input}
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Sconto primavera 2025"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Tipo Sconto</label>
                <select
                  style={styles.select}
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                >
                  <option value="percentage">Percentuale (%)</option>
                  <option value="fixed">Importo fisso (€)</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  {formData.discountType === 'percentage' ? 'Percentuale Sconto' : 'Importo Sconto (€)'}
                </label>
                <input
                  style={styles.input}
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  required
                  min="0"
                  max={formData.discountType === 'percentage' ? '100' : ''}
                  step="0.01"
                />
              </div>

              {formData.discountType === 'percentage' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Massimo Sconto (€) - Opzionale</label>
                  <input
                    style={styles.input}
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="ES: 100"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>Importo Minimo Acquisto (€)</label>
                <input
                  style={styles.input}
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                  min="0"
                  step="0.01"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Limita a Piani (separati da virgola)</label>
                <input
                  style={styles.input}
                  type="text"
                  value={formData.applicablePlans}
                  onChange={(e) => setFormData({ ...formData, applicablePlans: e.target.value })}
                  placeholder="ES: basic,pro,premium (vuoto = tutti)"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Limite Utilizzi Totali (vuoto = illimitato)</label>
                <input
                  style={styles.input}
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="ES: 100"
                  min="1"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Limite Utilizzi per Utente</label>
                <input
                  style={styles.input}
                  type="number"
                  value={formData.userUsageLimit}
                  onChange={(e) => setFormData({ ...formData, userUsageLimit: e.target.value })}
                  min="1"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Valido Dal</label>
                <input
                  style={styles.input}
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Valido Fino (vuoto = nessuna scadenza)</label>
                <input
                  style={styles.input}
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  min={formData.validFrom}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                  style={{ ...styles.button, flex: 1 }}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? '⏳ Salvataggio...' : (editingCoupon ? '💾 Aggiorna' : '✨ Crea Coupon')}
                </button>
                <button
                  style={{
                    ...styles.button,
                    flex: 1,
                    background: 'rgba(231, 76, 60, 0.2)',
                    color: '#e74c3c'
                  }}
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  ❌ Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCouponsManager;