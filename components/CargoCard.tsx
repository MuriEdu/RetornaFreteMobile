import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  data: {
    id: string;
    originName: string;
    destinationName: string;
    productName: string;
    weightKg: number;
    tripDate: string;
    status: string; // 'ACTIVE' | 'MATCHED' | 'DELIVERED' | 'CANCELED'
    matchesCount?: number; // Opcional: número de motoristas compatíveis
  };
  onPress: () => void;
  onViewMatches?: () => void;
}

export function CargoCard({ data, onPress, onViewMatches }: Props) {
  
  const isPending = data.status === 'ACTIVE';

  // Configuração visual baseada no status
  const getStatusConfig = () => {
    switch (data.status) {
      case 'ACTIVE': 
        return { 
          color: 'text-orange-600', 
          bg: 'bg-orange-50', 
          border: 'border-orange-200',
          label: 'Aguardando Motorista',
          icon: 'time-outline' as keyof typeof Ionicons.glyphMap
        };
      case 'MATCHED': 
        return { 
          color: 'text-blue-600', 
          bg: 'bg-blue-50', 
          border: 'border-blue-200',
          label: 'Frete Iniciado',
          icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap
        };
      case 'DELIVERED': 
        return { 
          color: 'text-green-600', 
          bg: 'bg-green-50', 
          border: 'border-green-200',
          label: 'Entregue',
          icon: 'flag-outline' as keyof typeof Ionicons.glyphMap
        };
      default: 
        return { 
          color: 'text-gray-500', 
          bg: 'bg-gray-100', 
          border: 'border-gray-200',
          label: 'Cancelado',
          icon: 'close-circle-outline' as keyof typeof Ionicons.glyphMap
        };
    }
  };

  const config = getStatusConfig();

  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.9}
      className={`bg-white rounded-xl border mb-4 overflow-hidden shadow-sm ${isPending ? 'border-orange-200' : 'border-gray-100'}`}
    >
      {/* HEADER DO CARD: Rota e Data */}
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-4">
            <View>
                <Text className="text-gray-400 text-xs font-medium uppercase mb-1">Origem</Text>
                <Text className="text-gray-900 font-bold text-base" numberOfLines={1}>{data.originName}</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color="#9CA3AF" style={{ marginTop: 20 }} />
            <View className="items-end">
                <Text className="text-gray-400 text-xs font-medium uppercase mb-1">Destino</Text>
                <Text className="text-gray-900 font-bold text-base" numberOfLines={1}>{data.destinationName}</Text>
            </View>
        </View>

        <View className="flex-row items-center gap-4">
            <View className="flex-row items-center bg-gray-50 px-2 py-1 rounded">
                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                <Text className="text-gray-600 text-xs ml-1 font-medium">{data.tripDate}</Text>
            </View>
            <View className="flex-row items-center bg-gray-50 px-2 py-1 rounded">
                <Ionicons name="cube-outline" size={14} color="#6B7280" />
                <Text className="text-gray-600 text-xs ml-1 font-medium">{data.productName}</Text>
            </View>
            <View className="flex-row items-center bg-gray-50 px-2 py-1 rounded">
                <Ionicons name="scale-outline" size={14} color="#6B7280" />
                <Text className="text-gray-600 text-xs ml-1 font-medium">{data.weightKg}kg</Text>
            </View>
        </View>
      </View>

      {/* FOOTER: Ação ou Status */}
      <View className={`px-4 py-3 flex-row justify-between items-center border-t ${config.bg} ${config.border}`}>
        <View className="flex-row items-center">
            <Ionicons name={config.icon} size={18} className={config.color} style={{ marginRight: 6 }} />
            <Text className={`font-bold text-xs ${config.color}`}>{config.label}</Text>
        </View>

        {/* Se estiver pendente, mostra botão de ação */}
        {isPending && (
            <TouchableOpacity 
                onPress={onViewMatches}
                className="bg-orange-500 px-4 py-2 rounded-lg flex-row items-center shadow-sm"
            >
                <Text className="text-white text-xs font-bold mr-1">BUSCAR MOTORISTAS</Text>
                <Ionicons name="chevron-forward" size={12} color="white" />
            </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}