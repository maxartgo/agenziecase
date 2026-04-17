import { useState, useEffect } from 'react';

/**
 * BasicInfo - Sezione informazioni base dell'immobile
 * Campi: titolo, descrizione, tipo, prezzo
 */
const BasicInfo = ({ formData, onChange, errors = {} }) => {
  const [localErrors, setLocalErrors] = useState({});

  useEffect(() => {
    setLocalErrors(errors);
  }, [errors]);

  const handleChange = (field, value) => {
    setLocalErrors(prev => ({ ...prev, [field]: '' }));
    onChange(field, value);
  };

  return (
    <>
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Titolo Annuncio *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="es. Attico con terrazza panoramica"
          style={{
            ...styles.input,
            borderColor: localErrors.title ? '#ff4444' : '#d4af37'
          }}
          required
        />
        {localErrors.title && <span style={styles.error}>{localErrors.title}</span>}
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Descrizione</label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Descrivi l'immobile in dettaglio..."
          style={styles.textarea}
          rows={4}
        />
      </div>

      <div style={styles.row}>
        <div style={{ ...styles.fieldGroup, flex: 1 }}>
          <label style={styles.label}>Tipo Annuncio *</label>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            style={styles.input}
            required
          >
            <option value="">Seleziona...</option>
            <option value="Vendita">Vendita</option>
            <option value="Affitto">Affitto</option>
          </select>
        </div>

        <div style={{ ...styles.fieldGroup, flex: 1 }}>
          <label style={styles.label}>Tipologia Immobile *</label>
          <select
            value={formData.propertyType}
            onChange={(e) => handleChange('propertyType', e.target.value)}
            style={styles.input}
            required
          >
            <option value="">Seleziona...</option>
            <option value="Appartamento">Appartamento</option>
            <option value="Villa">Villa</option>
            <option value="Loft">Loft</option>
            <option value="Attico">Attico</option>
            <option value="Bilocale">Bilocale</option>
            <option value="Trilocale">Trilocale</option>
            <option value="Quadrilocale">Quadrilocale</option>
            <option value="Mansarda">Mansarda</option>
            <option value="Terreno">Terreno</option>
            <option value="Garage">Garage</option>
            <option value="Ufficio">Ufficio</option>
            <option value="Negozio">Negozio</option>
            <option value="Capannone">Capannone</option>
            <option value="Rustico">Rustico</option>
            <option value="Casale">Casale</option>
          </select>
        </div>
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Prezzo (€) *</label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => handleChange('price', e.target.value)}
          placeholder="es. 250000"
          style={{
            ...styles.input,
            borderColor: localErrors.price ? '#ff4444' : '#d4af37'
          }}
          required
        />
        {localErrors.price && <span style={styles.error}>{localErrors.price}</span>}
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
  textarea: {
    width: '100%',
    padding: '12px',
    border: '2px solid #d4af37',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
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

export default BasicInfo;
