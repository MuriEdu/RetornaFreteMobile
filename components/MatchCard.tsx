import { Button } from "@/components/Button"; // Ajuste o import conforme seu projeto
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

// Tipagem dos dados
export interface Match {
  tripId: string;
  truckerName: string;
  vehicleInfo: string;
  truckerRating: number;
  pricePerKm: number;
  cargoDistanceKm: number;
  totalFreightPrice: number;
}

interface MatchCardProps {
  data: Match;
  ranking: number;
  onPress: () => void;
}

export default function MatchCard({ data, ranking, onPress }: MatchCardProps) {
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
      
      {/* --- CABEÇALHO --- */}
      <View className="flex-row justify-between items-start">
        <View className="flex-row items-center gap-2">
          {/* Badge de Ranking */}
          <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
            <Text className="font-bold text-gray-500 text-xs">#{ranking}</Text>
          </View>
          
          {/* Info Motorista */}
          <View>
            <Text className="text-gray-900 font-bold text-base">{data.truckerName}</Text>
            <View className="flex-row items-center">
              <Text className="text-gray-500 text-xs mr-1">{data.vehicleInfo}</Text>
              <Ionicons name="star" size={10} color="#F59E0B" />
              <Text className="text-xs font-bold text-gray-700 ml-0.5">
                {data.truckerRating.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Preço em Destaque */}
        <View className="items-end">
             <Text className="text-green-600 font-bold text-lg">
                {formatCurrency(data.totalFreightPrice)}
             </Text>
        </View>
      </View>

      <View className="h-[1px] bg-gray-100 my-3" />

      {/* --- RODAPÉ COM BOTÃO --- */}
      <View className="flex-row justify-between items-center">
        
        {/* Infos de Distância/Preço */}
        <View className="flex-1 pr-2">
            <View className="flex-row justify-between mb-1">
                <Text className="text-gray-400 text-xs">Distância</Text>
                <Text className="text-gray-700 font-medium text-xs">{data.cargoDistanceKm} km</Text>
            </View>
            <View className="flex-row justify-between">
                <Text className="text-gray-400 text-xs">Valor/km</Text>
                <Text className="text-gray-700 font-medium text-xs">
                    {formatCurrency(data.pricePerKm)}
                </Text>
            </View>
        </View>

        {/* Botão Compacto */}
        <View className="w-32 ml-2">
            <Button 
                title="Contratar" 
                onPress={onPress} 
                // Estilo para forçar o botão a ser menor (Compacto para Card)
                style={{ height: 40, marginTop: 0 }} 
            />
        </View>
      </View>
    </View>
  );
}