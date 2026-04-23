import { useState } from 'react';
import { API_BASE_URL } from '../config/api';


/**
 * Modal per creare un nuovo annuncio immobiliare
 * Usato da Partner/Agent nella Dashboard CRM
 */
const PropertyCreateModal = ({ isOpen, onClose, onSuccess, partnerId, agentId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'sale',
    propertyType: 'apartment',
    price: '',
    location: '',
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
    condition: 'good',
    heating: 'autonomous',
    furnished: 'no',
    // MLS fields
    mlsEnabled: false,
    mlsVisibility: 'private',
    allowCollaboration: true,
    commissionSplitPercentage: 50
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageMarks, setImageMarks] = useState([]); // Array di oggetti con marcature
  const [floorPlans, setFloorPlans] = useState([]);
  const [floorPlanPreviews, setFloorPlanPreviews] = useState([]);
  const [videos, setVideos] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Gestione cambio campo
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  // Gestione checkbox
  const handleCheckbox = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Gestione selezione immagini
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);

    // Limite massimo 20 immagini
    if (files.length + images.length > 20) {
      setError('Massimo 20 immagini per annuncio');
      return;
    }

    // Validazione tipo file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(f => !validTypes.includes(f.type));

    if (invalidFiles.length > 0) {
      setError('Solo immagini JPG, PNG o WebP sono permesse');
      return;
    }

    // Validazione dimensione singola (max 10MB per immagine)
    const oversizedFiles = files.filter(f => f.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('Dimensione massima 10MB per immagine');
      return;
    }

    // Calcola dimensione totale attuale
    const currentTotalSize = images.reduce((total, img) => total + img.size, 0);
    const newFilesSize = files.reduce((total, file) => total + file.size, 0);
    const totalSize = currentTotalSize + newFilesSize;

    // Limite totale: 100MB (0.1GB)
    const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB
    if (totalSize > MAX_TOTAL_SIZE) {
      const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);
      const maxSizeMB = (MAX_TOTAL_SIZE / (1024 * 1024)).toFixed(0);
      setError(`Dimensione totale ${totalSizeMB}MB supera il limite di ${maxSizeMB}MB`);
      return;
    }

    // Aggiungi immagini
    setImages(prev => [...prev, ...files]);

    // Inizializza marcature per nuove immagini (prima immagine = principale)
    const newMarks = files.map((_, idx) => ({
      isPrimary: images.length === 0 && idx === 0, // Prima immagine = principale
      isCover: false,
      isFeatured: false
    }));
    setImageMarks(prev => [...prev, ...newMarks]);

    // Crea preview
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Rimuovi immagine
  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageMarks(prev => prev.filter((_, i) => i !== index));
  };

  // Cambia marcatura immagine
  const toggleImageMark = (index, markType) => {
    setImageMarks(prev => {
      const newMarks = [...prev];

      if (markType === 'isPrimary') {
        // Solo una può essere principale
        newMarks.forEach((mark, i) => {
          mark.isPrimary = i === index;
        });
      } else {
        // Toggle per altri tipi
        newMarks[index] = {
          ...newMarks[index],
          [markType]: !newMarks[index][markType]
        };
      }

      return newMarks;
    });
  };

  // Gestione selezione planimetrie
  const handleFloorPlanSelect = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + floorPlans.length > 10) {
      setError('Massimo 10 planimetrie per annuncio');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(f => !validTypes.includes(f.type));

    if (invalidFiles.length > 0) {
      setError('Solo immagini JPG, PNG o WebP sono permesse');
      return;
    }

    const oversizedFiles = files.filter(f => f.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('Dimensione massima 10MB per planimetria');
      return;
    }

    setFloorPlans(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFloorPlanPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Rimuovi planimetria
  const handleRemoveFloorPlan = (index) => {
    setFloorPlans(prev => prev.filter((_, i) => i !== index));
    setFloorPlanPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Gestione selezione video
  const handleVideoSelect = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + videos.length > 5) {
      setError('Massimo 5 video per annuncio');
      return;
    }

    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    const invalidFiles = files.filter(f => !validTypes.includes(f.type));

    if (invalidFiles.length > 0) {
      setError('Solo video MP4, WebM, MOV, AVI sono permessi');
      return;
    }

    const oversizedFiles = files.filter(f => f.size > 100 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('Dimensione massima 100MB per video');
      return;
    }

    setVideos(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreviews(prev => [...prev, { name: file.name, size: file.size, url: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Rimuovi video
  const handleRemoveVideo = (index) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
    setVideoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Upload immagini su server locale
  const uploadImages = async () => {
    try {
      // Crea FormData con tutte le immagini
      const formData = new FormData();
      images.forEach(image => {
        formData.append('images', image);
      });

      // Upload a server
      const response = await fetch('${API_BASE_URL}/api/upload/images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Errore upload immagini');
      }

      console.log(`✅ Uploaded ${data.count} images`);

      // Ritorna array di URL completi
      return data.images.map(url => `${API_BASE_URL}${url}`);

    } catch (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }
  };

  // Upload planimetrie
  const uploadFloorPlans = async () => {
    if (floorPlans.length === 0) return [];

    try {
      const formData = new FormData();
      floorPlans.forEach(file => {
        formData.append('floorplans', file);
      });

      const response = await fetch('${API_BASE_URL}/api/upload/floorplans', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Errore upload planimetrie');
      }

      console.log(`✅ Uploaded ${data.count} floor plans`);
      return data.floorplans.map(url => `${API_BASE_URL}${url}`);

    } catch (error) {
      console.error('❌ Floor plans upload error:', error);
      throw error;
    }
  };

  // Upload video
  const uploadVideos = async () => {
    if (videos.length === 0) return [];

    try {
      const formData = new FormData();
      videos.forEach(file => {
        formData.append('videos', file);
      });

      const response = await fetch('${API_BASE_URL}/api/upload/videos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Errore upload video');
      }

      console.log(`✅ Uploaded ${data.count} videos`);
      return data.videos.map(url => `${API_BASE_URL}${url}`);

    } catch (error) {
      console.error('❌ Video upload error:', error);
      throw error;
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validazione
    if (!formData.title || !formData.price || !formData.city || !formData.sqm) {
      setError('Titolo, prezzo, città e superficie sono obbligatori');
      setLoading(false);
      return;
    }

    if (images.length === 0) {
      setError('Aggiungi almeno una immagine');
      setLoading(false);
      return;
    }

    try {
      // Upload tutti i file
      setUploading(true);
      const imageUrls = await uploadImages();
      const floorPlanUrls = await uploadFloorPlans();
      const videoUrls = await uploadVideos();
      setUploading(false);

      // Prepara dati per API
      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        sqm: parseInt(formData.sqm),
        rooms: formData.rooms ? parseInt(formData.rooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
        images: imageUrls,
        mainImage: imageUrls[0],
        floorPlans: floorPlanUrls,
        videos: videoUrls,
        partnerId: partnerId,
        agentId: agentId || null,
        status: 'available',
        // MLS fields
        mlsEnabled: formData.mlsEnabled,
        mlsVisibility: formData.mlsEnabled ? formData.mlsVisibility : 'private',
        allowCollaboration: formData.mlsEnabled ? formData.allowCollaboration : false,
        commissionSplitPercentage: formData.mlsEnabled ? parseFloat(formData.commissionSplitPercentage) : null
      };

      // Crea annuncio
      const response = await fetch('${API_BASE_URL}/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(propertyData)
      });

      const data = await response.json();

      if (data.success || response.ok) {
        onSuccess(data.property || data);
        onClose();

        // Reset form
        setFormData({
          title: '', description: '', type: 'sale', propertyType: 'apartment',
          price: '', location: '', city: '', address: '', province: '', zipCode: '',
          sqm: '', rooms: '', bathrooms: '', floor: '', energyClass: '',
          hasParking: false, hasElevator: false, hasBalcony: false, hasGarden: false,
          yearBuilt: '', condition: 'good', heating: 'autonomous', furnished: 'no',
          mlsEnabled: false, mlsVisibility: 'private', allowCollaboration: true, commissionSplitPercentage: 50
        });
        setImages([]);
        setImagePreviews([]);
        setImageMarks([]);
        setFloorPlans([]);
        setFloorPlanPreviews([]);
        setVideos([]);
        setVideoPreviews([]);
        setVirtualTourUrl('');
      } else {
        setError(data.error || 'Errore durante la creazione dell\'annuncio');
      }
    } catch (err) {
      console.error('Errore creazione annuncio:', err);
      setError('Errore durante la creazione dell\'annuncio');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      padding: '1rem',
      overflowY: 'auto'
    },
    modal: {
      backgroundColor: '#1a1a2e',
      borderRadius: '20px',
      maxWidth: '900px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 20px 60px rgba(212, 175, 55, 0.3)',
      border: '2px solid #d4af37',
      margin: '2rem auto'
    },
    header: {
      background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
      padding: '2rem',
      borderRadius: '20px 20px 0 0',
      color: '#0a0a0a',
      position: 'relative'
    },
    closeButton: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: 'rgba(255, 255, 255, 0.3)',
      border: 'none',
      borderRadius: '50%',
      width: '36px',
      height: '36px',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s'
    },
    title: {
      margin: 0,
      fontSize: '1.8rem',
      fontWeight: '700',
      fontFamily: "'Playfair Display', serif"
    },
    body: {
      padding: '2rem',
      maxHeight: 'calc(90vh - 200px)',
      overflowY: 'auto'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    section: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid rgba(212, 175, 55, 0.2)'
    },
    sectionTitle: {
      color: '#d4af37',
      fontSize: '1.1rem',
      fontWeight: '600',
      marginBottom: '1rem',
      fontFamily: "'DM Sans', sans-serif"
    },
    row: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem'
    },
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    label: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#d4af37',
      fontFamily: "'DM Sans', sans-serif"
    },
    input: {
      padding: '0.875rem 1rem',
      fontSize: '1rem',
      border: '2px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#fff',
      fontFamily: "'DM Sans', sans-serif",
      transition: 'all 0.3s'
    },
    textarea: {
      padding: '0.875rem 1rem',
      fontSize: '1rem',
      border: '2px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#fff',
      fontFamily: "'DM Sans', sans-serif",
      minHeight: '120px',
      resize: 'vertical'
    },
    select: {
      padding: '0.875rem 1rem',
      fontSize: '1rem',
      border: '2px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#fff',
      fontFamily: "'DM Sans', sans-serif",
      cursor: 'pointer'
    },
    checkboxGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer'
    },
    checkbox: {
      width: '20px',
      height: '20px',
      cursor: 'pointer'
    },
    imageUpload: {
      border: '2px dashed rgba(212, 175, 55, 0.5)',
      borderRadius: '12px',
      padding: '2rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s',
      backgroundColor: 'rgba(255, 255, 255, 0.03)'
    },
    imageGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '1rem',
      marginTop: '1rem'
    },
    imagePreview: {
      position: 'relative',
      borderRadius: '8px',
      overflow: 'hidden',
      aspectRatio: '16/9'
    },
    removeImage: {
      position: 'absolute',
      top: '0.5rem',
      right: '0.5rem',
      background: 'rgba(255, 0, 0, 0.8)',
      border: 'none',
      borderRadius: '50%',
      width: '28px',
      height: '28px',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '1.2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3
    },
    imageMarks: {
      position: 'absolute',
      top: '0.5rem',
      left: '0.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.3rem',
      zIndex: 2
    },
    markBadge: {
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.7rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '0.2rem'
    },
    markPrimary: {
      background: 'rgba(212, 175, 55, 0.95)',
      color: '#0a0a0a'
    },
    markCover: {
      background: 'rgba(52, 152, 219, 0.95)',
      color: '#fff'
    },
    markFeatured: {
      background: 'rgba(155, 89, 182, 0.95)',
      color: '#fff'
    },
    imageActions: {
      position: 'absolute',
      bottom: '0.5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '0.5rem',
      zIndex: 2
    },
    markButton: {
      background: 'rgba(0, 0, 0, 0.7)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      fontSize: '1rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s'
    },
    markButtonActive: {
      background: '#d4af37',
      borderColor: '#d4af37',
      transform: 'scale(1.1)'
    },
    error: {
      backgroundColor: 'rgba(255, 59, 48, 0.1)',
      border: '1px solid rgba(255, 59, 48, 0.3)',
      borderRadius: '10px',
      padding: '1rem',
      color: '#ff3b30',
      fontSize: '0.9rem'
    },
    button: {
      padding: '1rem 2rem',
      fontSize: '1.1rem',
      fontWeight: '600',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif",
      transition: 'all 0.3s',
      marginTop: '1rem'
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
      color: '#0a0a0a'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <button
            onClick={onClose}
            style={styles.closeButton}
            onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.5)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
          >
            ×
          </button>
          <h2 style={styles.title}>📝 Pubblica Nuovo Annuncio</h2>
        </div>

        <div style={styles.body}>
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* INFORMAZIONI BASE */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📋 Informazioni Base</h3>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Titolo Annuncio *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="es. Attico con terrazza panoramica"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Descrizione</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Descrivi l'immobile in dettaglio..."
                  style={styles.textarea}
                />
              </div>

              <div style={styles.row}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Tipo Annuncio *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    style={styles.select}
                    required
                  >
                    <option value="sale">Vendita</option>
                    <option value="rent">Affitto</option>
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Tipo Immobile *</label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => handleChange('propertyType', e.target.value)}
                    style={styles.select}
                    required
                  >
                    <option value="apartment">Appartamento</option>
                    <option value="house">Casa</option>
                    <option value="villa">Villa</option>
                    <option value="loft">Loft</option>
                    <option value="office">Ufficio</option>
                    <option value="commercial">Commerciale</option>
                    <option value="land">Terreno</option>
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Prezzo (€) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="250000"
                    style={styles.input}
                    required
                  />
                </div>
              </div>
            </div>

            {/* POSIZIONE */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📍 Posizione</h3>

              <div style={styles.row}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Città *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Milano"
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Zona</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="Porta Nuova"
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Provincia</label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => handleChange('province', e.target.value)}
                    placeholder="MI"
                    style={styles.input}
                    maxLength={2}
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Indirizzo</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Via Roma, 10"
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>CAP</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleChange('zipCode', e.target.value)}
                    placeholder="20121"
                    style={styles.input}
                    maxLength={5}
                  />
                </div>
              </div>
            </div>

            {/* CARATTERISTICHE */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🏠 Caratteristiche</h3>

              <div style={styles.row}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Superficie (mq) *</label>
                  <input
                    type="number"
                    value={formData.sqm}
                    onChange={(e) => handleChange('sqm', e.target.value)}
                    placeholder="120"
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Locali</label>
                  <input
                    type="number"
                    value={formData.rooms}
                    onChange={(e) => handleChange('rooms', e.target.value)}
                    placeholder="4"
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Bagni</label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => handleChange('bathrooms', e.target.value)}
                    placeholder="2"
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Piano</label>
                  <input
                    type="text"
                    value={formData.floor}
                    onChange={(e) => handleChange('floor', e.target.value)}
                    placeholder="3"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Classe Energetica</label>
                  <select
                    value={formData.energyClass}
                    onChange={(e) => handleChange('energyClass', e.target.value)}
                    style={styles.select}
                  >
                    <option value="">Seleziona...</option>
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
                    placeholder="2020"
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Condizione</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => handleChange('condition', e.target.value)}
                    style={styles.select}
                  >
                    <option value="new">Nuovo</option>
                    <option value="excellent">Ottimo</option>
                    <option value="good">Buono</option>
                    <option value="fair">Discreto</option>
                    <option value="to_renovate">Da ristrutturare</option>
                  </select>
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Riscaldamento</label>
                  <select
                    value={formData.heating}
                    onChange={(e) => handleChange('heating', e.target.value)}
                    style={styles.select}
                  >
                    <option value="autonomous">Autonomo</option>
                    <option value="centralized">Centralizzato</option>
                    <option value="floor">A pavimento</option>
                    <option value="none">Assente</option>
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Arredamento</label>
                  <select
                    value={formData.furnished}
                    onChange={(e) => handleChange('furnished', e.target.value)}
                    style={styles.select}
                  >
                    <option value="no">Non arredato</option>
                    <option value="partial">Parzialmente arredato</option>
                    <option value="full">Completamente arredato</option>
                  </select>
                </div>
              </div>

              {/* Checkbox Features */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                <div style={styles.checkboxGroup} onClick={() => handleCheckbox('hasParking')}>
                  <input
                    type="checkbox"
                    checked={formData.hasParking}
                    onChange={() => {}}
                    style={styles.checkbox}
                  />
                  <label style={styles.label}>Posto Auto</label>
                </div>

                <div style={styles.checkboxGroup} onClick={() => handleCheckbox('hasElevator')}>
                  <input
                    type="checkbox"
                    checked={formData.hasElevator}
                    onChange={() => {}}
                    style={styles.checkbox}
                  />
                  <label style={styles.label}>Ascensore</label>
                </div>

                <div style={styles.checkboxGroup} onClick={() => handleCheckbox('hasBalcony')}>
                  <input
                    type="checkbox"
                    checked={formData.hasBalcony}
                    onChange={() => {}}
                    style={styles.checkbox}
                  />
                  <label style={styles.label}>Balcone</label>
                </div>

                <div style={styles.checkboxGroup} onClick={() => handleCheckbox('hasGarden')}>
                  <input
                    type="checkbox"
                    checked={formData.hasGarden}
                    onChange={() => {}}
                    style={styles.checkbox}
                  />
                  <label style={styles.label}>Giardino</label>
                </div>
              </div>
            </div>

            {/* MLS - CONDIVISIONE NETWORK */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🔗 Condivisione Network MLS</h3>
              <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                Abilita la condivisione di questo immobile con altri partner del network per aumentare le possibilità di vendita/affitto tramite collaborazioni.
              </div>

              {/* MLS Enabled Toggle */}
              <div style={styles.checkboxGroup} onClick={() => handleCheckbox('mlsEnabled')}>
                <input
                  type="checkbox"
                  checked={formData.mlsEnabled}
                  onChange={() => {}}
                  style={styles.checkbox}
                />
                <label style={styles.label}>Abilita condivisione MLS</label>
              </div>

              {/* Mostra opzioni MLS solo se abilitato */}
              {formData.mlsEnabled && (
                <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>

                  <div style={styles.row}>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Visibilità MLS</label>
                      <select
                        value={formData.mlsVisibility}
                        onChange={(e) => handleChange('mlsVisibility', e.target.value)}
                        style={styles.select}
                      >
                        <option value="private">Privato (solo tu)</option>
                        <option value="mls_only">Solo Network MLS</option>
                        <option value="public">Pubblico (tutti)</option>
                      </select>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.5rem' }}>
                        {formData.mlsVisibility === 'private' && '🔒 Visibile solo a te'}
                        {formData.mlsVisibility === 'mls_only' && '🤝 Condiviso con partner del network'}
                        {formData.mlsVisibility === 'public' && '🌍 Visibile pubblicamente'}
                      </div>
                    </div>

                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Percentuale Split Commissione (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="5"
                        value={formData.commissionSplitPercentage}
                        onChange={(e) => handleChange('commissionSplitPercentage', e.target.value)}
                        style={styles.input}
                      />
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.5rem' }}>
                        💰 Tu: {100 - formData.commissionSplitPercentage}% | Collaboratore: {formData.commissionSplitPercentage}%
                      </div>
                    </div>
                  </div>

                  {/* Allow Collaboration Toggle */}
                  <div style={{ marginTop: '1rem' }}>
                    <div style={styles.checkboxGroup} onClick={() => handleCheckbox('allowCollaboration')}>
                      <input
                        type="checkbox"
                        checked={formData.allowCollaboration}
                        onChange={() => {}}
                        style={styles.checkbox}
                      />
                      <label style={styles.label}>Consenti richieste di collaborazione</label>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.5rem', marginLeft: '1.75rem' }}>
                      {formData.allowCollaboration
                        ? '✅ Altri partner possono richiedere di collaborare su questo immobile'
                        : '🚫 Le richieste di collaborazione sono disabilitate'}
                    </div>
                  </div>

                  {/* Info Box */}
                  <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(52, 152, 219, 0.1)',
                    border: '1px solid rgba(52, 152, 219, 0.3)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    lineHeight: '1.6'
                  }}>
                    <div style={{ fontWeight: '600', color: '#3498db', marginBottom: '0.5rem' }}>ℹ️ Come funziona il Network MLS:</div>
                    <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                      <li>I tuoi immobili saranno visibili agli altri partner del network</li>
                      <li>Altri agenti possono portare clienti interessati</li>
                      <li>Le commissioni vengono automaticamente divise secondo la percentuale impostata</li>
                      <li>Devi approvare ogni richiesta di collaborazione prima che sia attiva</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* IMMAGINI */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📸 Immagini (max 20)</h3>
              <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                <strong>Marcature disponibili:</strong><br/>
                ⭐ <strong>Principale</strong>: Prima immagine mostrata (solo una)<br/>
                📸 <strong>Copertina</strong>: Usata per copertina galleria<br/>
                ✨ <strong>Evidenza</strong>: Mostrata in homepage/ricerche
              </div>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                style={{ display: 'none' }}
                id="image-upload"
              />

              <label
                htmlFor="image-upload"
                style={styles.imageUpload}
                onMouseOver={(e) => e.target.style.borderColor = '#d4af37'}
                onMouseOut={(e) => e.target.style.borderColor = 'rgba(212, 175, 55, 0.5)'}
              >
                <div style={{ fontSize: '3rem' }}>📷</div>
                <div style={{ color: '#d4af37', marginTop: '1rem', fontWeight: '600' }}>
                  Clicca per caricare immagini
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  JPG, PNG o WebP - Max 10MB per immagine, 100MB totali
                </div>
              </label>

              {imagePreviews.length > 0 && (
                <div style={styles.imageGrid}>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} style={styles.imagePreview}>
                      <img src={preview} alt={`Preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                      {/* Mark Badges */}
                      <div style={styles.imageMarks}>
                        {imageMarks[index]?.isPrimary && (
                          <span style={{...styles.markBadge, ...styles.markPrimary}}>⭐ Principale</span>
                        )}
                        {imageMarks[index]?.isCover && (
                          <span style={{...styles.markBadge, ...styles.markCover}}>📸 Copertina</span>
                        )}
                        {imageMarks[index]?.isFeatured && (
                          <span style={{...styles.markBadge, ...styles.markFeatured}}>✨ Evidenza</span>
                        )}
                      </div>

                      {/* Mark Buttons */}
                      <div style={styles.imageActions}>
                        <button
                          type="button"
                          onClick={() => toggleImageMark(index, 'isPrimary')}
                          style={{
                            ...styles.markButton,
                            ...(imageMarks[index]?.isPrimary ? styles.markButtonActive : {})
                          }}
                          title="Imposta come immagine principale"
                        >
                          ⭐
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleImageMark(index, 'isCover')}
                          style={{
                            ...styles.markButton,
                            ...(imageMarks[index]?.isCover ? styles.markButtonActive : {})
                          }}
                          title="Usa come copertina"
                        >
                          📸
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleImageMark(index, 'isFeatured')}
                          style={{
                            ...styles.markButton,
                            ...(imageMarks[index]?.isFeatured ? styles.markButtonActive : {})
                          }}
                          title="Metti in evidenza"
                        >
                          ✨
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        style={styles.removeImage}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PLANIMETRIE */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📐 Planimetrie (max 10)</h3>
              <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Carica le planimetrie dell'immobile (facoltativo)
              </div>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFloorPlanSelect}
                style={{ display: 'none' }}
                id="floorplan-upload"
              />

              <label
                htmlFor="floorplan-upload"
                style={styles.imageUpload}
                onMouseOver={(e) => e.target.style.borderColor = '#d4af37'}
                onMouseOut={(e) => e.target.style.borderColor = 'rgba(212, 175, 55, 0.5)'}
              >
                <div style={{ fontSize: '3rem' }}>📐</div>
                <div style={{ color: '#d4af37', marginTop: '1rem', fontWeight: '600' }}>
                  Clicca per caricare planimetrie
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  JPG, PNG o WebP - Max 10MB per file
                </div>
              </label>

              {floorPlanPreviews.length > 0 && (
                <div style={styles.imageGrid}>
                  {floorPlanPreviews.map((preview, index) => (
                    <div key={index} style={styles.imagePreview}>
                      <img src={preview} alt={`Planimetria ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => handleRemoveFloorPlan(index)}
                        style={styles.removeImage}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* VIDEO */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🎥 Video (max 5)</h3>
              <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Carica video dell'immobile (facoltativo) - Max 100MB per video
              </div>

              <input
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoSelect}
                style={{ display: 'none' }}
                id="video-upload"
              />

              <label
                htmlFor="video-upload"
                style={styles.imageUpload}
                onMouseOver={(e) => e.target.style.borderColor = '#d4af37'}
                onMouseOut={(e) => e.target.style.borderColor = 'rgba(212, 175, 55, 0.5)'}
              >
                <div style={{ fontSize: '3rem' }}>🎥</div>
                <div style={{ color: '#d4af37', marginTop: '1rem', fontWeight: '600' }}>
                  Clicca per caricare video
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  MP4, WebM, MOV, AVI - Max 100MB per video
                </div>
              </label>

              {videoPreviews.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  {videoPreviews.map((preview, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '10px',
                      border: '1px solid rgba(212, 175, 55, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '2rem' }}>🎥</div>
                        <div>
                          <div style={{ color: '#fff', fontWeight: '600' }}>{preview.name}</div>
                          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem' }}>
                            {(preview.size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveVideo(index)}
                        style={{
                          background: '#ff3b30',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: '1.2rem'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ERRORE */}
            {error && (
              <div style={styles.error}>
                ⚠️ {error}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading || uploading}
              style={{ ...styles.button, ...styles.primaryButton, opacity: (loading || uploading) ? 0.6 : 1 }}
            >
              {uploading ? '📤 Caricamento immagini...' : loading ? '⏳ Pubblicazione...' : '✅ Pubblica Annuncio'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyCreateModal;
