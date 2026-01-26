import { TripCard } from "@/components/TripCard";
import { useMyTrips } from "@/hooks/useMyTrips";
import api from "@/services/api"; // Importando api para fazer o delete direto aqui
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
    ActivityIndicator,
    Alert,
    SectionList,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyTrips() {
  const router = useRouter();
  const { trips, loading, refresh } = useMyTrips();

  // Organização das seções (Disponíveis vs Histórico)
  const sections = useMemo(() => {
    const active = trips.filter(t => t.status === 'AVAILABLE');
    const history = trips.filter(t => t.status !== 'AVAILABLE');
    const result = [];
    if (active.length > 0) result.push({ title: 'Disponíveis', data: active, type: 'ACTIVE' });
    if (history.length > 0) result.push({ title: 'Histórico / Fretes', data: history, type: 'HISTORY' });
    return result;
  }, [trips]);

  // --- LÓGICA DE GERENCIAMENTO ---

  const handleCancelTrip = async (id: string) => {
    try {
        await api.delete(`/api/trips/${id}`);
        Alert.alert("Sucesso", "Oferta de viagem cancelada.");
        refresh(); // Atualiza a lista usando a função do hook original
    } catch (error) {
        console.error(error);
        Alert.alert("Erro", "Não foi possível cancelar a viagem.");
    }
  };

  const handleManageTrip = (item: any) => {
    // 1. REGRA DE NEGÓCIO: 
    // Impede alteração se não estiver Disponível (já contratada, cancelada, etc)
    if (item.status !== 'AVAILABLE') {
       let message = "Esta viagem já foi processada ou finalizada.";
       if (item.status === 'MATCHED') message = "Esta viagem já virou um frete contratado. Gerencie-a na aba de Fretes.";
       if (item.status === 'CANCELED') message = "Esta viagem já está cancelada.";
       
       Alert.alert("Ação não permitida", message);
       return;
    }

    // 2. Menu de Ações
    Alert.alert(
        "Gerenciar Oferta",
        "O que deseja fazer com esta viagem?",
        [
            { text: "Voltar", style: "cancel" },
            { 
                text: "Cancelar Oferta", 
                style: "destructive", 
                onPress: () => {
                    Alert.alert(
                        "Confirmar",
                        "Tem certeza? Essa ação removerá sua oferta da busca.",
                        [
                            { text: "Não", style: "cancel" },
                            { text: "Sim, Cancelar", style: "destructive", onPress: () => handleCancelTrip(item.id) }
                        ]
                    );
                }
            },
            { 
                text: "Editar", 
                onPress: () => {
                    // Prepara dados para edição e navega para Trip.tsx
                    const dataToPass = {
                        origin: item.originName,
                        destination: item.destinationName,
                        // Formata a data para DD/MM/AAAA (padrão do input)
                        date: new Date(item.tripDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
                        price: item.pricePerKm,
                        vehicleId: item.vehicle?.id
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
      <View className="bg-white px-6 py-4 border-b border-gray-100 mb-2">
        <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2 rounded-full active:bg-gray-100">
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <View className="ml-2">
                <Text className="text-xl font-bold text-black">Minhas Viagens</Text>
                <Text className="text-gray-500 text-xs">{trips.length} registros</Text>
            </View>
        </View>
      </View>

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
            </View>
          )}

          renderItem={({ item }) => (
            <TripCard 
                data={item} 
                // AQUI ESTÁ A LIGAÇÃO: Ao clicar, abre o menu de gerenciamento
                onPress={() => handleManageTrip(item)}
                
                onViewMatches={() => {
                    // router.push({ pathname: '/(common)/matches-for-trip', params: { tripId: item.id } });
                }}
            />
          )}

          ListEmptyComponent={
            <View className="items-center justify-center mt-20 px-10">
                <Ionicons name="map-outline" size={48} color="#D1D5DB" />
                <Text className="text-gray-900 font-bold text-lg text-center mt-4">Nenhuma viagem</Text>
                <Text className="text-gray-500 text-center mt-2 text-sm">
                    Você ainda não cadastrou rotas. Clique em + para oferecer seu frete.
                </Text>
            </View>
          }
          refreshing={loading}
          onRefresh={refresh}
        />
      )}

      {/* FAB - Nova Viagem */}
      <View className="absolute bottom-6 right-6">
        <TouchableOpacity 
            onPress={() => router.push('/(common)/trip')}
            className="bg-black w-14 h-14 rounded-full items-center justify-center shadow-lg"
        >
            <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}