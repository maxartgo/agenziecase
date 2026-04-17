import { useState } from 'react';
import { BasicInfo, LocationDetails, PropertyFeatures, ImageUpload, MLSSettings } from './index.js';

/**
 * PropertyCreateModal - Versione Modular
 * Modal per creare un nuovo annuncio immobiliare
 * Componente diviso in sub-componenti per migliorare performance e manutenibilità
 *
 * @param {boolean} isOpen - Se il modal è aperto
 * @param {function} onClose - Funzione chiamata alla chiusura
 * @param {function} onSuccess - Funzione chiamata dopo creazione riuscita
 * @param {number} partnerId - ID del partner
 * @param {number} agentId - ID dell'agente
 */
const PropertyCreateModalNew = ({ isOpen, onClose, onSuccess, partnerId, agentId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Vendita',
    propertyType: '',
    price: '',
    city: '',
    address: '',
    province: '',
    zipCode: '',
    sqm: '',
    rooms: '',
    bathrooms: '',
    floor: '',
    energyClass: '',
    hasParking: false,
    hasElevator: false,
    hasBalcony: false,
    hasGarden: false,
    yearBuilt: '',
    // MLS fields
    mlsEnabled: false,
    mlsVisibility: 'private',
    allowCollaboration: true,
    commissionSplitPercentage: 50
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Gestione cambio campo generico
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  // Validazione
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) errors.title = 'Il titolo è obbligatorio';
    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = 'Il prezzo deve essere maggiore di 0';
    }
    if (!formData.city.trim()) errors.city = 'La città è obbligatoria';
    if (!formData.sqm || parseInt(formData.sqm) <= 0) {
      errors.sqm = 'La superficie deve essere maggiore di 0';
    }
    if (!formData.propertyType) errors.propertyType = 'Seleziona la tipologia';

    return errors;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validazione
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors)[0]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Creazione FormData per upload
      const formDataToSend = new FormData();

      // Aggiungi dati immobile
      Object.entries({
        ...formData,
        partnerId,
        agentId,
        price: parseFloat(formData.price),
        sqm: parseInt(formData.sqm),
        rooms: parseInt(formData.rooms),
        bathrooms: parseInt(formData.bathrooms) || 0,
        yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : null
      }).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          formDataToSend.append(key, value);
        }
      });

      // Aggiungi immagini
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      // Upload su Cloudinary e creazione proprietà
      const response = await fetch('http://localhost:3001/api/properties', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante la creazione');
      }

      setSuccess('✅ Annuncio creato con successo!');

      // Reset form dopo 2 secondi
      setTimeout(() => {
        onSuccess?.(data.property);
        handleClose();
      }, 2000);

    } catch (err) {
      console.error('Errore creazione annuncio:', err);
      setError(err.message || 'Errore durante la creazione dell\'annuncio');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'Vendita',
      propertyType: '',
      price: '',
      city: '',
      address: '',
      province: '',
      zipCode: '',
      sqm: '',
      rooms: '',
      bathrooms: '',
      floor: '',
      energyClass: '',
      hasParking: false,
      hasElevator: false,
      hasBalcony: false,
      hasGarden: false,
      yearBuilt: '',
      mlsEnabled: false,
      mlsVisibility: 'private',
      allowCollaboration: true,
      commissionSplitPercentage: 50
    });
    setImages([]);
    setImagePreviews([]);
    setError('');
    setSuccess('');
  };

  // Close modal
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Se il modal non è aperto, non renderizzare nulla
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <button
            onClick={handleClose}
            style={styles.closeButton}
            onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.5)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
          >
            ×
          </button>
          <h2 style={styles.title}>📝 Pubblica Nuovo Annuncio</h2>
        </div>

        <div style={styles.body}>
          {error && (
            <div style={styles.errorBox}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div style={styles.successBox}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Informazioni Base */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📋 Informazioni Base</h3>
              <BasicInfo
                formData={formData}
                onChange={handleChange}
              />
            </div>

            {/* Posizione */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📍 Posizione</h3>
              <LocationDetails
                formData={formData}
                onChange={handleChange}
              />
            </div>

            {/* Caratteristiche */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🏠 Caratteristiche</h3>
              <PropertyFeatures
                formData={formData}
                onChange={handleChange}
              />
            </div>

            {/* MLS Settings */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🔗 Condivisione Network MLS</h3>
              <MLSSettings
                formData={formData}
                onChange={handleChange}
              />
            </div>

            {/* Upload Immagini */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📸 Immagini (max 20)</h3>
              <ImageUpload
                images={images}
                setImages={setImages}
                imagePreviews={imagePreviews}
                setImagePreviews={setImagePreviews}
                maxImages={20}
              />
            </div>

            {/* Buttons */}
            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={handleClose}
                style={styles.buttonSecondary}
                disabled={loading}
              >
                Annulla
              </button>
              <button
                type="submit"
                style={styles.buttonPrimary}
                disabled={loading}
              >
                {loading ? '⏳ Pubblicazione in corso...' : '🚀 Pubblica Annuncio'}
              </button>
            </div>
          </form>
        </div>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(5px)',
    animation: 'fadeIn 0.3s ease'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideUp 0.3s ease'
  },
  header: {
    padding: '20px 25px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeButton: {
    background: 'rgba(255, 255, 255, 0.3)',
    border: 'none',
    fontSize: '32px',
    cursor: 'pointer',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    color: '#0a0a0a'
  },
  body: {
    padding: '25px',
    overflowY: 'auto',
    flex: 1
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  section: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e0e0e0'
  },
  sectionTitle: {
    margin: '0 0 15px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#0a0a0a'
  },
  errorBox: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #fcc'
  },
  successBox: {
    backgroundColor: '#efe',
    color: '#3c3',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #cec'
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #eee'
  },
  buttonPrimary: {
    flex: 1,
    padding: '14px 28px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#d4af37',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)'
  },
  buttonSecondary: {
    flex: 1,
    padding: '14px 28px',
    fontSize: '16px',
    fontWeight: '500',
    color: '#0a0a0a',
    backgroundColor: '#f5f5f5',
    border: '2px solid #d4af37',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};

export default PropertyCreateModalNew;
