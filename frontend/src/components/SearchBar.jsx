import { useEffect, useState } from 'react';

export function SearchBar({ defaultValue = '', onSearch, label = 'Search photos' }) {
  const [query, setQuery] = useState(defaultValue);

  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  function handleSubmit(event) {
    event.preventDefault();
    onSearch(query.trim());
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <label className="search-bar__field">
        <span>{label}</span>
        <input
          type="search"
          placeholder="Try event names, locations, or tags"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <button type="submit" className="button">
        Search
      </button>
    </form>
  );
}
