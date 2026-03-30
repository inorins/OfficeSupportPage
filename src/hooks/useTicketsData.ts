import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiMode } from '@/context/ApiModeContext';
import { tickets as mockTickets, chatMessages as mockMessages } from '@/data/mockData';
import { api } from '@/services/api';

export function useTickets() {
  const { isApiMode } = useApiMode();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tickets'],
    queryFn: api.getTickets,
    enabled: isApiMode,
    retry: 1,
  });

  return {
    tickets: isApiMode ? (query.data ?? []) : mockTickets,
    isLoading: isApiMode && query.isLoading,
    isError: isApiMode && query.isError,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  };
}

export function useTicket(id: string) {
  const { isApiMode } = useApiMode();

  const query = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => api.getTicket(id),
    enabled: isApiMode && !!id,
    retry: 1,
  });

  const mockTicket = mockTickets.find((t) => t.id === id) ?? mockTickets[0];

  return {
    ticket: isApiMode ? (query.data ?? mockTicket) : mockTicket,
    isLoading: isApiMode && query.isLoading,
  };
}

export function useTicketMessages(ticketId: string) {
  const { isApiMode } = useApiMode();

  const query = useQuery({
    queryKey: ['messages', ticketId],
    queryFn: () => api.getMessages(ticketId),
    enabled: isApiMode && !!ticketId,
    retry: 1,
  });

  return {
    messages: isApiMode ? (query.data ?? []) : mockMessages,
    isLoading: isApiMode && query.isLoading,
  };
}

export function useStats() {
  const { isApiMode } = useApiMode();

  const query = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
    enabled: isApiMode,
    retry: 1,
  });

  return {
    stats: isApiMode ? query.data ?? null : null,
    isLoading: isApiMode && query.isLoading,
  };
}
