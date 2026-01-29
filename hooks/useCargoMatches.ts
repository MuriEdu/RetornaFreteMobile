import api from '@/services/api';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export interface Match {
  tripId: string;
  truckerName: string;
  vehicleInfo: string;
  truckerRating: number;
  pricePerKm: number;
  cargoDistanceKm: number;
  totalFreightPrice: number;
  tripDate: string
}

export function useCargoMatches(cargoId?: string) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchMatches = useCallback(async () => {
    if (!cargoId) return;

    setLoading(true);
    try {
      const response = await api.get(`/api/matches/cargo/${cargoId}`);
      setMatches(response.data || []); // Garante array vazio se null
      setError(false);
    } catch (err) {
      console.error("Erro ao buscar matches:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [cargoId]);

  useFocusEffect(
    useCallback(() => {
      fetchMatches();
    }, [fetchMatches])
  );

  return { 
    matches, 
    loading, 
    error, 
    refresh: fetchMatches 
  };
}