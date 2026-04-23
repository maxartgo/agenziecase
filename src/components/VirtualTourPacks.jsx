import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';


/**
 * Pagina acquisto Virtual Tour Packs
 * Mostra i 3 pack disponibili e permette acquisto
 */
const VirtualTourPacks = ({ token }) => {
  const [packs, setPacks] = useState([]);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);

  useEffect(() => {
    loadPacksAndCredits();
  }, []);

  const loadPacksAndCredits = async () => {
    try {
      setLoading(true);

      // Carica pack disponibili
      const packsResponse = await fetch('${API_BASE_URL}/api/virtual-tour-packs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const packsData = await packsResponse.json();

      // Carica crediti attuali
      const creditsResponse = await fetch('${API_BASE_URL}/api/virtual-tour-packs/credits', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const creditsData = await creditsResponse.json();

      if (packsData.success) {
        setPacks(packsData.packs);
      }

      if (creditsData.success) {
        setCredits(creditsData.credits);
      }

    } catch (error) {
      console.error('Error loading packs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pack) => {
    if (!confirm(`Confermi l'acquisto del ${pack.plan_name} a €${pack.price_monthly}/mese?`)) {
      return;
    }

    try {
      setPurchasing(true);
      setSelectedPack(pack.plan_type);

      const response = await fetch('${API_BASE_URL}/api/virtual-tour-packs/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planType: pack.plan_type,
          paymentMethod: 'manual'
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ ${data.message}\n\nHai ricevuto ${pack.credits_included} crediti Virtual Tour!`);
        // Ricarica crediti
        loadPacksAndCredits();
      } else {
        alert(`❌ ${data.message}`);
      }

    } catch (error) {
      console.error('Error purchasing pack:', error);
      alert('Errore durante l\'acquisto. Riprova.');
    } finally {
      setPurchasing(false);
      setSelectedPack(null);
    }
  };

  const getPackIcon = (planType) => {
    switch(planType) {
      case 'starter': return '🌟';
      case 'business': return '💼';
      case 'professional': return '👑';
      default: return '📦';
    }
  };

  const getPackBadge = (planType) => {
    switch(planType) {
      case 'starter': return null;
      case 'business': return { text: 'SCONTO -10%', color: '#3498db' };
      case 'professional': return { text: 'PIÙ POPOLARE', color: '#d4af37' };
      default: return null;
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
      padding: '2rem',
      color: '#fff'
    },
    header: {
      textAlign: 'center',
      marginBottom: '3rem'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #d4af37 0%, #f9d276 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '1rem'
    },
    subtitle: {
      fontSize: '1.2rem',
      color: 'rgba(255, 255, 255, 0.7)',
      maxWidth: '600px',
      margin: '0 auto'
    },
    creditsCard: {
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      borderRadius: '12px',
      padding: '2rem',
      marginBottom: '3rem',
      maxWidth: '600px',
      margin: '0 auto 3rem',
      border: '1px solid rgba(212, 175, 55, 0.3)'
    },
    creditsTitle: {
      fontSize: '1.2rem',
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: '1rem'
    },
    creditsValue: {
      fontSize: '3rem',
      fontWeight: '700',
      color: '#d4af37',
      marginBottom: '0.5rem'
    },
    creditsLabel: {
      fontSize: '0.9rem',
      color: 'rgba(255, 255, 255, 0.6)'
    },
    packsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    packCard: {
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      borderRadius: '16px',
      padding: '2.5rem',
      border: '2px solid rgba(255, 255, 255, 0.1)',
      transition: 'all 0.3s ease',
      position: 'relative',
      cursor: 'pointer'
    },
    packCardActive: {
      border: '2px solid #d4af37',
      boxShadow: '0 10px 40px rgba(212, 175, 55, 0.3)',
      transform: 'translateY(-5px)'
    },
    badge: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      fontSize: '0.7rem',
      fontWeight: '700',
      color: '#fff'
    },
    packIcon: {
      fontSize: '3rem',
      marginBottom: '1rem'
    },
    packName: {
      fontSize: '1.5rem',
      fontWeight: '700',
      marginBottom: '0.5rem',
      color: '#fff'
    },
    price: {
      fontSize: '2.5rem',
      fontWeight: '700',
      color: '#d4af37',
      marginBottom: '0.5rem'
    },
    priceLabel: {
      fontSize: '0.9rem',
      color: 'rgba(255, 255, 255, 0.6)',
      marginBottom: '2rem'
    },
    credits: {
      fontSize: '1.2rem',
      color: '#fff',
      marginBottom: '1.5rem',
      padding: '1rem',
      background: 'rgba(212, 175, 55, 0.1)',
      borderRadius: '8px',
      textAlign: 'center'
    },
    perCredit: {
      fontSize: '0.85rem',
      color: 'rgba(255, 255, 255, 0.7)',
      marginTop: '0.5rem'
    },
    features: {
      listStyle: 'none',
      padding: 0,
      marginBottom: '2rem'
    },
    feature: {
      padding: '0.75rem 0',
      color: 'rgba(255, 255, 255, 0.9)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    buyButton: {
      width: '100%',
      padding: '1rem',
      background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
      color: '#0a0a0a',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1.1rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    buyButtonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    currentPlan: {
      background: 'rgba(46, 204, 113, 0.2)',
      color: '#2ecc71',
      padding: '1rem',
      borderRadius: '8px',
      textAlign: 'center',
      fontWeight: '700',
      border: '2px solid #2ecc71'
    },
    loading: {
      textAlign: 'center',
      padding: '4rem',
      fontSize: '1.2rem',
      color: 'rgba(255, 255, 255, 0.7)'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>⏳ Caricamento pack...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🌐 Virtual Tour Packs</h1>
        <p style={styles.subtitle}>
          Crea virtual tour professionali per i tuoi immobili. Carica le tue foto e noi generiamo il tour!
        </p>
      </div>

      {/* Crediti attuali */}
      {credits && (
        <div style={styles.creditsCard}>
          <h3 style={styles.creditsTitle}>I tuoi crediti</h3>
          <div style={styles.creditsValue}>{credits.current}</div>
          <div style={styles.creditsLabel}>
            {credits.plan ? (
              <>
                Piano attivo: <strong>{credits.planName}</strong>
                {credits.renewDate && (
                  <> (rinnovo il {new Date(credits.renewDate).toLocaleDateString('it-IT')})</>
                )}
              </>
            ) : (
              'Nessun piano attivo. Acquista un pack per iniziare!'
            )}
          </div>
        </div>
      )}

      {/* Grid pack */}
      <div style={styles.packsGrid}>
        {packs.map((pack) => {
          const badge = getPackBadge(pack.plan_type);
          const isCurrentPlan = credits?.plan === pack.plan_type;
          // Converti price_monthly da stringa a numero (PostgreSQL DECIMAL ritorna stringhe)
          const priceMonthly = parseFloat(pack.price_monthly);
          const pricePerCredit = (priceMonthly / pack.credits_included).toFixed(2);

          return (
            <div
              key={pack.id}
              style={{
                ...styles.packCard,
                ...(pack.plan_type === 'professional' ? styles.packCardActive : {})
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#d4af37';
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = pack.plan_type === 'professional' ? '#d4af37' : 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = pack.plan_type === 'professional' ? 'translateY(-5px)' : 'translateY(0)';
              }}
            >
              {badge && (
                <div style={{ ...styles.badge, background: badge.color }}>
                  {badge.text}
                </div>
              )}

              <div style={styles.packIcon}>{getPackIcon(pack.plan_type)}</div>
              <h3 style={styles.packName}>{pack.plan_name}</h3>

              <div style={styles.price}>€{priceMonthly.toFixed(0)}</div>
              <div style={styles.priceLabel}>al mese</div>

              <div style={styles.credits}>
                <strong>{pack.credits_included}</strong> Virtual Tours
                <div style={styles.perCredit}>
                  €{pricePerCredit} per tour
                  {pack.plan_type !== 'starter' && (
                    <span style={{ color: '#2ecc71', marginLeft: '0.5rem' }}>
                      ✓ Risparmio!
                    </span>
                  )}
                </div>
              </div>

              <ul style={styles.features}>
                <li style={styles.feature}>
                  ✅ Self-service upload
                </li>
                <li style={styles.feature}>
                  ✅ Tour auto-generati
                </li>
                <li style={styles.feature}>
                  ✅ Hosting incluso
                </li>
                <li style={styles.feature}>
                  ✅ Analytics {pack.features?.analytics || 'basic'}
                </li>
                {pack.features?.white_label && (
                  <li style={styles.feature}>
                    ⭐ White label
                  </li>
                )}
                {pack.features?.custom_branding && (
                  <li style={styles.feature}>
                    ⭐ Custom branding
                  </li>
                )}
                <li style={styles.feature}>
                  📧 Supporto {pack.features?.support || 'email'}
                </li>
              </ul>

              {isCurrentPlan ? (
                <div style={styles.currentPlan}>
                  ✓ Piano Attivo
                </div>
              ) : (
                <button
                  onClick={() => handlePurchase(pack)}
                  style={{
                    ...styles.buyButton,
                    ...(purchasing ? styles.buyButtonDisabled : {})
                  }}
                  disabled={purchasing}
                  onMouseOver={(e) => {
                    if (!purchasing) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.4)';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {purchasing && selectedPack === pack.plan_type ? '⏳ Acquisto in corso...' : 'Acquista Ora'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VirtualTourPacks;
