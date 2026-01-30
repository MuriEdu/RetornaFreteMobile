import { storage } from '@/services/storage';
import { useEffect, useState } from 'react';
import EventSource, { EventSourceHttpErrorResponse } from 'react-native-sse';
import { Proposal } from './useProposals';

/**
 * Hook para subscrever atualizações de propostas em tempo real via SSE.
 * Não requer WebSockets e fecha a ligação automaticamente ao desmontar o componente.
 */
export const useProposalSubscription = () => {
  const [lastUpdate, setLastUpdate] = useState<Proposal | null>(null);

  useEffect(() => {
    let es: EventSource<"proposal-update">;

    const connectSSE = async () => {
      const token = await storage.getToken();
      
      // Se não houver token (utilizador deslogado), não inicia a conexão
      if (!token) return;

      const url = `${process.env.EXPO_PUBLIC_API_URL}/api/notifications/subscribe`;

      // Inicializa a conexão SSE com o cabeçalho de autorização JWT
      es = new EventSource<"proposal-update">(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Escuta o evento específico definido no NotificationService do Backend
      es.addEventListener('proposal-update', (event) => {
        if (event.data) {
          try {
            // Converte a string JSON recebida para o objeto Proposal tipado
            const proposalDto: Proposal = JSON.parse(event.data);
            setLastUpdate(proposalDto);
          } catch (e) {
            console.error("Erro ao processar dados recebidos via SSE:", e);
          }
        }
      });

      // Tratamento de erros e tentativas de reconexão
      es.addEventListener('error', (err: EventSourceHttpErrorResponse | any) => {
        if (err.type === 'error') {
          console.error("Erro na ligação SSE. A ligação será encerrada ou reiniciada pelo SO:", err.message);
        }
        es.close();
      });
    };

    connectSSE();

    // Limpeza: Fecha a conexão ao sair da tela para poupar bateria e dados
    return () => {
      if (es) {
        es.close();
      }
    };
  }, []);

  return lastUpdate;
};