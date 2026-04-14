import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getApiError } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { hasMinLength, validateEmail } from '../utils/validators';

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!validateEmail(form.email)) {
      setError('Enter a valid email address.');
      return;
    }

    if (!hasMinLength(form.password, 6)) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await login(form);
      const nextPath = location.state?.from?.pathname || (user.role === 'creator' ? '/upload' : '/');
      navigate(nextPath, { replace: true });
    } catch (requestError) {
      setError(getApiError(requestError, 'Login failed.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-layout">
      <div className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in to Playwright Island</h1>
        <p className="muted">Creators can upload. Consumers can browse, comment, and rate.</p>

        <form className="stack-md" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="you@example.com"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              placeholder="Minimum 6 characters"
            />
          </label>

          {error ? <div className="card card--error">{error}</div> : null}

          <button type="submit" className="button" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="muted">
          Need an account? <Link to="/register">Register here</Link>.
        </p>
      </div>
    </section>
  );
}
