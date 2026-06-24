'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Client } from '@/lib/types';

const STAGE_LABELS: Record<string, string> = {
  LEAD: 'Lead',
  QUALIFIED: 'Qualifié',
  PROPOSAL: 'Proposition',
  NEGOTIATION: 'Négociation',
  WON: 'Gagné',
  LOST: 'Perdu',
};

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<Client>(`/clients/${id}`)
      .then(setClient)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Supprimer ce client ?')) return;
    await apiFetch(`/clients/${id}`, { method: 'DELETE' });
    router.push('/clients');
  };

  const getLabel = (c: Client) =>
    c.type === 'COMPANY'
      ? c.companyName
      : `${c.firstName} ${c.lastName}`;

  if (loading) return <p className="text-sm text-gray-400">Chargement...</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (!client) return null;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {getLabel(client)}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{client.email}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/clients/${id}/edit`}
            className="text-sm px-4 py-2 rounded border border-gray-200 hover:border-gray-400 transition-colors"
          >
            Modifier
          </Link>
          <button
            onClick={handleDelete}
            className="text-sm px-4 py-2 rounded border border-red-200 text-red-500 hover:border-red-400 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>

      {/* Infos client */}
      <div className="border border-gray-200 rounded-lg bg-white p-5 mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">
          Informations
        </h2>
        <dl className="space-y-2">
          <Row label="Type" value={client.type === 'COMPANY' ? 'Entreprise' : 'Particulier'} />
          {client.phone && <Row label="Téléphone" value={client.phone} />}
          {client.type === 'COMPANY' && (
            <>
              {client.siret && <Row label="SIRET" value={client.siret} />}
              {client.contactName && <Row label="Contact" value={`${client.contactName}${client.contactRole ? ` — ${client.contactRole}` : ''}`} />}
            </>
          )}
        </dl>
      </div>

      {/* Opportunités liées */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-700">
            Opportunités ({client.opportunities.length})
          </h2>
          <Link
            href={`/opportunities/new?clientId=${id}`}
            className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
          >
            + Ajouter
          </Link>
        </div>
        {client.opportunities.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune opportunité.</p>
        ) : (
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg bg-white">
            {client.opportunities.map((opp) => (
              <Link
                key={opp.id}
                href={`/opportunities/${opp.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm text-gray-900">{opp.title}</p>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {Number(opp.amount).toLocaleString('fr-FR')} €
                  </span>
                  <span className="text-xs text-gray-400">
                    {STAGE_LABELS[opp.stage]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <dt className="text-sm text-gray-400 w-28 shrink-0">{label}</dt>
      <dd className="text-sm text-gray-900">{value}</dd>
    </div>
  );
}