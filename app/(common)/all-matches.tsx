import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Context & Hooks
import { useCargoMatches } from "@/hooks/useCargoMatches";

// Components
import MatchCard from "@/components/MatchCard";

// Tipos de Ordenação
type SortOption = 'RECOMMENDED' | 'LOWEST_PRICE' | 'HIGHEST_RATING' | 'SHORTEST_DISTANCE';

export default function AllMatches() {
  const router = useRouter();
  
  // 1. MUDANÇA PRINCIPAL: Recebendo o ID da navegação
  const { cargoId } = useLocalSearchParams<{ cargoId: string }>();

  // 2. Passando o ID específico para o hook (em vez de pegar do user.activeCargo)
  const { matches, loading, refresh } = useCargoMatches(cargoId);

  // Estados de Filtro
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('RECOMMENDED');

  // Lógica de Filtragem e Ordenação (Mantida igual)
  const filteredData = useMemo(() => {
    let result = [...matches];

    // A. Filtro de Texto
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(m => 
        m.truckerName.toLowerCase().includes(lowerSearch) ||
        m.vehicleInfo.toLowerCase().includes(lowerSearch)
      );
    }

    // B. Ordenação
    switch (sortBy) {
      case 'LOWEST_PRICE':
        result.sort((a, b) => a.totalFreightPrice - b.totalFreightPrice);
        break;
      case 'HIGHEST_RATING':
        result.sort((a, b) => b.truckerRating - a.truckerRating);
        break;
      case 'SHORTEST_DISTANCE':
        result.sort((a, b) => a.cargoDistanceKm - b.cargoDistanceKm);
        break;
      default:
        break;
    }

    return result;
  }, [matches, searchText, sortBy]);

  const renderFilterChip = (label: string, value: SortOption, icon: keyof typeof Ionicons.glyphMap) => {
    const isActive = sortBy === value;
    return (
      <TouchableOpacity
        onPress={() => setSortBy(value)}
        className={`flex-row items-center px-4 py-2 rounded-full mr-2 border ${
          isActive ? "bg-black border-black" : "bg-white border-gray-200"
        }`}
      >
        <Ionicons 
          name={icon} 
          size={14} 
          color={isActive ? "white" : "#4B5563"} 
        />
        <Text className={`ml-2 text-xs font-bold ${isActive ? "text-white" : "text-gray-600"}`}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      
      {/* HEADER FIXO */}
      <View className="bg-white px-6 pb-4 pt-2 border-b border-gray-100">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <View className="ml-2">
            <Text className="text-xl font-bold text-black">
                Motoristas Disponíveis
            </Text>
            {/* Opcional: Mostrar ID ou info extra para debug se quiser */}
            {/* <Text className="text-xs text-gray-400">Carga ID: {cargoId?.slice(0,8)}...</Text> */}
          </View>
          
          <View className="ml-auto bg-orange-100 px-3 py-1 rounded-full">
             <Text className="text-orange-700 font-bold text-xs">
                {matches.length} encontrados
             </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-4">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput 
            placeholder="Buscar por nome ou modelo..." 
            className="flex-1 ml-3 text-base text-gray-800"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#9CA3AF"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
               <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <View className="flex-row">
            <FlatList 
              horizontal
              showsHorizontalScrollIndicator={false}
              data={['DUMMY']}
              renderItem={() => (
                <>
                   {renderFilterChip("Recomendados", "RECOMMENDED", "sparkles")}
                   {renderFilterChip("Menor Preço", "LOWEST_PRICE", "pricetag")}
                   {renderFilterChip("Melhor Avaliação", "HIGHEST_RATING", "star")}
                   {renderFilterChip("Menor Distância", "SHORTEST_DISTANCE", "navigate")}
                </>
              )}
            />
        </View>
      </View>

      {/* LISTA DE RESULTADOS */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EA812E" />
          <Text className="text-gray-400 mt-4">Calculando rotas e preços...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.tripId}
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <MatchCard 
              data={item} 
              ranking={index + 1} 
              onPress={() => console.log("Detalhes", item)} 
            />
          )}
          ListEmptyComponent={
            <View className="items-center mt-20 px-8">
               <Ionicons name="people-outline" size={48} color="#D1D5DB" />
               <Text className="text-gray-900 font-bold mt-4 text-center">
                  Nenhum motorista compatível
               </Text>
               <Text className="text-gray-500 text-sm text-center mt-2">
                 Não encontramos caminhões passando pela rota dessa carga na data especificada.
               </Text>
            </View>
          }
          refreshing={loading}
          onRefresh={refresh}
        />
      )}
    </SafeAreaView>
  );
}