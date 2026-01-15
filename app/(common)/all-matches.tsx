import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { useAuth } from "@/context/AuthContext";
import { useCargoMatches } from "@/hooks/useCargoMatches";

// Components
import MatchCard from "@/components/MatchCard"; // Ajuste o import conforme seu projeto

// Tipos de Ordenação
type SortOption = 'RECOMMENDED' | 'LOWEST_PRICE' | 'HIGHEST_RATING' | 'SHORTEST_DISTANCE';

export default function AllMatches() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Pegamos o ID da carga ativa do contexto
  const activeCargoId = user?.activeCargo?.id;

  // 1. Hook de Dados
  const { matches, loading, refresh } = useCargoMatches(activeCargoId);

  // 2. Estados de Filtro
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('RECOMMENDED');

  // 3. Lógica de Filtragem e Ordenação (Memoized para performance)
  const filteredData = useMemo(() => {
    let result = [...matches];

    // A. Filtro de Texto (Nome ou Veículo)
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
        // RECOMMENDED: Mistura de preço e rating (Exemplo simples)
        // Lógica: Preço baixo tem peso 70%, Rating tem peso 30% (Simplificado aqui)
        break;
    }

    return result;
  }, [matches, searchText, sortBy]);

  // --- Renderização de Componentes Auxiliares ---

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
        {/* Top Bar */}
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-2 text-black">
            Motoristas Disponíveis
          </Text>
          <View className="ml-auto bg-orange-100 px-3 py-1 rounded-full">
             <Text className="text-orange-700 font-bold text-xs">{matches.length} encontrados</Text>
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

        {/* Filter Chips (Horizontal Scroll) */}
        <View className="flex-row">
            <FlatList 
              horizontal
              showsHorizontalScrollIndicator={false}
              data={['DUMMY']} // Hack simples para renderizar items inline se não quiser criar array de config
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
          <Text className="text-gray-400 mt-4">Atualizando lista...</Text>
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
            <View className="items-center mt-10">
               <Ionicons name="filter-circle-outline" size={48} color="#D1D5DB" />
               <Text className="text-gray-500 font-medium mt-2">Nenhum resultado para o filtro.</Text>
            </View>
          }
          refreshing={loading}
          onRefresh={refresh}
        />
      )}
    </SafeAreaView>
  );
}