'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Client, ClientType } from '@/lib/types';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filter, setFilter] = useState<ClientType | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const query = filter ? `?type=${filter}` : '';
    apiFetch<Client[]>(`/clients${query}`)
      .then(setClients)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filter]);

  const getLabel = (client: Client) =>
    client.type === 'COMPANY'
      ? client.companyName
      : `${client.firstName} ${client.lastName}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
        <Link
          href="/clients/new"
          className="bg-gray-900 text-white text-sm px-4 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          + Nouveau client
        </Link>
      </div>

      {/* Filtre */}
      <div className="flex gap-2 mb-6">
        {(['', 'COMPANY', 'INDIVIDUAL'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`text-sm px-3 py-1.5 rounded border transition-colors ${
              filter === t
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {t === '' ? 'Tous' : t === 'COMPANY' ? 'Entreprises' : 'Particuliers'}
          </button>
        ))}
      </div>

      {/* États */}
      {loading && (
        <p className="text-sm text-gray-400">Chargement...</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Liste */}
      {!loading && !error && clients.length === 0 && (
        <p className="text-sm text-gray-400">Aucun client trouvé.</p>
      )}

      <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg bg-white">
        {clients.map((client) => (
          <Link
            key={client.id}
            href={`/clients/${client.id}`}
            className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">
                {getLabel(client)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{client.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400">
                {client.opportunities.length} opportunité
                {client.opportunities.length !== 1 ? 's' : ''}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  client.type === 'COMPANY'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-purple-50 text-purple-600'
                }`}
              >
                {client.type === 'COMPANY' ? 'Entreprise' : 'Particulier'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}