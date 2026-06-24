'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { PipelineStage, ClientType } from '@/lib/types';

interface Client {
  id: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  type: ClientType;
}

interface Opportunity {
  id: string;
  title: string;
  amount: number;
  expectedCloseDate: string;
  stage: PipelineStage;
  notes?: string;
  isAtRisk: boolean;
  client: Client;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedOpportunities {
  data: Opportunity[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

interface PipelineSummary {
  pipelineTotal: number;
  byStage: { stage: PipelineStage; count: number; total: number }[];
  atRisk: number;
  conversionRate: number;
}

const STAGE_LABELS: Record<PipelineStage, string> = {
  LEAD: 'Lead',
  QUALIFIED: 'Qualifié',
  PROPOSAL: 'Proposition',
  NEGOTIATION: 'Négociation',
  WON: 'Gagné',
  LOST: 'Perdu',
};

const STAGE_COLORS: Record<PipelineStage, string> = {
  LEAD: 'bg-gray-100 text-gray-600',
  QUALIFIED: 'bg-blue-50 text-blue-600',
  PROPOSAL: 'bg-yellow-50 text-yellow-700',
  NEGOTIATION: 'bg-orange-50 text-orange-700',
  WON: 'bg-green-50 text-green-700',
  LOST: 'bg-red-50 text-red-600',
};

function clientName(client: Client): string {
  if (client.type === 'COMPANY') return client.companyName ?? '—';
  return [client.firstName, client.lastName].filter(Boolean).join(' ') || '—';
}

function formatAmount(n: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function OpportunitiesPage() {
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [summary, setSummary] = useState<PipelineSummary | null>(null);
  const [stageFilter, setStageFilter] = useState<PipelineStage | ''>('');
  const [clientTypeFilter, setClientTypeFilter] = useState<ClientType | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (stageFilter) params.set('stage', stageFilter);
      if (clientTypeFilter) params.set('clientType', clientTypeFilter);

      const [listRes, summaryRes] = await Promise.all([
        apiFetch<PaginatedOpportunities>(`/opportunities?${params}`),
        apiFetch<PipelineSummary>('/opportunities/pipeline'),
      ]);

      setOpps(listRes.data);
      setMeta(listRes.meta);
      setSummary(summaryRes);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageFilter, clientTypeFilter]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Opportunités</h1>
          {summary && (
            <p className="text-sm text-gray-400 mt-0.5">
              {meta.total} opportunité{meta.total !== 1 ? 's' : ''} · Pipeline{' '}
              {formatAmount(summary.pipelineTotal)}
            </p>
          )}
        </div>
        <Link
          href="/opportunities/new"
          className="bg-gray-900 text-white text-sm px-4 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          + Nouvelle opportunité
        </Link>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Pipeline total" value={formatAmount(summary.pipelineTotal)} />
          <KpiCard label="Taux de conversion" value={`${summary.conversionRate}%`} />
          <KpiCard
            label="À risque"
            value={String(summary.atRisk)}
            accent={summary.atRisk > 0 ? 'red' : undefined}
          />
          <KpiCard
            label="Gagnées"
            value={String(summary.byStage.find((s) => s.stage === 'WON')?.count ?? 0)}
            accent="green"
          />
        </div>
      )}

      {/* Pipeline par étape */}
      {summary && (
        <div className="bg-white border border-gray-100 rounded-lg p-4 mb-6 overflow-x-auto">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Entonnoir</p>
          <div className="flex gap-2 min-w-max">
            {summary.byStage
              .filter((s) => s.stage !== 'WON' && s.stage !== 'LOST')
              .map((s) => (
                <button
                  key={s.stage}
                  onClick={() => setStageFilter(stageFilter === s.stage ? '' : s.stage)}
                  className={`flex-1 min-w-[110px] text-left p-3 rounded border transition-colors ${
                    stageFilter === s.stage
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <p className={`text-xs mb-1 ${stageFilter === s.stage ? 'text-gray-300' : 'text-gray-400'}`}>
                    {STAGE_LABELS[s.stage]}
                  </p>
                  <p className={`text-sm font-semibold ${stageFilter === s.stage ? 'text-white' : 'text-gray-900'}`}>
                    {s.count}
                  </p>
                  <p className={`text-xs ${stageFilter === s.stage ? 'text-gray-300' : 'text-gray-500'}`}>
                    {formatAmount(s.total)}
                  </p>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value as PipelineStage | '')}
          className="text-sm border border-gray-200 rounded px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:border-gray-400"
        >
          <option value="">Toutes les étapes</option>
          {(Object.keys(STAGE_LABELS) as PipelineStage[]).map((s) => (
            <option key={s} value={s}>{STAGE_LABELS[s]}</option>
          ))}
        </select>
        <select
          value={clientTypeFilter}
          onChange={(e) => setClientTypeFilter(e.target.value as ClientType | '')}
          className="text-sm border border-gray-200 rounded px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:border-gray-400"
        >
          <option value="">Tous les clients</option>
          <option value="COMPANY">Entreprises</option>
          <option value="INDIVIDUAL">Particuliers</option>
        </select>
        {(stageFilter || clientTypeFilter) && (
          <button
            onClick={() => { setStageFilter(''); setClientTypeFilter(''); }}
            className="text-sm text-gray-400 hover:text-gray-600 px-2"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {/* Table */}
      {loading ? (
        <p className="text-sm text-gray-400">Chargement...</p>
      ) : opps.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">Aucune opportunité trouvée</p>
          <Link href="/opportunities/new" className="text-sm text-gray-900 underline mt-2 inline-block">
            Créer la première
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Titre</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Client</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Étape</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Montant</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Clôture prévue</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {opps.map((opp) => (
                  <tr key={opp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {opp.isAtRisk && (
                          <span title="À risque" className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        )}
                        <span className="text-gray-900 font-medium">{opp.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{clientName(opp.client)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STAGE_COLORS[opp.stage]}`}>
                        {STAGE_LABELS[opp.stage]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 font-medium tabular-nums">
                      {formatAmount(opp.amount)}
                    </td>
                    <td className={`px-4 py-3 ${new Date(opp.expectedCloseDate) < new Date() && opp.stage !== 'WON' && opp.stage !== 'LOST' ? 'text-red-500' : 'text-gray-500'}`}>
                      {formatDate(opp.expectedCloseDate)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/opportunities/${opp.id}`}
                        className="text-xs text-gray-400 hover:text-gray-900 transition-colors"
                      >
                        Voir →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => fetchData(p)}
                  className={`text-sm px-3 py-1 rounded border transition-colors ${
                    p === meta.page
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'red' | 'green';
}) {
  const valueColor =
    accent === 'red'
      ? 'text-red-600'
      : accent === 'green'
      ? 'text-green-600'
      : 'text-gray-900';

  return (
    <div className="bg-white border border-gray-100 rounded-lg px-4 py-3">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-lg font-semibold tabular-nums ${valueColor}`}>{value}</p>
    </div>
  );
}