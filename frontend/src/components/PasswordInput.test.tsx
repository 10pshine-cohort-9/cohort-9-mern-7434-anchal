import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordInput from './PasswordInput';

describe('PasswordInput', () => {
  it('renders with password type by default', () => {
    render(
      <PasswordInput
        id="password"
        value=""
        onChange={vi.fn()}
        placeholder="Enter password"
      />
    );
    const input = screen.getByPlaceholderText('Enter password');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('calls onChange when user types', async () => {
    const handleChange = vi.fn();
    render(
      <PasswordInput
        id="password"
        value=""
        onChange={handleChange}
        placeholder="Enter password"
      />
    );
    const input = screen.getByPlaceholderText('Enter password');
    await userEvent.type(input, 'a');
    expect(handleChange).toHaveBeenCalled();
  });

  it('toggles password visibility when button is clicked', async () => {
    render(
      <PasswordInput
        id="password"
        value="secret"
        onChange={vi.fn()}
        placeholder="Enter password"
      />
    );
    const input = screen.getByPlaceholderText('Enter password');
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(input).toHaveAttribute('type', 'password');
    await userEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');

    const hideButton = screen.getByRole('button', { name: /hide password/i });
    await userEvent.click(hideButton);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('applies minLength when provided', () => {
    render(
      <PasswordInput
        id="password"
        value=""
        onChange={vi.fn()}
        placeholder="At least 8 characters"
        minLength={8}
      />
    );
    const input = screen.getByPlaceholderText('At least 8 characters');
    expect(input).toHaveAttribute('minLength', '8');
  });
});