import { Ionicons } from "@expo/vector-icons"; // Importação adicionada
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { useProposals } from "@/hooks/useProposals";
import api from "@/services/api";

export default function CreateProposal() {
  const router = useRouter();
  const { tripId, cargoId } = useLocalSearchParams();
  const { createProposal } = useProposals('sent');

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [price, setPrice] = useState("");
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await api.get(`/api/matches/cargo/${cargoId}`);
        const match = response.data.find((m: any) => m.tripId === tripId);
        if (match) {
          setDetails(match);
          setPrice(match.totalFreightPrice.toString());
        }
      } catch (err) {
        Alert.alert("Erro", "Não foi possível carregar os dados do match.");
      } finally {
        setLoadingData(false);
      }
    };
    loadInitialData();
  }, [tripId, cargoId]);

  const handleSubmit = async () => {
    if (!price || isNaN(Number(price))) {
      Alert.alert("Atenção", "Insira um valor válido para a proposta.");
      return;
    }

    setSubmitting(true);
    try {
      await createProposal({
        cargoId: cargoId as string,
        tripId: tripId as string,
        initialPrice: Number(price)
      });
      Alert.alert("Sucesso", "Proposta enviada com sucesso!", [
        { text: "OK", onPress: () => router.replace("/(common)/home") }
      ]);
    } catch (err: any) {
      Alert.alert("Erro", err.response?.data?.message || "Erro ao enviar proposta.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) return <ActivityIndicator size="large" color="#EA812E" style={{ flex: 1 }} />;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
        
        {/* Botão de Voltar */}
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="mb-4 p-2 -ml-2 self-start"
        >
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-black mb-2">Enviar Proposta</Text>
        <Text className="text-gray-500 mb-6">Confirme os valores para iniciar a negociação com {details?.truckerName}.</Text>

        {/* Card de Resumo */}
        <View className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Distância da Carga:</Text>
            <Text className="font-bold">{details?.cargoDistanceKm} km</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Tarifa do Motorista:</Text>
            <Text className="font-bold">R$ {details?.pricePerKm}/km</Text>
          </View>
          <View className="h-[1px] bg-gray-200 my-2" />
          <View className="flex-row justify-between">
            <Text className="text-black font-bold">Sugestão do Sistema:</Text>
            <Text className="text-main font-bold">R$ {details?.totalFreightPrice.toFixed(2)}</Text>
          </View>
        </View>

        {/* Input de Preço */}
        <Text className="text-gray-700 font-bold mb-2">Seu Valor (R$)</Text>
        <View className="flex-row items-center bg-gray-100 rounded-lg px-4 mb-8">
          <Text className="text-gray-500 mr-2">R$</Text>
          <TextInput
            className="flex-1 h-14 text-lg font-bold"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
            placeholder="0,00"
          />
        </View>

        <Button 
          title="Enviar Oferta Inicial" 
          onPress={handleSubmit} 
          isLoading={submitting}
          icon="send"
        />
        
        {/* Botão de Cancelar/Voltar alternativo no final da tela */}
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="mt-4 py-2"
        >
          <Text className="text-gray-400 text-center font-bold">Cancelar e Voltar</Text>
        </TouchableOpacity>

        <Text className="text-gray-400 text-center text-[10px] mt-6 italic">
          O motorista poderá aceitar, recusar ou fazer uma contraproposta.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}