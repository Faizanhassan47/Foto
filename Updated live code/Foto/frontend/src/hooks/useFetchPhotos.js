import { useEffect, useState, useCallback, useRef } from 'react';
import api, { getApiError } from '../api/client';

export function useFetchPhotos(query = '', sort = 'newest') {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Ref to track parameters for reset
  const paramsRef = useRef({ query, sort });

  // Reset when query or sort changes
  useEffect(() => {
    if (paramsRef.current.query !== query || paramsRef.current.sort !== sort) {
      setPage(1);
      setPhotos([]);
      setHasMore(true);
      paramsRef.current = { query, sort };
    }
  }, [query, sort]);

  const loadPhotos = useCallback(async (isInitial = false) => {
    const currentPage = isInitial ? 1 : page;
    setIsLoading(true);
    setError('');

    try {
      const response = await api.get('/photos', {
        params: { 
          q: query,
          sort: sort,
          page: currentPage,
          limit: 12
        }
      });

      const newPhotos = response.data.photos;
      
      setPhotos(prev => isInitial ? newPhotos : [...prev, ...newPhotos]);
      setHasMore(newPhotos.length === 12);
      if (!isInitial) {
        setPage(prev => prev + 1);
      } else {
        setPage(2);
      }
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to load photos right now.'));
    } finally {
      setIsLoading(false);
    }
  }, [query, sort, page]);

  // Initial load
  useEffect(() => {
    loadPhotos(true);
  }, [query, sort]);

  const fetchNextPage = useCallback(() => {
    if (!isLoading && hasMore) {
      loadPhotos(false);
    }
  }, [isLoading, hasMore, loadPhotos]);

  return {
    photos,
    isLoading,
    error,
    hasMore,
    fetchNextPage,
    reload: () => {
      setPage(1);
      setPhotos([]);
      loadPhotos(true);
    }
  };
}
