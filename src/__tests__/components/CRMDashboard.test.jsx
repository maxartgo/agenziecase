// CRMDashboard Component Tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CRMDashboard from '../../components/CRMDashboard';

// Mock fetch globally
global.fetch = vi.fn();

// Mock child components
vi.mock('../../components/AgentRegistrationModal', () => ({
  default: ({ isOpen, onClose }) => isOpen ? <div data-testid="agent-modal">Agent Registration Modal</div> : null
}));

vi.mock('../../components/PropertyCreateModal', () => ({
  default: ({ isOpen, onClose }) => isOpen ? <div data-testid="property-modal">Property Create Modal</div> : null
}));

vi.mock('../../components/PropertyList', () => ({
  default: () => <div data-testid="property-list">Property List</div>
}));

vi.mock('../../components/VirtualTourPacks', () => ({
  default: () => <div data-testid="virtual-tour">Virtual Tour Packs</div>
}));

vi.mock('../../components/CRMSubscriptionPlans', () => ({
  default: () => <div data-testid="subscription-plans">CRM Subscription Plans</div>
}));

vi.mock('../../components/CRMDataManager', () => ({
  default: ({ section }) => <div data-testid={`crm-section-${section}`}>CRM Data Manager: {section}</div>
}));

vi.mock('../../components/SupportTickets', () => ({
  default: () => <div data-testid="support-tickets">Support Tickets</div>
}));

vi.mock('../../components/MLSBrowser', () => ({
  default: () => <div data-testid="mls-browser">MLS Browser</div>
}));

vi.mock('../../components/MLSCollaborations', () => ({
  default: () => <div data-testid="mls-collaborations">MLS Collaborations</div>
}));

vi.mock('../../components/MLSLeads', () => ({
  default: () => <div data-testid="mls-leads">MLS Leads</div>
}));

vi.mock('../../components/MLSTransactions', () => ({
  default: () => <div data-testid="mls-transactions">MLS Transactions</div>
}));

vi.mock('../../components/NotificationBell', () => ({
  default: () => <div data-testid="notification-bell">Notification Bell</div>
}));

vi.mock('../../components/NotificationCenter', () => ({
  default: () => <div data-testid="notification-center">Notification Center</div>
}));

describe('CRMDashboard Component', () => {
  const mockPartnerUser = {
    id: 1,
    email: 'partner@test.com',
    role: 'partner',
    firstName: 'Mario',
    lastName: 'Rossi'
  };

  const mockAgentUser = {
    id: 2,
    email: 'agent@test.com',
    role: 'agent',
    firstName: 'Luca',
    lastName: 'Verdi'
  };

  const mockToken = 'test-token-123';

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', mockToken);

    // Mock fetch responses
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });
  });

  describe('Rendering', () => {
    it('should render for partner user', async () => {
      render(<CRMDashboard user={mockPartnerUser} token={mockToken} />);

      await waitFor(() => {
        expect(screen.getByText(/dashboard|crm/i)).toBeInTheDocument();
      });
    });

    it('should render for agent user', async () => {
      render(<CRMDashboard user={mockAgentUser} token={mockToken} />);

      await waitFor(() => {
        expect(screen.getByText(/dashboard|crm/i)).toBeInTheDocument();
      });
    });

    it('should show subscription plans if partner has no active subscription', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, subscription: { active: false } })
      });

      render(<CRMDashboard user={mockPartnerUser} token={mockToken} />);

      await waitFor(() => {
        expect(screen.getByTestId('subscription-plans')).toBeInTheDocument();
      });
    });

    it('should render overview section by default', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, subscription: { active: true } })
      });

      render(<CRMDashboard user={mockPartnerUser} token={mockToken} />);

      await waitFor(() => {
        expect(screen.getByTestId('crm-section-overview')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to properties section', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, subscription: { active: true } })
      });

      render(<CRMDashboard user={mockPartnerUser} token={mockToken} />);

      await waitFor(() => {
        expect(screen.getByText(/annunci/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/annunci/i));

      await waitFor(() => {
        expect(screen.getByTestId('property-list')).toBeInTheDocument();
      });
    });

    it('should navigate to clients section', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, subscription: { active: true } })
      });

      render(<CRMDashboard user={mockAgentUser} token={mockToken} />);

      await waitFor(() => {
        expect(screen.getByText(/clienti/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/clienti/i));

      await waitFor(() => {
        expect(screen.getByTestId('crm-section-clients')).toBeInTheDocument();
      });
    });

    it('should navigate to appointments section', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, subscription: { active: true } })
      });

      render(<CRMDashboard user={mockAgentUser} token={mockToken} />);

      await waitFor(() => {
        expect(screen.getByText(/appuntamenti/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/appuntamenti/i));

      await waitFor(() => {
        expect(screen.getByTestId('crm-section-appointments')).toBeInTheDocument();
      });
    });

    it('should navigate to deals section', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, subscription: { active: true } })
      });

      render(<CRMDashboard user={mockAgentUser} token={mockToken} />);

      await waitFor(() => {
        expect(screen.getByText(/trattative/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/trattative/i));

      await waitFor(() => {
        expect(screen.getByTestId('crm-section-deals')).toBeInTheDocument();
      });
    });

    it('should navigate to activities section', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, subscription: { active: true } })
      });

      render(<CRMDashboard user={mockAgentUser} token={mockToken} />);

      await waitFor(() => {
        expect(screen.getByText(/attività/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/attività/i));

      await waitFor(() => {
        expect(screen.getByTestId('crm-section-activities')).toBeInTheDocument();
      });
    });
  });

  describe('Partner-specific Features', () => {
    it('should show agents section for partner users', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, subscription: { active: true } })
      });

      render(<CRMDashboard user={mockPartnerUser} token={mockToken} />);

      await waitFor(() => {
        expect(screen.getByText(/agenti/i)).toBeInTheDocument();
      });
    });

    it('should not show agents section for agent users', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, subscription: { active: true } })
      });

      render(<CRMDashboard user={mockAgentUser} token={mockToken} />);

      await waitFor(() => {
        expect(screen.queryByText(/agenti/i)).not.toBeInTheDocument();
      });
    });

    it('should show virtual tour section for partner users', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, subscription: { active: true } })
      });

      render(<CRMDashboard user={mockPartnerUser} token={mockToken} />);

      await waitFor(() => {
        expect(screen.getByText(/virtual tour/i)).toBeInTheDocument();
      });
    });
  });

  describe('MLS Features', () => {
    it('should navigate to MLS network section', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, subscription: { active: true } })
      });

      render(<CRMDashboard user={mockAgentUser} token={mockToken} />);

      await waitFor(() => {
        expect(screen.getByText(/network mls/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/network mls/i));

      await waitFor(() => {
        expect(screen.getByTestId('mls-browser')).toBeInTheDocument();
      });
    });

    it('should navigate to MLS collaborations section', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, subscription: { active: true } })
      });

      render(<CRMDashboard user={mockAgentUser} token={mockToken} />);

      await waitFor(() => {
        expect(screen.getByText(/collaborazioni/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/collaborazioni/i));

      await waitFor(() => {
        expect(screen.getByTestId('mls-collaborations')).toBeInTheDocument();
      });
    });

    it('should navigate to MLS leads section', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, subscription: { active: true } })
      });

      render(<CRMDashboard user={mockAgentUser} token={mockToken} />);

      await waitFor(() => {
        expect(screen.getByText(/lead mls/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/lead mls/i));

      await waitFor(() => {
        expect(screen.getByTestId('mls-leads')).toBeInTheDocument();
      });
    });

    it('should navigate to MLS transactions section', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, subscription: { active: true } })
      });

      render(<CRMDashboard user={mockAgentUser} token={mockToken} />);

      await waitFor(() => {
        expect(screen.getByText(/transazioni mls/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/transazioni mls/i));

      await waitFor(() => {
        expect(screen.getByTestId('mls-transactions')).toBeInTheDocument();
      });
    });
  });

  describe('Modals', () => {
    it('should open property creation modal', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, subscription: { active: true } })
      });

      render(<CRMDashboard user={mockPartnerUser} token={mockToken} />);

      await waitFor(() => {
        expect(screen.getByText(/nuovo annuncio|crea annuncio/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/nuovo annuncio|crea annuncio/i));

      await waitFor(() => {
        expect(screen.getByTestId('property-modal')).toBeInTheDocument();
      });
    });

    it('should open agent registration modal for partners', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, subscription: { active: true } })
      });

      render(<CRMDashboard user={mockPartnerUser} token={mockToken} />);

      await waitFor(() => {
        expect(screen.getByText(/aggiungi agente|nuovo agente/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/aggiungi agente|nuovo agente/i));

      await waitFor(() => {
        expect(screen.getByTestId('agent-modal')).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load dashboard data on mount', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, subscription: { active: true } })
      });

      render(<CRMDashboard user={mockPartnerUser} token={mockToken} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should handle loading state', async () => {
      let resolveFetch;
      global.fetch.mockImplementationOnce(() =>
        new Promise(resolve => {
          resolveFetch = resolve;
        })
      );

      render(<CRMDashboard user={mockPartnerUser} token={mockToken} />);

      expect(screen.queryByText(/caricamento|loading/i)).toBeInTheDocument();

      resolveFetch({
        ok: true,
        json: async () => ({ success: true, subscription: { active: true } })
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<CRMDashboard user={mockPartnerUser} token={mockToken} />);

      // Should not crash, should show error state or retry
      await waitFor(() => {
        expect(screen.getByText(/dashboard|crm/i)).toBeInTheDocument();
      });
    });
  });

  describe('Logout', () => {
    it('should call onLogout when logout button is clicked', async () => {
      const mockOnLogout = vi.fn();

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, subscription: { active: true } })
      });

      render(<CRMDashboard user={mockPartnerUser} token={mockToken} onLogout={mockOnLogout} />);

      await waitFor(() => {
        expect(screen.getByText(/logout|esci|disconnetti/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/logout|esci|disconnetti/i));

      expect(mockOnLogout).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper navigation structure', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, subscription: { active: true } })
      });

      render(<CRMDashboard user={mockPartnerUser} token={mockToken} />);

      await waitFor(() => {
        const navigation = screen.getByRole('navigation');
        expect(navigation).toBeInTheDocument();
      });
    });

    it('should have clickable menu items', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, subscription: { active: true } })
      });

      render(<CRMDashboard user={mockAgentUser} token={mockToken} />);

      await waitFor(() => {
        const menuItems = screen.getAllByRole('button');
        expect(menuItems.length).toBeGreaterThan(0);
      });
    });
  });
});
