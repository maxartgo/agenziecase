import { useState } from 'react';
import { API_BASE_URL } from '../config/api';

const ChatVisitConfirmation = ({ property, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    clientName: '', clientEmail: '', clientPhone: '', date: '', privacyConsent: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.privacyConsent) { setError('Devi accettare la privacy policy'); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-crm/create-appointment`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.clientName, clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone, date: formData.date, type: 'viewing',
          propertyId: property?.id, partnerId: property?.partnerId || property?.agency?.id,
          agentId: property?.agentId, privacyConsent: true,
          notes: `Richiesta visita da chat per: ${property?.title || 'Immobile'}`
        })
      });
      const data = await res.json();
      if (data.success) onSuccess(data); else setError(data.error || 'Errore');
    } catch (err) { setError('Errore di rete'); }
    finally { setLoading(false); }
  };

  const s = {
    container: { background: '#1a1a1a', border: '2px solid rgba(212,175,55,0.3)', borderRadius: '16px', padding: '1.5rem', margin: '1rem 0', maxWidth: '400px' },
    title: { color: '#d4af37', fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' },
    info: { background: 'rgba(212,175,55,0.1)', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.9rem', color: '#fff' },
    field: { marginBottom: '0.75rem' },
    label: { display: 'block', color: '#999', fontSize: '0.8rem', marginBottom: '0.3rem', textTransform: 'uppercase' },
    input: { width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' },
    checkWrap: { display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(22,160,133,0.1)', borderRadius: '8px' },
    check: { width: '18px', height: '18px', marginTop: '2px', accentColor: '#16a085' },
    checkLabel: { color: '#ccc', fontSize: '0.85rem', lineHeight: '1.4' },
    btn: { width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg,#d4af37,#b8860b)', border: 'none', borderRadius: '10px', color: '#0a0a0a', fontWeight: '700', cursor: 'pointer', opacity: loading ? 0.6 : 1 },
    cancel: { width: '100%', padding: '0.6rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#999', marginTop: '0.5rem', cursor: 'pointer' },
    err: { color: '#e74c3c', fontSize: '0.85rem', marginBottom: '0.75rem', padding: '0.5rem', background: 'rgba(231,76,60,0.1)', borderRadius: '6px' }
  };

  return (
    <div style={s.container}>
      <div style={s.title}>🏠 Fissa una Visita</div>
      {property && <div style={s.info}><strong>{property.title}</strong><br/>{property.location} — {property.price ? `€${property.price.toLocaleString()}` : ''}</div>}
      {error && <div style={s.err}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={s.field}><label style={s.label}>Nome e Cognome *</label><input required value={formData.clientName} onChange={e=>setFormData({...formData,clientName:e.target.value})} style={s.input} placeholder="Mario Rossi"/></div>
        <div style={s.field}><label style={s.label}>Email *</label><input type="email" required value={formData.clientEmail} onChange={e=>setFormData({...formData,clientEmail:e.target.value})} style={s.input} placeholder="mario@email.com"/></div>
        <div style={s.field}><label style={s.label}>Telefono *</label><input type="tel" required value={formData.clientPhone} onChange={e=>setFormData({...formData,clientPhone:e.target.value})} style={s.input} placeholder="333 123 4567"/></div>
        <div style={s.field}><label style={s.label}>Data e Ora *</label><input type="datetime-local" required value={formData.date} onChange={e=>setFormData({...formData,date:e.target.value})} style={s.input}/></div>
        <div style={s.checkWrap}>
          <input type="checkbox" id="pvc" checked={formData.privacyConsent} onChange={e=>setFormData({...formData,privacyConsent:e.target.checked})} style={s.check}/>
          <label htmlFor="pvc" style={s.checkLabel}>Accetto la privacy policy e autorizzo il trattamento dei dati personali ai sensi del GDPR.</label>
        </div>
        <button type="submit" disabled={loading} style={s.btn}>{loading ? '⏳ Prenotazione...' : '✅ Conferma e Prenota'}</button>
        <button type="button" onClick={onClose} style={s.cancel}>Annulla</button>
      </form>
    </div>
  );
};

export default ChatVisitConfirmation;
