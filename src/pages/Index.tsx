import { useState } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { DashboardView } from '@/components/views/DashboardView';
import { CreateTicketModal } from '@/components/views/CreateTicketModal';
import { TeamBoardView } from '@/components/views/TeamBoardView';
import { TicketDetailView } from '@/components/views/TicketDetailView';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleViewTicket = (id: string) => {
    setSelectedTicketId(id);
    setActiveView('ticket-detail');
  };

  const handleBack = () => {
    setSelectedTicketId(null);
    setActiveView('dashboard');
  };

  const renderView = () => {
    if (activeView === 'ticket-detail' && selectedTicketId) {
      return <TicketDetailView ticketId={selectedTicketId} onBack={handleBack} />;
    }
    switch (activeView) {
      case 'dashboard':
      case 'tickets':
        return <DashboardView onViewTicket={handleViewTicket} searchQuery={searchQuery} />;
      case 'board':
        return <TeamBoardView onViewTicket={handleViewTicket} />;
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Application settings and configuration</p>
          </div>
        );
      default:
        return <DashboardView onViewTicket={handleViewTicket} searchQuery={searchQuery} />;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-surface">
      <AppSidebar activeView={activeView} onNavigate={setActiveView} />
      <div className="flex-1 flex flex-col min-h-screen">
        <AppHeader
          onNewTicket={() => setShowCreateTicket(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <main className="flex-1 overflow-auto">
          {renderView()}
        </main>
      </div>
      <CreateTicketModal open={showCreateTicket} onClose={() => setShowCreateTicket(false)} />
    </div>
  );
};

export default Index;
