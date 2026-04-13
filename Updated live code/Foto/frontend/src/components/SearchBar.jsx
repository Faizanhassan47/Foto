import { useEffect, useState, useRef } from 'react';
import { Search } from 'lucide-react';

export function SearchBar({ defaultValue = '', onSearch, label = 'Search photos' }) {
  const [query, setQuery] = useState(defaultValue);
  const debounceRef = useRef(null);

  // Sync external changes (e.g. URL change)
  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  // Debounced live search — fires 300ms after user stops typing
  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(val.trim());
    }, 300);
  }

  function handleSubmit(e) {
    e.preventDefault();
    clearTimeout(debounceRef.current);
    onSearch(query.trim());
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <label className="search-bar__field">
        <span>{label}</span>
        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="search"
            placeholder="Try event names, locations, or tags…"
            value={query}
            onChange={handleChange}
            style={{ paddingLeft: '2.75rem' }}
          />
        </div>
      </label>
      <button type="submit" className="button button--primary">
        Search
      </button>
    </form>
  );
}
