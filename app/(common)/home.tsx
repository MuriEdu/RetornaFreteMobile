import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const [userType, setUserType] = useState<'TRUCKER' | 'SHIPPER'>('TRUCKER');

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 bg-white flex-row justify-between items-center border-b border-gray-100">
        <View>
          <Text className="text-gray-500 text-sm font-medium">
            {userType === 'TRUCKER' ? 'Motorista' : 'Embarcador'}
          </Text>
          <Text className="text-black text-xl font-bold">Marcos Silva</Text>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity 
            onPress={() => setUserType(userType === 'TRUCKER' ? 'SHIPPER' : 'TRUCKER')}
            className="bg-gray-100 p-2 rounded-full"
          >
            <Ionicons name="swap-horizontal" size={20} color="#EA812E" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        
        {userType === 'TRUCKER' ? (
          <View className="bg-main rounded-2xl p-6 mt-6 shadow-sm">
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="text-white/80 text-sm font-medium">Sua rota atual</Text>
                <Text className="text-white text-xl font-bold mt-1">São Paulo → Curitiba</Text>
                <Text className="text-white/90 text-xs mt-1">Disponível até: 15/01</Text>
              </View>
              <Ionicons name="navigate-circle" size={32} color="white" />
            </View>
            <TouchableOpacity className="bg-white rounded-lg py-3 mt-4 items-center">
              <Text className="text-main font-bold italic">ALTERAR ROTA</Text>
            </TouchableOpacity>
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
          <View className="flex-row justify-between">
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

function QuickActionButton({ icon, label, badge }: { icon: any, label: string, badge?: number }) {
  return (
    <TouchableOpacity className="items-center w-[30%]">
      <View className="bg-white border border-gray-100 w-full aspect-square rounded-2xl items-center justify-center shadow-sm mb-2 relative">
        <Ionicons name={icon} size={26} color="#EA812E" />
        {badge && (
          <View className="absolute -top-1 -right-1 bg-main w-5 h-5 rounded-full items-center justify-center border-2 border-white">
            <Text className="text-white text-[10px] font-bold">{badge}</Text>
          </View>
        )}
      </View>
      <Text className="text-black text-[11px] font-medium text-center">{label}</Text>
    </TouchableOpacity>
  );
}