import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

// Define the shape of your route data
export interface RouteData {
  origin: string;
  destination: string;
  validUntil: string;
}

interface RouteStatusCardProps {
  route?: RouteData | null; // If null/undefined, shows "No Route" variant
  onPress: () => void;
}

export function RouteStatusCard({ route, onPress }: RouteStatusCardProps) {
  const hasRoute = !!route;

  return (
    // Container with background color (assumed based on white text)
    <View className="bg-main rounded-xl p-4 shadow-sm">
      <View className="flex-row justify-between items-start">
        <View>
          {/* Header Label */}
          <Text className="text-white/80 text-sm font-medium">
            {hasRoute ? 'Sua rota atual' : 'Status da viagem'}
          </Text>

          {/* Main Content */}
          <Text className="text-white text-xl font-bold mt-1">
            {hasRoute 
              ? `${route.origin} → ${route.destination}` 
              : 'Nenhuma rota ativa'}
          </Text>

          {/* Subtext / Date */}
          <Text className="text-white/90 text-xs mt-1">
            {hasRoute 
              ? `Disponível até: ${route.validUntil}` 
              : 'Defina um destino para encontrar cargas'}
          </Text>
        </View>

        {/* Icon Toggle */}
        <Ionicons 
          name={hasRoute ? "navigate-circle" : "map-outline"} 
          size={32} 
          color="white" 
        />
      </View>

      {/* Action Button */}
      <TouchableOpacity 
        onPress={onPress}
        activeOpacity={0.8}
        className="bg-white rounded-lg py-3 mt-4 items-center"
      >
        <Text className="text-main font-bold italic">
          {hasRoute ? 'ALTERAR ROTA' : 'DEFINIR ROTA'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}