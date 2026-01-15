import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    FlatList,
    Modal,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";

// Exportamos a interface para poder usar na tipagem do estado na tela pai
export interface SelectItem {
  id: string;
  name: string;
  type?: string;
  icon?: string;
}

interface SelectProps {
  placeholder: string;
  value: SelectItem | null;
  data: SelectItem[];
  onSelect: (item: SelectItem) => void;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  colorTheme?: string;
}

export function Select({ 
  placeholder, 
  value, 
  data, 
  onSelect, 
  title, 
  icon, 
  colorTheme = "#EA812E" 
}: SelectProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity 
        onPress={() => setModalVisible(true)}
        className="w-full h-14 bg-gray-50 border-[#E5E7EB] border-2 rounded-xl px-4 flex-row items-center mb-4"
      >
        <Ionicons name={icon} size={20} color="#EA812E" style={{ marginRight: 8 }} />
        <Text className={`flex-1 text-base ${value ? 'text-black' : 'text-[#9CA3AF]'}`}>
          {value ? value.name : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View className="flex-1 bg-black/50 justify-end">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-t-3xl h-[50%] p-6">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-bold text-gray-900">{title}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                
                <FlatList
                  data={data}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => {
                    const isSelected = value?.id === item.id;
                    return (
                      <TouchableOpacity 
                        className={`p-4 border-b border-gray-100 flex-row items-center ${isSelected ? 'bg-gray-50' : ''}`}
                        onPress={() => {
                          onSelect(item);
                          setModalVisible(false);
                        }}
                      >
                        <View className="w-10 h-10 rounded-full bg-gray-100 mr-3 items-center justify-center">
                           <Ionicons name="bus-outline" size={20} color={isSelected ? colorTheme : "#6B7280"} />
                        </View>
                        <View>
                          <Text className={`text-base ${isSelected ? 'font-bold' : 'text-gray-700'}`} style={isSelected ? { color: colorTheme } : {}}>
                              {item.name}
                          </Text>
                          {item.type && <Text className="text-xs text-gray-400">{item.type}</Text>}
                        </View>
                        {isSelected && (
                           <View className="ml-auto">
                              <Ionicons name="checkmark-circle" size={24} color={colorTheme} />
                           </View>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}