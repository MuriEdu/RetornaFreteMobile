import { Button } from "@/components/Button";
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
  tripDate: string; 
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

  // Formata a data se vier YYYY-MM-DD, senão exibe como está
  const formatDate = (dateString: string) => {

    if (!dateString) return "--/--";
    if (dateString.includes('-')) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}`;
    }
    return dateString;
  }

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
        
        {/* Infos de Distância/Preço/Data */}
        <View className="flex-1 pr-2">
            
            <View className="flex-row gap-2 mb-2">
                <View className="flex-row items-center bg-gray-50 px-2 py-1 rounded">
                    <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                    <Text className="text-xs text-gray-600 ml-1 font-medium">
                        {formatDate(data.tripDate)}
                    </Text>
                </View>
                
                {/* Bloco Distância */}
                <View className="flex-row items-center bg-gray-50 px-2 py-1 rounded">
                    <Ionicons name="navigate-outline" size={12} color="#6B7280" />
                    <Text className="text-xs text-gray-600 ml-1 font-medium">
                        {data.cargoDistanceKm} km
                    </Text>
                </View>
            </View>

            <View className="flex-row items-center">
                <Text className="text-gray-400 text-xs mr-1">Tarifa:</Text>
                <Text className="text-gray-700 font-medium text-xs">
                    {formatCurrency(data.pricePerKm)}/km
                </Text>
            </View>
        </View>

        {/* Botão Compacto */}
        <View className="w-28 ml-2">
            <Button 
                title="Contratar" 
                onPress={onPress} 
                style={{ height: 36, marginTop: 0 }} 
            />
        </View>
      </View>
    </View>
  );
}