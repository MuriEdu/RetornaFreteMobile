import api from '@/services/api';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

export interface Vehicle {
    id: string;
    brand: string;
    model: string;
    licensePlate: string;
    typeName: string;
    typeId: number;
}

export interface VehicleType {
    id: number;
    name: string;
}

export function useVehicles() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [types, setTypes] = useState<VehicleType[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchVehicles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/vehicles');
            setVehicles(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTypes = useCallback(async () => {
        try {
            const response = await api.get('/api/vehicles/types');
            setTypes(response.data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const deleteVehicle = async (id: string) => {
        try {
            await api.delete(`/api/vehicles/${id}`);
            setVehicles(prev => prev.filter(v => v.id !== id));
            Alert.alert("Sucesso", "Veículo removido.");
        } catch (error) {
            console.log(error.response)
            Alert.alert("Erro", "Não foi possível remover o veículo.");
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchVehicles();
            fetchTypes();
        }, [fetchVehicles, fetchTypes])
    );

    return { vehicles, types, loading, refresh: fetchVehicles, deleteVehicle };
}