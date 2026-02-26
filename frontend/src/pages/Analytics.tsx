import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/api';
import { BarChart3, Target, PieChart } from 'lucide-react';

export function AnalyticsPage() {
  const { data: marketplace } = useQuery({
    queryKey: ['analytics', 'marketplace'],
    queryFn: analyticsAPI.marketplace,
  });

  const { data: segments } = useQuery({
    queryKey: ['analytics', 'segments'],
    queryFn: analyticsAPI.segments,
  });

  const { data: funnel } = useQuery({
    queryKey: ['analytics', 'funnel'],
    queryFn: analyticsAPI.funnel,
  });

  const marketplaceData = marketplace?.data?.marketplaces || [];
  const segmentData = segments?.data?.segments || [];
  const funnelData = funnel?.data?.funnel || [];

  const mpColors: Record<string, string> = {
    ML: 'bg-yellow-500',
    Shopee: 'bg-orange-500',
    Magalu: 'bg-blue-500',
    TikTok: 'bg-slate-800',
    Amazon: 'bg-amber-500',
    Shein: 'bg-pink-500',
  };

  return (
    <div className="space-y-6">
      {/* Conversion Funnel */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Funil de Conversão</h3>
        </div>
        <div className="space-y-3">
          {funnelData.map((stage: { stage: string; count: number; percentage: number }) => (
            <div key={stage.stage} className="flex items-center gap-4">
              <span className="text-sm text-slate-500 w-40 flex-shrink-0">{stage.stage}</span>
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-8 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                  style={{ width: `${Math.max(stage.percentage, 3)}%` }}
                >
                  {stage.percentage >= 15 && (
                    <span className="text-xs font-bold text-white">{stage.count}</span>
                  )}
                </div>
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white w-12 text-right">
                {stage.percentage}%
              </span>
            </div>
          ))}
          {funnelData.length === 0 && (
            <p className="text-center text-slate-400 py-8">Nenhum dado de funil disponível</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Marketplace */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Leads por Marketplace</h3>
          </div>
          <div className="space-y-3">
            {marketplaceData.map(
              (mp: { marketplace: string; totalLeads: number; avgScore: number; conversionRate: number }) => (
                <div key={mp.marketplace} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${mpColors[mp.marketplace] || 'bg-slate-400'}`} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-20">
                    {mp.marketplace}
                  </span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-4">
                    <div
                      className={`h-full rounded-full ${mpColors[mp.marketplace] || 'bg-slate-400'} opacity-70`}
                      style={{
                        width: `${Math.max(
                          (mp.totalLeads / Math.max(...marketplaceData.map((m: any) => m.totalLeads), 1)) * 100,
                          5
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white w-10 text-right">
                    {mp.totalLeads}
                  </span>
                  <span className="text-xs text-slate-400 w-16 text-right">
                    Score: {mp.avgScore}
                  </span>
                </div>
              )
            )}
            {marketplaceData.length === 0 && (
              <p className="text-center text-slate-400 py-8">Nenhum dado de marketplace</p>
            )}
          </div>
        </div>

        {/* By Segment */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Distribuição por Segmento</h3>
          </div>
          <div className="space-y-3">
            {segmentData.map(
              (seg: { segment: string; count: number; avgScore: number }) => {
                const segColors: Record<string, string> = {
                  founder: 'bg-purple-500',
                  seller: 'bg-blue-500',
                  buyer: 'bg-green-500',
                  'heavy-user': 'bg-amber-500',
                  inactive: 'bg-slate-400',
                  unassigned: 'bg-slate-300',
                };
                return (
                  <div key={seg.segment} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${segColors[seg.segment] || 'bg-slate-400'}`} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-24 capitalize">
                      {seg.segment}
                    </span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-4">
                      <div
                        className={`h-full rounded-full ${segColors[seg.segment] || 'bg-slate-400'} opacity-70`}
                        style={{
                          width: `${Math.max(
                            (seg.count / Math.max(...segmentData.map((s: any) => s.count), 1)) * 100,
                            5
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white w-10 text-right">
                      {seg.count}
                    </span>
                    <span className="text-xs text-slate-400 w-16 text-right">
                      Avg: {seg.avgScore}
                    </span>
                  </div>
                );
              }
            )}
            {segmentData.length === 0 && (
              <p className="text-center text-slate-400 py-8">Nenhum dado de segmento</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
