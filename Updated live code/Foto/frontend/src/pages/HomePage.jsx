import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Layout as LayoutIcon, Zap, Image as ImageIcon, ArrowUpDown, Loader2 } from 'lucide-react';
import { PhotoCard } from '../components/PhotoCard';
import { SearchBar } from '../components/SearchBar';
import { Lightbox } from '../components/Lightbox';
import { useAuth } from '../hooks/useAuth';
import { useFetchPhotos } from '../hooks/useFetchPhotos';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

function SkeletonCard() {
  return (
    <div className="photo-card card" style={{ height: '400px', display: 'flex', flexDirection: 'column', breakInside: 'avoid', marginBottom: '2rem' }}>
      <div style={{ flex: 1, background: 'var(--border-subtle)', borderRadius: 'var(--radius-md)', margin: '1rem', animation: 'pulse 1.5s infinite' }} />
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ height: '20px', width: '60%', background: 'var(--border-subtle)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: '14px', width: '40%', background: 'var(--border-subtle)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
      </div>
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sort, setSort] = useState('newest');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const { photos, isLoading, error, hasMore, fetchNextPage } = useFetchPhotos('', sort);
  
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoading, fetchNextPage]);

  function handleSearch(query) {
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
  }

  return (
    <motion.div 
      className="stack-lg"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <section className="hero">
        <motion.div className="hero__copy" variants={itemVariants}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'var(--accent)', 
            color: 'white',
            padding: '4px 12px',
            borderRadius: '99px',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            textTransform: 'uppercase'
          }}>
            <Sparkles size={14} />
            <span>Event Photography Redefined</span>
          </div>
          <h1 style={{ fontWeight: 800 }}>Capture the crowd, publish the moment.</h1>
          <p className="hero__text">
            Fotos gives creators a clean upload workflow and gives consumers a fast way to
            browse, search, comment, and rate event photos.
          </p>
          <div className="button-row" style={{ marginTop: '2.5rem' }}>
            <button type="button" className="button button--primary" onClick={() => navigate('/search')}>
              Explore Gallery
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => navigate(user?.role === 'creator' ? '/upload' : '/register')}
            >
              {user?.role === 'creator' ? 'Upload a photo' : 'Create an account'}
            </button>
          </div>
        </motion.div>

        <motion.div className="hero__panel glass card" variants={itemVariants} style={{ border: 'none' }}>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search size={24} />
            Search the latest drops
          </h2>
          <SearchBar defaultValue="" onSearch={handleSearch} label="Jump to an event or tag..." />
          
          <div className="stats-grid" style={{ marginTop: '2rem' }}>
            <div className="stat-card" style={{ background: 'var(--border-subtle)' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}><ImageIcon size={20} /></div>
              <strong>{photos.length}</strong>
              <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Photos available</span>
            </div>
            <div className="stat-card" style={{ background: 'var(--border-subtle)' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}><LayoutIcon size={20} /></div>
              <strong>2 roles</strong>
              <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Role-based access</span>
            </div>
            <div className="stat-card" style={{ background: 'var(--border-subtle)' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}><Zap size={20} /></div>
              <strong>Fast</strong>
              <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Local-first perf</span>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="stack-md">
        <motion.div className="section-header" variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: 700 }}>Trending Collection</p>
            <h2 style={{ fontSize: '2.5rem' }}>Newest photo sets</h2>
          </div>

          <div className="glass" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <ArrowUpDown size={16} style={{ marginLeft: '0.5rem', opacity: 0.6 }} />
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value)}
              style={{ background: 'transparent', border: 'none', padding: '0.4rem 2rem 0.4rem 0.5rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', color: 'inherit' }}
            >
              <option value="newest">Latest Uploads</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </motion.div>

        {isLoading && !photos.length ? (
          <div className="masonry-grid">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : null}
        
        {error ? <div className="card card--error">{error}</div> : null}

        {!isLoading && !error && !photos.length ? (
          <motion.div className="empty-state card glass" variants={itemVariants} style={{ padding: '4rem' }}>
            <ImageIcon size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <h3>No photos yet</h3>
            <p className="muted">Register as a creator to start the first event gallery.</p>
            <button className="button button--primary" style={{ marginTop: '2rem' }} onClick={() => navigate('/register')}>Get Started</button>
          </motion.div>
        ) : null}

        {photos.length ? (
          <>
            <motion.div 
              className="masonry-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {photos.map((photo) => (
                <PhotoCard 
                  key={photo.id} 
                  photo={photo} 
                  onExpand={(p) => setSelectedPhoto(p)}
                />
              ))}
            </motion.div>

            <div 
              ref={observerTarget} 
              style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {isLoading && hasMore && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}
                >
                  <Loader2 className="animate-spin" size={24} />
                  <span>Loading more...</span>
                </motion.div>
              )}
            </div>
          </>
        ) : null}
      </section>

      <Lightbox 
        photo={selectedPhoto} 
        onClose={() => setSelectedPhoto(null)} 
      />

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}
