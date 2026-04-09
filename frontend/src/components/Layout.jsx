import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { 
  Camera, 
  Image as ImageIcon, 
  Search, 
  Upload, 
  LogOut, 
  Sun, 
  Moon,
  User
} from 'lucide-react';

function NavItem({ to, children, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {Icon && <Icon size={18} />}
        <span>{children}</span>
      </div>
    </NavLink>
  );
}

export function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="page-shell">
      <header className="topbar site-shell">
        <div className="glass topbar__inner">
          <NavLink to="/" className="brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Camera size={28} />
              <span>Fotos</span>
            </div>
          </NavLink>

          <nav className="nav-links">
            <NavItem to="/" icon={ImageIcon}>Gallery</NavItem>
            <NavItem to="/search" icon={Search}>Search</NavItem>
            {user?.role === 'creator' && (
              <NavItem to="/upload" icon={Upload}>Upload</NavItem>
            )}
          </nav>

          <div className="nav-actions">
            <button 
              onClick={toggleTheme} 
              className="button button--ghost button--icon"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {isAuthenticated ? (
              <>
                <div className="user-chip">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={16} />
                    <span>{user.name}</span>
                  </div>
                  <small>{user.role}</small>
                </div>
                <button 
                  type="button" 
                  className="button button--ghost" 
                  onClick={logout}
                >
                  <LogOut size={18} />
                  <span>Log out</span>
                </button>
              </>
            ) : (
              <>
                <NavItem to="/login">Login</NavItem>
                <NavItem to="/register">
                  <div className="button button--primary">Register</div>
                </NavItem>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="site-shell main-content">
        <Outlet />
      </main>

      <footer className="footer site-shell" style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.6 }}>
        <p>&copy; {new Date().getFullYear()} Fotos. Premium event photo sharing experience.</p>
      </footer>
    </div>
  );
}
