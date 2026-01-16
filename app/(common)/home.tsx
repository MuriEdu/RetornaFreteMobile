import { Ionicons } from "@expo/vector-icons";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Contexts & Hooks
import { useAuth } from "@/context/AuthContext";
import { useCargoMatches } from "@/hooks/useCargoMatches";

// Components
import QuickActionButton from "@/components/QuickActionButton";
import { RouteStatusCard } from "@/components/RouteStatusCard";
import { MatchesList } from "@/components/ui/MatchesList";
import api from "@/services/api";

export default function Home() {
  const router = useRouter();

  // 1. HOOKS (Sempre no topo, incondicionalmente)
  const { user, signOut, routeData, refreshUserContext } = useAuth();

  // Variáveis seguras (usando optional chaining ?. caso user seja null antes do redirect)
  const isTrucker = user?.roles?.includes("TRUCKER");
  const userTypeLabel = isTrucker ? 'Motorista' : 'Embarcador';
  const activeCargoId = (!isTrucker && user?.activeCargo?.id) ? user.activeCargo.id : undefined;

  // Hooks de lógica (executam mesmo se não houver user, mas com parâmetros undefined)
  const { matches, loading: loadingMatches, refresh: refreshMatches } = useCargoMatches(activeCargoId);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Assim que a tela ganha foco (ex: voltando do Trip), atualiza o contexto
      refreshUserContext();
    }, []) // Array vazio garante que a função é estável
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (refreshUserContext) await refreshUserContext();
    if (activeCargoId && refreshMatches) await refreshMatches();
    setRefreshing(false);
  }, [refreshUserContext, refreshMatches, activeCargoId]);

  // 2. VERIFICAÇÃO DE SEGURANÇA (Agora sim, após os hooks)
  // Se não tiver user, faz o early return aqui
  if (!user) return <Redirect href={"/(auth)/login"} />;

  // 3. HANDLERS
  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Tem certeza que deseja sair?",
      [
        { text: "Sim", onPress: () => signOut() },
        { text: "Cancelar" }
      ],
      { cancelable: true }
    );
  };

  const handleHireMatch = (match: any) => {
    Alert.alert("Contratar", `Proposta enviada para ${match.truckerName}`);
  };

const handleRouteAction = () => {
    // Se não tem rota, vai para criar
    if ((isTrucker && !routeData) || (!isTrucker && !activeCargoId)) {
        router.push("/(common)/trip");
        return;
    }

    // Se TEM rota, mostra opções
    Alert.alert(
        "Gerenciar",
        "O que deseja fazer com sua rota atual?",
        [
            { text: "Voltar", style: "cancel" },
            { 
                text: "Cancelar Rota/Carga", 
                style: "destructive", 
                onPress: confirmCancellation 
            },
            { 
                text: "Editar", 
                onPress: navigateToEdit 
            }
        ]
    );
  };

  const confirmCancellation = async () => {
    try {
        const id = isTrucker ? user?.activeTrip?.id : user?.activeCargo?.id;
        const endpoint = isTrucker ? `/api/trips/${id}` : `/api/cargos/${id}`;
        
        await api.delete(endpoint);
        await refreshUserContext();
        Alert.alert("Cancelado", "Sua rota foi removida.");
    } catch (error) {
        Alert.alert("Erro", "Não foi possível cancelar.");
    }
  };

  const navigateToEdit = () => {
    // Precisamos montar os dados atuais para passar para a tela Trip
    // O ideal é que o 'routeData' ou 'user' do contexto tenha esses detalhes.
    // Supondo que você tenha os dados detalhados no user.activeTrip ou activeCargo:
    
    const activeObj = isTrucker ? user?.activeTrip : user?.activeCargo;
    if (!activeObj) return;

    // Formata objeto para passar via String (simplificado)
    const dataToPass = {
        origin: activeObj.originName,
        destination: activeObj.destinationName,
        date: formatDateToBR(activeObj.tripDate), // Função auxiliar YYYY-MM-DD -> DD/MM/AAAA
        price: activeObj.pricePerKm, // Trucker
        weight: activeObj.weightKg, // Shipper
        product: activeObj.productName, // Shipper
        vehicleId: activeObj.vehicle?.id, // Trucker
        typeId: activeObj.requiredVehicleType?.id // Shipper
    };

    router.push({
        pathname: "/(common)/trip",
        params: { 
            id: activeObj.id, // ID indica edição
            data: JSON.stringify(dataToPass) 
        }
    });
  };

  // Função auxiliar
  const formatDateToBR = (isoDate: string) => {
      if(!isoDate) return "";
      const [year, month, day] = isoDate.split('-');
      return `${day}/${month}/${year}`;
  }

  // 4. RENDERIZAÇÃO
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER */}
      <View className="px-6 py-4 bg-white flex-row justify-between items-center border-b border-gray-100">
        <View>
          <Text className="text-gray-500 text-sm font-medium">{userTypeLabel}</Text>
          <Text className="text-black text-xl font-bold">{user.fullname}</Text>
        </View>

        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-gray-100 p-2 rounded-full ml-2"
        >
          <Ionicons name="exit-outline" size={20} color="#EA812E" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#EA812E"]} // Cor laranja do loading no Android
            tintColor="#EA812E"  // Cor laranja do loading no iOS
          />
        }
      >

        {/* STATUS DA ROTA */}
        <View className="mt-6">
          <RouteStatusCard
            route={routeData}
            onPress={handleRouteAction}
            isTrucker={isTrucker}
          />
        </View>

        {/* FERRAMENTAS DE GERENCIAMENTO */}
        <View className="mt-8">
          <Text className="text-black text-lg font-bold mb-4">Gerenciamento</Text>
          <View className="flex-row justify-between gap-3">
            {isTrucker ? (
              <>
                <QuickActionButton icon="chatbubbles-outline" label="Propostas" badge={2} />
                <QuickActionButton icon="calendar-outline" label="Minha Agenda" 
                  onPress={() => router.push("/(common)/my-trips")}
                />
                <QuickActionButton icon="car-outline" label="Veículo" 
                  onPress={() => router.push("/(common)/vehicles")}
                />
              </>
            ) : (
              <>
                <QuickActionButton icon="search-outline" label="Buscar Docs" />
                <QuickActionButton icon="list-outline" label="Meus Fretes" />
                <QuickActionButton icon="cube-outline" label="Outras Cargas"
                  onPress={() => router.push("/(common)/my-cargos")}
                />
              </>
            )}
          </View>
        </View>

        {/* LISTAGEM DE OPORTUNIDADES */}
        <View className="mt-8 mb-10">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-black text-lg font-bold">
              {isTrucker ? 'Oportunidades na Rota' : 'Caminhoneiros Ativos'}
            </Text>
            <TouchableOpacity onPress={() => {
              router.push("/(common)/all-matches")
              router.push({
                pathname: '/(common)/all-matches',
                params: { cargoId: activeCargoId }
              });
            }}>
              <Text className="text-main font-bold">Ver todos</Text>
            </TouchableOpacity>
          </View>

          {isTrucker ? (
            // --- CAMINHONEIRO ---
            !routeData ? (
              // 1. Caminhoneiro SEM Rota
              <View className="mt-6">
                <EmptyState
                  icon="map-outline"
                  title="Nenhuma proposta ativa"
                  description="Cadastre sua rota acima para que as ofertas de embarcadores apareçam aqui."
                />
              </View>
            ) : (
              // 2. Caminhoneiro COM Rota (Aguardando implementação de ofertas)
              // Exibe um estado de "Aguardando" para não ficar vazio
              <View className="mt-6">
                <EmptyState
                  icon="hourglass-outline"
                  title="Aguardando ofertas"
                  description="Estamos monitorando sua rota. Você será notificado assim que aparecer uma carga compatível."
                />
              </View>
            )
          ) : (
            // --- EMBARCADOR ---
            !activeCargoId ? (
              // 3. Embarcador SEM Carga (Correção do buraco lógico)
              <View className="mt-6">
                <EmptyState
                  icon="cube-outline"
                  title="Nenhuma carga configurada"
                  description="Utilize o cartão acima para configurar sua carga e encontrar motoristas."
                />
              </View>
            ) : (
              // 4. Embarcador COM Carga (Busca de Motoristas)
              <View className="mt-6">
                {loadingMatches ? (
                  <View className="mt-10 items-center">
                    <ActivityIndicator size="large" color="#EA812E" />
                    <Text className="text-gray-400 mt-2 text-sm">Buscando motoristas na região...</Text>
                  </View>
                ) : matches.length > 0 ? (
                  <MatchesList
                    matches={matches}
                    onSelectMatch={handleHireMatch}
                  />
                ) : (
                  // Lista vazia (mas com carga configurada)
                  <EmptyState
                    icon="person-add-outline"
                    title="Nenhum motorista filtrado"
                    description="Ainda não encontramos caminhões compatíveis com sua rota e data. Tente novamente mais tarde."
                  />
                )}
              </View>
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Componente visual auxiliar
function EmptyState({ icon, title, description }: { icon: keyof typeof Ionicons.glyphMap, title: string, description: string }) {
  return (
    <View className="bg-gray-50 p-8 rounded-2xl border border-dashed border-gray-200 items-center">
      <Ionicons name={icon} size={30} color="#EA812E" />
      <Text className="text-black font-semibold mt-3 text-center">{title}</Text>
      <Text className="text-gray-400 text-xs text-center mt-1 px-4">{description}</Text>
    </View>
  );
}