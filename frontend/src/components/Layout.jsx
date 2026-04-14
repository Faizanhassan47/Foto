import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  User,
  Menu,
  X
} from 'lucide-react';

function NavItem({ to, children, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  const handleUploadClick = () => {
    if (!isAuthenticated) {
      showToast('Log in to upload data');
      return;
    }
    if (user?.role !== 'creator') {
      showToast('Only creators can upload photos');
      return;
    }
    navigate('/upload');
    closeMenu();
  };

  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-lock');
    } else {
      document.body.classList.remove('menu-lock');
    }
    return () => document.body.classList.remove('menu-lock');
  }, [isMenuOpen]);

  return (
    <div className={`page-shell ${isMenuOpen ? 'menu-open' : ''}`}>
      <AnimatePresence>
        {toast.message && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`toast toast--${toast.type} glass`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="topbar site-shell">
        <div className="glass topbar__inner">
          <NavLink to="/" className="brand" onClick={closeMenu}>
            Tasveer_Hubs
          </NavLink>

          <nav className={`nav-links ${isMenuOpen ? 'nav-links--open' : ''}`}>
            <NavItem to="/" icon={ImageIcon} onClick={closeMenu}>Gallery</NavItem>
            <NavItem to="/search" icon={Search} onClick={closeMenu}>Search</NavItem>
            <button className="nav-link" onClick={handleUploadClick} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={18} />
                <span>Upload</span>
              </div>
            </button>

            {/* Mobile-only actions inside nav-links when open */}
            {isMenuOpen && (
              <div className="mobile-only-actions">
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
                      onClick={() => { logout(); closeMenu(); }}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <LogOut size={18} />
                      <span>Log out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <NavItem to="/login" onClick={closeMenu}>Login</NavItem>
                    <NavItem to="/register" onClick={closeMenu}>
                      <div className="button button--primary" style={{ width: '100%', justifyContent: 'center' }}>Register</div>
                    </NavItem>
                  </>
                )}
              </div>
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

            <div className="desktop-only-actions">
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

            <button
              className="button button--ghost button--icon mobile-menu-toggle"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <main className="site-shell main-content">
        <Outlet />
      </main>

      <footer className="footer site-shell" style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.6 }}>
        <p>&copy; {new Date().getFullYear()} Tasveer_Hubs. Premium event photo sharing experience.</p>
      </footer>
    </div>
  );
}
