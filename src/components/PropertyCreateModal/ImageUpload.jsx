import { useState } from 'react';

/**
 * ImageUpload - Gestione upload immagini con preview
 * Supporta: upload drag & drop, preview, rimozione
 */
const ImageUpload = ({ images, setImages, imagePreviews, setImagePreviews, maxImages = 20 }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const fileList = Array.from(files);

    // Validazione numero immagini
    if (images.length + fileList.length > maxImages) {
      setError(`Massimo ${maxImages} immagini consentute`);
      return;
    }

    // Validazione tipo file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validFiles = fileList.filter(file => {
      if (!validTypes.includes(file.type)) {
        setError(`File "${file.name}" non valido. Solo JPG, PNG o WebP`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Validazione dimensione
    const maxSize = 10 * 1024 * 1024; // 10MB per immagine
    const sizeValidFiles = validFiles.filter(file => {
      if (file.size > maxSize) {
        setError(`File "${file.name}" troppo grande (max 10MB)`);
        return false;
      }
      return true;
    });

    if (sizeValidFiles.length === 0) return;

    // Creazione previews
    const newPreviews = sizeValidFiles.map(file => URL.createObjectURL(file));

    setImages([...images, ...sizeValidFiles]);
    setImagePreviews([...imagePreviews, ...newPreviews]);
    setError('');
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    // Revocare URL oggetto per liberare memoria
    URL.revokeObjectURL(imagePreviews[index]);

    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  return (
    <>
      <div
        style={{
          ...styles.uploadArea,
          borderColor: dragActive ? '#d4af37' : '#ccc'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          style={styles.fileInput}
        />
        <div style={styles.uploadPrompt}>
          <div style={styles.uploadIcon}>📸</div>
          <p style={styles.uploadText}>
            {dragActive ? 'Rilascia le immagini qui' : 'Trascina le immagini o clicca per selezionare'}
          </p>
          <p style={styles.uploadHint}>
            JPG, PNG o WebP (max 10MB per file, max {maxImages} immagini totali)
          </p>
        </div>
      </div>

      {error && <div style={styles.errorMessage}>{error}</div>}

      {imagePreviews.length > 0 && (
        <div style={styles.previewsGrid}>
          {imagePreviews.map((preview, index) => (
            <div key={index} style={styles.previewItem}>
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                style={styles.previewImage}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                style={styles.removeButton}
                title="Rimuovi immagine"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={styles.uploadInfo}>
        <span>📷 {imagePreviews.length} / {maxImages} immagini</span>
      </div>
    </>
  );
};

const styles = {
  uploadArea: {
    border: '2px dashed',
    borderRadius: '8px',
    padding: '30px',
    textAlign: 'center',
    cursor: 'pointer',
    marginBottom: '20px',
    transition: 'all 0.3s ease',
    backgroundColor: '#f9f9f9'
  },
  fileInput: {
    display: 'none'
  },
  uploadPrompt: {
    pointerEvents: 'none'
  },
  uploadIcon: {
    fontSize: '48px',
    marginBottom: '10px'
  },
  uploadText: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '5px'
  },
  uploadHint: {
    fontSize: '13px',
    color: '#666'
  },
  errorMessage: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '15px',
    fontSize: '14px'
  },
  previewsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '20px'
  },
  previewItem: {
    position: 'relative',
    aspectRatio: '16/9',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '2px solid #d4af37',
    backgroundColor: '#fff'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  removeButton: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'rgba(255, 68, 68, 0.9)',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  uploadInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    color: '#666',
    marginTop: '10px'
  }
};

export default ImageUpload;
