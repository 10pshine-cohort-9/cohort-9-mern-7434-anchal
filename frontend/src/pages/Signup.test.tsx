import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Signup from './Signup';
import { registerUser } from '../services/auth.service';

vi.mock('../services/auth.service', () => ({
  registerUser: vi.fn(),
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

describe('Signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the signup form', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('submits details and navigates to login on success', async () => {
    (registerUser as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/full name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('shows a generic error message when signup fails without a server message', async () => {
    (axios.isAxiosError as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (registerUser as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('failed'));
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/full name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  it('shows the server-provided error message when signup fails with an axios error', async () => {
    (axios.isAxiosError as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (registerUser as ReturnType<typeof vi.fn>).mockRejectedValueOnce({
      response: { data: { message: 'Email already registered' } },
    });
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/full name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument();
    });
  });

  it('shows a fallback error when signup fails with an axios error but no server message', async () => {
    (axios.isAxiosError as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (registerUser as ReturnType<typeof vi.fn>).mockRejectedValueOnce({
      response: { data: {} },
    });
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/full name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Unable to create account. Please try again.')
      ).toBeInTheDocument();
    });
  });
});