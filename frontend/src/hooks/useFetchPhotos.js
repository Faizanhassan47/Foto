import { useEffect, useState } from 'react';
import api, { getApiError } from '../api/client';

export function useFetchPhotos(query = '') {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadPhotos() {
      setIsLoading(true);
      setError('');

      try {
        const response = await api.get('/photos', {
          params: query ? { q: query } : {}
        });

        if (isMounted) {
          setPhotos(response.data.photos);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getApiError(requestError, 'Unable to load photos right now.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPhotos();

    return () => {
      isMounted = false;
    };
  }, [query, refreshKey]);

  return {
    photos,
    isLoading,
    error,
    reload: () => setRefreshKey((current) => current + 1)
  };
}
