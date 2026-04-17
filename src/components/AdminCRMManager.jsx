import { useState, useEffect } from 'react';

/**
 * Admin CRM Manager
 * Gestione completa di Clients, Appointments, Deals, Activities, Documents
 */
const AdminCRMManager = ({ token }) => {
  const [activeSection, setActiveSection] = useState('clients');
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadCRMData();
  }, [activeSection]);

  const loadCRMData = async () => {
    try {
      setLoading(true);

      if (activeSection === 'clients') {
        const response = await fetch('http://localhost:3001/api/crm/clients', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) setClients(data.clients || []);
      } else if (activeSection === 'appointments') {
        const response = await fetch('http://localhost:3001/api/crm/appointments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) setAppointments(data.appointments || []);
      } else if (activeSection === 'deals') {
        const response = await fetch('http://localhost:3001/api/crm/deals', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) setDeals(data.deals || []);
      } else if (activeSection === 'activities') {
        const response = await fetch('http://localhost:3001/api/crm/activities', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) setActivities(data.activities || []);
      } else if (activeSection === 'documents') {
        const response = await fetch('http://localhost:3001/api/crm/documents', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error loading CRM data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemType, itemId) => {
    if (!confirm('Sei sicuro di voler eliminare questo elemento?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/crm/${itemType}/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        alert('Elemento eliminato con successo!');
        loadCRMData();
      } else {
        alert('Errore durante l\'eliminazione: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Errore durante l\'eliminazione');
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
    createButton: {
      padding: '0.75rem 1.5rem',
      background: 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    sectionsNav: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
      paddingBottom: '0.5rem',
      overflowX: 'auto'
    },
    sectionButton: {
      padding: '0.75rem 1.5rem',
      background: 'transparent',
      border: 'none',
      borderBottom: '3px solid transparent',
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap'
    },
    sectionButtonActive: {
      color: '#16a085',
      borderBottomColor: '#16a085'
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
      borderBottom: '2px solid rgba(22, 160, 133, 0.3)',
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
      margin: '0 0.25rem',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.8rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    editButton: {
      background: '#3498db',
      color: '#fff'
    },
    deleteButton: {
      background: '#e74c3c',
      color: '#fff'
    },
    badge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '700',
      display: 'inline-block'
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

  const sections = [
    { id: 'clients', label: '👤 Clienti', icon: '👤' },
    { id: 'appointments', label: '📅 Appuntamenti', icon: '📅' },
    { id: 'deals', label: '💼 Trattative', icon: '💼' },
    { id: 'activities', label: '📝 Attività', icon: '📝' },
    { id: 'documents', label: '📄 Documenti', icon: '📄' }
  ];

  const getBadgeStyle = (status) => {
    const colors = {
      active: '#2ecc71',
      pending: '#f39c12',
      completed: '#3498db',
      cancelled: '#e74c3c',
      lost: '#95a5a6',
      won: '#27ae60',
      new: '#1abc9c',
      in_progress: '#3498db'
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>📇 CRM Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          style={styles.createButton}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(22, 160, 133, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          + Crea Nuovo
        </button>
      </div>

      {/* Sections Navigation */}
      <div style={styles.sectionsNav}>
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            style={{
              ...styles.sectionButton,
              ...(activeSection === section.id ? styles.sectionButtonActive : {})
            }}
            onMouseOver={(e) => {
              if (activeSection !== section.id) {
                e.target.style.color = 'rgba(255, 255, 255, 0.9)';
              }
            }}
            onMouseOut={(e) => {
              if (activeSection !== section.id) {
                e.target.style.color = 'rgba(255, 255, 255, 0.6)';
              }
            }}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={styles.loading}>⏳ Caricamento...</div>
      ) : (
        <>
          {/* CLIENTS SECTION */}
          {activeSection === 'clients' && (
            <>
              {clients.length === 0 ? (
                <div style={styles.emptyState}>
                  Nessun cliente trovato. Clicca su "Crea Nuovo" per aggiungere il primo cliente.
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Nome</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Telefono</th>
                      <th style={styles.th}>Tipo</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Creato</th>
                      <th style={styles.th}>Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(client => (
                      <tr key={client.id}>
                        <td style={styles.td}>#{client.id}</td>
                        <td style={styles.td}>{client.firstName} {client.lastName}</td>
                        <td style={styles.td}>{client.email}</td>
                        <td style={styles.td}>{client.phone || '-'}</td>
                        <td style={styles.td}>{client.type || 'buyer'}</td>
                        <td style={styles.td}>
                          <span style={getBadgeStyle(client.status || 'active')}>
                            {client.status || 'active'}
                          </span>
                        </td>
                        <td style={styles.td}>{formatDate(client.createdAt)}</td>
                        <td style={styles.td}>
                          <button
                            onClick={() => setEditingItem(client)}
                            style={{...styles.actionButton, ...styles.editButton}}
                          >
                            Modifica
                          </button>
                          <button
                            onClick={() => handleDelete('clients', client.id)}
                            style={{...styles.actionButton, ...styles.deleteButton}}
                          >
                            Elimina
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {/* APPOINTMENTS SECTION */}
          {activeSection === 'appointments' && (
            <>
              {appointments.length === 0 ? (
                <div style={styles.emptyState}>
                  Nessun appuntamento trovato. Clicca su "Crea Nuovo" per aggiungere il primo appuntamento.
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Titolo</th>
                      <th style={styles.th}>Cliente</th>
                      <th style={styles.th}>Data/Ora</th>
                      <th style={styles.th}>Tipo</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(apt => (
                      <tr key={apt.id}>
                        <td style={styles.td}>#{apt.id}</td>
                        <td style={styles.td}>{apt.title}</td>
                        <td style={styles.td}>
                          {apt.client ? `${apt.client.firstName} ${apt.client.lastName}` : '-'}
                        </td>
                        <td style={styles.td}>{formatDate(apt.scheduledAt)}</td>
                        <td style={styles.td}>{apt.appointmentType || 'viewing'}</td>
                        <td style={styles.td}>
                          <span style={getBadgeStyle(apt.status || 'pending')}>
                            {apt.status || 'pending'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => setEditingItem(apt)}
                            style={{...styles.actionButton, ...styles.editButton}}
                          >
                            Modifica
                          </button>
                          <button
                            onClick={() => handleDelete('appointments', apt.id)}
                            style={{...styles.actionButton, ...styles.deleteButton}}
                          >
                            Elimina
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {/* DEALS SECTION */}
          {activeSection === 'deals' && (
            <>
              {deals.length === 0 ? (
                <div style={styles.emptyState}>
                  Nessuna trattativa trovata. Clicca su "Crea Nuovo" per aggiungere la prima trattativa.
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Titolo</th>
                      <th style={styles.th}>Cliente</th>
                      <th style={styles.th}>Valore</th>
                      <th style={styles.th}>Stage</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Chiusura Prevista</th>
                      <th style={styles.th}>Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deals.map(deal => (
                      <tr key={deal.id}>
                        <td style={styles.td}>#{deal.id}</td>
                        <td style={styles.td}>{deal.title}</td>
                        <td style={styles.td}>
                          {deal.client ? `${deal.client.firstName} ${deal.client.lastName}` : '-'}
                        </td>
                        <td style={styles.td}>
                          €{deal.value ? deal.value.toLocaleString() : '0'}
                        </td>
                        <td style={styles.td}>{deal.stage || 'initial'}</td>
                        <td style={styles.td}>
                          <span style={getBadgeStyle(deal.status || 'active')}>
                            {deal.status || 'active'}
                          </span>
                        </td>
                        <td style={styles.td}>{formatDate(deal.expectedCloseDate)}</td>
                        <td style={styles.td}>
                          <button
                            onClick={() => setEditingItem(deal)}
                            style={{...styles.actionButton, ...styles.editButton}}
                          >
                            Modifica
                          </button>
                          <button
                            onClick={() => handleDelete('deals', deal.id)}
                            style={{...styles.actionButton, ...styles.deleteButton}}
                          >
                            Elimina
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {/* ACTIVITIES SECTION */}
          {activeSection === 'activities' && (
            <>
              {activities.length === 0 ? (
                <div style={styles.emptyState}>
                  Nessuna attività trovata. Clicca su "Crea Nuovo" per aggiungere la prima attività.
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Tipo</th>
                      <th style={styles.th}>Descrizione</th>
                      <th style={styles.th}>Cliente</th>
                      <th style={styles.th}>Data</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map(activity => (
                      <tr key={activity.id}>
                        <td style={styles.td}>#{activity.id}</td>
                        <td style={styles.td}>{activity.activityType || 'note'}</td>
                        <td style={styles.td}>
                          {activity.description?.substring(0, 50)}
                          {activity.description?.length > 50 ? '...' : ''}
                        </td>
                        <td style={styles.td}>
                          {activity.client ? `${activity.client.firstName} ${activity.client.lastName}` : '-'}
                        </td>
                        <td style={styles.td}>{formatDate(activity.activityDate)}</td>
                        <td style={styles.td}>
                          <span style={getBadgeStyle(activity.status || 'completed')}>
                            {activity.status || 'completed'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => setEditingItem(activity)}
                            style={{...styles.actionButton, ...styles.editButton}}
                          >
                            Modifica
                          </button>
                          <button
                            onClick={() => handleDelete('activities', activity.id)}
                            style={{...styles.actionButton, ...styles.deleteButton}}
                          >
                            Elimina
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {/* DOCUMENTS SECTION */}
          {activeSection === 'documents' && (
            <>
              {documents.length === 0 ? (
                <div style={styles.emptyState}>
                  Nessun documento trovato. Clicca su "Crea Nuovo" per caricare il primo documento.
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Nome File</th>
                      <th style={styles.th}>Tipo</th>
                      <th style={styles.th}>Cliente</th>
                      <th style={styles.th}>Dimensione</th>
                      <th style={styles.th}>Caricato</th>
                      <th style={styles.th}>Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map(doc => (
                      <tr key={doc.id}>
                        <td style={styles.td}>#{doc.id}</td>
                        <td style={styles.td}>{doc.fileName}</td>
                        <td style={styles.td}>{doc.documentType || 'contract'}</td>
                        <td style={styles.td}>
                          {doc.client ? `${doc.client.firstName} ${doc.client.lastName}` : '-'}
                        </td>
                        <td style={styles.td}>
                          {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(2)} KB` : '-'}
                        </td>
                        <td style={styles.td}>{formatDate(doc.createdAt)}</td>
                        <td style={styles.td}>
                          <button
                            onClick={() => window.open(doc.filePath, '_blank')}
                            style={{...styles.actionButton, ...styles.editButton}}
                          >
                            Download
                          </button>
                          <button
                            onClick={() => handleDelete('documents', doc.id)}
                            style={{...styles.actionButton, ...styles.deleteButton}}
                          >
                            Elimina
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AdminCRMManager;
