import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

/**
 * Lista annunci immobiliari per Dashboard Partner/Agent
 */
const PropertyList = ({ partnerId, agentId, token, onEdit }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, sale, rent, available, sold

  useEffect(() => {
    loadProperties();
  }, [partnerId, agentId, filter]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      let url = '${API_BASE_URL}/api/properties?';

      if (partnerId) url += `partnerId=${partnerId}&`;
      if (agentId) url += `agentId=${agentId}&`;
      if (filter !== 'all') {
        if (filter === 'sale' || filter === 'rent') {
          url += `type=${filter}&`;
        } else {
          url += `status=${filter}&`;
        }
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      setProperties(data.properties || data || []);
    } catch (error) {
      console.error('Errore caricamento annunci:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId) => {
    if (!confirm('Sei sicuro di voler eliminare questo annuncio?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setProperties(prev => prev.filter(p => p.id !== propertyId));
      } else {
        alert('Errore durante l\'eliminazione');
      }
    } catch (error) {
      console.error('Errore eliminazione:', error);
      alert('Errore durante l\'eliminazione');
    }
  };

  const styles = {
    container: {
      padding: '0'
    },
    filters: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      flexWrap: 'wrap'
    },
    filterButton: {
      padding: '0.75rem 1.5rem',
      border: '2px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#d4af37',
      cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: '600',
      transition: 'all 0.3s'
    },
    filterButtonActive: {
      backgroundColor: '#d4af37',
      color: '#0a0a0a',
      borderColor: '#d4af37'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '1.5rem'
    },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid rgba(212, 175, 55, 0.2)',
      transition: 'all 0.3s',
      cursor: 'pointer'
    },
    imageContainer: {
      position: 'relative',
      height: '220px',
      overflow: 'hidden'
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    badge: {
      position: 'absolute',
      top: '1rem',
      left: '1rem',
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '0.85rem',
      fontFamily: "'DM Sans', sans-serif"
    },
    saleBadge: {
      backgroundColor: '#d4af37',
      color: '#0a0a0a'
    },
    rentBadge: {
      backgroundColor: '#4CAF50',
      color: '#fff'
    },
    statusBadge: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      padding: '0.4rem 0.8rem',
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: '600'
    },
    cardBody: {
      padding: '1.5rem'
    },
    title: {
      fontSize: '1.2rem',
      fontWeight: '700',
      color: '#fff',
      marginBottom: '0.5rem',
      fontFamily: "'Playfair Display', serif"
    },
    location: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '0.9rem',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    price: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#d4af37',
      marginBottom: '1rem'
    },
    details: {
      display: 'flex',
      gap: '1.5rem',
      marginBottom: '1.5rem',
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '0.9rem'
    },
    detail: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.3rem'
    },
    actions: {
      display: 'flex',
      gap: '0.75rem',
      paddingTop: '1rem',
      borderTop: '1px solid rgba(212, 175, 55, 0.2)'
    },
    actionButton: {
      flex: 1,
      padding: '0.75rem',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontFamily: "'DM Sans', sans-serif",
      transition: 'all 0.3s'
    },
    editButton: {
      backgroundColor: 'rgba(212, 175, 55, 0.2)',
      color: '#d4af37',
      border: '1px solid rgba(212, 175, 55, 0.3)'
    },
    deleteButton: {
      backgroundColor: 'rgba(255, 59, 48, 0.1)',
      color: '#ff3b30',
      border: '1px solid rgba(255, 59, 48, 0.3)'
    },
    empty: {
      textAlign: 'center',
      padding: '4rem 2rem',
      color: 'rgba(255, 255, 255, 0.5)'
    },
    loading: {
      textAlign: 'center',
      padding: '4rem',
      color: '#d4af37',
      fontSize: '1.2rem'
    }
  };

  if (loading) {
    return <div style={styles.loading}>⏳ Caricamento annunci...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Filtri */}
      <div style={styles.filters}>
        <button
          onClick={() => setFilter('all')}
          style={{
            ...styles.filterButton,
            ...(filter === 'all' ? styles.filterButtonActive : {})
          }}
        >
          📋 Tutti
        </button>
        <button
          onClick={() => setFilter('sale')}
          style={{
            ...styles.filterButton,
            ...(filter === 'sale' ? styles.filterButtonActive : {})
          }}
        >
          💰 Vendita
        </button>
        <button
          onClick={() => setFilter('rent')}
          style={{
            ...styles.filterButton,
            ...(filter === 'rent' ? styles.filterButtonActive : {})
          }}
        >
          🏠 Affitto
        </button>
        <button
          onClick={() => setFilter('available')}
          style={{
            ...styles.filterButton,
            ...(filter === 'available' ? styles.filterButtonActive : {})
          }}
        >
          ✅ Disponibili
        </button>
        <button
          onClick={() => setFilter('sold')}
          style={{
            ...styles.filterButton,
            ...(filter === 'sold' ? styles.filterButtonActive : {})
          }}
        >
          🔒 Venduti/Affittati
        </button>
      </div>

      {/* Grid Annunci */}
      {properties.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Nessun annuncio trovato</div>
          <div>Pubblica il tuo primo annuncio per iniziare!</div>
        </div>
      ) : (
        <div style={styles.grid}>
          {properties.map((property) => (
            <div
              key={property.id}
              style={styles.card}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = '#d4af37';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(212, 175, 55, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Immagine */}
              <div style={styles.imageContainer}>
                <img
                  src={property.mainImage || property.images?.[0] || 'https://via.placeholder.com/400x250?text=No+Image'}
                  alt={property.title}
                  style={styles.image}
                />

                {/* Badge Tipo */}
                <div style={{
                  ...styles.badge,
                  ...(property.type === 'sale' ? styles.saleBadge : styles.rentBadge)
                }}>
                  {property.type === 'sale' ? 'VENDITA' : 'AFFITTO'}
                </div>

                {/* Badge Status */}
                {property.status && property.status !== 'available' && (
                  <div style={{
                    ...styles.statusBadge,
                    backgroundColor: property.status === 'sold' ? 'rgba(255, 59, 48, 0.9)' : 'rgba(255, 149, 0, 0.9)',
                    color: '#fff'
                  }}>
                    {property.status === 'sold' ? '🔒 VENDUTO' : property.status === 'rented' ? '🔒 AFFITTATO' : property.status.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Body */}
              <div style={styles.cardBody}>
                <h3 style={styles.title}>{property.title}</h3>

                <div style={styles.location}>
                  📍 {property.city}{property.location ? `, ${property.location}` : ''}
                </div>

                <div style={styles.price}>
                  €{property.price?.toLocaleString('it-IT')}
                  {property.type === 'rent' && <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>/mese</span>}
                </div>

                <div style={styles.details}>
                  {property.sqm && (
                    <div style={styles.detail}>
                      <span>📐</span>
                      <span>{property.sqm} mq</span>
                    </div>
                  )}
                  {property.rooms && (
                    <div style={styles.detail}>
                      <span>🚪</span>
                      <span>{property.rooms} locali</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div style={styles.detail}>
                      <span>🚿</span>
                      <span>{property.bathrooms} bagni</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={styles.actions}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit && onEdit(property);
                    }}
                    style={styles.actionButton, styles.editButton}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#d4af37';
                      e.target.style.color = '#0a0a0a';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'rgba(212, 175, 55, 0.2)';
                      e.target.style.color = '#d4af37';
                    }}
                  >
                    ✏️ Modifica
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(property.id);
                    }}
                    style={{...styles.actionButton, ...styles.deleteButton}}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#ff3b30';
                      e.target.style.color = '#fff';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 59, 48, 0.1)';
                      e.target.style.color = '#ff3b30';
                    }}
                  >
                    🗑️ Elimina
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyList;
