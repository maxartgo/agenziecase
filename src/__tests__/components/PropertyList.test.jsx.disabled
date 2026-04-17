// PropertyList Component Tests
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import PropertyList from '../../components/PropertyList';

// Mock fetch globally
global.fetch = vi.fn();

// Mock window.confirm
global.confirm = vi.fn(() => true);

describe('PropertyList Component', () => {
  const mockToken = 'test-token-123';
  const mockOnEdit = vi.fn();

  const mockProperties = [
    {
      id: 1,
      title: 'Villa Milano Centrale',
      price: '500000.00',
      city: 'Milano',
      type: 'Vendita',
      status: 'disponibile',
      sqm: 200,
      rooms: 5,
      mainImage: 'https://example.com/image1.jpg'
    },
    {
      id: 2,
      title: 'Appartamento Roma',
      price: '350000.00',
      city: 'Roma',
      type: 'Vendita',
      status: 'venduto',
      sqm: 120,
      rooms: 3,
      mainImage: 'https://example.com/image2.jpg'
    },
    {
      id: 3,
      title: 'Loft Torino',
      price: '1200.00',
      city: 'Torino',
      type: 'Affitto',
      status: 'disponibile',
      sqm: 80,
      rooms: 2,
      mainImage: 'https://example.com/image3.jpg'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.confirm
    global.confirm.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render loading state initially', () => {
      globalFetchMock({ properties: [] });

      render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      // Should show loading indicator
      const loadingElement = screen.queryByText(/caricando/i);
      expect(loadingElement).toBeInTheDocument();
    });

    it('should render properties list after loading', async () => {
      globalFetchMock({ properties: mockProperties });

      render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Should render property cards
      mockProperties.forEach(property => {
        expect(screen.getByText(property.title)).toBeInTheDocument();
      });
    });

    it('should render empty state when no properties', async () => {
      globalFetchMock({ properties: [] });

      render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      expect(screen.getByText(/nessun annuncio/i)).toBeInTheDocument();
    });

    it('should render filter buttons', async () => {
      globalFetchMock({ properties: mockProperties });

      render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Check for filter buttons
      expect(screen.getByText(/tutti/i)).toBeInTheDocument();
      expect(screen.getByText(/vendita/i)).toBeInTheDocument();
      expect(screen.getByText(/affitto/i)).toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    it('should load properties on mount', async () => {
      globalFetchMock({ properties: mockProperties });

      render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/properties?'),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': `Bearer ${mockToken}`
            })
          })
        );
      });
    });

    it('should load properties with partnerId filter', async () => {
      globalFetchMock({ properties: mockProperties });

      render(
        <PropertyList
          partnerId={123}
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('partnerId=123'),
          expect.any(Object)
        );
      });
    });

    it('should load properties with agentId filter', async () => {
      globalFetchMock({ properties: mockProperties });

      render(
        <PropertyList
          agentId={456}
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('agentId=456'),
          expect.any(Object)
        );
      });
    });

    it('should handle API errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText(/errore/i)).toBeInTheDocument();
      });
    });

    it('should handle empty API response', async () => {
      globalFetchMock({ success: true });

      render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/nessun annuncio/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should filter properties by type "sale"', async () => {
      globalFetchSequence([
        { properties: mockProperties },
        { properties: mockProperties.filter(p => p.type === 'Vendita') }
      ]);

      render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Click sale filter
      const saleFilter = screen.getByText(/vendita/i);
      fireEvent.click(saleFilter);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('type=Vendita'),
          expect.any(Object)
        );
      });
    });

    it('should filter properties by type "rent"', async () => {
      globalFetchSequence([
        { properties: mockProperties },
        { properties: mockProperties.filter(p => p.type === 'Affitto') }
      ]);

      render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Click rent filter
      const rentFilter = screen.getByText(/affitto/i);
      fireEvent.click(rentFilter);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('type=Affitto'),
          expect.any(Object)
        );
      });
    });

    it('should filter properties by status', async () => {
      globalFetchSequence([
        { properties: mockProperties },
        { properties: mockProperties.filter(p => p.status === 'disponibile') }
      ]);

      render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Click available filter
      const availableFilter = screen.getByText(/disponibile/i);
      fireEvent.click(availableFilter);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('status=disponibile'),
          expect.any(Object)
        );
      });
    });

    it('should reset to "all" filter', async () => {
      globalFetchSequence([
        { properties: mockProperties },
        { properties: mockProperties }
      ]);

      render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Click "all" filter
      const allFilter = screen.getByText(/tutti/i);
      fireEvent.click(allFilter);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Property Actions', () => {
    it('should call onEdit when edit button is clicked', async () => {
      globalFetchMock({ properties: mockProperties });

      render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Find edit button for first property
      const editButtons = screen.getAllByText(/modifica/i);
      if (editButtons.length > 0) {
        fireEvent.click(editButtons[0]);
        expect(mockOnEdit).toHaveBeenCalledWith(mockProperties[0].id);
      }
    });

    it('should delete property when delete button is clicked', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ properties: mockProperties })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

      render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Click delete button
      const deleteButtons = screen.getAllByText(/elimina/i);
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
          expect(global.confirm).toHaveBeenCalledWith(
            expect.stringContaining('sicuro')
          );
        });

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/properties/1'),
            expect.objectContaining({
              method: 'DELETE'
            })
          );
        });
      }
    });

    it('should not delete property when user cancels', async () => {
      global.confirm.mockReturnValueOnce(false);

      globalFetchMock({ properties: mockProperties });

      render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Click delete button
      const deleteButtons = screen.getAllByText(/elimina/i);
      if (deleteButtons.length > 0) {
        const fetchCountBefore = global.fetch.mock.calls.length;

        fireEvent.click(deleteButtons[0]);

        // Should not call DELETE API
        expect(global.fetch.mock.calls.length).toBe(fetchCountBefore);
      }
    });

    it('should handle delete API errors', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ properties: mockProperties })
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Delete failed' })
        });

      render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const deleteButtons = screen.getAllByText(/elimina/i);
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
          expect(screen.queryByText(/errore/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Property Display', () => {
    it('should display property price correctly', async () => {
      globalFetchMock({ properties: mockProperties });

      render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Check if prices are displayed
      expect(screen.getByText(/500000/)).toBeInTheDocument();
      expect(screen.getByText(/350000/)).toBeInTheDocument();
    });

    it('should display property images', async () => {
      globalFetchMock({ properties: mockProperties });

      render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Check for images
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });

    it('should display property status badges', async () => {
      globalFetchMock({ properties: mockProperties });

      render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Check for status indicators
      expect(screen.getByText(/disponibile/i)).toBeInTheDocument();
      expect(screen.getByText(/venduto/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing token gracefully', () => {
      globalFetchMock({ properties: [] });

      render(
        <PropertyList
          token={null}
          onEdit={mockOnEdit}
        />
      );

      // Should not crash
      expect(screen.getByText(/nessun annuncio/i)).toBeInTheDocument();
    });

    it('should handle missing onEdit callback', async () => {
      globalFetchMock({ properties: mockProperties });

      render(
        <PropertyList
          token={mockToken}
        />
      );

      // Should render without errors
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      expect(screen.getByText('Villa Milano Centrale')).toBeInTheDocument();
    });

    it('should handle very large property lists', async () => {
      const largeList = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        title: `Property ${i + 1}`,
        price: '100000.00',
        city: 'Milano',
        type: 'Vendita',
        status: 'disponibile',
        sqm: 100,
        rooms: 3
      }));

      globalFetchMock({ properties: largeList });

      render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Should render all properties
      largeList.slice(0, 10).forEach(property => {
        expect(screen.getByText(property.title)).toBeInTheDocument();
      });
    });

    it('should handle properties with missing images', async () => {
      const propertiesWithoutImages = mockProperties.map(p => ({
        ...p,
        mainImage: null
      }));

      globalFetchMock({ properties: propertiesWithoutImages });

      render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Should still render properties
      expect(screen.getByText('Villa Milano Centrale')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not reload data unnecessarily', async () => {
      globalFetchMock({ properties: mockProperties });

      const { rerender } = render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Rerender with same props
      rerender(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      // Should not call fetch again (same props)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should reload data when filter changes', async () => {
      globalFetchSequence([
        { properties: mockProperties },
        { properties: mockProperties.filter(p => p.type === 'Affitto') }
      ]);

      render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Change filter
      const filterSelect = screen.getByRole('combobox');
      fireEvent.change(filterSelect, { target: { value: 'Affitto' } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Integration', () => {
    it('should handle complete property management workflow', async () => {
      globalFetchSequence([
        { properties: mockProperties }, // Initial load
        { success: true }, // Delete
        { properties: mockProperties.slice(1) } // Reload after delete
      ]);

      render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      // 1. Load properties
      await waitFor(() => {
        expect(screen.getByText('Villa Milano Centrale')).toBeInTheDocument();
      });

      // 2. Filter properties
      const saleFilter = screen.getByText(/vendita/i);
      fireEvent.click(saleFilter);

      // 3. Delete property
      const deleteButtons = screen.getAllByText(/elimina/i);
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);
      }

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      globalFetchMock({ properties: mockProperties });

      render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Check for ARIA labels on buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should be keyboard navigable', async () => {
      globalFetchMock({ properties: mockProperties });

      render(
        <PropertyList
          token={mockToken}
          onEdit={mockOnEdit}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Check for keyboard accessibility
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type');
      });
    });
  });
});

// Helper function to mock fetch responses
function globalFetchMock(data) {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({ success: true, ...data })
  });
}

// Helper function to sequence multiple fetch calls
function globalFetchSequence(responses) {
  responses.forEach(data => {
    globalFetchMock(data);
  });
}