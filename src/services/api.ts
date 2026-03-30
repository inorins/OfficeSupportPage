import type { Ticket, ChatMessage } from '@/data/mockData';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

export interface StatsResponse {
  openTickets: number;
  resolvedThisWeek: number;
  pendingOurAction: number;
}

export const api = {
  // Tickets
  getTickets: () => request<Ticket[]>('/tickets'),
  getTicket: (id: string) => request<Ticket>(`/tickets/${id}`),
  createTicket: (data: Partial<Ticket>) =>
    request<Ticket>('/tickets', { method: 'POST', body: JSON.stringify(data) }),
  updateTicketStatus: (id: string, status: string) =>
    request<Ticket>(`/tickets/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  assignTicket: (id: string, assignee: string) =>
    request<Ticket>(`/tickets/${id}/assign`, { method: 'PATCH', body: JSON.stringify({ assignee }) }),

  // Messages
  getMessages: (ticketId: string) =>
    request<ChatMessage[]>(`/tickets/${ticketId}/messages`),
  sendMessage: (ticketId: string, data: { content: string; isInternal: boolean }) =>
    request<ChatMessage>(`/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Stats
  getStats: () => request<StatsResponse>('/stats'),
};
