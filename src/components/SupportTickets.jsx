import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';


const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    category: '',
    priority: 'normal'
  });
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch('${API_BASE_URL}/api/support-tickets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTicketDetails = async (ticketId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/support-tickets/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSelectedTicket(data.ticket);
        setResponses(data.responses || []);
      }
    } catch (error) {
      console.error('Error loading ticket details:', error);
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('${API_BASE_URL}/api/support-tickets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTicket)
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Ticket creato con successo!');
        setShowNewTicketModal(false);
        setNewTicket({
          subject: '',
          message: '',
          category: '',
          priority: 'normal'
        });
        loadTickets();
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Errore durante la creazione del ticket');
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    try {
      setSendingReply(true);
      const response = await fetch(`${API_BASE_URL}/api/support-tickets/${selectedTicket.id}/responses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: replyMessage })
      });

      const data = await response.json();
      if (data.success) {
        setReplyMessage('');
        loadTicketDetails(selectedTicket.id);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Errore durante l\'invio della risposta');
    } finally {
      setSendingReply(false);
    }
  };

  const updateTicketStatus = async (ticketId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/support-tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      if (data.success) {
        loadTickets();
        if (selectedTicket && selectedTicket.id === ticketId) {
          loadTicketDetails(ticketId);
        }
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#3498db';
      case 'in_progress': return '#f39c12';
      case 'waiting_response': return '#9b59b6';
      case 'closed': return '#95a5a6';
      default: return '#95a5a6';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'open': return 'Aperto';
      case 'in_progress': return 'In lavorazione';
      case 'waiting_response': return 'In attesa di risposta';
      case 'closed': return 'Chiuso';
      default: return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return '#95a5a6';
      case 'normal': return '#3498db';
      case 'high': return '#f39c12';
      case 'urgent': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'low': return 'Bassa';
      case 'normal': return 'Normale';
      case 'high': return 'Alta';
      case 'urgent': return 'Urgente';
      default: return priority;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#7f8c8d' }}>
        Caricamento ticket...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#2c3e50' }}>
          🎫 Ticket di Supporto
        </h1>
        <button
          onClick={() => setShowNewTicketModal(true)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#16a085',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ➕ Nuovo Ticket
        </button>
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '1fr 1.5fr' : '1fr', gap: '2rem' }}>
        {/* Tickets List */}
        <div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1.25rem',
              borderBottom: '1px solid #ecf0f1',
              backgroundColor: '#f8f9fa'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2c3e50', margin: 0 }}>
                I tuoi ticket ({tickets.length})
              </h3>
            </div>

            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {tickets.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#95a5a6' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                  <p>Nessun ticket di supporto</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Crea un nuovo ticket per ricevere assistenza
                  </p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => loadTicketDetails(ticket.id)}
                    style={{
                      padding: '1.25rem',
                      borderBottom: '1px solid #ecf0f1',
                      cursor: 'pointer',
                      backgroundColor: selectedTicket?.id === ticket.id ? '#f0f9ff' : 'white',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedTicket?.id !== ticket.id) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedTicket?.id !== ticket.id) {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#2c3e50', marginBottom: '0.25rem' }}>
                          {ticket.ticket_number}
                        </div>
                        <div style={{ fontSize: '0.95rem', color: '#34495e', marginBottom: '0.5rem' }}>
                          {ticket.subject}
                        </div>
                      </div>
                      <div style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: getStatusColor(ticket.status) + '20',
                        color: getStatusColor(ticket.status),
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {getStatusLabel(ticket.status)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#7f8c8d' }}>
                      <span>
                        Priorità: <span style={{ color: getPriorityColor(ticket.priority), fontWeight: '600' }}>
                          {getPriorityLabel(ticket.priority)}
                        </span>
                      </span>
                      {ticket.category && <span>• {ticket.category}</span>}
                      <span>• {ticket.responses_count || 0} risposte</span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#95a5a6', marginTop: '0.5rem' }}>
                      {new Date(ticket.created_at).toLocaleDateString('it-IT', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Ticket Detail */}
        {selectedTicket && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '80vh'
          }}>
            {/* Header */}
            <div style={{
              padding: '1.25rem',
              borderBottom: '1px solid #ecf0f1',
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '0.25rem' }}>
                    {selectedTicket.ticket_number}
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#2c3e50', margin: '0 0 0.75rem 0' }}>
                    {selectedTicket.subject}
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: getStatusColor(selectedTicket.status) + '20',
                      color: getStatusColor(selectedTicket.status),
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      {getStatusLabel(selectedTicket.status)}
                    </span>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: getPriorityColor(selectedTicket.priority) + '20',
                      color: getPriorityColor(selectedTicket.priority),
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      {getPriorityLabel(selectedTicket.priority)}
                    </span>
                    {selectedTicket.category && (
                      <span style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                        📂 {selectedTicket.category}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTicket(null)}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#95a5a6'
                  }}
                >
                  ✕
                </button>
              </div>

              {selectedTicket.status !== 'closed' && (
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  {selectedTicket.status === 'open' && (
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'closed')}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      Chiudi ticket
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {/* Original Message */}
              <div style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                borderLeft: '4px solid #16a085'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#2c3e50' }}>
                      {selectedTicket.author_name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                      {selectedTicket.author_email}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#95a5a6' }}>
                    {new Date(selectedTicket.created_at).toLocaleDateString('it-IT', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div style={{ color: '#34495e', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {selectedTicket.message}
                </div>
              </div>

              {/* Responses */}
              {responses.map((response) => (
                <div
                  key={response.id}
                  style={{
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    backgroundColor: response.is_admin_response ? '#e8f5e9' : '#f8f9fa',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${response.is_admin_response ? '#27ae60' : '#3498db'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#2c3e50' }}>
                        {response.author_name}
                        {response.is_admin_response && (
                          <span style={{
                            marginLeft: '0.5rem',
                            padding: '0.15rem 0.5rem',
                            backgroundColor: '#27ae60',
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '0.75rem'
                          }}>
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                        {response.author_email}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#95a5a6' }}>
                      {new Date(response.created_at).toLocaleDateString('it-IT', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div style={{ color: '#34495e', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {response.message}
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Form */}
            {selectedTicket.status !== 'closed' && (
              <div style={{
                padding: '1.25rem',
                borderTop: '1px solid #ecf0f1',
                backgroundColor: '#f8f9fa'
              }}>
                <form onSubmit={sendReply}>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Scrivi una risposta..."
                    required
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      marginBottom: '0.75rem'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      disabled={sendingReply || !replyMessage.trim()}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: sendingReply ? '#95a5a6' : '#16a085',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        cursor: sendingReply ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {sendingReply ? 'Invio...' : 'Invia risposta'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div style={{
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
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2c3e50', margin: 0 }}>
                📝 Nuovo Ticket di Supporto
              </h2>
              <button
                onClick={() => setShowNewTicketModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#95a5a6'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={createTicket}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c3e50' }}>
                  Oggetto *
                </label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  required
                  placeholder="Descrivi brevemente il problema"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c3e50' }}>
                  Categoria
                </label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="">Seleziona categoria</option>
                  <option value="Tecnico">Tecnico</option>
                  <option value="Abbonamento">Abbonamento</option>
                  <option value="Fatturazione">Fatturazione</option>
                  <option value="Funzionalità">Funzionalità</option>
                  <option value="Altro">Altro</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c3e50' }}>
                  Priorità
                </label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="low">Bassa</option>
                  <option value="normal">Normale</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c3e50' }}>
                  Messaggio *
                </label>
                <textarea
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  required
                  placeholder="Descrivi il problema in dettaglio"
                  style={{
                    width: '100%',
                    minHeight: '150px',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
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
                  Annulla
                </button>
                <button
                  type="submit"
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
                  Crea Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTickets;
