'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { PipelineStage } from '@/lib/types';

interface StageStats {
  stage: PipelineStage;
  count: number;
  total: number;
}

interface PipelineSummary {
  pipelineTotal: number;
  byStage: StageStats[];
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

// Only active stages shown in the funnel (not WON/LOST)
const ACTIVE_STAGES: PipelineStage[] = [
  'LEAD',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
];

const STAGE_COLORS: Record<PipelineStage, string> = {
  LEAD: '#6366f1',
  QUALIFIED: '#8b5cf6',
  PROPOSAL: '#a855f7',
  NEGOTIATION: '#d946ef',
  WON: '#22c55e',
  LOST: '#ef4444',
};

function formatAmount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M €`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k €`;
  return `${n.toFixed(0)} €`;
}

export default function PipelinePage() {
  const [summary, setSummary] = useState<PipelineSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<PipelineSummary>('/pipeline/summary')
      .then(setSummary)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-gray-400">Chargement du pipeline…</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-red-500">{error || 'Données indisponibles'}</p>
      </div>
    );
  }

  const activeStages = summary.byStage.filter((s) =>
    ACTIVE_STAGES.includes(s.stage),
  );
  const maxCount = Math.max(...activeStages.map((s) => s.count), 1);

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Pipeline</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Récapitulatif commercial en temps réel
          </p>
        </div>
        <Link
          href="/opportunities/new"
          className="text-sm bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          + Nouvelle opportunité
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Valeur totale active"
          value={formatAmount(summary.pipelineTotal)}
          sub="opportunités ouvertes"
        />
        <KpiCard
          label="Opportunités à risque"
          value={String(summary.atRisk)}
          sub="en retard ou stagnantes"
          highlight={summary.atRisk > 0}
        />
        <KpiCard
          label="Taux de conversion"
          value={`${summary.conversionRate}%`}
          sub="sur les dossiers fermés"
        />
        <KpiCard
          label="Étapes actives"
          value={String(activeStages.reduce((s, x) => s + x.count, 0))}
          sub="opportunités en cours"
        />
      </div>

      {/* Funnel */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h2 className="text-sm font-medium text-gray-700 mb-6">
          Entonnoir de vente
        </h2>
        <div className="space-y-3">
          {activeStages.map((s) => {
            const widthPct = maxCount > 0 ? (s.count / maxCount) * 100 : 0;
            return (
              <div key={s.stage} className="flex items-center gap-4">
                <span className="w-28 text-xs text-gray-500 text-right shrink-0">
                  {STAGE_LABELS[s.stage]}
                </span>
                <div className="flex-1 bg-gray-50 rounded-full h-8 overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center px-3 transition-all duration-500"
                    style={{
                      width: `${Math.max(widthPct, s.count > 0 ? 6 : 0)}%`,
                      backgroundColor: STAGE_COLORS[s.stage],
                    }}
                  />
                </div>
                <div className="w-32 text-right shrink-0">
                  <span className="text-sm font-medium text-gray-900">
                    {s.count} opp.
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    {formatAmount(s.total)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage breakdown table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-700">
            Détail par étape
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Étape
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Opportunités
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Valeur totale
              </th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {summary.byStage.map((s) => (
              <tr
                key={s.stage}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: STAGE_COLORS[s.stage] }}
                    />
                    <span className="text-gray-900">
                      {STAGE_LABELS[s.stage]}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-3 text-right text-gray-700">
                  {s.count}
                </td>
                <td className="px-6 py-3 text-right font-medium text-gray-900">
                  {formatAmount(s.total)}
                </td>
                <td className="px-6 py-3 text-right">
                  <Link
                    href={`/opportunities?stage=${s.stage}`}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Voir →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* At-risk callout */}
      {summary.atRisk > 0 && (
        <div className="flex items-center gap-4 bg-red-50 border border-red-100 rounded-xl px-6 py-4">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">
              {summary.atRisk} opportunité
              {summary.atRisk > 1 ? 's' : ''} à risque
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              En retard sur leur date de clôture ou sans activité depuis 14 jours.
            </p>
          </div>
          <Link
            href="/opportunities?atRisk=true"
            className="text-sm text-red-700 border border-red-200 px-4 py-1.5 rounded hover:bg-red-100 transition-colors shrink-0"
          >
            Voir les dossiers
          </Link>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight
          ? 'bg-red-50 border-red-100'
          : 'bg-white border-gray-100'
      }`}
    >
      <p className={`text-2xl font-semibold ${highlight ? 'text-red-700' : 'text-gray-900'}`}>
        {value}
      </p>
      <p className="text-xs font-medium text-gray-700 mt-1">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}