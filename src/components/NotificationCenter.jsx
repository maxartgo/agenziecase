import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';


/**
 * Centro Notifiche Completo
 * Pagina dedicata per visualizzare e gestire tutte le notifiche
 */
const NotificationCenter = ({ token, onNavigate }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    loadNotifications();
  }, [token, filter, typeFilter, priorityFilter]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      let url = '${API_BASE_URL}/api/notifications?limit=100';

      if (filter === 'unread') url += '&isRead=false';
      if (filter === 'read') url += '&isRead=true';
      if (typeFilter !== 'all') url += `&type=${typeFilter}`;
      if (priorityFilter !== 'all') url += `&priority=${priorityFilter}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('${API_BASE_URL}/api/notifications/read-all', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    if (!confirm('Eliminare questa notifica?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.link && onNavigate) {
      onNavigate(notification.link);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'mls_collaboration_request': '🤝',
      'mls_collaboration_approved': '✅',
      'mls_collaboration_rejected': '❌',
      'mls_new_lead': '📋',
      'mls_transaction_completed': '💰',
      'mls_payment_received': '💵'
    };
    return icons[type] || '🔔';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'urgent': '#e74c3c',
      'high': '#f39c12',
      'normal': '#16a085',
      'low': '#95a5a6'
    };
    return colors[priority] || colors.normal;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      'urgent': 'Urgente',
      'high': 'Alta',
      'normal': 'Normale',
      'low': 'Bassa'
    };
    return labels[priority] || priority;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeLabel = (type) => {
    const labels = {
      'mls_collaboration_request': 'Richiesta Collaborazione',
      'mls_collaboration_approved': 'Collaborazione Approvata',
      'mls_collaboration_rejected': 'Collaborazione Rifiutata',
      'mls_new_lead': 'Nuovo Lead',
      'mls_transaction_completed': 'Transazione Completata',
      'mls_payment_received': 'Pagamento Ricevuto'
    };
    return labels[type] || type;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#d4af37',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    badge: {
      background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
      color: '#fff',
      borderRadius: '12px',
      padding: '0.25rem 0.75rem',
      fontSize: '0.9rem',
      fontWeight: '700'
    },
    actions: {
      display: 'flex',
      gap: '1rem'
    },
    button: {
      padding: '0.75rem 1.5rem',
      background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
      border: 'none',
      borderRadius: '12px',
      color: '#0a0a0a',
      fontSize: '0.95rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
    },
    filters: {
      display: 'flex',
      gap: '1.5rem',
      marginBottom: '2rem',
      padding: '1.5rem',
      background: 'rgba(26, 26, 26, 0.7)',
      border: '1px solid rgba(212, 175, 55, 0.2)',
      borderRadius: '16px',
      flexWrap: 'wrap'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    filterLabel: {
      color: '#d4af37',
      fontSize: '0.85rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    select: {
      padding: '0.5rem 1rem',
      background: 'rgba(10, 10, 10, 0.8)',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '0.9rem',
      cursor: 'pointer',
      outline: 'none'
    },
    notificationsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    notificationCard: {
      background: 'rgba(26, 26, 26, 0.7)',
      border: '1px solid rgba(212, 175, 55, 0.2)',
      borderRadius: '16px',
      padding: '1.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      position: 'relative',
      overflow: 'hidden'
    },
    notificationCardUnread: {
      borderColor: '#d4af37',
      borderWidth: '2px',
      background: 'rgba(212, 175, 55, 0.05)'
    },
    notificationHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      marginBottom: '1rem'
    },
    icon: {
      fontSize: '2rem',
      flexShrink: 0
    },
    content: {
      flex: 1
    },
    titleRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '0.5rem'
    },
    notificationTitle: {
      color: '#fff',
      fontSize: '1.1rem',
      fontWeight: '700',
      flex: 1
    },
    priorityBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '8px',
      fontSize: '0.75rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    typeBadge: {
      padding: '0.25rem 0.75rem',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      fontSize: '0.75rem',
      color: '#ccc'
    },
    message: {
      color: '#ccc',
      fontSize: '0.95rem',
      lineHeight: '1.6',
      marginBottom: '1rem'
    },
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid rgba(212, 175, 55, 0.1)'
    },
    timestamp: {
      color: '#999',
      fontSize: '0.85rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    deleteButton: {
      padding: '0.5rem 1rem',
      background: 'rgba(231, 76, 60, 0.2)',
      border: '1px solid rgba(231, 76, 60, 0.4)',
      borderRadius: '8px',
      color: '#e74c3c',
      fontSize: '0.85rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    emptyState: {
      padding: '4rem 2rem',
      textAlign: 'center',
      background: 'rgba(26, 26, 26, 0.7)',
      border: '1px solid rgba(212, 175, 55, 0.2)',
      borderRadius: '16px'
    },
    emptyIcon: {
      fontSize: '4rem',
      marginBottom: '1rem'
    },
    emptyText: {
      color: '#999',
      fontSize: '1.1rem'
    },
    loading: {
      padding: '4rem',
      textAlign: 'center',
      color: '#d4af37',
      fontSize: '1.2rem'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          🔔 Centro Notifiche
          {unreadCount > 0 && <span style={styles.badge}>{unreadCount} non lette</span>}
        </h1>
        <div style={styles.actions}>
          {unreadCount > 0 && (
            <button
              style={styles.button}
              onClick={handleMarkAllAsRead}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
              }}
            >
              ✓ Segna tutte come lette
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Stato</label>
          <select
            style={styles.select}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tutte</option>
            <option value="unread">Non lette</option>
            <option value="read">Lette</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Tipo</label>
          <select
            style={styles.select}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Tutti i tipi</option>
            <option value="mls_collaboration_request">Richieste Collaborazione</option>
            <option value="mls_collaboration_approved">Collaborazioni Approvate</option>
            <option value="mls_collaboration_rejected">Collaborazioni Rifiutate</option>
            <option value="mls_new_lead">Nuovi Lead</option>
            <option value="mls_transaction_completed">Transazioni Completate</option>
            <option value="mls_payment_received">Pagamenti Ricevuti</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Priorità</label>
          <select
            style={styles.select}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">Tutte</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="normal">Normale</option>
            <option value="low">Bassa</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div style={styles.loading}>Caricamento notifiche...</div>
      ) : notifications.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔔</div>
          <div style={styles.emptyText}>
            {filter === 'unread' ? 'Nessuna notifica non letta' : 'Nessuna notifica'}
          </div>
        </div>
      ) : (
        <div style={styles.notificationsList}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                ...styles.notificationCard,
                ...(!notification.is_read ? styles.notificationCardUnread : {})
              }}
              onClick={() => handleNotificationClick(notification)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={styles.notificationHeader}>
                <span style={styles.icon}>{getNotificationIcon(notification.type)}</span>
                <div style={styles.content}>
                  <div style={styles.titleRow}>
                    <h3 style={styles.notificationTitle}>{notification.title}</h3>
                    <span
                      style={{
                        ...styles.priorityBadge,
                        backgroundColor: getPriorityColor(notification.priority),
                        color: '#fff'
                      }}
                    >
                      {getPriorityLabel(notification.priority)}
                    </span>
                    <span style={styles.typeBadge}>{getTypeLabel(notification.type)}</span>
                  </div>
                  <p style={styles.message}>{notification.message}</p>
                  <div style={styles.footer}>
                    <div style={styles.timestamp}>
                      🕒 {formatDateTime(notification.created_at)}
                      {!notification.is_read && (
                        <span style={{ color: '#d4af37', fontWeight: '600' }}> • Non letta</span>
                      )}
                    </div>
                    <button
                      style={styles.deleteButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = 'rgba(231, 76, 60, 0.3)';
                        e.target.style.borderColor = '#e74c3c';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = 'rgba(231, 76, 60, 0.2)';
                        e.target.style.borderColor = 'rgba(231, 76, 60, 0.4)';
                      }}
                    >
                      🗑️ Elimina
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
