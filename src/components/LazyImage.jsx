import { useState, useRef, useEffect } from 'react';

/**
 * LazyImage Component
 * Loads images only when they enter the viewport using IntersectionObserver
 *
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for accessibility
 * @param {string} className - CSS class name
 * @param {object} style - Inline styles
 * @param {function} onLoad - Callback when image loads
 * @param {function} onError - Callback when image fails to load
 * @param {string} placeholder - Placeholder image URL (optional)
 * @param {string} threshold - Intersection threshold (0-1)
 */
const LazyImage = ({
  src,
  alt,
  className = '',
  style = {},
  onLoad,
  onError,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-family="Arial, sans-serif"%3ELoading...%3C/text%3E%3C/svg%3E',
  threshold = 0.1
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // Create Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Image is in viewport, load it
            setImageSrc(src);
            observer.disconnect(); // Stop observing once loaded
          }
        });
      },
      { threshold }
    );

    // Start observing the image element
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    // Cleanup
    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, threshold]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setIsError(true);
    if (onError) onError(e);
  };

  const containerStyle = {
    ...style,
    opacity: isLoaded ? 1 : 0.7,
    transition: 'opacity 0.3s ease-in-out',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0'
  };

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      style={containerStyle}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
    />
  );
};

export default LazyImage;
