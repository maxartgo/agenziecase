import { useEffect, useRef } from 'react';

/**
 * Componente effetto Matrix Rain
 * Caratteri che cadono dall'alto verso il basso in stile Matrix
 */
const MatrixRain = ({
  opacity = 0.15,
  color = '#d4af37', // Oro per AgenzieCase
  fontSize = 14,
  speed = 50
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Imposta dimensioni canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Caratteri da usare (mix di numeri, lettere e simboli immobiliari)
    const chars = '0123456789€$¥£₿■▪▫○●◘◙♦♣♠•◘◙◊ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charArray = chars.split('');

    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    // Funzione di disegno
    const draw = () => {
      // Sfondo semi-trasparente per effetto scia
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;

      // Disegna caratteri
      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        // Reset casuale della colonna quando raggiunge il fondo
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    // Avvia animazione
    const interval = setInterval(draw, speed);

    // Gestisci resize finestra
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [color, fontSize, speed]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: opacity,
        pointerEvents: 'none', // Non blocca i click
        zIndex: 0 // Dietro tutto
      }}
    />
  );
};

export default MatrixRain;
