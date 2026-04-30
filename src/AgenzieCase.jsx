import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import PartnerRegistrationModal from './components/PartnerRegistrationModal';
import LoginModal from './components/LoginModal';
import ChatVisitConfirmation from './components/ChatVisitConfirmation';
import { useVoice } from './hooks/useVoice';
import MatrixRain from './components/MatrixRain';
import { API_BASE_URL } from './config/api';

// Code splitting for heavy components
const CRMDashboard = lazy(() => import('./components/CRMDashboard'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

// Loading fallback component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px',
    color: '#d4af37'
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '3px solid rgba(212, 175, 55, 0.3)',
      borderTop: '3px solid #d4af37',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
  </div>
);

// Configurazione API
const API_URL = `${API_BASE_URL}/api`;

// Componente Typewriter Effect
const TypewriterText = ({ text, speed = 100, delay = 0 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [started, setStarted] = useState(false);

  // Delay iniziale prima di iniziare
  useEffect(() => {
    const timer = setTimeout(() => {
      setStarted(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Effetto typewriter
  useEffect(() => {
    if (!started) return;

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else {
      // Quando finisce, mantieni il cursor per 2 secondi poi rimuovilo
      const timer = setTimeout(() => {
        setShowCursor(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed, started]);

  return (
    <span>
      {displayedText}
      {showCursor && (
        <span style={{
          borderRight: '3px solid #d4af37',
          animation: 'blink 1s step-end infinite',
          marginLeft: '2px'
        }}>
          &nbsp;
        </span>
      )}
    </span>
  );
};

// Mock data per le proprietà (fallback se API non disponibile)
const mockProperties = [
  {
    id: 1,
    title: "Attico con terrazza panoramica",
    location: "Milano, Porta Nuova",
    price: 1250000,
    sqm: 180,
    rooms: 4,
    bathrooms: 2,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    type: "Vendita",
    highlight: "Vista Skyline",
    energyClass: "A",
    floor: "15°",
    hasParking: true,
    hasElevator: true,
    yearBuilt: 2020,
    description: "Splendido attico di design con terrazza di 50mq e vista mozzafiato sullo skyline di Milano. Finiture di pregio, domotica completa."
  },
  {
    id: 2,
    title: "Loft industriale ristrutturato",
    location: "Torino, San Salvario",
    price: 320000,
    sqm: 120,
    rooms: 2,
    bathrooms: 1,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
    type: "Vendita",
    highlight: "Soffitti 4m",
    energyClass: "B",
    floor: "2°",
    hasParking: false,
    hasElevator: true,
    yearBuilt: 2018,
    description: "Ex laboratorio tessile trasformato in un loft contemporaneo con soffitti di 4 metri, travi a vista e ampie vetrate."
  },
  {
    id: 3,
    title: "Villa con giardino privato",
    location: "Roma, EUR",
    price: 890000,
    sqm: 250,
    rooms: 5,
    bathrooms: 3,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    type: "Vendita",
    highlight: "Giardino 500mq",
    energyClass: "A+",
    floor: "Terra",
    hasParking: true,
    hasElevator: false,
    yearBuilt: 2019,
    description: "Elegante villa su tre livelli con giardino privato, piscina e dependance. Quartiere residenziale esclusivo."
  },
  {
    id: 4,
    title: "Bilocale moderno zona università",
    location: "Bologna, Centro",
    price: 1200,
    sqm: 55,
    rooms: 2,
    bathrooms: 1,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    type: "Affitto",
    highlight: "Arredato",
    energyClass: "C",
    floor: "3°",
    hasParking: false,
    hasElevator: true,
    yearBuilt: 2015,
    description: "Bilocale completamente arredato e ristrutturato, perfetto per studenti o giovani professionisti. A due passi dall'università."
  },
  {
    id: 5,
    title: "Appartamento vista mare",
    location: "Genova, Nervi",
    price: 485000,
    sqm: 95,
    rooms: 3,
    bathrooms: 2,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
    type: "Vendita",
    highlight: "Fronte mare",
    energyClass: "B",
    floor: "5°",
    hasParking: true,
    hasElevator: true,
    yearBuilt: 2010,
    description: "Luminoso appartamento con vista mare spettacolare, doppia esposizione e accesso diretto alla passeggiata Anita Garibaldi."
  },
  {
    id: 6,
    title: "Rustico ristrutturato in collina",
    location: "Firenze, Chianti",
    price: 720000,
    sqm: 200,
    rooms: 4,
    bathrooms: 2,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
    type: "Vendita",
    highlight: "Vigneto",
    energyClass: "B",
    floor: "Terra",
    hasParking: true,
    hasElevator: false,
    yearBuilt: 1800,
    description: "Antico casale toscano completamente restaurato con rispetto delle caratteristiche originali. Terreno con vigneto e uliveto."
  },
  {
    id: 7,
    title: "Penthouse con piscina privata",
    location: "Napoli, Posillipo",
    price: 1850000,
    sqm: 280,
    rooms: 5,
    bathrooms: 4,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
    type: "Vendita",
    highlight: "Piscina",
    energyClass: "A",
    floor: "Ultimo",
    hasParking: true,
    hasElevator: true,
    yearBuilt: 2022,
    description: "Esclusivo penthouse con piscina infinity privata e vista sul Golfo di Napoli. Standard di lusso assoluto."
  },
  {
    id: 8,
    title: "Monolocale centrale ristrutturato",
    location: "Milano, Navigli",
    price: 950,
    sqm: 35,
    rooms: 1,
    bathrooms: 1,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    type: "Affitto",
    highlight: "Sui Navigli",
    energyClass: "C",
    floor: "1°",
    hasParking: false,
    hasElevator: false,
    yearBuilt: 2020,
    description: "Monolocale di design affacciato sul Naviglio Grande. Zona vivace, ricca di locali e ristoranti."
  }
];

// Stili CSS
const styles = {
  // Reset e base
  app: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
    fontFamily: '"DM Sans", sans-serif',
    color: '#f5f5f5',
    position: 'relative',
    overflow: 'hidden'
  },
  
  // Texture di sfondo
  bgTexture: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `radial-gradient(circle at 25% 25%, rgba(212, 175, 55, 0.03) 0%, transparent 50%),
                      radial-gradient(circle at 75% 75%, rgba(212, 175, 55, 0.02) 0%, transparent 50%)`,
    pointerEvents: 'none',
    zIndex: 0
  },

  // Header
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    padding: '1.5rem 3rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(180deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0) 100%)',
    zIndex: 100,
    backdropFilter: 'blur(10px)'
  },

  logo: {
    fontFamily: '"Playfair Display", serif',
    fontSize: '2rem',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #d4af37 0%, #f5e7a3 50%, #d4af37 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '0.1em'
  },

  nav: {
    display: 'flex',
    gap: '2.5rem',
    alignItems: 'center'
  },

  navLink: {
    color: '#999',
    textDecoration: 'none',
    fontSize: '0.9rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    transition: 'color 0.3s ease',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    fontFamily: 'inherit'
  },

  // Hero section
  hero: {
    paddingTop: '140px',
    paddingBottom: '60px',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1
  },

  heroTitle: {
    fontFamily: '"Playfair Display", serif',
    fontSize: '4rem',
    fontWeight: '400',
    marginBottom: '1rem',
    background: 'linear-gradient(135deg, #ffffff 0%, #d4af37 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },

  heroSubtitle: {
    fontSize: '1.2rem',
    color: '#888',
    fontWeight: '300',
    letterSpacing: '0.2em',
    textTransform: 'uppercase'
  },

  // Search bar
  searchContainer: {
    maxWidth: '900px',
    margin: '3rem auto',
    padding: '0 2rem',
    position: 'relative',
    zIndex: 1
  },

  searchBar: {
    display: 'flex',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '100px',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
  },

  searchInput: {
    flex: 1,
    padding: '1.5rem 2rem',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '1.1rem',
    outline: 'none',
    fontFamily: 'inherit'
  },

  searchButton: {
    padding: '1.5rem 3rem',
    background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
    border: 'none',
    color: '#0a0a0a',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
    letterSpacing: '0.05em'
  },

  // Filters
  filtersContainer: {
    maxWidth: '1200px',
    margin: '0 auto 3rem',
    padding: '0 2rem',
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1
  },

  filterPill: {
    padding: '0.8rem 1.5rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '50px',
    color: '#999',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit'
  },

  filterPillActive: {
    background: 'rgba(212, 175, 55, 0.15)',
    borderColor: '#d4af37',
    color: '#d4af37'
  },

  // Property grid
  gridContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 2rem 4rem',
    position: 'relative',
    zIndex: 1
  },

  gridHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },

  gridTitle: {
    fontFamily: '"Playfair Display", serif',
    fontSize: '1.8rem',
    fontWeight: '400',
    color: '#fff'
  },

  resultsCount: {
    color: '#666',
    fontSize: '0.9rem'
  },

  propertyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '2rem'
  },

  // Property card
  propertyCard: {
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.05)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    position: 'relative'
  },

  propertyCardHover: {
    transform: 'translateY(-8px)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    boxShadow: '0 30px 60px rgba(0,0,0,0.4), 0 0 40px rgba(212, 175, 55, 0.1)'
  },

  propertyImageContainer: {
    position: 'relative',
    height: '260px',
    overflow: 'hidden'
  },

  propertyImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.6s ease'
  },

  propertyImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.8) 100%)'
  },

  propertyBadge: {
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    padding: '0.5rem 1rem',
    background: 'rgba(212, 175, 55, 0.9)',
    borderRadius: '50px',
    color: '#0a0a0a',
    fontSize: '0.75rem',
    fontWeight: '600',
    letterSpacing: '0.05em',
    textTransform: 'uppercase'
  },

  energyBadge: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: '700'
  },

  favoriteButton: {
    position: 'absolute',
    bottom: '1rem',
    right: '1rem',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.5)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)'
  },

  propertyContent: {
    padding: '1.5rem'
  },

  propertyType: {
    color: '#d4af37',
    fontSize: '0.75rem',
    fontWeight: '600',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '0.5rem'
  },

  propertyTitle: {
    fontFamily: '"Playfair Display", serif',
    fontSize: '1.3rem',
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.5rem',
    lineHeight: '1.3'
  },

  propertyLocation: {
    color: '#888',
    fontSize: '0.9rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },

  propertyPrice: {
    fontFamily: '"Playfair Display", serif',
    fontSize: '1.6rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '1rem'
  },

  propertyFeatures: {
    display: 'flex',
    gap: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.05)'
  },

  propertyFeature: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#666',
    fontSize: '0.85rem'
  },

  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.9)',
    backdropFilter: 'blur(20px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
  },

  modalContent: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 100%)',
    borderRadius: '24px',
    maxWidth: '1000px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    boxShadow: '0 40px 80px rgba(0,0,0,0.5)'
  },

  modalImage: {
    width: '100%',
    height: '400px',
    objectFit: 'cover'
  },

  modalBody: {
    padding: '2rem'
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem'
  },

  modalClose: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: '#fff',
    fontSize: '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },

  modalTitle: {
    fontFamily: '"Playfair Display", serif',
    fontSize: '2rem',
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.5rem'
  },

  modalPrice: {
    fontFamily: '"Playfair Display", serif',
    fontSize: '2.5rem',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #d4af37 0%, #f5e7a3 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },

  modalDescription: {
    color: '#999',
    lineHeight: '1.8',
    marginBottom: '2rem',
    fontSize: '1.1rem'
  },

  modalFeatures: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  },

  modalFeatureItem: {
    background: 'rgba(255,255,255,0.03)',
    padding: '1rem',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.05)'
  },

  modalFeatureValue: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#d4af37',
    marginBottom: '0.25rem'
  },

  modalFeatureLabel: {
    fontSize: '0.8rem',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },

  contactButton: {
    width: '100%',
    padding: '1.2rem',
    background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
    border: 'none',
    borderRadius: '12px',
    color: '#0a0a0a',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
    letterSpacing: '0.05em'
  },

  // Range slider
  rangeContainer: {
    background: 'rgba(255,255,255,0.03)',
    padding: '1.5rem',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.05)',
    marginBottom: '1rem'
  },

  rangeLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    color: '#999',
    fontSize: '0.9rem'
  },

  rangeSlider: {
    width: '100%',
    height: '4px',
    borderRadius: '2px',
    background: 'rgba(255,255,255,0.1)',
    outline: 'none',
    WebkitAppearance: 'none',
    cursor: 'pointer'
  },

  // Footer styles
  footer: {
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
    borderTop: '1px solid rgba(212, 175, 55, 0.2)',
    padding: '3rem 2rem 1rem',
    marginTop: '4rem'
  },
  footerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem'
  },
  footerSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  footerTitle: {
    fontFamily: '"Playfair Display", serif',
    fontSize: '1.5rem',
    fontWeight: '500',
    background: 'linear-gradient(135deg, #d4af37 0%, #f5e7a3 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0
  },
  footerSubtitle: {
    color: '#d4af37',
    fontSize: '1.1rem',
    fontWeight: '500',
    margin: 0
  },
  footerText: {
    color: '#999',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    margin: 0
  },
  footerLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  footerLink: {
    color: '#999',
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'color 0.3s ease'
  },
  footerButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '1rem'
  },
  loginButton: {
    padding: '0.875rem 1.5rem',
    background: '#fff',
    border: '2px solid #d4af37',
    borderRadius: '12px',
    color: '#d4af37',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
    letterSpacing: '0.05em',
    boxShadow: '0 2px 8px rgba(212, 175, 55, 0.1)'
  },
  partnerButton: {
    padding: '0.875rem 1.5rem',
    background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
    border: 'none',
    borderRadius: '12px',
    color: '#0a0a0a',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
    letterSpacing: '0.05em',
    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
  },
  footerBottom: {
    maxWidth: '1400px',
    margin: '0 auto',
    paddingTop: '2rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    textAlign: 'center'
  },
  footerCopyright: {
    color: '#666',
    fontSize: '0.9rem',
    margin: 0
  }
};

// Funzione per ottenere il colore della classe energetica
const getEnergyColor = (energyClass) => {
  const colors = {
    'A+': '#00c853',
    'A': '#64dd17',
    'B': '#aeea00',
    'C': '#ffeb3b',
    'D': '#ffc107',
    'E': '#ff9800',
    'F': '#ff5722',
    'G': '#f44336'
  };
  return colors[energyClass] || '#999';
};

// Formattazione prezzo
const formatPrice = (price, type) => {
  if (type === 'Affitto') {
    return `€${price.toLocaleString('it-IT')}/mese`;
  }
  return `€${price.toLocaleString('it-IT')}`;
};

// Icone SVG
const Icons = {
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="M21 21l-4.35-4.35"/>
    </svg>
  ),
  Heart: ({ filled }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? '#d4af37' : 'none'} stroke="#d4af37" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  Location: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Bed: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 4v16"/>
      <path d="M2 8h18a2 2 0 0 1 2 2v10"/>
      <path d="M2 17h20"/>
      <path d="M6 8v9"/>
    </svg>
  ),
  Bath: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"/>
      <path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"/>
      <circle cx="12" cy="5" r="1"/>
    </svg>
  ),
  Area: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M3 9h18"/>
      <path d="M9 21V9"/>
    </svg>
  ),
  Chat: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Close: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18"/>
      <path d="M6 6l12 12"/>
    </svg>
  ),
  AI: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2">
      <path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
      <path d="M16 15v1a4 4 0 0 1-8 0v-1"/>
      <circle cx="12" cy="19" r="2"/>
      <path d="M12 17v-4"/>
    </svg>
  ),
  Send: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2L11 13"/>
      <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
    </svg>
  )
};

// Componente PropertyCard
const PropertyCard = ({ property, onSelect, isFavorite, onToggleFavorite }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.propertyCard,
        ...(isHovered ? styles.propertyCardHover : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(property)}
    >
      <div style={styles.propertyImageContainer}>
        <img
          src={property.image}
          alt={property.title}
          style={{
            ...styles.propertyImage,
            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
          }}
        />
        <div style={styles.propertyImageOverlay} />
        <div style={styles.propertyBadge}>{property.highlight}</div>
        <div
          style={{
            ...styles.energyBadge,
            background: getEnergyColor(property.energyClass),
            color: ['A+', 'A', 'B'].includes(property.energyClass) ? '#000' : '#fff'
          }}
        >
          {property.energyClass}
        </div>
        <button
          style={{
            ...styles.favoriteButton,
            background: isFavorite ? 'rgba(212, 175, 55, 0.3)' : 'rgba(0,0,0,0.5)'
          }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(property.id);
          }}
        >
          <Icons.Heart filled={isFavorite} />
        </button>
      </div>
      <div style={styles.propertyContent}>
        <div style={styles.propertyType}>{property.type}</div>
        <h3 style={styles.propertyTitle}>{property.title}</h3>
        <div style={styles.propertyLocation}>
          <Icons.Location />
          {property.location}
        </div>
        <div style={styles.propertyPrice}>
          {formatPrice(property.price, property.type)}
        </div>
        <div style={styles.propertyFeatures}>
          <div style={styles.propertyFeature}>
            <Icons.Bed />
            {property.rooms} locali
          </div>
          <div style={styles.propertyFeature}>
            <Icons.Bath />
            {property.bathrooms} bagni
          </div>
          <div style={styles.propertyFeature}>
            <Icons.Area />
            {property.sqm} m²
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente PropertyModal
const PropertyModal = ({ property, onClose, isFavorite, onToggleFavorite }) => {
  if (!property) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <img src={property.image} alt={property.title} style={styles.modalImage} />
        <div style={styles.modalBody}>
          <div style={styles.modalHeader}>
            <div>
              <div style={styles.propertyType}>{property.type}</div>
              <h2 style={styles.modalTitle}>{property.title}</h2>
              <div style={styles.propertyLocation}>
                <Icons.Location />
                {property.location}
              </div>
            </div>
            <button style={styles.modalClose} onClick={onClose}>
              <Icons.Close />
            </button>
          </div>
          
          <div style={styles.modalPrice}>
            {formatPrice(property.price, property.type)}
          </div>
          
          <p style={styles.modalDescription}>{property.description}</p>
          
          <div style={styles.modalFeatures}>
            <div style={styles.modalFeatureItem}>
              <div style={styles.modalFeatureValue}>{property.rooms}</div>
              <div style={styles.modalFeatureLabel}>Locali</div>
            </div>
            <div style={styles.modalFeatureItem}>
              <div style={styles.modalFeatureValue}>{property.bathrooms}</div>
              <div style={styles.modalFeatureLabel}>Bagni</div>
            </div>
            <div style={styles.modalFeatureItem}>
              <div style={styles.modalFeatureValue}>{property.sqm}</div>
              <div style={styles.modalFeatureLabel}>m²</div>
            </div>
            <div style={styles.modalFeatureItem}>
              <div style={styles.modalFeatureValue}>{property.floor}</div>
              <div style={styles.modalFeatureLabel}>Piano</div>
            </div>
            <div style={styles.modalFeatureItem}>
              <div style={{...styles.modalFeatureValue, color: getEnergyColor(property.energyClass)}}>
                {property.energyClass}
              </div>
              <div style={styles.modalFeatureLabel}>Classe</div>
            </div>
            <div style={styles.modalFeatureItem}>
              <div style={styles.modalFeatureValue}>{property.yearBuilt}</div>
              <div style={styles.modalFeatureLabel}>Anno</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              style={{
                ...styles.favoriteButton,
                position: 'relative',
                width: 'auto',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                background: isFavorite ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(212, 175, 55, 0.3)'
              }}
              onClick={() => onToggleFavorite(property.id)}
            >
              <Icons.Heart filled={isFavorite} />
            </button>
            <button style={styles.contactButton}>
              Contatta l'agenzia
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principale
const AgenzieCase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('tutti');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [areaRange, setAreaRange] = useState([0, 300]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);

  // Stati per AI Chat Header e cronologia conversazione
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]); // Cronologia messaggi [{role: 'user'|'assistant', content: '...'}]
  const [showChatBox, setShowChatBox] = useState(false); // Chat box persistente
  const [chatProperties, setChatProperties] = useState([]); // Proprietà restituite dalla chat
  const [selectedPropertyForVisit, setSelectedPropertyForVisit] = useState(null);
  const [showVisitForm, setShowVisitForm] = useState(false);

  // Stati per Modal
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Stato per mostrare/nascondere le card (solo dopo ricerca AI)
  const [showResults, setShowResults] = useState(false);

  // Ref per tracciare l'ultimo transcript processato
  const lastProcessedTranscript = useRef('');

  // Ref per auto-scroll della chat
  const chatEndRef = useRef(null);

  // Hook per Voice AI
  const {
    isListening,
    isSpeaking,
    transcript,
    error: voiceError,
    isSupported: isVoiceSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking
  } = useVoice();

  const filters = ['tutti', 'vendita', 'affitto', 'nuove costruzioni', 'lusso'];

  // Auto-scroll quando cambia la cronologia chat
  useEffect(() => {
    if (chatEndRef.current && showChatBox) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, showChatBox]);

  // NON caricare immobili all'avvio - verranno mostrati solo dopo ricerca AI
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const response = await fetch(`${API_URL}/properties`);
        const data = await response.json();

        if (data.success) {
          // Salva gli immobili ma NON mostrarli
          const formattedProperties = data.properties.map(prop => ({
            ...prop,
            image: prop.mainImage || prop.images?.[0] || '',
            price: parseFloat(prop.price)
          }));
          setProperties(formattedProperties);
          setApiConnected(true);
          console.log('✅ Caricati', formattedProperties.length, 'immobili dal database');
        } else {
          throw new Error('Risposta API non valida');
        }
      } catch (error) {
        console.warn('⚠️ API non disponibile, uso dati mock', error.message);
        setProperties(mockProperties);
        setApiConnected(false);
      } finally {
        setLoading(false);
      }
    };

    checkApiConnection();
  }, []);

  // Controlla se c'è una sessione salvata in localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log('✅ Sessione ripristinata:', userData);
      } catch (error) {
        console.error('❌ Errore nel parsing dei dati utente:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  // Aggiorna input AI quando c'è un nuovo transcript vocale
  // e invia automaticamente la richiesta
  useEffect(() => {
    if (transcript && transcript.trim().length > 0 && transcript !== lastProcessedTranscript.current && !aiLoading) {
      console.log('🎤 Nuovo transcript ricevuto:', transcript);

      const userMessage = transcript.trim();

      // Aggiorna l'input
      setAiInput(userMessage);

      // Marca come processato
      lastProcessedTranscript.current = transcript;

      // Avvia automaticamente la ricerca AI dopo 800ms
      const timer = setTimeout(async () => {
        console.log('🚀 Invio automatico richiesta AI...');

        setAiLoading(true);

        try {
          const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: userMessage,
              history: chatHistory
            })
          });

          const data = await response.json();

          if (data.success) {
            // Salva le proprietà restituite dalla chat
            if (data.properties && data.properties.length > 0) {
              setChatProperties(data.properties);
            } else {
              setChatProperties([]);
            }

            // Aggiungi alla cronologia
            setChatHistory(prev => [...prev,
              { role: 'user', content: userMessage },
              { role: 'assistant', content: data.message }
            ]);
            // 🔊 AUTOPLAY: Riproduci automaticamente la risposta con Browser TTS (voce femminile italiana)
            speak(data.message, true);

            const lowerResponse = data.message.toLowerCase();
            if (lowerResponse.includes('milano')) setSearchQuery('Milano');
            else if (lowerResponse.includes('roma')) setSearchQuery('Roma');
            else if (lowerResponse.includes('torino')) setSearchQuery('Torino');
            else if (lowerResponse.includes('napoli')) setSearchQuery('Napoli');

            if (lowerResponse.includes('affitto') || userMessage.toLowerCase().includes('affitto')) {
              setActiveFilter('affitto');
            } else if (lowerResponse.includes('vendita') || userMessage.toLowerCase().includes('vendita')) {
              setActiveFilter('vendita');
            }

            // Mostra i risultati solo se ci sono proprietà
            if (data.properties && data.properties.length > 0) {
              setShowResults(true);
            } else {
              setShowResults(false);
            }
            setShowChatBox(true);
          } else {
            const errorMsg = 'Mi dispiace, non sono riuscito a elaborare la tua richiesta. Riprova!';
            setChatHistory(prev => [...prev,
              { role: 'user', content: userMessage },
              { role: 'assistant', content: errorMsg }
            ]);
            setShowChatBox(true);
          }
        } catch (error) {
          console.error('Errore AI Chat:', error);
          const errorMsg = 'Servizio AI temporaneamente non disponibile.';
          setChatHistory(prev => [...prev,
            { role: 'user', content: userMessage },
            { role: 'assistant', content: errorMsg }
          ]);
          setShowChatBox(true);
        } finally {
          setAiLoading(false);
        }
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [transcript, aiLoading]);

  const filteredProperties = properties.filter(property => {
    // Filtro per tipo
    if (activeFilter === 'vendita' && property.type !== 'Vendita') return false;
    if (activeFilter === 'affitto' && property.type !== 'Affitto') return false;
    if (activeFilter === 'lusso' && property.price < 800000) return false;
    if (activeFilter === 'nuove costruzioni' && property.yearBuilt < 2018) return false;
    
    // Filtro per ricerca testuale
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesLocation = property.location.toLowerCase().includes(query);
      const matchesTitle = property.title.toLowerCase().includes(query);
      if (!matchesLocation && !matchesTitle) return false;
    }
    
    // Filtro per prezzo (solo vendita)
    if (property.type === 'Vendita') {
      if (property.price < priceRange[0] || property.price > priceRange[1]) return false;
    }
    
    // Filtro per superficie
    if (property.sqm < areaRange[0] || property.sqm > areaRange[1]) return false;
    
    return true;
  });

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Funzione per dialogare con AI nell'header
  const handleAiSearch = async () => {
    if (!aiInput.trim() || aiLoading) return;

    const userMessage = aiInput.trim();
    setAiInput('');
    setAiLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: chatHistory
        })
      });

      const data = await response.json();

      if (data.success) {
        // Salva le proprietà restituite dalla chat
        if (data.properties && data.properties.length > 0) {
          setChatProperties(data.properties);
        } else {
          setChatProperties([]);
        }

        // Aggiungi messaggio AI alla cronologia
        setChatHistory(prev => [...prev,
          { role: 'user', content: userMessage },
          { role: 'assistant', content: data.message }
        ]);

        // Analizza la risposta per applicare filtri automatici
        const lowerResponse = data.message.toLowerCase();

        // Auto-filtra per città
        if (lowerResponse.includes('milano')) {
          setSearchQuery('Milano');
        } else if (lowerResponse.includes('roma')) {
          setSearchQuery('Roma');
        } else if (lowerResponse.includes('torino')) {
          setSearchQuery('Torino');
        } else if (lowerResponse.includes('napoli')) {
          setSearchQuery('Napoli');
        }

        // Auto-filtra per tipo
        if (lowerResponse.includes('affitto') || userMessage.toLowerCase().includes('affitto')) {
          setActiveFilter('affitto');
        } else if (lowerResponse.includes('vendita') || userMessage.toLowerCase().includes('vendita')) {
          setActiveFilter('vendita');
        }

        // MOSTRA I RISULTATI solo se ci sono proprietà
        if (data.properties && data.properties.length > 0) {
          setShowResults(true);
        } else {
          setShowResults(false);
        }

        // Apri il chat box se non è già aperto
        setShowChatBox(true);

      } else {
        const errorMsg = 'Mi dispiace, non sono riuscito a elaborare la tua richiesta. Riprova!';
        setChatHistory(prev => [...prev,
          { role: 'user', content: userMessage },
          { role: 'assistant', content: errorMsg }
        ]);
        setShowChatBox(true);
      }
    } catch (error) {
      console.error('Errore AI Chat:', error);
      const errorMsg = 'Servizio AI temporaneamente non disponibile.';
      setChatHistory(prev => [...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: errorMsg }
      ]);
      setShowChatBox(true);
    } finally {
      setAiLoading(false);
    }
  };

  // Handler per successo registrazione partner
  const handlePartnerRegistrationSuccess = (userData, token) => {
    setUser(userData);
    console.log('Partner registrato con successo:', userData);
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    console.log('✅ Logout effettuato');
  };

  // Se l'utente è loggato come admin, mostra l'Admin Dashboard
  if (user && user.role === 'admin') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AdminDashboard
          token={localStorage.getItem('token')}
          onLogout={handleLogout}
        />
      </Suspense>
    );
  }

  // Se l'utente è loggato come agent o partner, mostra la Dashboard CRM
  if (user && (user.role === 'agent' || user.role === 'partner')) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <CRMDashboard
          user={user}
          token={localStorage.getItem('token')}
          onLogout={handleLogout}
        />
      </Suspense>
    );
  }

  // Altrimenti mostra la homepage normale
  return (
    <div style={styles.app}>
      {/* Matrix Rain Background Animation */}
      <MatrixRain opacity={0.15} color="#00ff41" fontSize={14} speed={50} />

      <div style={styles.bgTexture} />
      
      {/* Header - Pulito */}
      <header style={styles.header}>
        <div style={styles.logo}>AgenzieCase</div>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>
          <TypewriterText
            text="Trova la tua casa ideale"
            speed={80}
            delay={500}
          />
        </h1>
        <p style={{
          ...styles.heroSubtitle,
          animation: 'fadeIn 1s ease 3s both'
        }}>
          Ricerca intelligente con AI
          <span style={{
            marginLeft: '1rem',
            fontSize: '0.7rem',
            padding: '0.3rem 0.8rem',
            borderRadius: '20px',
            background: apiConnected ? 'rgba(0, 200, 83, 0.2)' : 'rgba(255, 152, 0, 0.2)',
            color: apiConnected ? '#00c853' : '#ff9800'
          }}>
            {apiConnected ? '● Database Online' : '● Offline Mode'}
          </span>
        </p>
      </section>

      {/* AI Chat Search */}
      <div style={styles.searchContainer}>
        {/* Bottone Voice - Sopra la barra, al centro */}
        {isVoiceSupported && (
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <button
              style={{
                background: isListening ? '#d4af37' : 'rgba(212, 175, 55, 0.1)',
                border: isListening ? '2px solid #d4af37' : '2px solid rgba(212, 175, 55, 0.3)',
                color: isListening ? '#000' : '#d4af37',
                padding: '0.75rem 2rem',
                borderRadius: '30px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                animation: isListening ? 'pulse 1.5s infinite' : 'none',
                boxShadow: isListening ? '0 0 20px rgba(212, 175, 55, 0.4)' : 'none'
              }}
              onClick={() => isListening ? stopListening() : startListening()}
              title={isListening ? 'Ferma ascolto' : 'Parla con l\'AI'}
            >
              {isListening ? 'In ascolto...' : 'Parla con l\'AI'}
            </button>
          </div>
        )}

        <div style={styles.searchBar}>
          <Icons.AI />
          <input
            type="text"
            style={{...styles.searchInput, paddingLeft: '1rem', paddingRight: '10px'}}
            placeholder="Chiedimi cosa cerchi... (es: 'Voglio un appartamento in affitto a Milano')"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
          />
          <button
            style={{
              ...styles.searchButton,
              opacity: aiLoading ? 0.6 : 1,
              cursor: aiLoading ? 'not-allowed' : 'pointer'
            }}
            onClick={handleAiSearch}
            disabled={aiLoading}
          >
            {aiLoading ? '●●●' : '💬 Chiedi all\'AI'}
          </button>
        </div>

        {/* Chat Box Persistente con Cronologia */}
        {showChatBox && chatHistory.length > 0 && (
          <div style={{
            marginTop: '1rem',
            maxWidth: '900px',
            margin: '1rem auto 0',
            background: 'rgba(10, 10, 10, 0.8)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '16px',
            overflow: 'hidden',
            animation: 'slideDown 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}>
            {/* Header Chat Box */}
            <div style={{
              padding: '1rem 1.5rem',
              background: 'rgba(212, 175, 55, 0.1)',
              borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#d4af37',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}>
                <Icons.AI />
                <span>Conversazione con l'AI ({chatHistory.length / 2} messaggi)</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {/* Bottone Clear Chat */}
                <button
                  onClick={() => {
                    setChatHistory([]);
                    setShowChatBox(false);
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: '#d4af37',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease'
                  }}
                  title="Cancella cronologia"
                >
                  🗑️ Cancella
                </button>
                {/* Bottone Close */}
                <button
                  onClick={() => setShowChatBox(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#888',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '0.25rem'
                  }}
                  title="Chiudi chat"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Area messaggi con scroll */}
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '1rem'
            }}>
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #666 0%, #999 100%)'
                      : 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '0.9rem'
                  }}>
                    {msg.role === 'user' ? '👤' : <Icons.AI />}
                  </div>

                  {/* Messaggio */}
                  <div style={{
                    flex: 1,
                    maxWidth: '75%'
                  }}>
                    <div style={{
                      fontSize: '0.75rem',
                      color: msg.role === 'user' ? '#999' : '#d4af37',
                      marginBottom: '0.3rem',
                      fontWeight: '600',
                      textAlign: msg.role === 'user' ? 'right' : 'left'
                    }}>
                      {msg.role === 'user' ? 'Tu' : 'Assistente AI'}
                    </div>
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      background: msg.role === 'user'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(212, 175, 55, 0.1)',
                      border: `1px solid ${msg.role === 'user'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(212, 175, 55, 0.2)'}`,
                      color: '#e0e0e0',
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                      wordWrap: 'break-word'
                    }}>
                      {msg.content}

                      {/* Bottone Speaker solo per messaggi AI */}
                      {msg.role === 'assistant' && msg.content.length > 20 && index === chatHistory.length - 1 && (
                        <button
                          onClick={() => isSpeaking ? stopSpeaking() : speak(msg.content, true)}
                          style={{
                            marginLeft: '0.5rem',
                            background: isSpeaking ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            color: '#d4af37',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            padding: '0.3rem 0.5rem',
                            borderRadius: '6px',
                            transition: 'all 0.3s ease'
                          }}
                          title={isSpeaking ? 'Ferma audio' : 'Ascolta risposta'}
                        >
                          {isSpeaking ? '🔊' : '🔉'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Mostra proprietà della chat quando ci sono */}
              {chatProperties.length > 0 && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(212, 175, 55, 0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '12px'
                }}>
                  <div style={{
                    color: '#d4af37',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    textAlign: 'center'
                  }}>
                    🏠 {chatProperties.length} {chatProperties.length === 1 ? 'Immobile disponibile' : 'Immobili disponibili'}
                  </div>

                  {/* Grid compatto per le proprietà */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1rem',
                    maxHeight: '600px',
                    overflowY: 'auto'
                  }}>
                    {chatProperties.map(property => (
                      <div key={property.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <PropertyCard
                          property={property}
                          onSelect={setSelectedProperty}
                          isFavorite={favorites.has(property.id)}
                          onToggleFavorite={toggleFavorite}
                        />
                        <button
                          onClick={() => { setSelectedPropertyForVisit(property); setShowVisitForm(true); }}
                          style={{
                            padding: '0.5rem', background: 'linear-gradient(135deg,#16a085,#138d75)',
                            border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600',
                            fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: '0.4rem'
                          }}
                        >
                          📅 Fissa Visita
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form fissa visita */}
              {showVisitForm && selectedPropertyForVisit && (
                <ChatVisitConfirmation
                  property={selectedPropertyForVisit}
                  onClose={() => setShowVisitForm(false)}
                  onSuccess={(data) => {
                    setShowVisitForm(false);
                    setChatHistory(prev => [...prev, {
                      role: 'assistant',
                      content: `✅ Visita prenotata con successo! Ti contatteremo presto per confermare l'appuntamento per: ${selectedPropertyForVisit.title}.`
                    }]);
                    setSelectedPropertyForVisit(null);
                  }}
                />
              )}

              {/* Loading indicator */}
              {aiLoading && (
                <div style={{
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icons.AI />
                  </div>
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    background: 'rgba(212, 175, 55, 0.1)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    color: '#d4af37',
                    fontSize: '0.95rem'
                  }}>
                    ●●● Sto pensando...
                  </div>
                </div>
              )}

              {/* Elemento invisibile per auto-scroll */}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}

        {/* Testo descrittivo AI */}
        {!showChatBox && !aiLoading && (
          <div style={{
            maxWidth: '700px',
            margin: '2rem auto',
            padding: '2rem',
            background: 'rgba(212, 175, 55, 0.05)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <h3 style={{
              color: '#d4af37',
              fontSize: '1.4rem',
              fontWeight: '500',
              marginBottom: '1rem',
              fontFamily: '"Playfair Display", serif'
            }}>
              Il tuo assistente immobiliare intelligente
            </h3>
            <p style={{
              color: '#ccc',
              fontSize: '1rem',
              lineHeight: '1.8',
              marginBottom: '1rem'
            }}>
              La nostra AI può aiutarti in ogni fase del tuo percorso immobiliare:
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <div style={{ color: '#d4af37', fontSize: '0.95rem' }}>✓ Comprare casa</div>
              <div style={{ color: '#d4af37', fontSize: '0.95rem' }}>✓ Vendere immobile</div>
              <div style={{ color: '#d4af37', fontSize: '0.95rem' }}>✓ Affittare proprietà</div>
              <div style={{ color: '#d4af37', fontSize: '0.95rem' }}>✓ Valutare immobile</div>
              <div style={{ color: '#d4af37', fontSize: '0.95rem' }}>✓ Calcolare mutuo</div>
              <div style={{ color: '#d4af37', fontSize: '0.95rem' }}>✓ Nuove costruzioni</div>
            </div>
            <p style={{
              color: '#999',
              fontSize: '0.9rem',
              lineHeight: '1.6',
              fontStyle: 'italic'
            }}>
              Chiedimi qualsiasi cosa sugli immobili: città, prezzo, caratteristiche, zone, documenti necessari.
              Sono qui per consigliarti la soluzione perfetta e guidarti passo dopo passo!
            </p>
          </div>
        )}
      </div>

      {/* Property Grid - Mostra SOLO dopo ricerca AI */}
      {showResults && (
        <div style={styles.gridContainer}>
          <div style={styles.gridHeader}>
            <h2 style={styles.gridTitle}>Risultati della ricerca</h2>
            <span style={styles.resultsCount}>{filteredProperties.length} immobili trovati</span>
          </div>

          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem',
              color: '#666',
              fontSize: '1.2rem'
            }}>
              Caricamento immobili...
            </div>
          ) : filteredProperties.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem',
              color: '#999',
              fontSize: '1.1rem'
            }}>
              Nessun immobile trovato con questi criteri. Prova a modificare la tua ricerca.
            </div>
          ) : (
            <div style={styles.propertyGrid}>
              {filteredProperties.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onSelect={setSelectedProperty}
                  isFavorite={favorites.has(property.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Property Modal */}
      <PropertyModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        isFavorite={selectedProperty ? favorites.has(selectedProperty.id) : false}
        onToggleFavorite={toggleFavorite}
      />

      {/* Partner Registration Modal */}
      <PartnerRegistrationModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        onSuccess={handlePartnerRegistrationSuccess}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={(userData, token) => {
          setUser(userData);
          console.log('Login effettuato:', userData);
        }}
      />

      {/* Floating Chat Button - Mostra quando la chat è chiusa ma ci sono messaggi */}
      {!showChatBox && chatHistory.length > 0 && (
        <button
          onClick={() => setShowChatBox(true)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 20px rgba(212, 175, 55, 0.4), 0 0 30px rgba(212, 175, 55, 0.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            transition: 'all 0.3s ease',
            zIndex: 999,
            animation: 'pulse 2s infinite'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 12px 30px rgba(212, 175, 55, 0.6), 0 0 40px rgba(212, 175, 55, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 8px 20px rgba(212, 175, 55, 0.4), 0 0 30px rgba(212, 175, 55, 0.2)';
          }}
          title={`Apri chat (${chatHistory.length / 2} messaggi)`}
        >
          💬
          {/* Badge contatore messaggi */}
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#ff4444',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #0a0a0a'
          }}>
            {chatHistory.length / 2}
          </div>
        </button>
      )}

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerSection}>
            <h3 style={styles.footerTitle}>AgenzieCase</h3>
            <p style={styles.footerText}>
              Il portale immobiliare italiano con ricerca AI
            </p>
          </div>

          <div style={styles.footerSection}>
            <h4 style={styles.footerSubtitle}>Link Utili</h4>
            <div style={styles.footerLinks}>
              <a href="#" style={styles.footerLink}>Chi Siamo</a>
              <a href="#" style={styles.footerLink}>Contatti</a>
              <a href="#" style={styles.footerLink}>Privacy Policy</a>
              <a href="#" style={styles.footerLink}>Termini e Condizioni</a>
            </div>
          </div>

          <div style={styles.footerSection}>
            <h4 style={styles.footerSubtitle}>Area Riservata</h4>
            <p style={styles.footerText}>
              Accedi alla tua area personale o registra la tua agenzia
            </p>
            <div style={styles.footerButtons}>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                style={styles.loginButton}
              >
                🔑 Login
              </button>
              <button
                onClick={() => setIsPartnerModalOpen(true)}
                style={styles.partnerButton}
              >
                🤝 Registrati come Partner
              </button>
            </div>
          </div>
        </div>

        <div style={styles.footerBottom}>
          <p style={styles.footerCopyright}>
            © 2025 AgenzieCase. Tutti i diritti riservati.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AgenzieCase;
