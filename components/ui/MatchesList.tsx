import React from 'react';
import { Text, View } from 'react-native';
import MatchCard from '../MatchCard';

// 1. Tipagem baseada no JSON que você forneceu
export interface Match {
  tripId: string;
  truckerName: string;
  vehicleInfo: string;
  truckerRating: number;
  pricePerKm: number;
  cargoDistanceKm: number;
  totalFreightPrice: number;
  tripDate: string;
}

interface MatchesListProps {
  matches: Match[];
  onSelectMatch: (match: Match) => void;
}

export function MatchesList({ matches, onSelectMatch }: MatchesListProps) {
  
  // Garante que só mostramos os 3 primeiros
  const topMatches = matches.slice(0, 3);

  if (!matches || matches.length === 0) {
    return null; // Ou um componente de "Nenhum motorista encontrado"
  }

  return (
    <View className="w-full mt-6 px-6 mb-10">
      <Text className="text-gray-800 text-lg font-bold mb-4">
        Motoristas Recomendados
      </Text>

      <View className="gap-y-4">
        {topMatches.map((match, index) => (
          <MatchCard 
            key={match.tripId} 
            data={match} 
            ranking={index + 1}
            onPress={() => onSelectMatch(match)}
          />
        ))}
      </View>
    </View>
  );
}