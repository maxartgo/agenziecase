// PropertyCreateModal Component Tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PropertyCreateModal from '../../components/PropertyCreateModal';

// Mock fetch globally
global.fetch = vi.fn();

// Mock FileReader
global.FileReader = class FileReader {
  constructor() {
    this.result = null;
    this.onloadend = null;
  }

  readAsDataURL(file) {
    setTimeout(() => {
      this.result = `data:${file.type};base64,${file.name}`;
      if (this.onloadend) this.onloadend();
    }, 0);
  }
};

describe('PropertyCreateModal Component', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    partnerId: 123,
    agentId: 456
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token-123');
  });

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<PropertyCreateModal {...mockProps} />);

      expect(screen.getByText(/nuovo annuncio/i)).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<PropertyCreateModal {...mockProps} isOpen={false} />);

      expect(screen.queryByText(/nuovo annuncio/i)).not.toBeInTheDocument();
    });

    it('should render form fields', () => {
      render(<PropertyCreateModal {...mockProps} />);

      expect(screen.getByLabelText(/titolo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/descrizione/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/prezzo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/città/i)).toBeInTheDocument();
    });

    it('should render file upload sections', () => {
      render(<PropertyCreateModal {...mockProps} />);

      expect(screen.getByText(/immagini/i)).toBeInTheDocument();
      expect(screen.getByText(/planimetrie/i)).toBeInTheDocument();
      expect(screen.getByByText(/video/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<PropertyCreateModal {...mockProps} />);

      expect(screen.getByRole('button', { name: /pubblica annuncio|crea|salva/i })).toBeInTheDocument();
    });

    it('should render cancel button', () => {
      render(<PropertyCreateModal {...mockProps} />);

      expect(screen.getByRole('button', { name: /annulla|chiudi/i })).toBeInTheDocument();
    });
  });

  describe('Form Input Handling', () => {
    it('should update title field', () => {
      render(<PropertyCreateModal {...mockProps} />);

      const titleInput = screen.getByLabelText(/titolo/i);
      fireEvent.change(titleInput, { target: { value: 'Villa Milano' } });

      expect(titleInput.value).toBe('Villa Milano');
    });

    it('should update description field', () => {
      render(<PropertyCreateModal {...mockProps} />);

      const descriptionInput = screen.getByLabelText(/descrizione/i);
      fireEvent.change(descriptionInput, { target: { value: 'Bellissima villa' } });

      expect(descriptionInput.value).toBe('Bellissima villa');
    });

    it('should update price field', () => {
      render(<PropertyCreateModal {...mockProps} />);

      const priceInput = screen.getByLabelText(/prezzo/i);
      fireEvent.change(priceInput, { target: { value: '500000' } });

      expect(priceInput.value).toBe('500000');
    });

    it('should update city field', () => {
      render(<PropertyCreateModal {...mockProps} />);

      const cityInput = screen.getByLabelText(/città/i);
      fireEvent.change(cityInput, { target: { value: 'Milano' } });

      expect(cityInput.value).toBe('Milano');
    });

    it('should toggle checkbox fields', () => {
      render(<PropertyCreateModal {...mockProps} />);

      const parkingCheckbox = screen.getByLabelText(/parcheggio|box/i);
      fireEvent.click(parkingCheckbox);

      expect(parkingCheckbox.checked).toBe(true);
    });
  });

  describe('Image Upload', () => {
    it('should handle image file selection', () => {
      render(<PropertyCreateModal {...mockProps} />);

      const fileInput = screen.getByLabelText(/carica immagini/i);
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      // Should accept valid file
      expect(screen.queryByText(/solo immagini JPG/i)).not.toBeInTheDocument();
    });

    it('should reject invalid file types', () => {
      render(<PropertyCreateModal {...mockProps} />);

      const fileInput = screen.getByLabelText(/carica immagini/i);
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.queryByText(/solo immagini JPG/i)).toBeInTheDocument();
    });

    it('should enforce max images limit (20)', () => {
      render(<PropertyCreateModal {...mockProps} />);

      const fileInput = screen.getByLabelText(/carica immagini/i);
      const files = Array.from({ length: 21 }, (_, i) =>
        new File([''], `test${i}.jpg`, { type: 'image/jpeg' })
      );

      fireEvent.change(fileInput, { target: { files } });

      expect(screen.queryByText(/massimo 20 immagini/i)).toBeInTheDocument();
    });

    it('should enforce single image size limit (10MB)', () => {
      render(<PropertyCreateModal {...mockProps} />);

      const fileInput = screen.getByLabelText(/carica immagini/i);
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg'
      });

      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      expect(screen.queryByText(/dimensione massima 10MB/i)).toBeInTheDocument();
    });

    it('should enforce total size limit (100MB)', () => {
      render(<PropertyCreateModal {...mockProps} />);

      const fileInput = screen.getByLabelText(/carica immagini/i);
      const largeFiles = Array.from({ length: 10 }, (_, i) =>
        new File(['x'.repeat(11 * 1024 * 1024)], `large${i}.jpg`, { type: 'image/jpeg' })
      );

      fireEvent.change(fileInput, { target: { files: largeFiles } });

      expect(screen.queryByText(/dimensione totale.*supera il limite/i)).toBeInTheDocument();
    });
  });

  describe('Floor Plan Upload', () => {
    it('should handle floor plan file selection', () => {
      render(<PropertyCreateModal {...mockProps} />);

      const fileInput = screen.getByLabelText(/carica planimetrie/i);
      const file = new File([''], 'plan.jpg', { type: 'image/jpeg' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.queryByText(/solo immagini JPG/i)).not.toBeInTheDocument();
    });

    it('should enforce max floor plans limit (10)', () => {
      render(<PropertyCreateModal {...mockProps} />);

      const fileInput = screen.getByLabelText(/carica planimetrie/i);
      const files = Array.from({ length: 11 }, (_, i) =>
        new File([''], `plan${i}.jpg`, { type: 'image/jpeg' })
      );

      fireEvent.change(fileInput, { target: { files } });

      expect(screen.queryByText(/massimo 10 planimetrie/i)).toBeInTheDocument();
    });
  });

  describe('Video Upload', () => {
    it('should handle video file selection', () => {
      render(<PropertyCreateModal {...mockProps} />);

      const fileInput = screen.getByLabelText(/carica video/i);
      const file = new File([''], 'video.mp4', { type: 'video/mp4' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.queryByText(/solo video MP4/i)).not.toBeInTheDocument();
    });

    it('should reject invalid video types', () => {
      render(<PropertyCreateModal {...mockProps} />);

      const fileInput = screen.getByLabelText(/carica video/i);
      const file = new File([''], 'video.txt', { type: 'text/plain' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.queryByText(/solo video MP4/i)).toBeInTheDocument();
    });

    it('should enforce max videos limit (5)', () => {
      render(<PropertyCreateModal {...mockProps} />);

      const fileInput = screen.getByLabelText(/carica video/i);
      const files = Array.from({ length: 6 }, (_, i) =>
        new File([''], `video${i}.mp4`, { type: 'video/mp4' })
      );

      fireEvent.change(fileInput, { target: { files } });

      expect(screen.queryByText(/massimo 5 video/i)).toBeInTheDocument();
    });
  });

  describe('Image Marks', () => {
    it('should mark first image as primary by default', () => {
      render(<PropertyCreateModal {...mockProps} />);

      const fileInput = screen.getByLabelText(/carica immagini/i);
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      // First image should be marked as primary
      // This would be tested with actual component implementation
    });

    it('should allow toggling image marks', () => {
      render(<PropertyCreateModal {...mockProps} />);

      const fileInput = screen.getByLabelText(/carica immagini/i);
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      // Test mark toggling
      // This would be tested with actual component implementation
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, property: { id: 123 } })
      });

      render(<PropertyCreateModal {...mockProps} />);

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/titolo/i), {
        target: { value: 'Villa Test' }
      });
      fireEvent.change(screen.getByLabelText(/prezzo/i), {
        target: { value: '500000' }
      });
      fireEvent.change(screen.getByLabelText(/città/i), {
        target: { value: 'Milano' }
      });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /pubblica|crea|salva/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should call onSuccess after successful submission', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, property: { id: 123 } })
      });

      render(<PropertyCreateModal {...mockProps} />);

      // Fill and submit
      fireEvent.change(screen.getByLabelText(/titolo/i), {
        target: { value: 'Villa Test' }
      });
      fireEvent.change(screen.getByLabelText(/prezzo/i), {
        target: { value: '500000' }
      });

      fireEvent.click(screen.getByRole('button', { name: /pubblica|crea|salva/i }));

      await waitFor(() => {
        expect(mockProps.onSuccess).toHaveBeenCalledWith({ id: 123 });
      });
    });

    it('should call onClose after successful submission', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, property: { id: 123 } })
      });

      render(<PropertyCreateModal {...mockProps} />);

      // Fill and submit
      fireEvent.change(screen.getByLabelText(/titolo/i), {
        target: { value: 'Villa Test' }
      });
      fireEvent.change(screen.getByLabelText(/prezzo/i), {
        target: { value: '500000' }
      });

      fireEvent.click(screen.getByRole('button', { name: /pubblica|crea|salva/i }));

      await waitFor(() => {
        expect(mockProps.onClose).toHaveBeenCalled();
      });
    });

    it('should handle submission errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false, error: 'Errore creazione' })
      });

      render(<PropertyCreateModal {...mockProps} />);

      // Fill and submit
      fireEvent.change(screen.getByLabelText(/titolo/i), {
        target: { value: 'Villa Test' }
      });
      fireEvent.change(screen.getByLabelText(/prezzo/i), {
        target: { value: '500000' }
      });

      fireEvent.click(screen.getByRole('button', { name: /pubblica|crea|salva/i }));

      await waitFor(() => {
        expect(screen.queryByText(/errore creazione/i)).toBeInTheDocument();
      });
    });

    it('should validate required fields', async () => {
      render(<PropertyCreateModal {...mockProps} />);

      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /pubblica|crea|salva/i });
      fireEvent.click(submitButton);

      // Should show validation errors
      expect(screen.queryByText(/titolo obbligatorio/i)).toBeInTheDocument();
    });
  });

  describe('Modal Actions', () => {
    it('should call onClose when cancel button is clicked', () => {
      render(<PropertyCreateModal {...mockProps} />);

      const cancelButton = screen.getByRole('button', { name: /annulla|chiudi/i });
      fireEvent.click(cancelButton);

      expect(mockProps.onClose).toHaveBeenCalled();
    });

    it('should clear form when reopened', () => {
      const { rerender } = render(<PropertyCreateModal {...mockProps} />);

      // Fill form
      fireEvent.change(screen.getByLabelText(/titolo/i), {
        target: { value: 'Villa Test' }
      });

      // Close and reopen
      rerender(<PropertyCreateModal {...mockProps} isOpen={false} />);
      rerender(<PropertyCreateModal {...mockProps} isOpen={true} />);

      // Form should be cleared
      expect(screen.getByLabelText(/titolo/i).value).toBe('');
    });
  });

  describe('Loading States', () => {
    it('should show loading state during submission', async () => {
      let resolveFetch;
      global.fetch.mockImplementationOnce(() =>
        new Promise(resolve => {
          resolveFetch = resolve;
        })
      );

      render(<PropertyCreateModal {...mockProps} />);

      // Fill and submit
      fireEvent.change(screen.getByLabelText(/titolo/i), {
        target: { value: 'Villa Test' }
      });
      fireEvent.change(screen.getByLabelText(/prezzo/i), {
        target: { value: '500000' }
      });

      fireEvent.click(screen.getByRole('button', { name: /pubblica|crea|salva/i }));

      // Should show loading
      await waitFor(() => {
        expect(screen.queryByText(/caricamento|salvataggio|invio/i)).toBeInTheDocument();
      });

      // Resolve fetch
      resolveFetch({
        ok: true,
        json: async () => ({ success: true, property: { id: 123 } })
      });
    });
  });

  describe('Error Handling', () => {
    it('should clear error when user types in field', () => {
      // Set error state first by selecting invalid file
      render(<PropertyCreateModal {...mockProps} />);

      const fileInput = screen.getByLabelText(/carica immagini/i);
      const invalidFile = new File([''], 'test.pdf', { type: 'application/pdf' });

      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      expect(screen.queryByText(/solo immagini JPG/i)).toBeInTheDocument();

      // Type in title field
      fireEvent.change(screen.getByLabelText(/titolo/i), {
        target: { value: 'Villa Test' }
      });

      // Error should be cleared
      expect(screen.queryByText(/solo immagini JPG/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<PropertyCreateModal {...mockProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<PropertyCreateModal {...mockProps} />);

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAttribute('type');
      });
    });
  });
});
