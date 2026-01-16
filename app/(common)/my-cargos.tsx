import { CargoCard } from "@/components/CargoCard";
import { useMyCargos } from "@/hooks/useMyCargos";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
    ActivityIndicator,
    SectionList,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyCargos() {
  const router = useRouter();
  const { cargos, loading, refresh } = useMyCargos();

  // Organiza os dados em Seções para a SectionList
  const sections = useMemo(() => {
    const active = cargos.filter(c => c.status === 'ACTIVE');
    const history = cargos.filter(c => c.status !== 'ACTIVE');

    const result = [];

    if (active.length > 0) {
        result.push({ title: 'Em Aberto', data: active, type: 'ACTIVE' });
    }
    
    if (history.length > 0) {
        result.push({ title: 'Histórico', data: history, type: 'HISTORY' });
    }

    return result;
  }, [cargos]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      
      {/* HEADER */}
      <View className="bg-white px-6 py-4 border-b border-gray-100 mb-2">
        <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2 rounded-full active:bg-gray-100">
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <View className="ml-2">
                <Text className="text-xl font-bold text-black">Gerenciar Cargas</Text>
                <Text className="text-gray-500 text-xs">
                    {cargos.length} registros encontrados
                </Text>
            </View>
        </View>
      </View>

      {/* LISTA DE SEÇÕES */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#EA812E" />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          
          // Renderiza o Título da Seção (Ex: "Em Aberto")
          renderSectionHeader={({ section: { title, type } }) => (
            <View className="flex-row items-center mb-4 mt-2">
                <View className={`w-1 h-4 mr-2 rounded-full ${type === 'ACTIVE' ? 'bg-orange-500' : 'bg-gray-400'}`} />
                <Text className="text-lg font-bold text-gray-800">{title}</Text>
                <View className="ml-2 bg-gray-200 px-2 py-0.5 rounded-full">
                    <Text className="text-xs font-bold text-gray-600">
                        {/* Conta itens na seção atual */}
                        {sections.find(s => s.title === title)?.data.length}
                    </Text>
                </View>
            </View>
          )}

          // Renderiza o Card da Carga
          renderItem={({ item }) => (
            <CargoCard 
                data={item} 
                // Ação 1: Clicar no Card (Pode ir para detalhes ou edição)
                onPress={() => console.log("Detalhes da Carga:", item.id)}
                
                // Ação 2: Clicar no botão "BUSCAR MOTORISTAS" (Se status for ACTIVE)
                onViewMatches={() => {
                    // NAVEGAÇÃO CORRETA:
                    // Verifica se o arquivo all-matches.tsx está na pasta (app)
                    router.push({ 
                      pathname: '/(common)/all-matches', 
                      params: { cargoId: item.id } 
                    });
                }}
            />
          )}

          // Estado Vazio (Sem nenhuma carga criada)
          ListEmptyComponent={
            <View className="items-center justify-center mt-20 px-10">
                <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                    <Ionicons name="folder-open-outline" size={40} color="#9CA3AF" />
                </View>
                <Text className="text-gray-900 font-bold text-lg text-center">
                    Nenhuma carga encontrada
                </Text>
                <Text className="text-gray-500 text-center mt-2 text-sm">
                    Você ainda não criou nenhum anúncio de carga. Clique no botão + para começar.
                </Text>
            </View>
          }
          
          refreshing={loading}
          onRefresh={refresh}
        />
      )}

      {/* FAB - Adicionar Carga */}
      <View className="absolute bottom-6 right-6">
        <TouchableOpacity 
            // NAVEGAÇÃO CORRETA:
            // Vai para a tela de criação (Trip.tsx) na pasta (common)
            onPress={() => router.push('/(common)/trip')}
            className="bg-black w-14 h-14 rounded-full items-center justify-center shadow-lg active:scale-95"
            activeOpacity={0.9}
        >
            <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}