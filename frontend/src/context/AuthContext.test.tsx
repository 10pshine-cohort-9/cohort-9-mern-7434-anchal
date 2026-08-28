import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AuthProvider, useAuth } from './AuthContext';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
} from '../services/auth.service';

vi.mock('../services/auth.service', () => ({
  getCurrentUser: vi.fn(),
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
}));

const TestConsumer = () => {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user ? user.name : 'none'}</span>
      <button
        onClick={() =>
          login({ email: 'test@example.com', password: 'password123' })
        }
      >
        Login
      </button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('finishes loading with no user when there is no stored token', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('none');
    expect(getCurrentUser).not.toHaveBeenCalled();
  });

  it('restores the session when a valid token exists', async () => {
    localStorage.setItem('token', 'stored-token');
    (getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { id: '1', name: 'Test User', email: 'test@example.com' },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent('Test User');
  });

  it('clears the stored token when session restoration fails', async () => {
    localStorage.setItem('token', 'stale-token');
    (getCurrentUser as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('unauthorized')
    );

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('logs in, stores the token, and updates the user', async () => {
    (loginUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        token: 'new-token',
        user: { id: '1', name: 'Test User', email: 'test@example.com' },
      },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    expect(localStorage.getItem('token')).toBe('new-token');
    expect(loginUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('logs out, clears the token, and resets the user', async () => {
    localStorage.setItem('token', 'stored-token');
    (getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { id: '1', name: 'Test User', email: 'test@example.com' },
    });
    (logoutUser as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    await userEvent.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('none');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('still clears local session when the logout request fails', async () => {
    localStorage.setItem('token', 'stored-token');
    (getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { id: '1', name: 'Test User', email: 'test@example.com' },
    });
    (logoutUser as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('network error')
    );
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    await userEvent.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    expect(localStorage.getItem('token')).toBeNull();
  });

  it('throws when useAuth is used outside of an AuthProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );
  });
});