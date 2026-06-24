'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { PipelineStage, ClientType } from '@/lib/types';

interface Client {
  id: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  type: ClientType;
  email?: string;
  phone?: string;
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

const STAGE_LABELS: Record<PipelineStage, string> = {
  LEAD: 'Lead',
  QUALIFIED: 'Qualifié',
  PROPOSAL: 'Proposition',
  NEGOTIATION: 'Négociation',
  WON: 'Gagné',
  LOST: 'Perdu',
};

const STAGE_ORDER: PipelineStage[] = ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON'];

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
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [updatingStage, setUpdatingStage] = useState(false);

  useEffect(() => {
    apiFetch<Opportunity>(`/opportunities/${id}`)
      .then(setOpp)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStageChange = async (stage: PipelineStage) => {
    if (!opp || updatingStage) return;
    setUpdatingStage(true);
    try {
      const updated = await apiFetch<Opportunity>(`/opportunities/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ stage }),
      });
      setOpp(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setUpdatingStage(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer cette opportunité ?')) return;
    setDeleting(true);
    try {
      await apiFetch(`/opportunities/${id}`, { method: 'DELETE' });
      router.push('/opportunities');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur');
      setDeleting(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-400">Chargement...</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (!opp) return null;

  const isOverdue =
    new Date(opp.expectedCloseDate) < new Date() &&
    opp.stage !== 'WON' &&
    opp.stage !== 'LOST';

  return (
    <div className="max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/opportunities" className="hover:text-gray-600 transition-colors">
          Opportunités
        </Link>
        <span>/</span>
        <span className="text-gray-600">{opp.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {opp.isAtRisk && (
              <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                ⚠ À risque
              </span>
            )}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STAGE_COLORS[opp.stage]}`}>
              {STAGE_LABELS[opp.stage]}
            </span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">{opp.title}</h1>
          <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">
            {formatAmount(opp.amount)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/opportunities/${id}/edit`}
            className="text-sm px-4 py-2 rounded border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors"
          >
            Modifier
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm px-4 py-2 rounded border border-red-100 text-red-500 hover:border-red-300 transition-colors disabled:opacity-50"
          >
            {deleting ? '...' : 'Supprimer'}
          </button>
        </div>
      </div>

      {/* Pipeline progress */}
      <div className="bg-white border border-gray-100 rounded-lg p-4 mb-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Avancement</p>
        <div className="flex gap-1">
          {STAGE_ORDER.map((stage, i) => {
            const currentIndex = STAGE_ORDER.indexOf(opp.stage as PipelineStage);
            const isActive = stage === opp.stage;
            const isPast = currentIndex > i;
            const isLost = opp.stage === 'LOST';

            return (
              <button
                key={stage}
                onClick={() => handleStageChange(stage)}
                disabled={updatingStage}
                className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
                  isLost
                    ? 'bg-gray-100 text-gray-400'
                    : isActive
                    ? 'bg-gray-900 text-white'
                    : isPast
                    ? 'bg-gray-200 text-gray-600'
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
              >
                {STAGE_LABELS[stage]}
              </button>
            );
          })}
        </div>
        {opp.stage !== 'WON' && opp.stage !== 'LOST' && (
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => handleStageChange('WON')}
              disabled={updatingStage}
              className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              ✓ Marquer gagnée
            </button>
            <button
              onClick={() => handleStageChange('LOST')}
              disabled={updatingStage}
              className="text-xs text-red-500 bg-red-50 px-3 py-1 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              ✕ Marquer perdue
            </button>
          </div>
        )}
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <InfoCard label="Client">
          <Link href={`/clients/${opp.client.id}`} className="text-gray-900 hover:underline font-medium">
            {clientName(opp.client)}
          </Link>
          {opp.client.email && <p className="text-xs text-gray-400 mt-0.5">{opp.client.email}</p>}
        </InfoCard>
        <InfoCard label="Clôture prévue">
          <p className={`font-medium ${isOverdue ? 'text-red-500' : 'text-gray-900'}`}>
            {formatDate(opp.expectedCloseDate)}
          </p>
          {isOverdue && <p className="text-xs text-red-400 mt-0.5">En retard</p>}
        </InfoCard>
        <InfoCard label="Créée le">
          <p className="text-gray-700">{formatDate(opp.createdAt)}</p>
        </InfoCard>
        <InfoCard label="Mise à jour">
          <p className="text-gray-700">{formatDate(opp.updatedAt)}</p>
        </InfoCard>
      </div>

      {/* Notes */}
      {opp.notes && (
        <div className="bg-white border border-gray-100 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Notes</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{opp.notes}</p>
        </div>
      )}

      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
    </div>
  );
}

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg px-4 py-3">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {children}
    </div>
  );
}