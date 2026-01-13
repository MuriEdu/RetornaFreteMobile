import QuickActionButton from "@/components/QuickActionButton";
import { RouteData, RouteStatusCard } from "@/components/RouteStatusCard";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {

  const {user, signOut} = useAuth()
  const router = useRouter()

  const route: RouteData = {
    origin: 'São Paulo',
    destination: 'Curitiba',
    validUntil: '15/01'
  }

  if(!user) return <Redirect href={"/(auth)/login"} />

  const userType = user.roles[0]
  const userName = user.fullname

  function handleSignOut() {

    Alert.alert(
    "Sign Out", 
    "Tem certeza que deseja sair?", 
    [
      {
        text: "Sim",
        onPress: () => signOut()
      },
      {
        text: "Cancelar",
      }
    ],
    {
      cancelable: true
    }
  );

  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 bg-white flex-row justify-between items-center border-b border-gray-100">
        <View>
          <Text className="text-gray-500 text-sm font-medium">
            {userType === 'TRUCKER' ? 'Motorista' : 'Embarcador'}
          </Text>
          <Text className="text-black text-xl font-bold">{userName}</Text>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity 
            onPress={handleSignOut}
            className="bg-gray-100 p-2 rounded-full" 
            style={{ marginLeft: 8 }}
          >

            <Ionicons name="exit-outline" size={20} color="#EA812E" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        
        {userType === 'TRUCKER' ? (
          <View className="mt-6">
            <RouteStatusCard route={null} onPress={() => router.navigate("/(common)/trip")}/>
          </View>

        ) : (
          <View className="bg-black rounded-2xl p-6 mt-6 shadow-sm">
            <Text className="text-white text-xl font-bold">Oferecer Frete</Text>
            <Text className="text-white/70 text-sm mt-1">Encontre o caminhão ideal para sua carga.</Text>
            <TouchableOpacity className="bg-main rounded-lg py-3 mt-4 items-center">
              <Text className="text-white font-bold">REALIZAR PROPOSTA</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* FERRAMENTAS */}
        <View className="mt-8">
          <Text className="text-black text-lg font-bold mb-4">Gerenciamento</Text>
          <View className="flex-row justify-between gap-3">
            {userType === 'TRUCKER' ? (
              <>
                <QuickActionButton icon="chatbubbles-outline" label="Propostas" badge={2} />
                <QuickActionButton icon="calendar-outline" label="Minha Agenda" />
                <QuickActionButton icon="car-outline" label="Veículo" />
              </>
            ) : (
              <>
                <QuickActionButton icon="search-outline" label="Buscar Docs" />
                <QuickActionButton icon="list-outline" label="Meus Fretes" />
                <QuickActionButton icon="shield-checkmark-outline" label="Seguros" />
              </>
            )}
          </View>
        </View>

        {/* SEÇÃO DE LISTAGEM (UX PARA LÓGICA POSTERIOR) */}
        <View className="mt-8 mb-10">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-black text-lg font-bold">
              {userType === 'TRUCKER' ? 'Oportunidades na Rota' : 'Caminhoneiros Ativos'}
            </Text>
            <TouchableOpacity>
              <Text className="text-main font-bold">Ver todos</Text>
            </TouchableOpacity>
          </View>

          {/* Placeholder de Lista */}
          <View className="bg-gray-50 p-8 rounded-2xl border border-dashed border-gray-200 items-center">
            <Ionicons 
              name={userType === 'TRUCKER' ? "map-outline" : "person-add-outline"} 
              size={30} 
              color="#EA812E" 
            />
            <Text className="text-black font-semibold mt-3 text-center">
              {userType === 'TRUCKER' ? 'Nenhuma proposta ativa' : 'Nenhum motorista filtrado'}
            </Text>
            <Text className="text-gray-400 text-xs text-center mt-1">
              {userType === 'TRUCKER' 
                ? 'As ofertas de embarcadores aparecerão aqui.' 
                : 'Selecione uma rota para ver quem está disponível.'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}