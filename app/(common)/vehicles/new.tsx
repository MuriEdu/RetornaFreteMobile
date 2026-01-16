import { Button } from "@/components/Button"; // Use seus componentes existentes
import { Input } from "@/components/Input";
import { Select, SelectItem } from "@/components/Select"; // Adapte para usar o Select existente ou Modal
import { useVehicles } from "@/hooks/useVehicles";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewVehicle() {
  const router = useRouter();
  const { types } = useVehicles(); // Busca os tipos para o Select
  
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");
  const [selectedType, setSelectedType] = useState<SelectItem | null>(null);
  const [loading, setLoading] = useState(false);

  // Converter tipos do backend para o formato do SelectItem
  const typeOptions: SelectItem[] = types.map(t => ({ id: t.id.toString(), name: t.name }));

  const handleSave = async () => {
    if (!brand || !model || !plate || !selectedType) {
        Alert.alert("Erro", "Preencha todos os campos.");
        return;
    }

    setLoading(true);
    try {
        await api.post('/api/vehicles', {
            brand,
            model,
            licensePlate: plate,
            typeId: Number(selectedType.id)
        });
        
        Alert.alert("Sucesso", "Veículo cadastrado!", [
            { text: "OK", onPress: () => router.back() }
        ]);
    } catch (error) {
        Alert.alert("Erro", "Falha ao salvar veículo. Verifique os dados.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER */}
      <View className="px-6 py-4 border-b border-gray-100 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2 rounded-full active:bg-gray-100">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-2 text-black">Novo Veículo</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        
        <Text className="text-gray-900 font-bold text-lg mb-6">Dados do Caminhão</Text>

        <Input 
            placeholder="Placa (Ex: ABC-1234)" 
            value={plate} 
            onChangeText={(t) => setPlate(t.toUpperCase())} // Força uppercase
            icon="card-outline"
            maxLength={8}
        />

        <View className="flex-row gap-3">
            <View className="flex-1">
                <Input 
                    placeholder="Marca (Ex: Volvo)" 
                    value={brand} 
                    onChangeText={setBrand} 
                    icon="pricetag-outline"
                />
            </View>
            <View className="flex-1">
                <Input 
                    placeholder="Modelo (Ex: FH 540)" 
                    value={model} 
                    onChangeText={setModel} 
                    icon="construct-outline"
                />
            </View>
        </View>

        <View className="mt-2">
            <Select 
                title="Tipo de Carroceria"
                placeholder="Selecione o Tipo"
                data={typeOptions}
                value={selectedType}
                onSelect={setSelectedType}
                icon="cube-outline"
                colorTheme="#000000"
            />
        </View>

        <View className="mt-8">
            <Button 
                title="SALVAR VEÍCULO" 
                onPress={handleSave} 
                isLoading={loading}
                icon="checkmark-circle"
                iconPosition="left"
            />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}