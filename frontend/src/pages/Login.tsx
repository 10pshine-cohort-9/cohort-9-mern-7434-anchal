import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import AuthLayout from '../components/AuthLayout';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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
      await login({ email, password });
      navigate('/dashboard');
    } catch (error: unknown) {
      if (axios.isAxiosError<{ message?: unknown }>(error)) {
        const message = error.response?.data?.message;
        setError(
          typeof message === 'string' && message.length > 0
            ? message
            : 'Unable to login. Please check your credentials.'
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
      eyebrow="Welcome back"
      title="Sign in to your account"
      error={error}
      footer={<>Don't have an account? <Link to="/signup">Create one</Link></>}
    >
      <form onSubmit={handleSubmit} className="auth-form">
        <label htmlFor="email">Email address</label>
        <div className="input-wrapper">
          <Mail size={18} />
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
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
          placeholder="Enter your password"
        />
        <button type="submit" className="primary-button" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;