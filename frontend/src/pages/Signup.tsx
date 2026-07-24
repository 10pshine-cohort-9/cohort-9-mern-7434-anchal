import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, Mail, User } from 'lucide-react';

import { registerUser } from '../services/auth.service';

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');
    setIsLoading(true);

    try {
      await registerUser({
        name,
        email,
        password,
      });

      navigate('/login');
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          'Unable to create account. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark">N</div>

        <div className="auth-heading">
          <p className="eyebrow">Get started</p>
          <h1>Create your account</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

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

          <div className="input-wrapper">
            <LockKeyhole size={18} />

            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((previous) => !previous)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
};

export default Signup;