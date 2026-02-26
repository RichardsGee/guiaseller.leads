import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { PageHeader } from './PageHeader';
import { DashboardPage } from '../../pages/Dashboard';
import { LeadsPage } from '../../pages/Leads';
import { AnalyticsPage } from '../../pages/Analytics';
import { SettingsPage } from '../../pages/Settings';
import { useUIStore } from '../../store/uiStore';

type Page = 'dashboard' | 'leads' | 'analytics' | 'settings';

export function AppLayout() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const { sidebarOpen } = useUIStore();

  const pageConfig: Record<Page, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Visão geral de leads e métricas' },
    leads: { title: 'Leads', subtitle: 'Gerenciar e acompanhar leads' },
    analytics: { title: 'Analytics', subtitle: 'Métricas e relatórios detalhados' },
    settings: { title: 'Configurações', subtitle: 'Usuários e integrações' },
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'leads':
        return <LeadsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-200 ${
          sidebarOpen ? 'ml-64' : 'ml-16'
        }`}
      >
        <PageHeader
          title={pageConfig[currentPage].title}
          subtitle={pageConfig[currentPage].subtitle}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
