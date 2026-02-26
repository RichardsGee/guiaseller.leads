import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/api';
import {
  Users,
  TrendingUp,
  Target,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export function DashboardPage() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: analyticsAPI.overview,
  });

  const kpis = overview?.data?.kpis;

  const kpiCards = [
    {
      label: 'Total Leads',
      value: kpis?.totalLeads ?? '—',
      icon: Users,
      color: 'blue',
      change: '+12%',
      trend: 'up' as const,
    },
    {
      label: 'Leads Ativos',
      value: kpis?.activeLeads ?? '—',
      icon: Sparkles,
      color: 'green',
      change: '+5%',
      trend: 'up' as const,
    },
    {
      label: 'Taxa de Conversão',
      value: kpis ? `${kpis.conversionRate}%` : '—',
      icon: Target,
      color: 'purple',
      change: '+2.1%',
      trend: 'up' as const,
    },
    {
      label: 'Score Médio',
      value: kpis?.avgScore ?? '—',
      icon: TrendingUp,
      color: 'amber',
      change: '-3',
      trend: 'down' as const,
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-3" />
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">{kpi.label}</span>
                <div className={`p-2 rounded-lg ${colorMap[kpi.color]}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {kpi.value}
                </span>
                <span
                  className={`flex items-center text-xs font-medium mb-1 ${
                    kpi.trend === 'up' ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {kpi.trend === 'up' ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {kpi.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leads por Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Novos Leads Hoje</h3>
          <div className="text-center py-8 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {kpis?.newLeadsToday ?? 0}
            </p>
            <p className="text-sm">leads capturados hoje</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Distribuição por Status</h3>
          <div className="space-y-3">
            {overview?.data?.leadsByStatus?.map((item: { status: string; _count: number }) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      item.status === 'active'
                        ? 'bg-green-500'
                        : item.status === 'inactive'
                        ? 'bg-yellow-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                    {item.status}
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item._count}
                </span>
              </div>
            )) || (
              <p className="text-sm text-slate-400 text-center py-4">Nenhum dado disponível</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
