import { useState } from 'react';

/**
 * MLSSettings - Impostazioni condivisione Network MLS
 * Configura visibilità e split di commissione
 */
const MLSSettings = ({ formData, onChange }) => {
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
      <div style={styles.checkboxGroup}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={formData.mlsEnabled}
            onChange={() => handleCheckbox('mlsEnabled')}
            style={styles.checkbox}
          />
          <div>
            <strong>🔗 Attiva condivisione MLS</strong>
            <p style={styles.checkboxHint}>
              Rendi questo immobile visibile agli altri partner del network
            </p>
          </div>
        </label>
      </div>

      {formData.mlsEnabled && (
        <>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Visibilità</label>
            <select
              value={formData.mlsVisibility}
              onChange={(e) => handleChange('mlsVisibility', e.target.value)}
              style={styles.input}
            >
              <option value="private">Privato - Solo per collaborazioni dirette</option>
              <option value="network">Network - Visibile a tutti i partner</option>
              <option value="public">Pubblico - Visibile anche sul portale pubblico</option>
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Permessi Collaborazione</label>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.allowCollaboration}
                onChange={() => handleCheckbox('allowCollaboration')}
                style={styles.checkbox}
              />
              <span>Permetti ad altri partner di proporre collaborazioni</span>
            </label>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Split Commissionione (% per partner collaboratore)
            </label>
            <input
              type="number"
              value={formData.commissionSplitPercentage}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 0 && value <= 100) {
                  handleChange('commissionSplitPercentage', value);
                }
              }}
              placeholder="50"
              style={{
                ...styles.input,
                borderColor: localErrors.commissionSplitPercentage ? '#ff4444' : '#d4af37'
              }}
            />
            {localErrors.commissionSplitPercentage && (
              <span style={styles.error}>{localErrors.commissionSplitPercentage}</span>
            )}
            <p style={styles.hint}>
              Percentuale della commissione che offri al partner che trova l'acquirente
            </p>
          </div>
        </>
      )}

      <div style={styles.infoBox}>
        <strong>ℹ️ Info MLS:</strong>
        <ul style={styles.infoList}>
          <li>Attivando la condivisione MLS, il tuo immobile sarà visibile agli altri partner</li>
          <li>Puoi ricevere proposte di collaborazione da altri agenti</li>
          <li>La commissione verrà divisa secondo lo split configurato</li>
        </ul>
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
  checkboxGroup: {
    marginBottom: '20px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    cursor: 'pointer',
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid #e0e0e0',
    backgroundColor: '#fff',
    transition: 'all 0.2s ease'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    marginTop: '2px',
    cursor: 'pointer'
  },
  checkboxHint: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: '#666'
  },
  hint: {
    fontSize: '12px',
    color: '#666',
    marginTop: '5px'
  },
  error: {
    display: 'block',
    marginTop: '5px',
    color: '#ff4444',
    fontSize: '12px'
  },
  infoBox: {
    backgroundColor: '#f0f8ff',
    border: '1px solid #d4af37',
    borderRadius: '8px',
    padding: '15px',
    marginTop: '20px'
  },
  infoList: {
    margin: '10px 0 0 20px',
    paddingLeft: '20px',
    fontSize: '13px',
    color: '#333'
  }
};

export default MLSSettings;
