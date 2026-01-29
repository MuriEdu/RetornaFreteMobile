import { Proposal } from '@/hooks/useProposals';
import { Ionicons } from "@expo/vector-icons";
import React from 'react';
import { Text, View } from 'react-native';
import ProposalCard from '../ProposalCard';

interface ProposalsListProps {
  proposals: Proposal[];
  onSelectProposal: (proposal: Proposal) => void;
  title?: string;
  isRecived?: boolean;
}

export function ProposalsList({ 
  proposals, 
  onSelectProposal, 
  title = "Negociações Ativas",
  isRecived = false 
}: ProposalsListProps) {
  
  if (!proposals || proposals.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20 px-10">
        <View className="bg-gray-50 p-6 rounded-full">
            <Ionicons name="document-text-outline" size={40} color="#D1D5DB" />
        </View>
        <Text className="text-gray-500 font-bold mt-4 text-center">
          Nenhuma proposta por aqui
        </Text>
        <Text className="text-gray-400 text-xs text-center mt-1">
          As negociações em andamento aparecerão nesta lista.
        </Text>
      </View>
    );
  }

  return (
    <View className="w-full px-6">
      <Text className="text-gray-800 text-lg font-bold mb-4">
        {title}
      </Text>

      {proposals.map((proposal) => (
        <ProposalCard 
          key={proposal.id} 
          data={proposal} 
          isRecived={isRecived}
          onPress={() => onSelectProposal(proposal)}
        />
      ))}
    </View>
  );
}