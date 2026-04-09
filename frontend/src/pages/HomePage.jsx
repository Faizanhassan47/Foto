import { useNavigate } from 'react-router-dom';
import { PhotoCard } from '../components/PhotoCard';
import { SearchBar } from '../components/SearchBar';
import { useAuth } from '../hooks/useAuth';
import { useFetchPhotos } from '../hooks/useFetchPhotos';

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { photos, isLoading, error } = useFetchPhotos();

  function handleSearch(query) {
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
  }

  return (
    <div className="stack-lg">
      <section className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Event photography, organized and shareable</p>
          <h1>Capture the crowd, publish the moment, and keep every gallery searchable.</h1>
          <p className="hero__text">
            Fotos gives creators a clean upload workflow and gives consumers a fast way to
            browse, search, comment, and rate event photos.
          </p>
          <div className="button-row">
            <button type="button" className="button" onClick={() => navigate('/search')}>
              Explore gallery
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => navigate(user?.role === 'creator' ? '/upload' : '/register')}
            >
              {user?.role === 'creator' ? 'Upload a photo' : 'Create an account'}
            </button>
          </div>
        </div>

        <div className="hero__panel card">
          <h2>Search the latest drops</h2>
          <SearchBar defaultValue="" onSearch={handleSearch} label="Jump to an event" />
          <div className="stats-grid">
            <div className="stat-card">
              <strong>{photos.length}</strong>
              <span>Photos in the gallery</span>
            </div>
            <div className="stat-card">
              <strong>2 roles</strong>
              <span>Creators upload, consumers interact</span>
            </div>
            <div className="stat-card">
              <strong>Local first</strong>
              <span>Ready for later MongoDB and S3 upgrades</span>
            </div>
          </div>
        </div>
      </section>

      <section className="stack-md">
        <div className="section-header">
          <div>
            <p className="eyebrow">Gallery</p>
            <h2>Newest photo sets</h2>
          </div>
        </div>

        {isLoading ? <div className="card">Loading gallery...</div> : null}
        {error ? <div className="card card--error">{error}</div> : null}

        {!isLoading && !error && !photos.length ? (
          <div className="empty-state">
            <h3>No photos yet</h3>
            <p>Register as a creator to start the first event gallery.</p>
          </div>
        ) : null}

        {!isLoading && !error && photos.length ? (
          <div className="gallery-grid">
            {photos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
