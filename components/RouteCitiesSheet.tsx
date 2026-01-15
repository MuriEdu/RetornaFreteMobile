import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    FlatList,
    Modal,
    Pressable, // Usaremos Pressable em vez de TouchableWithoutFeedback
    Text,
    TouchableOpacity,
    View
} from "react-native";

export interface CityRouteData {
  name: string;
  state: string;
}

interface RouteCitiesSheetProps {
  isVisible: boolean;
  onClose: () => void;
  cities: CityRouteData[];
  colorTheme?: string;
}

const ITEM_HEIGHT = 72; 

export function RouteCitiesSheet({ 
  isVisible, 
  onClose, 
  cities, 
  colorTheme = "#EA812E" 
}: RouteCitiesSheetProps) {

  const renderItem = ({ item, index }: { item: CityRouteData; index: number }) => {
    const isFirst = index === 0;
    const isLast = index === cities.length - 1;

    return (
      <View className="flex-row items-center px-4 py-3 h-[72px] border-b border-gray-50">
        <View className="mr-4 items-center justify-center w-6">
          {!isFirst && <View className="w-[2px] h-4 bg-gray-200 absolute -top-3" />}
          <View 
            className={`w-3 h-3 rounded-full border-2 bg-white z-10`}
            style={{ borderColor: isFirst || isLast ? colorTheme : "#D1D5DB" }}
          />
          {!isLast && <View className="w-[2px] h-8 bg-gray-200 absolute -bottom-4" />}
        </View>

        <View className="flex-1">
          <Text className="text-gray-900 font-semibold text-base leading-tight">
            {item.name}
          </Text>
          <Text className="text-gray-400 text-xs font-medium mt-0.5">
            {item.state} • Brasil
          </Text>
        </View>

        <View className="bg-gray-50 px-2 py-1 rounded">
            <Text className="text-xs text-gray-500 font-bold">#{index + 1}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* MUDANÇA PRINCIPAL:
         Removemos os TouchableWithoutFeedback aninhados.
         Usamos uma View container principal.
      */}
      <View className="flex-1 justify-end">
        
        {/* 1. O Fundo Escuro (Agora é um irmão do conteúdo, não o pai) */}
        {/* Ele fica posicionado absolutamente atrás de tudo */}
        <Pressable 
          onPress={onClose}
          className="absolute top-0 left-0 right-0 bottom-0 bg-black/60"
        />
          
        {/* 2. O Conteúdo do Modal (Fica por cima do Pressable devido à ordem) */}
        {/* NENHUM Touchable envolve este bloco, liberando o scroll */}
        <View className="bg-white rounded-t-3xl h-[85%] shadow-2xl overflow-hidden z-10">
          
          {/* Header */}
          <View className="px-6 py-4 border-b border-gray-100 flex-row justify-between items-center bg-white z-10">
            <View>
              <Text className="text-xl font-bold text-gray-900">Rota Detalhada</Text>
              <Text className="text-gray-500 text-sm">Passando por {cities.length} cidades</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 bg-gray-50 rounded-full">
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Lista */}
          <FlatList
            data={cities}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            renderItem={renderItem}
            getItemLayout={(data, index) => (
              { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
            )}
            initialNumToRender={15}
            windowSize={5} 
            removeClippedSubviews={true}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          />
        </View>

      </View>
    </Modal>
  );
}