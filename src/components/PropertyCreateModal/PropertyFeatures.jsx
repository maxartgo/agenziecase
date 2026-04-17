import { useState } from 'react';

/**
 * PropertyFeatures - Sezione caratteristiche dell'immobile
 * Campi: superficie, locali, bagni, piano, caratteristiche extra
 */
const PropertyFeatures = ({ formData, onChange }) => {
  const [localErrors, setLocalErrors] = useState({});

  const handleChange = (field, value) => {
    setLocalErrors(prev => ({ ...prev, [field]: '' }));
    onChange(field, value);
  };

  const handleCheckbox = (field) => {
    onChange(field, !formData[field]);
  };

  return (
    <>
      <div style={styles.row}>
        <div style={{ ...styles.fieldGroup, flex: 1 }}>
          <label style={styles.label}>Superficie (m²) *</label>
          <input
            type="number"
            value={formData.sqm}
            onChange={(e) => handleChange('sqm', e.target.value)}
            placeholder="es. 120"
            style={{
              ...styles.input,
              borderColor: localErrors.sqm ? '#ff4444' : '#d4af37'
            }}
            required
          />
          {localErrors.sqm && <span style={styles.error}>{localErrors.sqm}</span>}
        </div>

        <div style={{ ...styles.fieldGroup, flex: 1 }}>
          <label style={styles.label}>Locali *</label>
          <input
            type="number"
            value={formData.rooms}
            onChange={(e) => handleChange('rooms', e.target.value)}
            placeholder="es. 4"
            style={styles.input}
            required
          />
        </div>

        <div style={{ ...styles.fieldGroup, flex: 1 }}>
          <label style={styles.label}>Bagni</label>
          <input
            type="number"
            value={formData.bathrooms}
            onChange={(e) => handleChange('bathrooms', e.target.value)}
            placeholder="es. 2"
            style={styles.input}
          />
        </div>
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Piano</label>
        <input
          type="text"
          value={formData.floor}
          onChange={(e) => handleChange('floor', e.target.value)}
          placeholder="es. 3° o Terra"
          style={styles.input}
        />
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Classe Energetica</label>
        <select
          value={formData.energyClass}
          onChange={(e) => handleChange('energyClass', e.target.value)}
          style={styles.input}
        >
          <option value="">Non specificata</option>
          <option value="A+">A+</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="E">E</option>
          <option value="F">F</option>
          <option value="G">G</option>
        </select>
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Anno Costruzione</label>
        <input
          type="number"
          value={formData.yearBuilt}
          onChange={(e) => handleChange('yearBuilt', e.target.value)}
          placeholder="es. 2010"
          style={styles.input}
          min="1800"
          max={new Date().getFullYear() + 1}
        />
      </div>

      <div style={styles.sectionDivider} />

      <h4 style={styles.subsectionTitle}>Caratteristiche Aggiuntive</h4>

      <div style={styles.checkboxGroup}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={formData.hasParking}
            onChange={() => handleCheckbox('hasParking')}
            style={styles.checkbox}
          />
          <span>🅿️ Box / Posto Auto</span>
        </label>

        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={formData.hasElevator}
            onChange={() => handleCheckbox('hasElevator')}
            style={styles.checkbox}
          />
          <span>🛗 Ascensore</span>
        </label>

        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={formData.hasBalcony}
            onChange={() => handleCheckbox('hasBalcony')}
            style={styles.checkbox}
          />
          <span>🌿 Balcone / Terrazzo</span>
        </label>

        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={formData.hasGarden}
            onChange={() => handleCheckbox('hasGarden')}
            style={styles.checkbox}
          />
          <span>🌳 Giardino</span>
        </label>
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
  sectionDivider: {
    margin: '20px 0',
    borderTop: '1px solid #d4af37',
    paddingTop: '20px'
  },
  subsectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#0a0a0a',
    marginBottom: '15px',
    marginTop: '10px'
  },
  checkboxGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginTop: '10px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    transition: 'background 0.2s ease'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  error: {
    display: 'block',
    marginTop: '5px',
    color: '#ff4444',
    fontSize: '12px'
  }
};

export default PropertyFeatures;
