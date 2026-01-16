import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  data: {
    id: string;
    originName: string;
    destinationName: string;
    tripDate: string;
    pricePerKm: number;
    vehicle: {
        licensePlate: string;
        model: string;
    };
    status: string; // 'AVAILABLE' | 'MATCHED' | 'CANCELED'
  };
  onPress: () => void;
  onViewMatches?: () => void;
}

export function TripCard({ data, onPress, onViewMatches }: Props) {
  
  const isAvailable = data.status === 'AVAILABLE';

  const getStatusConfig = () => {
    switch (data.status) {
      case 'AVAILABLE': 
        return { 
          color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200',
          label: 'Buscando Carga', icon: 'search-outline' as const
        };
      case 'MATCHED': 
        return { 
          color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200',
          label: 'Frete Fechado', icon: 'checkmark-circle-outline' as const
        };
      default: 
        return { 
          color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-200',
          label: 'Cancelado/Inativo', icon: 'close-circle-outline' as const
        };
    }
  };

  const config = getStatusConfig();
  const formattedDate = new Date(data.tripDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'});

  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.9}
      className={`bg-white rounded-xl border mb-4 shadow-sm ${isAvailable ? 'border-orange-200' : 'border-gray-100'}`}
    >
      <View className="p-4">
        {/* ROTA */}
        <View className="flex-row items-center justify-between mb-3">
            <View className="flex-1">
                <Text className="text-xs text-gray-400 font-bold uppercase">Origem</Text>
                <Text className="text-gray-900 font-bold text-base" numberOfLines={1}>{data.originName}</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color="#D1D5DB" style={{ marginHorizontal: 8, marginTop: 14 }} />
            <View className="flex-1 items-end">
                <Text className="text-xs text-gray-400 font-bold uppercase">Destino</Text>
                <Text className="text-gray-900 font-bold text-base" numberOfLines={1}>{data.destinationName}</Text>
            </View>
        </View>

        {/* DETALHES TÉCNICOS */}
        <View className="flex-row gap-3 mt-2">
            <View className="bg-gray-50 px-2 py-1 rounded flex-row items-center">
                <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                <Text className="text-xs text-gray-600 ml-1 font-medium">{formattedDate}</Text>
            </View>
            <View className="bg-gray-50 px-2 py-1 rounded flex-row items-center">
                <Ionicons name="cash-outline" size={12} color="#6B7280" />
                <Text className="text-xs text-gray-600 ml-1 font-medium">R$ {data.pricePerKm}/km</Text>
            </View>
             <View className="bg-gray-50 px-2 py-1 rounded flex-row items-center">
                <Ionicons name="car-outline" size={12} color="#6B7280" />
                <Text className="text-xs text-gray-600 ml-1 font-medium">{data.vehicle.model}</Text>
            </View>
        </View>
      </View>

      {/* FOOTER STATUS */}
      <View className={`px-4 py-3 flex-row justify-between items-center border-t ${config.bg} ${config.border} rounded-b-xl`}>
        <View className="flex-row items-center">
            <Ionicons name={config.icon} size={16} className={config.color} style={{ marginRight: 6 }} />
            <Text className={`font-bold text-xs ${config.color}`}>{config.label}</Text>
        </View>

        {isAvailable && (
             <TouchableOpacity 
                onPress={onViewMatches}
                className="bg-main px-3 py-1.5 rounded-lg flex-row items-center shadow-sm"
            >
                <Text className="text-white text-xs font-bold mr-1">VER OFERTAS</Text>
                <Ionicons name="chevron-forward" size={12} color="white" />
            </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}