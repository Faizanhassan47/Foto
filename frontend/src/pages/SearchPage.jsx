import { useNavigate, useSearchParams } from 'react-router-dom';
import { PhotoCard } from '../components/PhotoCard';
import { SearchBar } from '../components/SearchBar';
import { useFetchPhotos } from '../hooks/useFetchPhotos';

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { photos, isLoading, error } = useFetchPhotos(query);

  function handleSearch(nextQuery) {
    navigate(nextQuery ? `/search?q=${encodeURIComponent(nextQuery)}` : '/search');
  }

  return (
    <div className="stack-lg">
      <section className="page-header">
        <div>
          <p className="eyebrow">Search</p>
          <h1>Find photos by title, location, event, caption, or tags.</h1>
        </div>
      </section>

      <section className="card stack-md">
        <SearchBar defaultValue={query} onSearch={handleSearch} label="Search the gallery" />
        <p className="muted">
          {query
            ? `Showing results for "${query}".`
            : 'Enter a search term to filter the photo collection.'}
        </p>
      </section>

      {isLoading ? <div className="card">Searching photos...</div> : null}
      {error ? <div className="card card--error">{error}</div> : null}

      {!isLoading && !error && !photos.length ? (
        <div className="empty-state">
          <h3>No results found</h3>
          <p>Try a different event name, location, or tag.</p>
        </div>
      ) : null}

      {!isLoading && !error && photos.length ? (
        <div className="gallery-grid">
          {photos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
