import { Button } from "@/components/Button";
import { Proposal } from "@/hooks/useProposals";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

interface ProposalCardProps {
  data: Proposal;
  onPress: () => void;
  isRecived?: boolean;
  isLoading?: boolean;
}

export default function ProposalCard({ data, onPress, isRecived, isLoading }: ProposalCardProps) {

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return { label: 'Aceito', color: 'text-green-600', bg: 'bg-green-50', icon: 'checkmark-circle' as const };
      case 'REJECTED': return { label: 'Recusado', color: 'text-red-600', bg: 'bg-red-50', icon: 'close-circle' as const };
      case 'UNDER_NEGOTIATION': return { label: 'Em Negociação', color: 'text-blue-600', bg: 'bg-blue-50', icon: 'chatbubbles' as const };
      case 'CANCELED': return { label: 'Cancelado', color: 'text-gray-500', bg: 'bg-gray-100', icon: 'ban' as const };
      default: return { label: 'Pendente', color: 'text-amber-600', bg: 'bg-amber-50', icon: 'time' as const };
    }
  };

  const statusStyle = getStatusConfig(data.status);

  return (
    <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">

      {/* --- CABEÇALHO --- */}
      <View className="flex-row justify-between items-start">
        <View className="flex-row items-center gap-2">
          <View>
            <Text className="text-gray-900 font-bold text-base">
              {isRecived ? "Proposta Recebida" : "Minha Oferta"}
            </Text>
            <Text className="text-gray-500 text-[10px]">
              Data do frete: {
                new Intl.DateTimeFormat('pt-BR').format(new Date(data.freightDate + 'T00:00:00'))
              }
            </Text>
          </View>
        </View>

        {/* Valor Atual */}
        <View className="items-end">
          <Text className="text-green-600 font-bold text-lg">
            {formatCurrency(data.currentBid)}
          </Text>
          {data.currentBid !== data.initialValue && (
            <Text className="text-gray-400 text-[10px] line-through">
              {formatCurrency(data.initialValue)}
            </Text>
          )}
        </View>
      </View>


      {/* --- RODAPÉ --- */}
      <View className="flex-row justify-between items-center">
        <View className="flex-col gap-2">
          <View className={`flex-row items-center mt-4 px-2 py-1 rounded-md ${statusStyle.bg}`}>
            <Ionicons name={statusStyle.icon} size={14} className={statusStyle.color} />
            <Text className={`font-bold text-sm uppercase ml-1 ${statusStyle.color}`}>
              {statusStyle.label}
            </Text>
          </View>
          <View className="flex-1 pr-4">
            <Text className="text-gray-400 text-[10px]">
              Clique para ver detalhes e histórico
            </Text>
          </View>
        </View>

        {/* Botão utilizando seu componente customizado */}
        <View className="w-32">
          <Button
            title={data.status === 'PENDING' && isRecived ? "Responder" : "Ver"}
            onPress={onPress}
            icon="chevron-forward"
            iconPosition="right"
            isLoading={isLoading}
            style={{ height: 40, marginTop: 0 }} // Sobrescrevendo altura para ser mais compacto no card
          />
        </View>
      </View>
    </View>
  );
}