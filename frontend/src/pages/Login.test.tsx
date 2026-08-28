import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    ...actual,
    default: {
      ...(actual as { default: object }).default,
      isAxiosError: vi.fn(),
    },
  };
});

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ login: mockLogin });
  });

  it('renders the login form', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('submits credentials and navigates to dashboard on success', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows a generic error message when login fails without a server message', async () => {
    (axios.isAxiosError as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);
    mockLogin.mockRejectedValueOnce(new Error('failed'));
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  it('shows the server-provided error message when login fails with an axios error', async () => {
    (axios.isAxiosError as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
    mockLogin.mockRejectedValueOnce({
      response: { data: { message: 'Invalid email or password' } },
    });
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });

  it('shows a fallback error when login fails with an axios error but no server message', async () => {
    (axios.isAxiosError as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
    mockLogin.mockRejectedValueOnce({
      response: { data: {} },
    });
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Unable to login. Please check your credentials.')
      ).toBeInTheDocument();
    });
  });
});