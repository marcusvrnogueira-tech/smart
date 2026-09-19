import React, { useState } from 'react';
import { X, Compass, Image as ImageIcon, Calendar, Wallet } from 'lucide-react';
import { Trip } from '../types';
import { IMAGE_PRESETS } from '../data/mockData';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newTrip: Trip) => void;
}

export const CreateTripModal: React.FC<CreateTripModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [country, setCountry] = useState('');
  const [flag, setFlag] = useState('✈️');
  const [dateRange, setDateRange] = useState('');
  const [daysCount, setDaysCount] = useState(5);
  const [budgetTotal, setBudgetTotal] = useState(2500);
  const [currency, setCurrency] = useState('USD ($)');
  const [tagsInput, setTagsInput] = useState('Praia & Mar, Gastronomia');
  const [coverImageUrl, setCoverImageUrl] = useState(IMAGE_PRESETS[0].url);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !destination) return;

    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      title,
      destination,
      country: country || destination,
      flag,
      coverImageUrl,
      directImageLink: coverImageUrl,
      dateRange: dateRange || 'Datas a definir',
      daysCount: Number(daysCount),
      budgetTotal: Number(budgetTotal),
      budgetSpent: 0,
      currency,
      status: 'upcoming',
      rating: 5.0,
      tags: tags.length > 0 ? tags : ['Viagem Inteligente'],
      weatherSummary: {
        temp: '25°C',
        condition: 'Ensolarado',
        icon: 'Sun',
      },
      budgetItems: [],
      days: [
        {
          dayNumber: 1,
          date: 'Dia 1',
          title: `Chegada em ${destination}`,
          note: 'Dia livre para aclimatação e explorar as redondezas.',
          weather: { temp: '25°C', condition: 'Agradável', rainProb: '0%', icon: 'Sun' },
          items: [
            {
              id: `item-${Date.now()}-1`,
              time: '14:00',
              title: `Check-in em ${destination}`,
              category: 'transport',
              location: destination,
              cost: 0,
              duration: '1h',
              imageUrl: coverImageUrl,
              directImageLink: coverImageUrl,
              notes: 'Desembarque e acomodação.',
              rating: 5.0,
              isConfirmed: true,
            },
          ],
        },
      ],
    };

    onCreate(newTrip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Criar Novo Roteiro de Viagem
              </h3>
              <p className="text-xs text-slate-500">
                Insira os dados do destino e o link direto para a imagem de capa.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nome da Viagem
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Férias em Fernando de Noronha"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Destino / Cidade
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Fernando de Noronha, PE"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                País
              </label>
              <input
                type="text"
                placeholder="Brasil"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Bandeira (Emoji)
              </label>
              <input
                type="text"
                placeholder="🇧🇷"
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Duração (dias)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={daysCount}
                onChange={(e) => setDaysCount(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Período / Datas
              </label>
              <input
                type="text"
                placeholder="Ex: 10 Nov - 16 Nov, 2026"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Orçamento Previsto
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={budgetTotal}
                  onChange={(e) => setBudgetTotal(Number(e.target.value))}
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="text-xs p-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="BRL (R$)">BRL (R$)</option>
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Direct Image Link URL */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Link Direto da Imagem de Capa (URL HTML):
            </label>
            <input
              type="url"
              required
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />

            {/* Quick Presets row */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
              {IMAGE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setCoverImageUrl(p.url)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                    coverImageUrl === p.url
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {p.title.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Preview */}
            <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mt-2">
              <img
                src={coverImageUrl}
                alt="Preview Capa"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20"
            >
              Criar Viagem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
