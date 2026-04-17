import { useState } from 'react';

/**
 * CRM Subscription Plans Component
 * Pagina acquisto abbonamento CRM per partners
 * Solo pagamento annuale
 */
const CRMSubscriptionPlans = ({ token, onSubscribe }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [customTeamSize, setCustomTeamSize] = useState(15);
  const [subscribing, setSubscribing] = useState(false);

  // Piani fissi
  const fixedPlans = [
    {
      id: 'single',
      name: 'Piano Singolo',
      teamSize: 1,
      monthlyPrice: 22,
      annualPrice: 264,
      popular: false,
      features: [
        'CRM completo per 1 persona',
        'Gestione clienti illimitati',
        'Appuntamenti e calendario',
        'Gestione trattative',
        'Storico attività',
        'Upload documenti'
      ]
    },
    {
      id: 'team_5',
      name: 'Team 5',
      teamSize: 5,
      monthlyPrice: 55,
      annualPrice: 660,
      popular: true,
      features: [
        'CRM completo per 5 persone',
        'Gestione clienti illimitati',
        'Calendario condiviso',
        'Gestione trattative di team',
        'Storico attività collaborativo',
        'Upload documenti condivisi',
        'Report e statistiche'
      ]
    },
    {
      id: 'team_10',
      name: 'Team 10',
      teamSize: 10,
      monthlyPrice: 100,
      annualPrice: 1200,
      popular: false,
      features: [
        'CRM completo per 10 persone',
        'Gestione clienti illimitati',
        'Calendario condiviso',
        'Gestione trattative avanzata',
        'Storico attività completo',
        'Upload documenti illimitati',
        'Report e analytics avanzati',
        'Supporto prioritario'
      ]
    }
  ];

  // Opzioni per piano personalizzato
  const customTeamSizeOptions = [15, 20, 30, 40, 50];

  // Calcolo prezzo piano personalizzato
  const calculateCustomPrice = (teamSize) => {
    const monthlyPrice = teamSize * 9;
    const annualPrice = monthlyPrice * 12;
    return { monthlyPrice, annualPrice };
  };

  const customPricing = calculateCustomPrice(customTeamSize);

  const handleSubscribe = async (planId, teamSize) => {
    const planName = planId === 'custom' ? `Team ${teamSize}+` : fixedPlans.find(p => p.id === planId)?.name;

    if (!confirm(`Confermi l'acquisto del piano ${planName} per ${teamSize} ${teamSize === 1 ? 'persona' : 'persone'}?`)) {
      return;
    }

    try {
      setSubscribing(true);

      const response = await fetch('http://localhost:3001/api/crm-subscriptions/subscribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teamSize,
          paymentType: 'annual'
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Abbonamento CRM attivato con successo!');
        if (onSubscribe) onSubscribe(data.subscription);
      } else {
        alert('Errore: ' + data.message);
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Errore durante la sottoscrizione');
    } finally {
      setSubscribing(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
      color: '#fff',
      padding: '3rem 2rem'
    },
    header: {
      textAlign: 'center',
      marginBottom: '3rem'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '1rem'
    },
    subtitle: {
      fontSize: '1.2rem',
      color: 'rgba(255, 255, 255, 0.7)',
      maxWidth: '800px',
      margin: '0 auto 0.5rem'
    },
    badge: {
      display: 'inline-block',
      background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
      color: '#fff',
      padding: '0.5rem 1.5rem',
      borderRadius: '25px',
      fontSize: '0.9rem',
      fontWeight: '700',
      marginTop: '1rem'
    },
    plansGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      maxWidth: '1400px',
      margin: '0 auto 4rem'
    },
    planCard: {
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      borderRadius: '16px',
      padding: '2rem',
      border: '2px solid rgba(255, 255, 255, 0.1)',
      transition: 'all 0.3s ease',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    },
    planCardPopular: {
      border: '2px solid #16a085',
      transform: 'scale(1.05)',
      boxShadow: '0 8px 32px rgba(22, 160, 133, 0.3)'
    },
    popularBadge: {
      position: 'absolute',
      top: '-12px',
      right: '20px',
      background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
      color: '#fff',
      padding: '0.4rem 1rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '700',
      textTransform: 'uppercase'
    },
    planName: {
      fontSize: '1.5rem',
      fontWeight: '700',
      marginBottom: '1rem',
      color: '#16a085'
    },
    planPrice: {
      fontSize: '3rem',
      fontWeight: '700',
      color: '#fff',
      marginBottom: '0.5rem'
    },
    planPriceSub: {
      fontSize: '1rem',
      color: 'rgba(255, 255, 255, 0.6)',
      marginBottom: '0.5rem'
    },
    priceBreakdown: {
      fontSize: '0.85rem',
      color: 'rgba(255, 255, 255, 0.5)',
      marginBottom: '1.5rem'
    },
    featuresList: {
      listStyle: 'none',
      padding: 0,
      margin: '1.5rem 0',
      flex: 1
    },
    feature: {
      padding: '0.75rem 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      fontSize: '0.95rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.5rem'
    },
    featureIcon: {
      color: '#16a085',
      fontSize: '1.2rem',
      flexShrink: 0,
      marginTop: '0.1rem'
    },
    subscribeButton: {
      width: '100%',
      padding: '1rem',
      background: 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1.1rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: 'auto'
    },
    customSection: {
      maxWidth: '900px',
      margin: '0 auto',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      borderRadius: '16px',
      padding: '3rem',
      border: '2px solid #16a085',
      boxShadow: '0 8px 32px rgba(22, 160, 133, 0.3)'
    },
    customTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      marginBottom: '0.5rem',
      textAlign: 'center',
      color: '#16a085'
    },
    customSubtitle: {
      fontSize: '1rem',
      color: 'rgba(255, 255, 255, 0.6)',
      textAlign: 'center',
      marginBottom: '2rem'
    },
    teamSizeGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    teamSizeCard: {
      padding: '1.5rem',
      background: 'rgba(26, 26, 26, 0.5)',
      border: '2px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    teamSizeCardSelected: {
      background: 'rgba(22, 160, 133, 0.2)',
      border: '2px solid #16a085',
      transform: 'scale(1.05)'
    },
    teamSizeNumber: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#16a085',
      marginBottom: '0.25rem'
    },
    priceDisplay: {
      textAlign: 'center',
      padding: '2rem',
      background: 'rgba(22, 160, 133, 0.1)',
      borderRadius: '12px',
      marginBottom: '2rem',
      border: '1px solid rgba(22, 160, 133, 0.3)'
    },
    customFeatures: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Abbonamento CRM AgenzieCase</h1>
        <p style={styles.subtitle}>
          Sblocca tutte le funzionalità CRM per la tua agenzia. Gestisci clienti, appuntamenti, trattative e documenti in un unico sistema professionale.
        </p>
        <div style={styles.badge}>Solo Pagamento Annuale</div>
      </div>

      {/* Fixed Plans Grid */}
      <div style={styles.plansGrid}>
        {fixedPlans.map((plan) => (
          <div
            key={plan.id}
            style={{
              ...styles.planCard,
              ...(plan.popular ? styles.planCardPopular : {})
            }}
            onMouseOver={(e) => {
              if (!plan.popular) {
                e.currentTarget.style.borderColor = 'rgba(22, 160, 133, 0.5)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseOut={(e) => {
              if (!plan.popular) {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {plan.popular && (
              <div style={styles.popularBadge}>Più Popolare</div>
            )}

            <div style={styles.planName}>{plan.name}</div>

            <div style={styles.planPrice}>€{plan.annualPrice}</div>
            <div style={styles.planPriceSub}>pagamento annuale</div>
            <div style={styles.priceBreakdown}>
              €{plan.monthlyPrice}/mese • €{Math.round(plan.monthlyPrice / plan.teamSize)}/mese per persona
            </div>

            <ul style={styles.featuresList}>
              {plan.features.map((feature, index) => (
                <li key={index} style={styles.feature}>
                  <span style={styles.featureIcon}>✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.id, plan.teamSize)}
              disabled={subscribing}
              style={styles.subscribeButton}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(22, 160, 133, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {subscribing ? 'Elaborazione...' : 'Sottoscrivi Ora'}
            </button>
          </div>
        ))}
      </div>

      {/* Custom Plan (15-50) */}
      <div style={styles.customSection}>
        <h2 style={styles.customTitle}>Piano Team Personalizzato</h2>
        <p style={styles.customSubtitle}>Per agenzie con team da 15 a 50 persone</p>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#fff' }}>
            Seleziona il numero di persone:
          </h3>
          <div style={styles.teamSizeGrid}>
            {customTeamSizeOptions.map((size) => (
              <div
                key={size}
                onClick={() => setCustomTeamSize(size)}
                style={{
                  ...styles.teamSizeCard,
                  ...(customTeamSize === size ? styles.teamSizeCardSelected : {})
                }}
                onMouseOver={(e) => {
                  if (customTeamSize !== size) {
                    e.currentTarget.style.borderColor = 'rgba(22, 160, 133, 0.5)';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseOut={(e) => {
                  if (customTeamSize !== size) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                <div style={styles.teamSizeNumber}>{size}</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>persone</div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Price Display */}
        <div style={styles.priceDisplay}>
          <div style={{ fontSize: '3.5rem', fontWeight: '700', color: '#16a085', marginBottom: '0.5rem' }}>
            €{customPricing.annualPrice}
          </div>
          <div style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '0.5rem' }}>
            pagamento annuale
          </div>
          <div style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            €{customPricing.monthlyPrice}/mese • €9/mese per persona
          </div>
        </div>

        {/* Custom Features */}
        <div style={styles.customFeatures}>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>✓</span>
            <span>CRM completo per {customTeamSize} persone</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>✓</span>
            <span>Gestione multi-agenzia</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>✓</span>
            <span>API access e integrazioni custom</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>✓</span>
            <span>Account manager dedicato</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>✓</span>
            <span>Supporto prioritario 24/7</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>✓</span>
            <span>Report e analytics avanzati</span>
          </div>
        </div>

        <button
          onClick={() => handleSubscribe('custom', customTeamSize)}
          disabled={subscribing}
          style={styles.subscribeButton}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 24px rgba(22, 160, 133, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          {subscribing ? 'Elaborazione...' : `Sottoscrivi Ora - €${customPricing.annualPrice}/anno`}
        </button>
      </div>
    </div>
  );
};

export default CRMSubscriptionPlans;
