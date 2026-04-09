import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
    >
      {children}
    </NavLink>
  );
}

export function Layout() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="site-shell topbar__inner">
          <NavLink to="/" className="brand">
            Fotos
          </NavLink>

          <nav className="nav-links">
            <NavItem to="/">Gallery</NavItem>
            <NavItem to="/search">Search</NavItem>
            {user?.role === 'creator' ? <NavItem to="/upload">Upload</NavItem> : null}
          </nav>

          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <div className="user-chip">
                  <span>{user.name}</span>
                  <small>{user.role}</small>
                </div>
                <button type="button" className="button button--ghost" onClick={logout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavItem to="/login">Login</NavItem>
                <NavItem to="/register">Register</NavItem>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="site-shell main-content">
        <Outlet />
      </main>

      <footer className="footer site-shell">
        <p>Cloud-ready event photo sharing, built locally from the project docs.</p>
      </footer>
    </div>
  );
}
