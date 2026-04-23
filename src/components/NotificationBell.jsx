import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config/api';


/**
 * Campanella Notifiche con dropdown
 * Mostra badge con contatore non lette + dropdown con ultime notifiche
 */
const NotificationBell = ({ token, onNotificationClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Chiudi dropdown se si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Carica contatore notifiche non lette
  useEffect(() => {
    loadUnreadCount();
    // Polling ogni 30 secondi per aggiornare il contatore
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Carica notifiche quando si apre il dropdown
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, token]);

  const loadUnreadCount = async () => {
    try {
      const response = await fetch('${API_BASE_URL}/api/notifications/unread/count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('${API_BASE_URL}/api/notifications?limit=5', {
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
        // Aggiorna lista locale
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        // Ricarica contatore
        loadUnreadCount();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    // Segna come letta se non lo è già
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    // Chiudi dropdown
    setIsOpen(false);
    // Callback per navigare alla sezione corretta
    if (onNotificationClick) {
      onNotificationClick(notification);
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

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Adesso';
    if (diffMins < 60) return `${diffMins}m fa`;
    if (diffHours < 24) return `${diffHours}h fa`;
    if (diffDays < 7) return `${diffDays}g fa`;
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
  };

  const styles = {
    container: {
      position: 'relative',
      display: 'inline-block'
    },
    bell: {
      position: 'relative',
      cursor: 'pointer',
      fontSize: '1.5rem',
      padding: '0.5rem',
      color: '#0a0a0a',
      transition: 'transform 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    badge: {
      position: 'absolute',
      top: '0.25rem',
      right: '0.25rem',
      background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
      color: '#fff',
      borderRadius: '10px',
      padding: '0.15rem 0.4rem',
      fontSize: '0.7rem',
      fontWeight: '700',
      minWidth: '1.2rem',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(231, 76, 60, 0.4)'
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      right: '0',
      marginTop: '0.5rem',
      width: '380px',
      maxHeight: '500px',
      overflowY: 'auto',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
      border: '2px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
      zIndex: 1000,
      backdropFilter: 'blur(10px)'
    },
    header: {
      padding: '1rem 1.25rem',
      borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(212, 175, 55, 0.05)'
    },
    headerTitle: {
      color: '#d4af37',
      fontSize: '1rem',
      fontWeight: '700'
    },
    viewAll: {
      color: '#d4af37',
      fontSize: '0.85rem',
      cursor: 'pointer',
      textDecoration: 'none',
      transition: 'opacity 0.2s'
    },
    notificationsList: {
      maxHeight: '400px',
      overflowY: 'auto'
    },
    notificationItem: {
      padding: '1rem 1.25rem',
      borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
      cursor: 'pointer',
      transition: 'background 0.2s'
    },
    notificationItemUnread: {
      background: 'rgba(212, 175, 55, 0.05)'
    },
    notificationHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.5rem'
    },
    notificationIcon: {
      fontSize: '1.2rem'
    },
    notificationTitle: {
      color: '#fff',
      fontSize: '0.9rem',
      fontWeight: '600',
      flex: 1
    },
    notificationTime: {
      color: '#999',
      fontSize: '0.75rem'
    },
    notificationMessage: {
      color: '#ccc',
      fontSize: '0.85rem',
      lineHeight: '1.4',
      marginLeft: '1.7rem'
    },
    priorityDot: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      marginLeft: '0.25rem'
    },
    emptyState: {
      padding: '3rem 1.5rem',
      textAlign: 'center',
      color: '#999'
    },
    emptyIcon: {
      fontSize: '3rem',
      marginBottom: '1rem'
    },
    emptyText: {
      fontSize: '0.95rem'
    },
    loading: {
      padding: '2rem',
      textAlign: 'center',
      color: '#d4af37'
    }
  };

  return (
    <div style={styles.container} ref={dropdownRef}>
      {/* Bell Icon */}
      <div
        style={styles.bell}
        onClick={() => setIsOpen(!isOpen)}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        🔔
        {unreadCount > 0 && (
          <span style={styles.badge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.header}>
            <div style={styles.headerTitle}>
              Notifiche {unreadCount > 0 && `(${unreadCount})`}
            </div>
            <a
              style={styles.viewAll}
              onClick={() => {
                setIsOpen(false);
                if (onNotificationClick) {
                  onNotificationClick({ link: '/notifications' });
                }
              }}
              onMouseOver={(e) => e.target.style.opacity = '0.7'}
              onMouseOut={(e) => e.target.style.opacity = '1'}
            >
              Vedi tutte
            </a>
          </div>

          <div style={styles.notificationsList}>
            {loading ? (
              <div style={styles.loading}>Caricamento...</div>
            ) : notifications.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🔔</div>
                <div style={styles.emptyText}>Nessuna notifica</div>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    ...styles.notificationItem,
                    ...(!notification.is_read ? styles.notificationItemUnread : {})
                  }}
                  onClick={() => handleNotificationClick(notification)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = !notification.is_read
                      ? 'rgba(212, 175, 55, 0.05)'
                      : 'transparent';
                  }}
                >
                  <div style={styles.notificationHeader}>
                    <span style={styles.notificationIcon}>
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div style={styles.notificationTitle}>
                      {notification.title}
                    </div>
                    <span style={styles.notificationTime}>
                      {formatTime(notification.created_at)}
                    </span>
                    <div
                      style={{
                        ...styles.priorityDot,
                        backgroundColor: getPriorityColor(notification.priority)
                      }}
                    />
                  </div>
                  <div style={styles.notificationMessage}>
                    {notification.message}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
