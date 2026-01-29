import api from '@/services/api';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export interface Proposal {
  id: string;
  cargoId: string;
  tripId: string;
  initialValue: number;
  currentBid: number;
  createdAt: string;
  status: 'PENDING' | 'UNDER_NEGOTIATION' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';
  freightDate: string;
  originCity: string;
  destCity: string;
  distanceKm: string
}

export interface CreateProposalDTO {
  cargoId: string;
  tripId: string;
  initialPrice: number;
}

// O parâmetro 'type' define se buscaremos ofertas enviadas ou recebidas
export function useProposals(type: 'sent' | 'recived') {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    try {
      // Define o endpoint com base no tipo solicitado
      const endpoint = type === 'sent' ? '/api/proposals/my-offers' : '/api/proposals/recived';
      const response = await api.get(endpoint);
      
      setProposals(response.data || []);
      setError(false);
    } catch (err) {
      console.error(`Erro ao buscar propostas (${type}):`, err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [type]);

  // Funções Utilitárias para Ações
  const createProposal = async (data: CreateProposalDTO) => {
    try {
      await api.post('/api/proposals', data);
      await fetchProposals();
    } catch (err) {
      console.error("Erro ao criar proposta:", err);
      throw err;
    }
  };

  const respondProposal = async (id: string, action: 'ACCEPT' | 'REJECT' | 'NEGOTIATE') => {
    try {
      await api.patch(`/api/proposals/${id}/respond`, { action });
      await fetchProposals(); // Atualiza a lista após responder
    } catch (err) {
      console.error("Erro ao responder proposta:", err);
      throw err;
    }
  };

  const cancelProposal = async (id: string) => {
    try {
      await api.delete(`/api/proposals/${id}`);
      await fetchProposals(); // Atualiza a lista após cancelar
    } catch (err) {
      console.error("Erro ao cancelar proposta:", err);
      throw err;
    }
  };

  // Atualiza automaticamente quando a tela ganha foco (navegação Mobile)
  useFocusEffect(
    useCallback(() => {
      fetchProposals();
    }, [fetchProposals])
  );

  return { 
    proposals, 
    loading, 
    error, 
    refresh: fetchProposals,
    createProposal,
    respondProposal,
    cancelProposal
  };
}