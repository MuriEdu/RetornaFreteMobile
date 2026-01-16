import api from '@/services/api';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export interface Cargo {
  id: string;
  originName: string;
  destinationName: string;
  productName: string;
  weightKg: number;
  tripDate: string;
  status: 'ACTIVE' | 'MATCHED' | 'DELIVERED' | 'CANCELED';
  createdAt: string;
  // Adicione outros campos se necessário (vehicleType, etc)
}

export function useMyCargos() {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCargos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/cargos/my-cargos');
      setCargos(response.data);
    } catch (err) {
      console.error("Erro ao buscar cargas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCargos();
    }, [fetchCargos])
  );

  return { cargos, loading, refresh: fetchCargos };
}