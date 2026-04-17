import { useState } from 'react';

const API_URL = 'http://localhost:3001/api';

const PartnerRegistrationModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    // Dati personali (Step 1)
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    // Dati aziendali (Step 2)
    companyName: '',
    vatNumber: '',
    fiscalCode: '',
    address: '',
    city: '',
    province: '',
    zipCode: '',
    companyPhone: '',
    companyEmail: '',
    website: '',
    // Termini (Step 3)
    termsAccepted: false,
    privacyAccepted: false
  });

  const [files, setFiles] = useState({
    visuraCamerale: null,
    documentoIdentita: null
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Dati aziendali, 2: Documenti

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setError('');
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      // Validazione dimensione file (max 5MB)
      if (fileList[0].size > 5 * 1024 * 1024) {
        setError(`Il file ${name} supera i 5MB`);
        return;
      }
      setFiles({
        ...files,
        [name]: fileList[0]
      });
      setError('');
    }
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      // Validazione dati personali (Step 1)
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        setError('Compila tutti i campi obbligatori: Nome, Cognome, Email, Password');
        return false;
      }
      // Validazione email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Inserisci una email valida');
        return false;
      }
      // Validazione password
      if (formData.password.length < 6) {
        setError('La password deve essere di almeno 6 caratteri');
        return false;
      }
    }
    if (currentStep === 2) {
      // Validazione dati aziendali (Step 2)
      if (!formData.companyName || !formData.vatNumber || !formData.address || !formData.city || !formData.companyPhone) {
        setError('Compila tutti i campi obbligatori: Ragione Sociale, P.IVA, Indirizzo, Città, Telefono Aziendale');
        return false;
      }
    }
    if (currentStep === 3) {
      // Validazione documenti (Step 3)
      if (!files.visuraCamerale || !files.documentoIdentita) {
        setError('Carica entrambi i documenti richiesti');
        return false;
      }
      if (!formData.termsAccepted || !formData.privacyAccepted) {
        setError('Devi accettare i termini e condizioni e la privacy policy');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      setError('');
    }
  };

  const handlePrev = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(2)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Crea FormData per multipart/form-data
      const data = new FormData();

      // Aggiungi tutti i campi del form
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      // Aggiungi i file (nomi devono corrispondere a multer)
      data.append('businessCertificate', files.visuraCamerale);
      data.append('idDocument', files.documentoIdentita);

      // Aggiungi acceptedTerms come boolean
      data.set('acceptedTerms', formData.termsAccepted && formData.privacyAccepted);

      const response = await fetch(`${API_URL}/partners/register`, {
        method: 'POST',
        body: data // Non impostare Content-Type, il browser lo farà automaticamente
      });

      const result = await response.json();

      if (response.ok) {
        // Mostra messaggio di successo dal backend
        alert(result.message || 'Registrazione completata con successo!');

        // Chiama il callback di successo se fornito
        if (onSuccess) {
          onSuccess(result.partner);
        }

        // Chiudi il modal
        onClose();
      } else {
        // Gestisci errori dal backend
        setError(result.error || 'Errore durante la registrazione');
      }
    } catch (err) {
      setError('Errore di connessione al server');
      console.error('Partner registration error:', err);
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
          <h2 style={styles.title}>Registrazione Partner</h2>
          <p style={styles.subtitle}>
            Diventa partner di AgenzieCase
          </p>

          {/* Progress indicator */}
          <div style={styles.progressBar}>
            <div style={{...styles.progressStep, ...(step >= 1 ? styles.progressStepActive : {})}}>1</div>
            <div style={{...styles.progressLine, ...(step >= 2 ? styles.progressLineActive : {})}} />
            <div style={{...styles.progressStep, ...(step >= 2 ? styles.progressStepActive : {})}}>2</div>
            <div style={{...styles.progressLine, ...(step >= 3 ? styles.progressLineActive : {})}} />
            <div style={{...styles.progressStep, ...(step >= 3 ? styles.progressStepActive : {})}}>3</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Step 1: Dati personali */}
          {step === 1 && (
            <>
              <h3 style={styles.stepTitle}>Dati Personali</h3>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nome *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Cognome *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email *</label>
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
                <label style={styles.label}>Password *</label>
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

              <div style={styles.inputGroup}>
                <label style={styles.label}>Telefono</label>
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

          {/* Step 2: Dati aziendali */}
          {step === 2 && (
            <>
              <h3 style={styles.stepTitle}>Dati Aziendali</h3>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Ragione Sociale *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Partita IVA *</label>
                  <input
                    type="text"
                    name="vatNumber"
                    value={formData.vatNumber}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Codice Fiscale</label>
                  <input
                    type="text"
                    name="fiscalCode"
                    value={formData.fiscalCode}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Indirizzo *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Città *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Provincia</label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    style={styles.input}
                    maxLength={2}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>CAP</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Telefono Aziendale *</label>
                <input
                  type="tel"
                  name="companyPhone"
                  value={formData.companyPhone}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Aziendale</label>
                <input
                  type="email"
                  name="companyEmail"
                  value={formData.companyEmail}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Sito Web</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="https://www.tuoagenzia.it"
                />
              </div>
            </>
          )}

          {/* Step 3: Documenti */}
          {step === 3 && (
            <>
              <h3 style={styles.stepTitle}>Documenti e Conferme</h3>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Visura Camerale * (PDF, max 5MB)</label>
                <input
                  type="file"
                  name="visuraCamerale"
                  onChange={handleFileChange}
                  style={styles.fileInput}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                />
                {files.visuraCamerale && (
                  <span style={styles.fileName}>✓ {files.visuraCamerale.name}</span>
                )}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Documento d'Identità * (PDF/JPG/PNG, max 5MB)</label>
                <input
                  type="file"
                  name="documentoIdentita"
                  onChange={handleFileChange}
                  style={styles.fileInput}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                />
                {files.documentoIdentita && (
                  <span style={styles.fileName}>✓ {files.documentoIdentita.name}</span>
                )}
              </div>

              <div style={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  style={styles.checkbox}
                  required
                />
                <label style={styles.checkboxLabel}>
                  Accetto i <a href="#" style={styles.link}>Termini e Condizioni</a> *
                </label>
              </div>

              <div style={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  name="privacyAccepted"
                  checked={formData.privacyAccepted}
                  onChange={handleChange}
                  style={styles.checkbox}
                  required
                />
                <label style={styles.checkboxLabel}>
                  Accetto la <a href="#" style={styles.link}>Privacy Policy</a> *
                </label>
              </div>

              <div style={styles.infoBox}>
                <p style={styles.infoText}>
                  📋 Dopo la registrazione, riceverai una email di conferma.
                  Il tuo account sarà attivato dopo la verifica dei documenti e l'attivazione dell'abbonamento.
                </p>
              </div>
            </>
          )}

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <div style={styles.buttonGroup}>
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                style={styles.prevButton}
              >
                Indietro
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                style={styles.nextButton}
              >
                Avanti
              </button>
            ) : (
              <button
                type="submit"
                style={{
                  ...styles.submitButton,
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                disabled={loading}
              >
                {loading ? 'Invio in corso...' : 'Completa Registrazione'}
              </button>
            )}
          </div>
        </form>
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
    overflowY: 'auto',
    animation: 'fadeIn 0.3s ease'
  },
  modal: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%)',
    borderRadius: '24px',
    maxWidth: '700px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
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
    fontSize: '0.95rem',
    marginBottom: '1.5rem'
  },
  progressBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '1.5rem'
  },
  progressStep: {
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    border: '2px solid rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  progressStepActive: {
    background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
    border: '2px solid #d4af37',
    color: '#0a0a0a'
  },
  progressLine: {
    width: '60px',
    height: '2px',
    background: 'rgba(255,255,255,0.2)',
    transition: 'all 0.3s ease'
  },
  progressLineActive: {
    background: '#d4af37'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  stepTitle: {
    color: '#d4af37',
    fontSize: '1.2rem',
    fontWeight: '500',
    marginBottom: '0.5rem',
    textAlign: 'center'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
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
  fileInput: {
    padding: '0.875rem 1.125rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#999',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer'
  },
  fileName: {
    color: '#4CAF50',
    fontSize: '0.85rem',
    marginTop: '0.25rem'
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer'
  },
  checkboxLabel: {
    color: '#ccc',
    fontSize: '0.9rem'
  },
  link: {
    color: '#d4af37',
    textDecoration: 'underline'
  },
  infoBox: {
    background: 'rgba(212, 175, 55, 0.1)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '12px',
    padding: '1rem'
  },
  infoText: {
    color: '#d4af37',
    fontSize: '0.85rem',
    margin: 0,
    lineHeight: '1.5'
  },
  error: {
    padding: '0.875rem 1.125rem',
    background: 'rgba(244, 67, 54, 0.1)',
    border: '1px solid rgba(244, 67, 54, 0.3)',
    borderRadius: '12px',
    color: '#ff6b6b',
    fontSize: '0.9rem'
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem'
  },
  prevButton: {
    flex: 1,
    padding: '1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '1.05rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit'
  },
  nextButton: {
    flex: 1,
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
    letterSpacing: '0.05em'
  },
  submitButton: {
    flex: 1,
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
    letterSpacing: '0.05em'
  }
};

export default PartnerRegistrationModal;
