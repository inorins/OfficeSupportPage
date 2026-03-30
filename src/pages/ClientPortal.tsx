import { useState, useMemo } from 'react';
import { ClientHeader } from '@/components/client/ClientHeader';
import { ClientSidebar } from '@/components/client/ClientSidebar';
import { ClientTicketListView } from '@/components/views/ClientTicketListView';
import { ClientTicketDetailView } from '@/components/views/ClientTicketDetailView';
import { ClientNewTicketView } from '@/components/views/ClientNewTicketView';
import { useTickets } from '@/hooks/useTicketsData';
import { useAuth } from '@/context/AuthContext';
import { HelpCircle } from 'lucide-react';

export function ClientPortal() {
  const { user } = useAuth();
  const { tickets } = useTickets();
  const [activeView, setActiveView] = useState<string>('my-tickets');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const myTickets = useMemo(() => {
    if (!user?.bankDomain) return [];
    return tickets.filter((t) => t.reporterEmail.endsWith(`@${user.bankDomain}`));
  }, [tickets, user]);

  const openCount = myTickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length;

  const handleViewTicket = (id: string) => {
    setSelectedTicketId(id);
    setActiveView('ticket-detail');
  };

  const handleBack = () => {
    setSelectedTicketId(null);
    setActiveView('my-tickets');
  };

  const renderContent = () => {
    if (activeView === 'ticket-detail' && selectedTicketId) {
      return <ClientTicketDetailView ticketId={selectedTicketId} onBack={handleBack} />;
    }
    switch (activeView) {
      case 'my-tickets':
        return <ClientTicketListView onViewTicket={handleViewTicket} />;
      case 'new-ticket':
        return <ClientNewTicketView onSuccess={() => setActiveView('my-tickets')} />;
      case 'faq':
        return <FaqView />;
      default:
        return <ClientTicketListView onViewTicket={handleViewTicket} />;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-surface">
      <ClientSidebar
        activeView={activeView === 'ticket-detail' ? 'my-tickets' : activeView}
        onNavigate={setActiveView}
        openTicketCount={openCount}
      />
      <div className="flex-1 flex flex-col min-h-screen">
        <ClientHeader onNewTicket={() => setActiveView('new-ticket')} />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function FaqView() {
  const faqs = [
    {
      q: 'How long does it take to resolve a Critical ticket?',
      a: 'Critical tickets (system-down) are assigned within 30 minutes and targeted for resolution within 4 hours.',
    },
    {
      q: 'What is the difference between UAT and Production tickets?',
      a: 'UAT issues affect your test environment. Production issues affect live operations and receive higher priority.',
    },
    {
      q: 'Can I add attachments after submitting a ticket?',
      a: 'Yes — open the ticket and use the message box to attach files in a follow-up message.',
    },
    {
      q: 'Who should I contact for urgent escalation?',
      a: 'Reply to your ticket with "ESCALATE" and a description of the business impact. Our support lead will be notified immediately.',
    },
    {
      q: 'How do I check if the issue is from the CBS, ECL or DCH system?',
      a: 'CBS covers core banking (accounts, loans, users). ECL is for provisioning and IFRS9 reporting. DCH handles reconciliation and settlement.',
    },
  ];

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">FAQ & Guides</h1>
        <p className="text-sm text-muted-foreground mt-1">Common questions about using the Inorins support portal</p>
      </div>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-card rounded-lg border border-border p-5">
            <div className="flex gap-3">
              <HelpCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1.5">{faq.q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
