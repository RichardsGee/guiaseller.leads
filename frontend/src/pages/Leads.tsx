import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leadsAPI, type LeadFilters } from '../services/api';
import {
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ArrowUpDown,
} from 'lucide-react';

const MARKETPLACES = ['ML', 'Shopee', 'Magalu', 'TikTok', 'Amazon', 'Shein'];
const SEGMENTS = ['founder', 'seller', 'buyer', 'heavy-user', 'inactive'];
const STATUSES = ['active', 'inactive', 'archived'];

const marketplaceColors: Record<string, string> = {
  ML: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  Shopee: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  Magalu: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  TikTok: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
  Amazon: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  Shein: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
};

function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400';
  if (score >= 60) return 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400';
  if (score >= 40) return 'text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400';
  if (score >= 20) return 'text-orange-600 bg-orange-50 dark:bg-orange-950 dark:text-orange-400';
  return 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400';
}

export function LeadsPage() {
  const [filters, setFilters] = useState<LeadFilters>({
    page: 1,
    limit: 20,
    sort: 'createdAt',
    order: 'desc',
  });
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['leads', filters],
    queryFn: () => leadsAPI.list(filters),
  });

  const leads = data?.data?.leads || [];
  const pagination = data?.data?.pagination;

  const handleSearch = (value: string) => {
    setSearch(value);
    setFilters((f) => ({ ...f, search: value || undefined, page: 1 }));
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar por nome, email..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
            showFilters
              ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-950'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros
        </button>

        <button
          onClick={() => refetch()}
          className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          title="Atualizar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Novo Lead
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined, page: 1 }))}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm"
            >
              <option value="">Todos</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Marketplace</label>
            <select
              value={filters.marketplace || ''}
              onChange={(e) => setFilters((f) => ({ ...f, marketplace: e.target.value || undefined, page: 1 }))}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm"
            >
              <option value="">Todos</option>
              {MARKETPLACES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Segmento</label>
            <select
              value={filters.segment || ''}
              onChange={(e) => setFilters((f) => ({ ...f, segment: e.target.value || undefined, page: 1 }))}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm"
            >
              <option value="">Todos</option>
              {SEGMENTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                {['Nome', 'Email', 'Marketplace', 'Score', 'Segmento', 'Status', 'Criado em'].map(
                  (header) => (
                    <th
                      key={header}
                      className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      <button className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300">
                        {header}
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Nenhum lead encontrado
                  </td>
                </tr>
              ) : (
                leads.map((lead: any) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {lead.firstName} {lead.lastName}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{lead.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          marketplaceColors[lead.primaryMarketplace] || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {lead.primaryMarketplace}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${scoreColor(
                          lead.leadScore
                        )}`}
                      >
                        {lead.leadScore}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500 capitalize">
                        {lead.segment || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs ${
                          lead.status === 'active'
                            ? 'text-green-600'
                            : lead.status === 'inactive'
                            ? 'text-yellow-600'
                            : 'text-slate-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            lead.status === 'active'
                              ? 'bg-green-500'
                              : lead.status === 'inactive'
                              ? 'bg-yellow-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
            <span className="text-sm text-slate-500">
              {pagination.total} leads — Página {pagination.page} de {pagination.totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, (f.page || 1) - 1) }))}
                disabled={pagination.page <= 1}
                className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
