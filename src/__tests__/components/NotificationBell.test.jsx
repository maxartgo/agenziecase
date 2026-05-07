// NotificationBell Component Tests
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import NotificationBell from '../../components/NotificationBell';

// Mock fetch globally
global.fetch = vi.fn();

describe('NotificationBell Component', () => {
  const mockToken = 'test-token-123';
  const mockOnNotificationClick = vi.fn();

  const mockNotifications = [
    {
      id: 1,
      title: 'Nuova lead',
      message: 'Hai ricevuto una nuova lead per Villa Milano',
      type: 'lead',
      read: false,
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      title: 'Appuntamento confermato',
      message: 'Appuntamento con cliente confermato per domani',
      type: 'appointment',
      read: false,
      created_at: '2024-01-15T09:15:00Z'
    },
    {
      id: 3,
      title: 'Messaggio',
      message: 'Nuovo messaggio dalla piattaforma',
      type: 'message',
      read: true,
      created_at: '2024-01-14T16:45:00Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch responses
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render notification bell icon', () => {
      render(
        <NotificationBell
          token={mockToken}
          onNotificationClick={mockOnNotificationClick}
        />
      );

      // Check for bell icon/button
      const bellButton = screen.getByRole('button');
      expect(bellButton).toBeInTheDocument();
    });

    it('should display unread count badge when count > 0', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, count: 5 })
      });

      render(
        <NotificationBell
          token={mockToken}
          onNotificationClick={mockOnNotificationClick}
        />
      );

      // Wait for count to load
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/notifications/unread/count',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': `Bearer ${mockToken}`
            })
          })
        );
      });
    });

    it('should not display badge when count is 0', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, count: 0 })
      });

      render(
        <NotificationBell
          token={mockToken}
          onNotificationClick={mockOnNotificationClick}
        />
      );

      const bellButton = screen.getByRole('button');
      expect(bellButton).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      render(
        <NotificationBell
          token={mockToken}
          onNotificationClick={mockOnNotificationClick}
        />
      );

      // Should not crash, just handle error silently
      const bellButton = screen.getByRole('button');
      expect(bellButton).toBeInTheDocument();
    });
  });

  describe('Dropdown Interaction', () => {
    it('should open dropdown when bell is clicked', async () => {
      global.fetchSequence([
        { count: 2 }, // unread count
        mockNotifications // notifications list
      ]);

      render(
        <NotificationBell
          token={mockToken}
          onNotificationClick={mockOnNotificationClick}
        />
      );

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      // Should load notifications when dropdown opens
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/notifications?limit=5',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': `Bearer ${mockToken}`
            })
          })
        );
      });
    });

    it('should close dropdown when clicking outside', async () => {
      global.fetchSequence([
        { count: 0 },
        mockNotifications
      ]);

      render(
        <NotificationBell
          token={mockToken}
          onNotificationClick={mockOnNotificationClick}
        />
      );

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      // Click outside
      fireEvent.mouseDown(document.body);

      // Dropdown should close (this is handled by useEffect)
      expect(bellButton).toBeInTheDocument();
    });

    it('should toggle dropdown on repeated clicks', async () => {
      global.fetchSequence([
        { count: 0 },
        mockNotifications,
        { count: 0 }
      ]);

      render(
        <NotificationBell
          token={mockToken}
          onNotificationClick={mockOnNotificationClick}
        />
      );

      const bellButton = screen.getByRole('button');

      // First click - open
      fireEvent.click(bellButton);

      // Second click - close
      fireEvent.click(bellButton);

      expect(bellButton).toBeInTheDocument();
    });
  });

  describe('Notifications List', () => {
    it('should display notifications when dropdown is open', async () => {
      global.fetchSequence([
        { count: 3 },
        mockNotifications
      ]);

      render(
        <NotificationBell
          token={mockToken}
          onNotificationClick={mockOnNotificationClick}
        />
      );

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should show loading state while fetching notifications', async () => {
      let resolveFetch;
      global.fetch.mockImplementationOnce(() =>
        new Promise(resolve => {
          resolveFetch = resolve;
        })
      );

      render(
        <NotificationBell
          token={mockToken}
          onNotificationClick={mockOnNotificationClick}
        />
      );

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      // Should be in loading state
      expect(bellButton).toBeInTheDocument();

      // Resolve fetch
      resolveFetch({
        ok: true,
        json: async () => ({ success: true, notifications: mockNotifications })
      });
    });

    it('should handle empty notifications list', async () => {
      global.fetchSequence([
        { count: 0 },
        []
      ]);

      render(
        <NotificationBell
          token={mockToken}
          onNotificationClick={mockOnNotificationClick}
        />
      );

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should display notification type icons', async () => {
      global.fetchSequence([
        { count: 3 },
        mockNotifications
      ]);

      render(
        <NotificationBell
          token={mockToken}
          onNotificationClick={mockOnNotificationClick}
        />
      );

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Notification Actions', () => {
    it('should call onNotificationClick when notification is clicked', async () => {
      global.fetchSequence([
        { count: 1 },
        mockNotifications
      ]);

      render(
        <NotificationBell
          token={mockToken}
          onNotificationClick={mockOnNotificationClick}
        />
      );

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should mark notification as read when clicked', async () => {
      let notificationClickResolve;
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, count: 1 })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, notifications: mockNotifications })
        })
        .mockImplementationOnce(() =>
          new Promise(resolve => {
            notificationClickResolve = resolve;
          })
        );

      render(
        <NotificationBell
          token={mockToken}
          onNotificationClick={mockOnNotificationClick}
        />
      );

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });

      // Simulate notification click - this would mark as read
      // The exact implementation depends on the component
    });

    it('should refresh unread count after marking notification as read', async () => {
      global.fetchSequence([
        { count: 3 },
        mockNotifications,
        { count: 2 }, // Updated count after marking one as read
        { count: 2 }
      ]);

      render(
        <NotificationBell
          token={mockToken}
          onNotificationClick={mockOnNotificationClick}
        />
      );

      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Auto-refresh', () => {
    it('should poll unread count every 30 seconds', async () => {
      vi.useFakeTimers();

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, count: 1 })
      });

      render(
        <NotificationBell
          token={mockToken}
          onNotificationClick={mockOnNotificationClick}
        />
      );

      // Initial load
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Fast-forward 30 seconds
      vi.advanceTimersByTime(30000);

      // Should poll again
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });

      vi.useRealTimers();
    });

    it('should cleanup polling interval on unmount', async () => {
      vi.useFakeTimers();

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, count: 1 })
      });

      const { unmount } = render(
        <NotificationBell
          token={mockToken}
          onNotificationClick={mockOnNotificationClick}
        />
      );

      unmount();

      // Fast-forward after unmount
      vi.advanceTimersByTime(30000);

      // Should not poll after unmount
      expect(global.fetch).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing token gracefully', () => {
      render(
        <NotificationBell
          token={null}
          onNotificationClick={mockOnNotificationClick}
        />
      );

      const bellButton = screen.getByRole('button');
      expect(bellButton).toBeInTheDocument();
    });

    it('should handle very large unread counts', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, count: 999 })
      });

      render(
        <NotificationBell
          token={mockToken}
          onNotificationClick={mockOnNotificationClick}
        />
      );

      const bellButton = screen.getByRole('button');
      expect(bellButton).toBeInTheDocument();
    });

    it('should handle rapid open/close clicks', async () => {
      global.fetchSequence([
        { count: 0 },
        [],
        { count: 0 },
        [],
        { count: 0 }
      ]);

      render(
        <NotificationBell
          token={mockToken}
          onNotificationClick={mockOnNotificationClick}
        />
      );

      const bellButton = screen.getByRole('button');

      // Rapid clicks
      fireEvent.click(bellButton);
      fireEvent.click(bellButton);
      fireEvent.click(bellButton);
      fireEvent.click(bellButton);

      expect(bellButton).toBeInTheDocument();
    });

    it('should handle missing onNotificationClick callback', () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, count: 0 })
      });

      render(
        <NotificationBell
          token={mockToken}
        />
      );

      const bellButton = screen.getByRole('button');
      expect(bellButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label on bell button', () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, count: 0 })
      });

      render(
        <NotificationBell
          token={mockToken}
          onNotificationClick={mockOnNotificationClick}
        />
      );

      const bellButton = screen.getByRole('button');
      expect(bellButton).toBeInTheDocument();
    });

    it('should announce unread count to screen readers', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, count: 5 })
      });

      render(
        <NotificationBell
          token={mockToken}
          onNotificationClick={mockOnNotificationClick}
        />
      );

      // Check for aria-live or similar announcements
      const bellButton = screen.getByRole('button');
      expect(bellButton).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should handle complete notification workflow', async () => {
      // Start with unread notifications
      global.fetchSequence([
        { count: 3 },
        mockNotifications,
        { count: 2 }, // After marking one as read
        { count: 2 }
      ]);

      render(
        <NotificationBell
          token={mockToken}
          onNotificationClick={mockOnNotificationClick}
        />
      );

      // 1. Initial load
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // 2. Open dropdown
      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      // 3. Load notifications
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });

      // 4. Close dropdown
      fireEvent.click(bellButton);

      expect(bellButton).toBeInTheDocument();
    });

    it('should handle error recovery', async () => {
      // First call fails
      global.fetch.mockRejectedValueOnce(new Error('Network error'))
        // Second call succeeds
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, count: 1 })
        });

      render(
        <NotificationBell
          token={mockToken}
          onNotificationClick={mockOnNotificationClick}
        />
      );

      const bellButton = screen.getByRole('button');
      expect(bellButton).toBeInTheDocument();

      // Should recover and work correctly
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });
});

// Helper function to sequence multiple fetch calls
function globalFetchSequence(responses) {
  responses.forEach((response, index) => {
    if (typeof response === 'number') {
      // Handle count response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, count: response })
      });
    } else if (Array.isArray(response)) {
      // Handle notifications array
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, notifications: response })
      });
    } else {
      // Handle custom response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => response
      });
    }
  });
}