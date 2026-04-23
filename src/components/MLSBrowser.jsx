import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';


/**
 * MLS Browser - Esplora immobili condivisi da altri partner
 */
const MLSBrowser = ({ token }) => {
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [collaborationNotes, setCollaborationNotes] = useState('');
  const [requesting, setRequesting] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    city: '',
    minPrice: '',
    maxPrice: '',
    propertyType: '',
    bedrooms: ''
  });

  useEffect(() => {
    loadMLSProperties();
    loadStats();
  }, []);

  const loadMLSProperties = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (filters.city) queryParams.append('city', filters.city);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.propertyType) queryParams.append('propertyType', filters.propertyType);
      if (filters.bedrooms) queryParams.append('bedrooms', filters.bedrooms);

      const response = await fetch(`${API_BASE_URL}/api/mls/properties?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setProperties(data.properties || []);
      }
    } catch (error) {
      console.error('Error loading MLS properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('${API_BASE_URL}/api/mls/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleRequestCollaboration = async (property) => {
    setSelectedProperty(property);
    setShowCollaborationModal(true);
  };

  const submitCollaborationRequest = async () => {
    if (!selectedProperty) return;

    try {
      setRequesting(true);
      const response = await fetch('${API_BASE_URL}/api/mls/collaborations/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          propertyId: selectedProperty.id,
          notes: collaborationNotes,
          proposedCommissionSplit: selectedProperty.commission_split_percentage
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Richiesta di collaborazione inviata con successo!');
        setShowCollaborationModal(false);
        setCollaborationNotes('');
        setSelectedProperty(null);
        loadMLSProperties();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error requesting collaboration:', error);
      alert('Errore durante la richiesta');
    } finally {
      setRequesting(false);
    }
  };

  const applyFilters = () => {
    loadMLSProperties();
  };

  const resetFilters = () => {
    setFilters({
      city: '',
      minPrice: '',
      maxPrice: '',
      propertyType: '',
      bedrooms: ''
    });
    setTimeout(() => loadMLSProperties(), 100);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading && properties.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
        Caricamento network MLS...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#2c3e50', marginBottom: '0.5rem' }}>
          🔗 Network MLS - Immobili Condivisi
        </h1>
        <p style={{ color: '#7f8c8d', fontSize: '0.95rem' }}>
          Esplora gli immobili disponibili da altri partner e richiedi collaborazioni
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #3498db'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '0.5rem' }}>
              Immobili MLS Disponibili
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3498db' }}>
              {properties.length}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #16a085'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '0.5rem' }}>
              Collaborazioni Attive
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#16a085' }}>
              {stats.active_collaborations || 0}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #f39c12'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '0.5rem' }}>
              Collaborazioni Completate
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f39c12' }}>
              {stats.completed_collaborations || 0}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2c3e50', marginBottom: '1rem' }}>
          🔍 Filtri di Ricerca
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#2c3e50' }}>
              Città
            </label>
            <input
              type="text"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              placeholder="es. Milano, Roma..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#2c3e50' }}>
              Prezzo Min
            </label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              placeholder="€"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#2c3e50' }}>
              Prezzo Max
            </label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              placeholder="€"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#2c3e50' }}>
              Tipologia
            </label>
            <select
              value={filters.propertyType}
              onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '0.95rem'
              }}
            >
              <option value="">Tutte</option>
              <option value="apartment">Appartamento</option>
              <option value="house">Casa</option>
              <option value="villa">Villa</option>
              <option value="office">Ufficio</option>
              <option value="land">Terreno</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#2c3e50' }}>
              Camere (min)
            </label>
            <input
              type="number"
              value={filters.bedrooms}
              onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
              placeholder="0"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '0.95rem'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={applyFilters}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#16a085',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Applica Filtri
          </button>
          <button
            onClick={resetFilters}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#ecf0f1',
              color: '#2c3e50',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏘️</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#2c3e50', marginBottom: '0.5rem' }}>
            Nessun immobile trovato
          </h3>
          <p style={{ color: '#7f8c8d' }}>
            Prova a modificare i filtri di ricerca
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {properties.map((property) => (
            <div
              key={property.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                transition: 'transform 0.2s, boxShadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              {/* Image */}
              <div style={{
                height: '200px',
                backgroundImage: property.images && property.images.length > 0
                  ? `url(${API_BASE_URL}${property.images[0]})`
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  backgroundColor: '#16a085',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}>
                  MLS
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '1rem',
                  left: '1rem',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '1.2rem',
                  fontWeight: '700'
                }}>
                  {formatPrice(property.price)}
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2c3e50', marginBottom: '0.5rem' }}>
                  {property.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '1rem' }}>
                  📍 {property.city}, {property.address}
                </p>

                {/* Details */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  {property.bedrooms && (
                    <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                      🛏️ {property.bedrooms} camere
                    </span>
                  )}
                  {property.bathrooms && (
                    <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                      🚿 {property.bathrooms} bagni
                    </span>
                  )}
                  {property.size && (
                    <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                      📐 {property.size}m²
                    </span>
                  )}
                </div>

                {/* Partner Info */}
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginBottom: '0.25rem' }}>
                    Listing Partner
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2c3e50' }}>
                    {property.partner_company_name}
                  </div>
                  {property.listing_agent_name && (
                    <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginTop: '0.25rem' }}>
                      👤 {property.listing_agent_name}
                    </div>
                  )}
                </div>

                {/* Commission Split */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '0.25rem' }}>
                    Split Commissione
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#16a085' }}>
                    {property.commission_split_percentage || 50}% / {100 - (property.commission_split_percentage || 50)}%
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleRequestCollaboration(property)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#16a085',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#138d75'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#16a085'}
                >
                  🤝 Richiedi Collaborazione
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Collaboration Request Modal */}
      {showCollaborationModal && selectedProperty && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => !requesting && setShowCollaborationModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2c3e50', marginBottom: '1rem' }}>
              🤝 Richiesta di Collaborazione
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2c3e50', marginBottom: '0.5rem' }}>
                {selectedProperty.title}
              </h3>
              <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                {selectedProperty.city} • {formatPrice(selectedProperty.price)}
              </p>
            </div>

            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '0.5rem' }}>
                Listing Partner
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '600', color: '#2c3e50' }}>
                {selectedProperty.partner_company_name}
              </div>
              {selectedProperty.listing_agent_name && (
                <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.25rem' }}>
                  Agente: {selectedProperty.listing_agent_name}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2c3e50', marginBottom: '0.5rem' }}>
                Split Commissione Proposto
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#16a085' }}>
                {selectedProperty.commission_split_percentage || 50}% Listing Agent / {100 - (selectedProperty.commission_split_percentage || 50)}% Collaborator
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c3e50' }}>
                Note per il Partner
              </label>
              <textarea
                value={collaborationNotes}
                onChange={(e) => setCollaborationNotes(e.target.value)}
                placeholder="Aggiungi eventuali note o dettagli sulla tua richiesta..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => !requesting && setShowCollaborationModal(false)}
                disabled={requesting}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#ecf0f1',
                  color: '#2c3e50',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: requesting ? 'not-allowed' : 'pointer'
                }}
              >
                Annulla
              </button>
              <button
                onClick={submitCollaborationRequest}
                disabled={requesting}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: requesting ? '#95a5a6' : '#16a085',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: requesting ? 'not-allowed' : 'pointer'
                }}
              >
                {requesting ? 'Invio...' : 'Invia Richiesta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MLSBrowser;
