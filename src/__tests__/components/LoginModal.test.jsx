// LoginModal Component Tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginModal from '../../components/LoginModal';

// Mock fetch
global.fetch = vi.fn();

describe('LoginModal Component', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage
    localStorage.clear();
  });

  it('should render when isOpen is true', () => {
    render(<LoginModal {...mockProps} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/)).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<LoginModal {...mockProps} isOpen={false} />);

    expect(screen.queryByText(/email/i)).not.toBeInTheDocument();
  });

  it('should show login button', () => {
    render(<LoginModal {...mockProps} />);

    const loginButton = screen.getByRole('button', { name: /accedi|login|entra/i });
    expect(loginButton).toBeInTheDocument();
  });

  it('should update form input values', () => {
    render(<LoginModal {...mockProps} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('should call login API on form submit', async () => {
    const mockResponse = {
      success: true,
      token: 'mock-token',
      user: {
        id: 1,
        email: 'test@example.com',
        role: 'agent'
      }
    };

    global.fetch.mockResolvedValueOnce({
      json: async () => mockResponse,
      ok: true
    });

    render(<LoginModal {...mockProps} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /accedi|login|entra/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('test@example.com')
        })
      );
    });
  });

  it('should save token and user on successful login', async () => {
    const mockResponse = {
      success: true,
      token: 'mock-token-123',
      user: {
        id: 1,
        email: 'test@example.com',
        role: 'agent',
        firstName: 'Test',
        lastName: 'User'
      }
    };

    global.fetch.mockResolvedValueOnce({
      json: async () => mockResponse,
      ok: true
    });

    render(<LoginModal {...mockProps} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /accedi|login|entra/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('mock-token-123');
      expect(localStorage.getItem('user')).toBeTruthy();
    });
  });

  it('should call onSuccess callback after successful login', async () => {
    const mockResponse = {
      success: true,
      token: 'mock-token',
      user: {
        id: 1,
        email: 'test@example.com',
        role: 'agent'
      }
    };

    global.fetch.mockResolvedValueOnce({
      json: async () => mockResponse,
      ok: true
    });

    render(<LoginModal {...mockProps} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^Password$/);
    const submitButton = screen.getByRole('button', { name: /accedi/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockProps.onSuccess).toHaveBeenCalledWith(
        mockResponse.user,
        mockResponse.token
      );
    });
  });

  it('should call onClose callback after successful login', async () => {
    const mockResponse = {
      success: true,
      token: 'mock-token',
      user: { id: 1, email: 'test@example.com', role: 'agent' }
    };

    global.fetch.mockResolvedValueOnce({
      json: async () => mockResponse,
      ok: true
    });

    render(<LoginModal {...mockProps} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^Password$/);
    const submitButton = screen.getByRole('button', { name: /accedi/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockProps.onClose).toHaveBeenCalled();
    });
  });

  it('should display error message on failed login', async () => {
    const mockResponse = {
      success: false,
      error: 'Credenziali non valide'
    };

    global.fetch.mockResolvedValueOnce({
      json: async () => mockResponse,
      ok: true
    });

    render(<LoginModal {...mockProps} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^Password$/);
    const submitButton = screen.getByRole('button', { name: /accedi/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/credenziali non valide/i)).toBeInTheDocument();
    });
  });

  it('should clear error when user types in input', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({ success: false, error: 'Error' }),
      ok: true
    });

    render(<LoginModal {...mockProps} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^Password$/);
    const submitButton = screen.getByRole('button', { name: /accedi/i });

    // Submit empty form to get error
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText(/error/i)).toBeInTheDocument();
    });

    // Quando l'utente digita, l'errore dovrebbe sparire
    fireEvent.change(emailInput, { target: { value: 'new@email.com' } });

    // L'errore dovrebbe essere stato pulito
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });
});
