'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { ClientType } from '@/lib/types';

export default function NewClientPage() {
  const router = useRouter();
  const [type, setType] = useState<ClientType>('COMPANY');
  const [form, setForm] = useState({
    email: '',
    phone: '',
    companyName: '',
    siret: '',
    contactName: '',
    contactRole: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      await apiFetch('/clients', {
        method: 'POST',
        body: JSON.stringify({ type, ...form }),
      });
      router.push('/clients');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        Nouveau client
      </h1>

      {/* Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type de client
        </label>
        <div className="flex gap-2">
          {(['COMPANY', 'INDIVIDUAL'] as ClientType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`text-sm px-4 py-2 rounded border transition-colors ${
                type === t
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {t === 'COMPANY' ? 'Entreprise' : 'Particulier'}
            </button>
          ))}
        </div>
      </div>

      {/* Champs communs */}
      <div className="space-y-4 mb-6">
        <Field label="Email *" name="email" value={form.email} onChange={handleChange} type="email" />
        <Field label="Téléphone" name="phone" value={form.phone} onChange={handleChange} />
      </div>

      {/* Champs entreprise */}
      {type === 'COMPANY' && (
        <div className="space-y-4 mb-6">
          <Field label="Raison sociale *" name="companyName" value={form.companyName} onChange={handleChange} />
          <Field label="SIRET" name="siret" value={form.siret} onChange={handleChange} />
          <Field label="Contact principal" name="contactName" value={form.contactName} onChange={handleChange} />
          <Field label="Poste du contact" name="contactRole" value={form.contactRole} onChange={handleChange} />
        </div>
      )}

      {/* Champs particulier */}
      {type === 'INDIVIDUAL' && (
        <div className="space-y-4 mb-6">
          <Field label="Prénom *" name="firstName" value={form.firstName} onChange={handleChange} />
          <Field label="Nom *" name="lastName" value={form.lastName} onChange={handleChange} />
        </div>
      )}

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-gray-900 text-white text-sm px-5 py-2 rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Enregistrement...' : 'Créer le client'}
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

function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition-colors"
      />
    </div>
  );
}