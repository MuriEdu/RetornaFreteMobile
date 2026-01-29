import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProposalsList } from "@/components/ui/ProposalsList";
import { useAuth } from "@/context/AuthContext";
import { useProposals } from "@/hooks/useProposals";

export default function AllProposals() {
  const router = useRouter();
  const { user } = useAuth();
  const isTrucker = user?.roles?.includes("TRUCKER");

  // Busca 'received' se for motorista, 'sent' se for embarcador
  const { proposals, loading, refresh } = useProposals(isTrucker ? "recived" : "sent");

  const handleSelectProposal = (proposal: any) => {
    router.push({
      pathname: "/(common)/proposal-details",
      params: { id: proposal.id }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER CUSTOMIZADO */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-black">Todas as Propostas</Text>
      </View>

      <ScrollView 
        className="flex-1 mt-4" 
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View className="mt-20">
            <ActivityIndicator size="large" color="#EA812E" />
            <Text className="text-gray-400 text-center mt-4">Carregando negociações...</Text>
          </View>
        ) : (
          <ProposalsList 
            proposals={proposals} 
            isRecived={isTrucker} 
            onSelectProposal={handleSelectProposal}
            title={isTrucker ? "Propostas para você" : "Suas ofertas enviadas"}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}