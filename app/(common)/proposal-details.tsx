import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { useProposals } from "@/hooks/useProposals";

export default function ProposalDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const isTrucker = user?.roles?.includes("TRUCKER");

  const { proposals, loading, respondProposal, cancelProposal } = useProposals(isTrucker ? 'recived' : 'sent');
  const proposal = proposals.find(p => p.id === id);

  const [actionLoading, setActionLoading] = useState(false);

  const handleResponse = async (action: 'ACCEPT' | 'REJECT' | 'NEGOTIATE') => {
    const messages = {
      ACCEPT: "Deseja fechar o frete por este valor?",
      REJECT: "Deseja recusar esta proposta?",
      NEGOTIATE: "Deseja abrir a sala de negociação?"
    };

    Alert.alert("Confirmar", messages[action], [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sim",
        onPress: async () => {
          setActionLoading(true);
          try {
            await respondProposal(id as string, action);
            if (action === 'ACCEPT') Alert.alert("Sucesso", "Frete fechado com sucesso!");
          } catch (err) {
            Alert.alert("Erro", "Não foi possível processar a ação.");
          } finally {
            setActionLoading(false);
          }
        }
      }
    ]);
  };

  if (loading || !proposal) return <ActivityIndicator size="large" color="#EA812E" style={{ flex: 1 }} />;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>

        {/* Header de Status */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <View className="bg-gray-100 px-4 py-1.5 rounded-full">
            <Text className="text-gray-600 font-bold text-[10px] uppercase tracking-wider">{proposal.status}</Text>
          </View>
        </View>

        {/* --- SEÇÃO LOGÍSTICA (NOVA) --- */}
        <View className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
          <View className="flex-row items-center mb-4">
            <Ionicons name="map-outline" size={20} color="#EA812E" />
            <Text className="ml-2 font-bold text-gray-800">Detalhes do Trajeto</Text>
          </View>

          <View className="flex-row items-center">
            <View className="items-center mr-4">
              <Ionicons name="radio-button-on" size={12} color="#EA812E" />
              <View className="w-[2px] h-8 bg-gray-200 my-1" />
              <Ionicons name="location" size={16} color="#ef4444" />
            </View>
            <View className="flex-1">
              <View className="mb-4">
                <Text className="text-gray-400 text-[10px] uppercase font-bold">Origem</Text>
                <Text className="text-gray-800 font-medium">{proposal.originCity}</Text>
              </View>
              <View>
                <Text className="text-gray-400 text-[10px] uppercase font-bold">Destino</Text>
                <Text className="text-gray-800 font-medium">{proposal.destCity}</Text>
              </View>
            </View>
          </View>

          <View className="h-[1px] bg-gray-200 my-4" />

          <View className="flex-row justify-between">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text className="text-gray-600 text-xs ml-1 font-medium">
                {new Intl.DateTimeFormat('pt-BR').format(new Date(proposal.freightDate + 'T00:00:00'))}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="navigate-outline" size={14} color="#6B7280" />
              <Text className="text-gray-600 text-xs ml-1 font-medium">
                {Number(proposal.distanceKm).toFixed(2)} km
              </Text>
            </View>
          </View>
        </View>

        {/* --- SEÇÃO FINANCEIRA --- */}
        <View className="mb-8">
          <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Valor Atual da Negociação</Text>
          <Text className="text-black text-4xl font-bold">
            R$ {proposal.currentBid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
        </View>

        {/* Timeline de Lances */}
        <View className="mb-8">
          <Text className="text-gray-800 font-bold mb-4">Histórico de Lances</Text>
          <View className="border-l-2 border-gray-100 ml-4 pl-6 py-2">
            <View className="mb-6">
              <View className="absolute -left-[33px] bg-white p-1">
                <Ionicons name="radio-button-on" size={16} color="#EA812E" />
              </View>
              <View>
                <Text className="text-gray-400 text-[10px] font-bold uppercase">Proposta Inicial</Text>
                <Text className="text-gray-800 font-bold text-lg">R$ {proposal.initialValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
              </View>
            </View>

            {proposal.status === 'UNDER_NEGOTIATION' && (
              <View>
                <View className="absolute -left-[33px] bg-white p-1">
                  <Ionicons name="sync" size={16} color="#3B82F6" />
                </View>
                <View>
                  <Text className="text-blue-500 text-[10px] font-bold uppercase">Contraproposta em aberto</Text>
                  <Text className="text-gray-500 text-sm mt-1 italic">Aguardando novo lance de uma das partes...</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Ações Contextuais */}
        <View className="mt-4 gap-y-4 mb-10">
          {isTrucker && proposal.status === 'PENDING' && (
            <>
              <Button
                title="Aceitar Frete"
                icon="checkmark-circle"
                onPress={() => handleResponse('ACCEPT')}
                isLoading={actionLoading}
              />
              <Button
                title="Fazer Contraproposta"
                icon="chatbubbles-outline"
                onPress={() => handleResponse('NEGOTIATE')}
                disabled={actionLoading}
                style={{ backgroundColor: '#F3F4F6' }}
              />
              <TouchableOpacity onPress={() => handleResponse('REJECT')} className="py-2">
                <Text className="text-red-500 text-center font-bold">Recusar Oferta</Text>
              </TouchableOpacity>
            </>
          )}

          {!isTrucker && proposal.status === 'PENDING' && (
            <Button
              title="Cancelar Minha Oferta"
              icon="trash-outline"
              onPress={() => cancelProposal(proposal.id)}
              style={{ backgroundColor: '#FEE2E2' }}
              isLoading={actionLoading}
            />
          )}

          {/* Caso já esteja aceito ou em negociação, exibe o botão de abrir Chat/Sala */}
          {(proposal.status === 'UNDER_NEGOTIATION' || proposal.status === 'ACCEPTED') && (
            <Button
              title="Abrir Sala de Negociação"
              icon="chatbox-ellipses"
              onPress={() => Alert.alert("Em breve", "O chat em tempo real está sendo implementado.")}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}