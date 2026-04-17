import { useState, useEffect } from 'react';

/**
 * Admin Properties Manager
 * Gestione completa immobili: View, Edit, Delete, Change Status
 */
const AdminPropertiesManager = ({ token }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, available, sold, rented
  const [filterType, setFilterType] = useState('all'); // all, apartment, house, office, etc.
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProperty, setEditingProperty] = useState(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);

      const response = await fetch('http://localhost:3001/api/properties?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setProperties(data.properties || []);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (propertyId, newStatus) => {
    if (!confirm(`Cambiare lo status dell'immobile a "${newStatus}"?`)) return;

    try {
      const response = await fetch(`http://localhost:3001/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        alert('Status aggiornato con successo!');
        loadProperties();
      } else {
        alert('Errore: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Errore durante l\'aggiornamento dello status');
    }
  };

  const handleDelete = async (propertyId) => {
    if (!confirm('Sei sicuro di voler eliminare questo immobile? Questa azione è irreversibile.')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/properties/${propertyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        alert('Immobile eliminato con successo!');
        loadProperties();
      } else {
        alert('Errore: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Errore durante l\'eliminazione');
    }
  };

  const handleFeature = async (propertyId, featured) => {
    try {
      const response = await fetch(`http://localhost:3001/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ featured: !featured })
      });

      const data = await response.json();
      if (data.success) {
        alert(featured ? 'Rimosso dai Featured' : 'Aggiunto ai Featured!');
        loadProperties();
      } else {
        alert('Errore: ' + data.message);
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      alert('Errore durante l\'aggiornamento');
    }
  };

  const styles = {
    container: {
      width: '100%'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem'
    },
    title: {
      fontSize: '1.8rem',
      fontWeight: '700',
      color: '#fff'
    },
    filtersContainer: {
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '2rem',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    filtersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    filterLabel: {
      fontSize: '0.85rem',
      color: 'rgba(255, 255, 255, 0.7)',
      fontWeight: '600'
    },
    select: {
      padding: '0.75rem',
      background: '#1a1a1a',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '6px',
      color: '#fff',
      fontSize: '0.9rem',
      cursor: 'pointer'
    },
    searchInput: {
      padding: '0.75rem',
      background: '#1a1a1a',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '6px',
      color: '#fff',
      fontSize: '0.9rem'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    statCard: {
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      borderRadius: '12px',
      padding: '1rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      textAlign: 'center'
    },
    statIcon: {
      fontSize: '1.5rem',
      marginBottom: '0.3rem'
    },
    statLabel: {
      fontSize: '0.75rem',
      color: 'rgba(255, 255, 255, 0.6)',
      marginBottom: '0.3rem'
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#3498db'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      borderRadius: '12px',
      overflow: 'hidden'
    },
    th: {
      textAlign: 'left',
      padding: '1rem',
      borderBottom: '2px solid rgba(52, 152, 219, 0.3)',
      fontSize: '0.85rem',
      fontWeight: '700',
      color: 'rgba(255, 255, 255, 0.8)',
      textTransform: 'uppercase'
    },
    td: {
      padding: '1rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      fontSize: '0.9rem',
      color: 'rgba(255, 255, 255, 0.9)'
    },
    actionButton: {
      padding: '0.4rem 0.8rem',
      margin: '0 0.25rem 0.25rem 0',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    viewButton: {
      background: '#3498db',
      color: '#fff'
    },
    editButton: {
      background: '#f39c12',
      color: '#fff'
    },
    deleteButton: {
      background: '#e74c3c',
      color: '#fff'
    },
    featureButton: {
      background: '#d4af37',
      color: '#fff'
    },
    statusButton: {
      background: '#2ecc71',
      color: '#fff'
    },
    badge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '700',
      display: 'inline-block'
    },
    propertyImage: {
      width: '80px',
      height: '60px',
      objectFit: 'cover',
      borderRadius: '6px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '1.1rem'
    },
    loading: {
      textAlign: 'center',
      padding: '2rem',
      fontSize: '1.1rem',
      color: 'rgba(255, 255, 255, 0.7)'
    }
  };

  const getBadgeStyle = (status) => {
    const colors = {
      available: '#2ecc71',
      sold: '#e74c3c',
      rented: '#3498db',
      pending: '#f39c12',
      reserved: '#9b59b6'
    };
    return {
      ...styles.badge,
      background: colors[status] || '#95a5a6',
      color: '#fff'
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getFilteredProperties = () => {
    return properties.filter(prop => {
      const matchesStatus = filterStatus === 'all' || prop.status === filterStatus;
      const matchesType = filterType === 'all' || prop.type === filterType;
      const matchesSearch = !searchTerm ||
        prop.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.address?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesType && matchesSearch;
    });
  };

  const filteredProperties = getFilteredProperties();

  const stats = {
    total: properties.length,
    available: properties.filter(p => p.status === 'available').length,
    sold: properties.filter(p => p.status === 'sold').length,
    rented: properties.filter(p => p.status === 'rented').length,
    featured: properties.filter(p => p.featured).length
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>🏠 Properties Management</h2>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🏠</div>
          <div style={styles.statLabel}>Total</div>
          <div style={styles.statValue}>{stats.total}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statLabel}>Available</div>
          <div style={styles.statValue}>{stats.available}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💰</div>
          <div style={styles.statLabel}>Sold</div>
          <div style={styles.statValue}>{stats.sold}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🔑</div>
          <div style={styles.statLabel}>Rented</div>
          <div style={styles.statValue}>{stats.rented}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⭐</div>
          <div style={styles.statLabel}>Featured</div>
          <div style={styles.statValue}>{stats.featured}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filtersContainer}>
        <div style={styles.filtersGrid}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>🔍 Cerca</label>
            <input
              type="text"
              placeholder="Cerca per titolo, città, indirizzo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>📊 Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={styles.select}
            >
              <option value="all">Tutti</option>
              <option value="available">Disponibili</option>
              <option value="sold">Venduti</option>
              <option value="rented">Affittati</option>
              <option value="pending">In Attesa</option>
              <option value="reserved">Riservati</option>
            </select>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>🏘️ Tipo</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={styles.select}
            >
              <option value="all">Tutti</option>
              <option value="apartment">Appartamento</option>
              <option value="house">Villa</option>
              <option value="office">Ufficio</option>
              <option value="commercial">Commerciale</option>
              <option value="land">Terreno</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Table */}
      {loading ? (
        <div style={styles.loading}>⏳ Caricamento immobili...</div>
      ) : filteredProperties.length === 0 ? (
        <div style={styles.emptyState}>
          Nessun immobile trovato con i filtri selezionati.
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Foto</th>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Titolo</th>
              <th style={styles.th}>Tipo</th>
              <th style={styles.th}>Prezzo</th>
              <th style={styles.th}>Città</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Featured</th>
              <th style={styles.th}>Pubblicato</th>
              <th style={styles.th}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredProperties.map(property => (
              <tr key={property.id}>
                <td style={styles.td}>
                  {property.mainImage ? (
                    <img
                      src={property.mainImage}
                      alt={property.title}
                      style={styles.propertyImage}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x60?text=No+Image';
                      }}
                    />
                  ) : (
                    <div style={{
                      ...styles.propertyImage,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#333',
                      fontSize: '0.7rem'
                    }}>
                      No Image
                    </div>
                  )}
                </td>
                <td style={styles.td}>#{property.id}</td>
                <td style={styles.td}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {property.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    {property.address}
                  </div>
                </td>
                <td style={styles.td}>{property.type}</td>
                <td style={styles.td}>
                  <div style={{ fontWeight: '600' }}>
                    €{property.price?.toLocaleString()}
                  </div>
                </td>
                <td style={styles.td}>{property.city}</td>
                <td style={styles.td}>
                  <span style={getBadgeStyle(property.status)}>
                    {property.status}
                  </span>
                </td>
                <td style={styles.td}>
                  {property.featured ? '⭐ Sì' : 'No'}
                </td>
                <td style={styles.td}>{formatDate(property.createdAt)}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => window.open(`/property/${property.id}`, '_blank')}
                      style={{...styles.actionButton, ...styles.viewButton}}
                    >
                      Vedi
                    </button>
                    <button
                      onClick={() => handleFeature(property.id, property.featured)}
                      style={{...styles.actionButton, ...styles.featureButton}}
                    >
                      {property.featured ? 'Rimuovi ⭐' : 'Featured ⭐'}
                    </button>
                    <button
                      onClick={() => {
                        const newStatus = prompt(
                          'Nuovo status (available, sold, rented, pending, reserved):',
                          property.status
                        );
                        if (newStatus) handleChangeStatus(property.id, newStatus);
                      }}
                      style={{...styles.actionButton, ...styles.statusButton}}
                    >
                      Cambia Status
                    </button>
                    <button
                      onClick={() => handleDelete(property.id)}
                      style={{...styles.actionButton, ...styles.deleteButton}}
                    >
                      Elimina
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{
        marginTop: '1.5rem',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '0.9rem'
      }}>
        Mostrando {filteredProperties.length} di {properties.length} immobili
      </div>
    </div>
  );
};

export default AdminPropertiesManager;
