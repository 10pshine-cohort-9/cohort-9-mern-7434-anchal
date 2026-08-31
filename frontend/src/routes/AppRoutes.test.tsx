import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import AppRoutes from './AppRoutes';

vi.mock('../pages/Login', () => ({
  default: () => <div>Login Page</div>,
}));

vi.mock('../pages/Signup', () => ({
  default: () => <div>Signup Page</div>,
}));

vi.mock('../pages/Dashboard', () => ({
  default: () => <div>Dashboard Page</div>,
}));

vi.mock('./ProtectedRoute', () => ({
  default: () => <div>Protected Wrapper</div>,
}));

describe('AppRoutes', () => {
  it.each([
    {
      path: '/',
      expectedText: 'Login Page',
      description: 'redirects the root path to the login page',
    },
    {
      path: '/some-unknown-path',
      expectedText: 'Login Page',
      description: 'redirects unknown paths to the login page',
    },
    {
      path: '/signup',
      expectedText: 'Signup Page',
      description: 'renders the signup page',
    },
    {
      path: '/dashboard',
      expectedText: 'Protected Wrapper',
      description: 'renders the protected wrapper',
    },
  ])('$description', ({ path, expectedText }) => {
    window.history.pushState({}, '', path);

    render(<AppRoutes />);

    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });
});

