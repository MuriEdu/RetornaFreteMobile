import { useVehicles, Vehicle } from "@/hooks/useVehicles";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VehicleList() {
  const router = useRouter();
  const { vehicles, loading, refresh, deleteVehicle } = useVehicles();

  const handleDelete = (id: string) => {
    Alert.alert(
      "Remover Veículo",
      "Tem certeza que deseja remover este veículo? Essa ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", style: "destructive", onPress: () => deleteVehicle(id) }
      ]
    );
  };

  const renderItem = ({ item }: { item: Vehicle }) => (
    <View className="bg-white p-4 rounded-xl border border-gray-100 mb-3 shadow-sm flex-row justify-between items-center">
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Text className="text-black font-bold text-lg mr-2">{item.licensePlate}</Text>
          <View className="bg-gray-100 px-2 py-0.5 rounded text-xs">
            <Text className="text-gray-600 text-[10px] font-bold uppercase">{item.typeName}</Text>
          </View>
        </View>
        <Text className="text-gray-500 text-sm">{item.brand} • {item.model}</Text>
      </View>
      
      <TouchableOpacity 
        onPress={() => handleDelete(item.id)}
        className="p-2 bg-red-50 rounded-lg ml-2"
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      
      {/* HEADER */}
      <View className="bg-white px-6 py-4 border-b border-gray-100 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2 rounded-full active:bg-gray-100">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-2 text-black">Meus Veículos</Text>
        </View>
        
        {/* Botão Adicionar (Header Action) */}
        <TouchableOpacity 
            onPress={() => router.push('/(common)/vehicles/new')}
            className="flex-row items-center bg-black px-3 py-1.5 rounded-lg"
        >
            <Ionicons name="add" size={16} color="white" />
            <Text className="text-white text-xs font-bold ml-1">Novo</Text>
        </TouchableOpacity>
      </View>

      {/* LISTA */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EA812E" />
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24 }}
          renderItem={renderItem}
          ListEmptyComponent={
            <View className="items-center mt-20 px-8">
               <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                  <Ionicons name="car-sport-outline" size={40} color="#9CA3AF" />
               </View>
               <Text className="text-gray-900 font-bold mt-2 text-center">Nenhum veículo cadastrado</Text>
               <Text className="text-gray-500 text-sm text-center mt-1">
                 Cadastre seu caminhão para começar a receber ofertas de frete.
               </Text>
               <TouchableOpacity 
                  onPress={() => router.push('/(common)/vehicles/new')}
                  className="mt-6 bg-main px-6 py-3 rounded-lg w-full"
               >
                  <Text className="text-white font-bold text-center">CADASTRAR VEÍCULO</Text>
               </TouchableOpacity>
            </View>
          }
          refreshing={loading}
          onRefresh={refresh}
        />
      )}
    </SafeAreaView>
  );
}