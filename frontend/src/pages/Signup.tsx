import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User } from 'lucide-react';
import axios from 'axios';
import { registerUser } from '../services/auth.service';
import PasswordInput from '../components/PasswordInput';
import AuthLayout from '../components/AuthLayout';

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    event: Parameters<NonNullable<React.ComponentProps<'form'>['onSubmit']>>[0]
  ) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await registerUser({ name, email, password });
      navigate('/login');
    } catch (error: unknown) {
      if (axios.isAxiosError<{ message?: unknown }>(error)) {
        const message = error.response?.data?.message;
        setError(
          typeof message === 'string' && message.length > 0
            ? message
            : 'Unable to create account. Please try again.'
        );
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      error={error}
      footer={<>Already have an account? <Link to="/login">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} className="auth-form">
        <label htmlFor="name">Full name</label>
        <div className="input-wrapper">
          <User size={18} />
          <input
            id="name"
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            minLength={3}
            required
          />
        </div>
        <label htmlFor="email">Email address</label>
        <div className="input-wrapper">
          <Mail size={18} />
          <input
            id="email"
            type="email"
            placeholder="name@gmail.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <label htmlFor="password">Password</label>
        <PasswordInput
          id="password"
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters"
          minLength={8}
        />
        <button type="submit" className="primary-button" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Signup;