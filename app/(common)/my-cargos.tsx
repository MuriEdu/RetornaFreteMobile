import { CargoCard } from "@/components/CargoCard";
import { useMyCargos } from "@/hooks/useMyCargos";
import api from "@/services/api"; // Importando API para o delete
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Alert, // Importando Alert
  SectionList,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyCargos() {
  const router = useRouter();
  const { cargos, loading, refresh } = useMyCargos();

  // Organiza os dados em Seções
  const sections = useMemo(() => {
    const active = cargos.filter(c => c.status === 'ACTIVE');
    const history = cargos.filter(c => c.status !== 'ACTIVE');

    const result = [];
    if (active.length > 0) result.push({ title: 'Em Aberto', data: active, type: 'ACTIVE' });
    if (history.length > 0) result.push({ title: 'Histórico', data: history, type: 'HISTORY' });

    return result;
  }, [cargos]);

  // --- LÓGICA DE GERENCIAMENTO ---

  const handleCancelCargo = async (id: string) => {
    try {
        await api.delete(`/api/cargos/${id}`);
        Alert.alert("Sucesso", "Anúncio de carga cancelado.");
        refresh(); // Atualiza a lista
    } catch (error) {
        console.error(error);
        Alert.alert("Erro", "Não foi possível cancelar a carga.");
    }
  };

  const handleManageCargo = (item: any) => {
    // 1. REGRA DE NEGÓCIO: Só edita se estiver 'ACTIVE'
    if (item.status !== 'ACTIVE') {
       let message = "Esta carga não pode mais ser alterada.";
       if (item.status === 'MATCHED') message = "Esta carga já virou um frete em andamento.";
       if (item.status === 'CANCELED') message = "Esta carga já está cancelada.";
       
       Alert.alert("Ação não permitida", message);
       return;
    }

    // 2. Menu de Ações
    Alert.alert(
        "Gerenciar Carga",
        "O que deseja fazer com este anúncio?",
        [
            { text: "Voltar", style: "cancel" },
            { 
                text: "Cancelar Anúncio", 
                style: "destructive", 
                onPress: () => {
                    Alert.alert(
                        "Confirmar",
                        "Tem certeza? Motoristas não verão mais esta carga.",
                        [
                            { text: "Não", style: "cancel" },
                            { text: "Sim, Cancelar", style: "destructive", onPress: () => handleCancelCargo(item.id) }
                        ]
                    );
                }
            },
            { 
                text: "Editar", 
                onPress: () => {
                    // Prepara dados para edição (Campos específicos de Carga)
                    const dataToPass = {
                        origin: item.originName,
                        destination: item.destinationName,
                        date: new Date(item.tripDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
                        // Campos exclusivos de Embarcador:
                        product: item.productName,
                        weight: item.weightKg,
                        typeId: item.requiredVehicleType?.id // ID do tipo de veículo exigido
                    };

                    router.push({
                        pathname: '/(common)/trip',
                        params: { 
                            id: item.id, 
                            data: JSON.stringify(dataToPass) 
                        }
                    });
                }
            }
        ]
    );
  };

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
          
          renderSectionHeader={({ section: { title, type } }) => (
            <View className="flex-row items-center mb-4 mt-2">
                <View className={`w-1 h-4 mr-2 rounded-full ${type === 'ACTIVE' ? 'bg-orange-500' : 'bg-gray-400'}`} />
                <Text className="text-lg font-bold text-gray-800">{title}</Text>
                <View className="ml-2 bg-gray-200 px-2 py-0.5 rounded-full">
                    <Text className="text-xs font-bold text-gray-600">
                        {sections.find(s => s.title === title)?.data.length}
                    </Text>
                </View>
            </View>
          )}

          renderItem={({ item }) => (
            <CargoCard 
                data={item} 
                // Ação 1: Clicar no Card abre o Menu de Gerenciamento
                onPress={() => handleManageCargo(item)}
                
                // Ação 2: Botão específico (Buscar Motoristas)
                onViewMatches={() => {
                    router.push({ 
                      pathname: '/(common)/all-matches', 
                      params: { cargoId: item.id } 
                    });
                }}
            />
          )}

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