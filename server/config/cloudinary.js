import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configurazione Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload immagine su Cloudinary
 * @param {string} filePath - Path del file da caricare
 * @param {string} folder - Cartella su Cloudinary (es. 'properties')
 * @returns {Promise<Object>} - URL e informazioni dell'immagine caricata
 */
export const uploadImage = async (filePath, folder = 'properties') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `agenziecase/${folder}`,
      transformation: [
        { width: 1200, height: 800, crop: 'limit' }, // Max size
        { quality: 'auto' }, // Auto quality optimization
        { fetch_format: 'auto' } // Auto format (WebP se supportato)
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    console.error('❌ Errore upload Cloudinary:', error);
    throw new Error('Errore durante l\'upload dell\'immagine');
  }
};

/**
 * Elimina immagine da Cloudinary
 * @param {string} publicId - ID pubblico dell'immagine
 * @returns {Promise<Object>} - Risultato dell'eliminazione
 */
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('❌ Errore eliminazione Cloudinary:', error);
    throw new Error('Errore durante l\'eliminazione dell\'immagine');
  }
};

/**
 * Upload multiplo di immagini
 * @param {Array} filePaths - Array di path di file
 * @param {string} folder - Cartella su Cloudinary
 * @returns {Promise<Array>} - Array di URL e info immagini
 */
export const uploadMultipleImages = async (filePaths, folder = 'properties') => {
  try {
    const uploadPromises = filePaths.map(path => uploadImage(path, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('❌ Errore upload multiplo:', error);
    throw new Error('Errore durante l\'upload delle immagini');
  }
};

export default cloudinary;
