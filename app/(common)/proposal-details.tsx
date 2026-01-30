import { Button } from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { useProposals } from "@/hooks/useProposals";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProposalDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const isTrucker = user?.roles?.includes("TRUCKER");

  const { proposals, loading, respondProposal, negotiateProposal } = useProposals(isTrucker ? 'recived' : 'sent');

  const proposal = useMemo(() => proposals.find(p => p.id === id), [proposals, id]);
  const [actionLoading, setActionLoading] = useState(false);

  if (loading || !proposal) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#EA812E" />
        <Text className="text-gray-400 mt-4 font-medium">Sincronizando oferta...</Text>
      </View>
    );
  }

  // Lógica de Turno e Finalização
  const isMyTurn = proposal.currentBidderId !== user?.id;
  const isFinalized = ['ACCEPTED', 'REJECTED', 'CANCELED'].includes(proposal.status);
  const canInteract = isMyTurn && !isFinalized;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return { label: 'Negócio Fechado', color: 'bg-green-100', text: 'text-green-700', icon: 'checkmark-circle' };
      case 'REJECTED': return { label: 'Recusada', color: 'bg-red-100', text: 'text-red-700', icon: 'close-circle' };
      case 'UNDER_NEGOTIATION': return { label: 'Em Negociação', color: 'bg-blue-100', text: 'text-blue-700', icon: 'sync' };
      default: return { label: 'Pendente', color: 'bg-amber-100', text: 'text-amber-700', icon: 'time' };
    }
  };

  const statusStyle = getStatusConfig(proposal.status);

  const handleNegotiate = () => {
    if (!canInteract) return; // Bloqueio de segurança

    Alert.prompt(
      "Enviar Contraproposta",
      "Qual valor você propõe para este frete?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Enviar Lance",
          onPress: async (value: any) => {
            const numValue = Number(value?.toString().replace(',', '.'));
            if (!value || isNaN(numValue)) return Alert.alert("Erro", "Insira um valor numérico.");
            setActionLoading(true);
            try {
              await negotiateProposal(id as string, numValue);
            } catch (err) {
              Alert.alert("Limite excedido", "O valor proposto está fora da margem permitida.");
            } finally {
              setActionLoading(false);
            }
          }
        }
      ],
      "plain-text",
      ""
    );
  };

  const handleResponse = async (action: 'ACCEPT' | 'REJECT') => {
    if (!canInteract) return; // Bloqueio de segurança

    const isAccept = action === 'ACCEPT';
    Alert.alert(
      isAccept ? "Fechar Acordo?" : "Recusar Oferta?",
      isAccept ? "Ao aceitar, você confirma o frete por este valor." : "Esta ação encerrará a negociação.",
      [
        { text: "Voltar", style: "cancel" },
        {
          text: isAccept ? "Sim, Aceitar" : "Sim, Recusar",
          style: isAccept ? "default" : "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              await respondProposal(id as string, action);
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER */}
      <View className="bg-white px-6 pt-4 pb-8 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View className={`${statusStyle.color} px-4 py-1.5 rounded-full`}>
            <Text className={`${statusStyle.text} font-bold text-[10px] uppercase tracking-widest`}>
              {statusStyle.label}
            </Text>
          </View>
        </View>

        <Text className="text-gray-500 text-xs font-bold uppercase mb-1">Valor Atual da Oferta</Text>
        <Text className="text-gray-900 text-4xl font-black">
          R$ {proposal.currentBid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* ROTA */}
        <View className="m-6 bg-gray-50 rounded-3xl p-5 border border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="font-bold text-gray-800">Trajeto</Text>
            <Text className="text-orange-600 font-bold text-xs">{Number(proposal.distanceKm).toFixed(0)} KM</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="location" size={18} color="#EA812E" />
            <Text className="ml-2 text-gray-600 flex-1" numberOfLines={1}>{proposal.originCity} → {proposal.destCity}</Text>
          </View>
        </View>

        {/* TIMELINE */}
        {/* TIMELINE DE NEGOCIAÇÃO */}
        <View className="px-6 mb-20">
          <Text className="text-gray-900 font-black text-lg mb-8 uppercase tracking-tighter">
            Histórico de Negociação
          </Text>

          <View className="border-l-2 border-gray-100 ml-4 pl-6 pb-4">
            {/* LANCE INICIAL (Âncora da Timeline) */}
            <View className="mb-8 relative">
              <View className="absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-white bg-gray-300 shadow-sm" />
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-gray-400 text-[10px] font-bold uppercase">Lance Inicial</Text>
                <Text className="text-gray-400 text-[10px]">
                  {new Date(proposal.createdAt).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <Text className="text-gray-500 font-bold text-lg">
                R$ {proposal.initialValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            {/* HISTÓRICO DINÂMICO */}
            {proposal.bidHistory && proposal.bidHistory.length > 0 ? (
              proposal.bidHistory.map((bid, index) => {
                const isMe = bid.bidderId === user?.id;
                const isLast = index === proposal.bidHistory.length - 1;

                return (
                  <View key={bid.id} className={`mb-8 relative ${isLast ? 'opacity-100' : 'opacity-60'}`}>
                    {/* Marcador na Linha */}
                    <View
                      className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-md 
                        ${isMe ? 'bg-blue-600' : 'bg-orange-600'}`}
                    />

                    <View className="flex-row justify-between items-center mb-1">
                      <Text className={`text-[10px] font-black uppercase ${isMe ? 'text-blue-600' : 'text-orange-600'}`}>
                        {isMe ? "Sua Contraproposta" : bid.bidderName || "Contraparte"}
                      </Text>
                      <Text className="text-gray-400 text-[10px]">
                        {new Date(bid.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>

                    <View className={`p-4 rounded-2xl rounded-tl-none ${isMe ? 'bg-blue-50' : 'bg-orange-50'}`}>
                      <Text className={`font-black text-xl ${isMe ? 'text-blue-800' : 'text-orange-800'}`}>
                        R$ {bid.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              /* ESTADO VAZIO (Apenas se não houver contrapropostas ainda) */
              <View className="py-4">
                <Text className="text-gray-400 italic text-sm font-medium">
                  Aguardando primeira contraproposta...
                </Text>
              </View>
            )}

            {/* INDICADOR DE "EM PROCESSAMENTO" (Visualmente no fim da timeline) */}
            {!isMyTurn && !isFinalized && (
              <View className="flex-row items-center mt-2 bg-gray-50 self-start px-4 py-2 rounded-full border border-gray-100">
                <Text className="text-gray-500 italic text-xs ml-3 font-semibold">
                  Outra parte está analisando...
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* FOOTER DE AÇÕES - BLOQUEIO AQUI */}
      <View className="px-6 py-6 bg-white border-t border-gray-100">
        {!isFinalized ? (
          <View className="gap-y-3">
            {/* Se não for o turno do usuário, mostramos o aviso e desabilitamos os botões */}
            {!isMyTurn && (
              <View className="bg-amber-50 p-4 rounded-2xl mb-2 flex-row items-center border border-amber-100">
                <Ionicons name="hourglass-outline" size={20} color="#D97706" />
                <Text className="text-amber-700 text-xs ml-3 font-medium flex-1">
                  Aguardando resposta da outra parte. Você poderá interagir assim que receber um novo lance.
                </Text>
              </View>
            )}

            <View style={{ opacity: canInteract ? 1 : 0.5 }}>
              <Button
                title={isTrucker ? "Aceitar Frete" : "Aceitar Valor"}
                onPress={() => handleResponse('ACCEPT')}
                isLoading={actionLoading}
                disabled={!canInteract} // Propriedade disabled nativa ou do seu componente
              />
            </View>

            <View className="flex-row gap-x-3" style={{ opacity: canInteract ? 1 : 0.5 }}>
              <TouchableOpacity
                onPress={handleNegotiate}
                disabled={!canInteract}
                className="flex-1 bg-gray-100 h-14 rounded-2xl items-center justify-center flex-row"
              >
                <Ionicons name="chatbubble-ellipses-outline" size={20} color={canInteract ? "#374151" : "#9CA3AF"} />
                <Text className={`${canInteract ? 'text-gray-700' : 'text-gray-400'} font-bold ml-2`}>
                  Contraproposta
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleResponse('REJECT')}
                disabled={!canInteract}
                className="w-14 h-14 bg-red-50 rounded-2xl items-center justify-center"
              >
                <Ionicons name="trash-outline" size={24} color={canInteract ? "#EF4444" : "#FCA5A5"} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Button
            title="Voltar para Propostas"
            onPress={() => router.back()}
            className="bg-gray-800"
          />
        )}
      </View>
    </SafeAreaView>
  );
}