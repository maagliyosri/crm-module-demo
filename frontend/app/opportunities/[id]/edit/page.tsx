'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  clientId: string;
}

const STAGE_LABELS: Record<PipelineStage, string> = {
  LEAD: 'Lead',
  QUALIFIED: 'Qualifié',
  PROPOSAL: 'Proposition',
  NEGOTIATION: 'Négociation',
  WON: 'Gagné',
  LOST: 'Perdu',
};

function clientName(c: Client): string {
  if (c.type === 'COMPANY') return c.companyName ?? '—';
  return [c.firstName, c.lastName].filter(Boolean).join(' ') || '—';
}

export default function EditOpportunityPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({
    title: '',
    amount: '',
    expectedCloseDate: '',
    stage: 'LEAD' as PipelineStage,
    clientId: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch<Opportunity & { client: Client }>(`/opportunities/${id}`),
      apiFetch<{ data: Client[] }>('/clients?limit=100'),
    ])
      .then(([opp, clientsRes]) => {
  // Fix: handle both { data: [...] } and [...] shapes
  const list = Array.isArray(clientsRes) ? clientsRes : clientsRes.data;
  setClients(Array.isArray(list) ? list : []);

  const dateOnly = new Date(opp.expectedCloseDate).toISOString().split('T')[0];
  setForm({
    title: opp.title,
    amount: String(opp.amount),
    expectedCloseDate: dateOnly,
    stage: opp.stage,
    clientId: opp.clientId,
    notes: opp.notes ?? '',
  });
})
.catch((e) => {
  setError(e.message);
  setClients([]); // ← prevent undefined on error
})
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      await apiFetch(`/opportunities/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
        }),
      });
      router.push(`/opportunities/${id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-400">Chargement...</p>;

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Modifier l'opportunité</h1>

      <div className="space-y-4 mb-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€) *</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            min="0"
            step="100"
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>

        {/* Expected close date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date de clôture prévue *</label>
          <input
            type="date"
            name="expectedCloseDate"
            value={form.expectedCloseDate}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>

        {/* Client */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
          <select
            name="clientId"
            value={form.clientId}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-gray-400 transition-colors"
          >
            <option value="">Sélectionner un client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {clientName(c)}
              </option>
            ))}
          </select>
        </div>

        {/* Stage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Étape</label>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(STAGE_LABELS) as PipelineStage[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, stage: s }))}
                className={`text-sm px-3 py-1.5 rounded border transition-colors ${
                  form.stage === s
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {STAGE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-gray-400 transition-colors resize-none"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-gray-900 text-white text-sm px-5 py-2 rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Enregistrement...' : 'Sauvegarder'}
        </button>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 px-5 py-2 rounded border border-gray-200 hover:border-gray-400 transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}