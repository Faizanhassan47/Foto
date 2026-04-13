import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="empty-state">
      <h1>Page not found</h1>
      <p>The page you requested does not exist in this app.</p>
      <Link to="/" className="button">
        Return home
      </Link>
    </div>
  );
}
