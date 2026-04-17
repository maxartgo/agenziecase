import { useState } from 'react';

/**
 * Form per raccolta dati cliente nella chat AI
 * Si apre quando l'AI richiede i dati per appuntamenti/lead
 */
const ClientDataForm = ({
  onSubmit,
  onCancel,
  initialData = {},
  purpose = 'appointment', // 'appointment' | 'lead' | 'valuation'
  agencyName = '',
  propertyTitle = ''
}) => {
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    acceptTerms: false,
    acceptPrivacy: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Nome
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nome obbligatorio';
    }

    // Cognome
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Cognome obbligatorio';
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email obbligatoria';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }

    // Telefono
    const phoneRegex = /^[\d\s\-\+()]{8,}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefono obbligatorio';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Telefono non valido';
    }

    // Termini e Privacy
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Devi accettare i termini e condizioni';
    }

    if (!formData.acceptPrivacy) {
      newErrors.acceptPrivacy = 'Devi accettare la privacy policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Errore invio form:', error);
      setErrors({ submit: 'Errore durante l\'invio. Riprova.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Rimuovi errore del campo quando l'utente inizia a modificarlo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const getPurposeText = () => {
    switch (purpose) {
      case 'appointment':
        return 'per fissare l\'appuntamento';
      case 'lead':
        return 'per ricevere informazioni';
      case 'valuation':
        return 'per richiedere la valutazione';
      default:
        return '';
    }
  };

  const styles = {
    container: {
      backgroundColor: '#f9f9f9',
      border: '2px solid #d4af37',
      borderRadius: '12px',
      padding: '24px',
      marginTop: '16px',
      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.1)'
    },
    header: {
      marginBottom: '20px'
    },
    title: {
      margin: 0,
      fontSize: '20px',
      color: '#0a0a0a',
      fontFamily: "'Playfair Display', serif"
    },
    subtitle: {
      margin: '8px 0 0 0',
      fontSize: '14px',
      color: '#666',
      fontFamily: "'DM Sans', sans-serif"
    },
    infoBox: {
      backgroundColor: '#fff9e6',
      border: '1px solid #d4af37',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '20px',
      fontSize: '13px',
      color: '#666'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px'
    },
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#0a0a0a',
      fontFamily: "'DM Sans', sans-serif"
    },
    required: {
      color: '#d4af37',
      marginLeft: '2px'
    },
    input: {
      padding: '10px 12px',
      fontSize: '15px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontFamily: "'DM Sans', sans-serif",
      transition: 'border-color 0.2s',
      outline: 'none'
    },
    inputFocus: {
      borderColor: '#d4af37'
    },
    inputError: {
      borderColor: '#e74c3c'
    },
    error: {
      fontSize: '12px',
      color: '#e74c3c',
      marginTop: '4px'
    },
    checkboxGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginTop: '8px'
    },
    checkboxRow: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px'
    },
    checkbox: {
      marginTop: '3px',
      width: '18px',
      height: '18px',
      cursor: 'pointer'
    },
    checkboxLabel: {
      fontSize: '13px',
      color: '#333',
      lineHeight: '1.5',
      cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif"
    },
    link: {
      color: '#d4af37',
      textDecoration: 'underline'
    },
    buttons: {
      display: 'flex',
      gap: '12px',
      marginTop: '8px'
    },
    button: {
      flex: 1,
      padding: '12px 24px',
      fontSize: '16px',
      fontWeight: '600',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif",
      transition: 'all 0.2s',
      outline: 'none'
    },
    submitButton: {
      backgroundColor: '#d4af37',
      color: '#0a0a0a'
    },
    submitButtonHover: {
      backgroundColor: '#c29d2f',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(212, 175, 55, 0.3)'
    },
    submitButtonDisabled: {
      backgroundColor: '#ccc',
      cursor: 'not-allowed',
      transform: 'none'
    },
    cancelButton: {
      backgroundColor: '#fff',
      color: '#666',
      border: '1px solid #ddd'
    },
    cancelButtonHover: {
      backgroundColor: '#f5f5f5'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>📋 I tuoi dati</h3>
        <p style={styles.subtitle}>
          Compila il form {getPurposeText()}
          {propertyTitle && ` per "${propertyTitle}"`}
        </p>
      </div>

      {agencyName && (
        <div style={styles.infoBox}>
          🏢 I tuoi dati saranno condivisi con <strong>{agencyName}</strong> per gestire la tua richiesta.
          Nessun'altra agenzia avrà accesso a queste informazioni.
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Nome e Cognome */}
        <div style={styles.row}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Nome<span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="Mario"
              style={{
                ...styles.input,
                ...(errors.firstName && styles.inputError)
              }}
              disabled={isSubmitting}
            />
            {errors.firstName && <span style={styles.error}>{errors.firstName}</span>}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Cognome<span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Rossi"
              style={{
                ...styles.input,
                ...(errors.lastName && styles.inputError)
              }}
              disabled={isSubmitting}
            />
            {errors.lastName && <span style={styles.error}>{errors.lastName}</span>}
          </div>
        </div>

        {/* Email */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Email<span style={styles.required}>*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="mario.rossi@example.com"
            style={{
              ...styles.input,
              ...(errors.email && styles.inputError)
            }}
            disabled={isSubmitting}
          />
          {errors.email && <span style={styles.error}>{errors.email}</span>}
        </div>

        {/* Telefono */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Telefono<span style={styles.required}>*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+39 333 123 4567"
            style={{
              ...styles.input,
              ...(errors.phone && styles.inputError)
            }}
            disabled={isSubmitting}
          />
          {errors.phone && <span style={styles.error}>{errors.phone}</span>}
        </div>

        {/* Checkbox Termini e Privacy */}
        <div style={styles.checkboxGroup}>
          <div style={styles.checkboxRow}>
            <input
              type="checkbox"
              id="acceptTerms"
              checked={formData.acceptTerms}
              onChange={(e) => handleChange('acceptTerms', e.target.checked)}
              style={styles.checkbox}
              disabled={isSubmitting}
            />
            <label htmlFor="acceptTerms" style={styles.checkboxLabel}>
              Accetto i{' '}
              <a href="/termini-e-condizioni" target="_blank" style={styles.link}>
                termini e condizioni
              </a>
              <span style={styles.required}>*</span>
            </label>
          </div>
          {errors.acceptTerms && <span style={styles.error}>{errors.acceptTerms}</span>}

          <div style={styles.checkboxRow}>
            <input
              type="checkbox"
              id="acceptPrivacy"
              checked={formData.acceptPrivacy}
              onChange={(e) => handleChange('acceptPrivacy', e.target.checked)}
              style={styles.checkbox}
              disabled={isSubmitting}
            />
            <label htmlFor="acceptPrivacy" style={styles.checkboxLabel}>
              Accetto la{' '}
              <a href="/privacy-policy" target="_blank" style={styles.link}>
                privacy policy
              </a>{' '}
              e autorizzo il trattamento dei miei dati personali
              <span style={styles.required}>*</span>
            </label>
          </div>
          {errors.acceptPrivacy && <span style={styles.error}>{errors.acceptPrivacy}</span>}
        </div>

        {/* Errore submit */}
        {errors.submit && (
          <div style={{ ...styles.error, textAlign: 'center' }}>
            {errors.submit}
          </div>
        )}

        {/* Pulsanti */}
        <div style={styles.buttons}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              ...styles.button,
              ...styles.cancelButton
            }}
            onMouseOver={(e) => {
              if (!isSubmitting) {
                Object.assign(e.target.style, styles.cancelButtonHover);
              }
            }}
            onMouseOut={(e) => {
              Object.assign(e.target.style, styles.cancelButton);
            }}
            disabled={isSubmitting}
          >
            Annulla
          </button>

          <button
            type="submit"
            style={{
              ...styles.button,
              ...styles.submitButton,
              ...(isSubmitting && styles.submitButtonDisabled)
            }}
            onMouseOver={(e) => {
              if (!isSubmitting) {
                Object.assign(e.target.style, { ...styles.submitButton, ...styles.submitButtonHover });
              }
            }}
            onMouseOut={(e) => {
              if (!isSubmitting) {
                Object.assign(e.target.style, styles.submitButton);
              }
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Invio...' : 'Conferma'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientDataForm;
