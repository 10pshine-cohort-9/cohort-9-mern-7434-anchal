import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import App from './App';

vi.mock('./routes/AppRoutes', () => ({
  default: () => <div>Mock App Routes</div>,
}));

vi.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

describe('App', () => {
  it('wraps AppRoutes inside AuthProvider', () => {
    render(<App />);

    const provider = screen.getByTestId('auth-provider');

    expect(provider).toBeInTheDocument();
    expect(screen.getByText('Mock App Routes')).toBeInTheDocument();
  });
});