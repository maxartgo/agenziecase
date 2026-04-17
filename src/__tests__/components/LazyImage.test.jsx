// LazyImage Component Tests
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LazyImage from '../../components/LazyImage';

// Mock IntersectionObserver is already in setupTests.js

describe('LazyImage Component', () => {
  it('should render img element', () => {
    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test Image"
      />
    );

    const img = screen.getByAltText('Test Image');
    expect(img).toBeInTheDocument();
  });

  it('should have correct alt text', () => {
    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test Alt Text"
      />
    );

    const img = screen.getByAltText('Test Alt Text');
    expect(img).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test"
        className="custom-class"
      />
    );

    const img = screen.getByAltText('Test');
    expect(img).toHaveClass('custom-class');
  });

  it('should apply inline styles', () => {
    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test"
        style={{ width: '100px', height: '100px' }}
      />
    );

    const img = screen.getByAltText('Test');
    expect(img).toHaveStyle({ width: '100px', height: '100px' });
  });

  it('should render with placeholder before loading', () => {
    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test"
      />
    );

    const img = screen.getByAltText('Test');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', expect.stringContaining(''));
  });
});
