import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AuthLayout from './AuthLayout';

describe('AuthLayout', () => {
  it('renders eyebrow, title, and children', () => {
    render(
      <AuthLayout
        eyebrow="Welcome back"
        title="Sign in to your account"
        error=""
        footer={<span>Footer text</span>}
      >
        <div>Form content</div>
      </AuthLayout>
    );

    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByText('Form content')).toBeInTheDocument();
    expect(screen.getByText('Footer text')).toBeInTheDocument();
  });

  it('shows error message when error is provided', () => {
    render(
      <AuthLayout
        eyebrow="Welcome back"
        title="Sign in"
        error="Invalid credentials"
        footer={<span>Footer</span>}
      >
        <div>Form</div>
      </AuthLayout>
    );
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('does not render error message when error is empty', () => {
    render(
      <AuthLayout
        eyebrow="Welcome back"
        title="Sign in"
        error=""
        footer={<span>Footer</span>}
      >
        <div>Form</div>
      </AuthLayout>
    );
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
  });
});