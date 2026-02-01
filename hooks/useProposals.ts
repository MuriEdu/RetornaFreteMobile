import api from '@/services/api';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useProposalSubscription } from './useProposalSubscription';

export interface BidHistory {
  id: string;
  value: number;
  bidderId: string;
  bidderName: string;
  createdAt: string;
}
export interface Proposal {
  id: string;
  cargoId: string;
  tripId: string;
  initialValue: number;
  currentBid: number;
  currentBidderId: string;
  createdAt: string;
  status: 'PENDING' | 'UNDER_NEGOTIATION' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';
  freightDate: string;
  originCity: string;
  destCity: string;
  distanceKm: string;
  productName: string;
  weightKg: number;
  tripDate: string;
  bidHistory: BidHistory[];
}

export interface CreateProposalDTO {
  cargoId: string;
  tripId: string;
  initialPrice: number;
}

export function useProposals(type: 'sent' | 'recived') {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const incomingUpdate = useProposalSubscription();

  useEffect(() => {
    if (incomingUpdate) {
      setProposals(current => {
        const index = current.findIndex(p => p.id === incomingUpdate.id);
        if (index !== -1) {
          const newList = [...current];
          newList[index] = incomingUpdate;
          return newList;
        }
        return type === 'recived' ? [incomingUpdate, ...current] : current;
      });
    }
  }, [incomingUpdate, type]);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    try {
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

  // --- NOVA FUNÇÃO: CRIAR PROPOSTA ---
  const createProposal = async (data: CreateProposalDTO) => {
    try {
      const response = await api.post('/api/proposals', data);
      // Após criar, atualizamos a lista local para refletir a nova oferta enviada
      await fetchProposals();
      return response.data;
    } catch (err) {
      console.error("Erro ao criar proposta:", err);
      throw err;
    }
  };

  const respondProposal = async (id: string, action: 'ACCEPT' | 'REJECT') => {
    try {
      await api.patch(`/api/proposals/${id}/respond`, { action });
    } catch (err) {
      console.error("Erro ao responder proposta:", err);
      throw err;
    }
  };

  const negotiateProposal = async (id: string, newBid: number) => {
    try {
      const response = await api.patch(`/api/proposals/${id}/negotiate`, { newBid });
      // Atualiza o estado local imediatamente com o retorno da API 
      // enquanto o SSE não chega, evitando "pulos" na UI.
      setProposals(current =>
        current.map(p => p.id === id ? { ...p, ...response.data } : p)
      );
    } catch (err) {
      throw err;
    }
  };

  const acceptProposal = async (id: string) => {
    try {
      const response = await api.patch(`/api/proposals/${id}/accept`);
      // Atualização otimista do estado local
      setProposals(current => 
        current.map(p => p.id === id ? { ...p, status: 'ACCEPTED', ...response.data } : p)
      );
      return response.data;
    } catch (err) {
      console.error("Erro ao aceitar proposta:", err);
      throw err;
    }
  };

  const cancelProposal = async (id: string) => {
    try {
      await api.delete(`/api/proposals/${id}`);
      await fetchProposals();
    } catch (err) {
      console.error("Erro ao cancelar proposta:", err);
      throw err;
    }
  };

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
    negotiateProposal,
    acceptProposal,
    cancelProposal
  };
}