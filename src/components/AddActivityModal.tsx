import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, DollarSign, Image as ImageIcon } from 'lucide-react';
import { ItineraryItem } from '../types';
import { IMAGE_PRESETS } from '../data/mockData';

interface AddActivityModalProps {
  isOpen: boolean;
  dayNumber: number;
  onClose: () => void;
  onAdd: (item: Omit<ItineraryItem, 'id'>) => void;
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  dayNumber,
  onClose,
  onAdd,
}) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('11:00');
  const [duration, setDuration] = useState('1h 30m');
  const [category, setCategory] = useState<ItineraryItem['category']>('culture');
  const [location, setLocation] = useState('');
  const [cost, setCost] = useState(25);
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState(IMAGE_PRESETS[1].url);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location) return;

    onAdd({
      title,
      time,
      duration,
      category,
      location,
      cost: Number(cost),
      notes,
      imageUrl,
      directImageLink: imageUrl,
      isConfirmed: true,
      rating: 4.9,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Nova Atividade — Dia {dayNumber}
            </h3>
            <p className="text-xs text-slate-500">
              Adicione uma parada com horário e link direto da foto.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Título da Atividade
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Degustação de Vinhos no Pôr do Sol"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Horário
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Duração estimada
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Ex: 2h"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="culture">Cultura & Passeio</option>
                <option value="food">Gastronomia</option>
                <option value="nature">Natureza / Trilha</option>
                <option value="relax">Relaxamento / Praia</option>
                <option value="transport">Transporte / Barco</option>
                <option value="nightlife">Vida Noturna</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Custo estimado (€ ou $)
              </label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Localização / Endereço
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Marina Grande ou Belvedere Panorâmico"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Link Direto da Imagem (URL HTML)
            </label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Dicas ou Observações
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Levar calçado confortável, reserva confirmada sob nome X."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            >
              Adicionar ao Roteiro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
