import { useState } from 'react';

/**
 * LocationDetails - Sezione posizione dell'immobile
 * Campi: città, indirizzo, provincia, CAP
 */
const LocationDetails = ({ formData, onChange }) => {
  const [localErrors, setLocalErrors] = useState({});

  const handleChange = (field, value) => {
    setLocalErrors(prev => ({ ...prev, [field]: '' }));
    onChange(field, value);
  };

  return (
    <>
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Città *</label>
        <input
          type="text"
          value={formData.city}
          onChange={(e) => handleChange('city', e.target.value)}
          placeholder="es. Milano"
          style={{
            ...styles.input,
            borderColor: localErrors.city ? '#ff4444' : '#d4af37'
          }}
          required
        />
        {localErrors.city && <span style={styles.error}>{localErrors.city}</span>}
      </div>

      <div style={styles.row}>
        <div style={{ ...styles.fieldGroup, flex: 2 }}>
          <label style={styles.label}>Indirizzo</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="es. Via Roma 123"
            style={styles.input}
          />
        </div>

        <div style={{ ...styles.fieldGroup, flex: 1 }}>
          <label style={styles.label}>CAP</label>
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            placeholder="00100"
            style={styles.input}
            maxLength={5}
          />
        </div>
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Provincia</label>
        <input
          type="text"
          value={formData.province}
          onChange={(e) => handleChange('province', e.target.value)}
          placeholder="es. MI"
          style={styles.input}
          maxLength={2}
        />
      </div>
    </>
  );
};

const styles = {
  fieldGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#0a0a0a',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #d4af37',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    backgroundColor: '#fff'
  },
  row: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px'
  },
  error: {
    display: 'block',
    marginTop: '5px',
    color: '#ff4444',
    fontSize: '12px'
  }
};

export default LocationDetails;
