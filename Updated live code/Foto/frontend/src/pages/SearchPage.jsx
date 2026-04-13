import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';
import { PhotoCard } from '../components/PhotoCard';
import { SearchBar } from '../components/SearchBar';
import { Lightbox } from '../components/Lightbox';
import { useFetchPhotos } from '../hooks/useFetchPhotos';

const PAGE_SIZE = 16; // 4 columns × 4 rows

// ── Skeleton card for loading state ──
function SkeletonCard() {
  return (
    <div className="photo-card card search-skeleton">
      <div className="search-skeleton__img" />
      <div className="photo-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div className="search-skeleton__line" style={{ width: '40%', height: '12px' }} />
        <div className="search-skeleton__line" style={{ width: '75%', height: '18px' }} />
        <div className="search-skeleton__line" style={{ width: '55%', height: '12px' }} />
      </div>
    </div>
  );
}

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  // Fetch results; empty query shows trending/recent photos
  const { photos, isLoading, error, hasMore, fetchNextPage } = useFetchPhotos(query);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Reset pagination when query changes
  const visible = photos.slice(0, visibleCount);
  const canLoadMore = visibleCount < photos.length || hasMore;

  function handleSearch(nextQuery) {
    setVisibleCount(PAGE_SIZE);
    navigate(nextQuery ? `/search?q=${encodeURIComponent(nextQuery)}` : '/search');
  }

  function handleLoadMore() {
    const nextCount = visibleCount + PAGE_SIZE;
    setVisibleCount(nextCount);
    // If we've shown all locally-fetched photos, fetch from server
    if (nextCount >= photos.length && hasMore) {
      fetchNextPage();
    }
  }

  function handleNavigate(photo) {
    setSelectedPhoto(photo);
  }

  return (
    <div className="stack-lg">
      {/* ── Header ── */}
      <section className="page-header">
        <div>
          <p className="eyebrow">Search</p>
          <h1>Find photos by title, location, event, caption, or tags.</h1>
        </div>
      </section>

      {/* ── Search box ── */}
      <section className="card stack-md">
        <SearchBar defaultValue={query} onSearch={handleSearch} label="Search the gallery" />
        <p className="muted">
          {query
            ? `Showing results for "${query}".`
            : 'Browsing the latest photos — type to filter.'}
        </p>
      </section>

      {/* ── Loading skeletons ── */}
      {isLoading && !photos.length && (
        <div className="gallery-grid">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {error && <div className="card card--error">{error}</div>}

      {/* ── Empty state ── */}
      {!isLoading && !error && !photos.length && (
        <div className="empty-state">
          <ImageIcon size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <h3>No results found</h3>
          <p>Try a different event name, location, or tag.</p>
        </div>
      )}

      {/* ── Grid ── */}
      {!error && visible.length > 0 && (
        <>
          <p className="muted" style={{ fontSize: '0.88rem' }}>
            {query
              ? <>Showing <strong>{visible.length}</strong> of <strong>{photos.length}</strong> result{photos.length !== 1 ? 's' : ''}</>
              : <><strong>{visible.length}</strong> recent photo{visible.length !== 1 ? 's' : ''}</>
            }
          </p>

          <div className="gallery-grid">
            {visible.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onExpand={(p) => setSelectedPhoto(p)}
                onTagClick={(tag) => handleSearch(tag)}
              />
            ))}

            {/* Show skeleton placeholders while next page loads */}
            {isLoading && photos.length > 0 &&
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)
            }
          </div>

          {/* ── Load more ── */}
          {canLoadMore && !isLoading && (
            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '2rem' }}>
              <motion.button
                className="button button--ghost"
                onClick={handleLoadMore}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{ minWidth: '200px', justifyContent: 'center' }}
              >
                Load more photos
              </motion.button>
            </div>
          )}
        </>
      )}

      {/* ── Pinterest modal ── */}
      <Lightbox
        photo={selectedPhoto}
        photos={visible}
        onClose={() => {
          setSelectedPhoto(null);
          // Restore URL back to search page
          navigate(`/search${query ? `?q=${encodeURIComponent(query)}` : ''}`, { replace: true });
        }}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
