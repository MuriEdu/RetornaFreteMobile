import api from '@/services/api';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export function useMyTrips() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/trips/my-trips');
      setTrips(response.data);
    } catch (error) {
      console.error(error.response);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTrips();
    }, [fetchTrips])
  );

  return { trips, loading, refresh: fetchTrips };
}