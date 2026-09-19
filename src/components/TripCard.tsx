import React from 'react';
import { Star, MapPin, Calendar, Wallet, ExternalLink, Edit3, CloudSun, CheckCircle2 } from 'lucide-react';
import { Trip } from '../types';

interface TripCardProps {
  trip: Trip;
  isActive: boolean;
  onSelect: (trip: Trip) => void;
  onEditImage: (trip: Trip) => void;
  onViewItinerary: (trip: Trip) => void;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  isActive,
  onSelect,
  onEditImage,
  onViewItinerary,
}) => {
  const budgetPercentage = Math.min(100, Math.round((trip.budgetSpent / trip.budgetTotal) * 100));

  return (
    <div
      id={`trip-card-${trip.id}`}
      className={`group relative bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
        isActive
          ? 'border-blue-500/80 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20'
          : 'border-slate-200/80 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* 16:10 Aspect Ratio Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={trip.coverImageUrl}
          alt={trip.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // Fallback if URL fails to load
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
          }}
        />

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {/* Status & Flag */}
          <div className="flex items-center gap-1.5">
            <span className="bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <span>{trip.flag}</span>
              <span>{trip.country}</span>
            </span>
            {isActive && (
              <span className="bg-emerald-500 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Em Andamento
              </span>
            )}
          </div>

          {/* Rating & Weather */}
          <div className="flex items-center gap-1.5">
            <span className="bg-white/90 backdrop-blur-md text-amber-600 text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              {trip.rating}
            </span>
            <span className="bg-black/40 backdrop-blur-md text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
              <CloudSun className="w-3.5 h-3.5 text-sky-300" />
              {trip.weatherSummary.temp}
            </span>
          </div>
        </div>

        {/* Edit Image Link Floating Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditImage(trip);
          }}
          className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-md shadow-md border border-white/50 flex items-center gap-1 transition-all cursor-pointer active:scale-95"
          title="Editar link direto da imagem HTML"
        >
          <Edit3 className="w-3 h-3 text-blue-600" />
          <span>Trocar Link</span>
        </button>

        {/* Bottom Title Overlay */}
        <div className="absolute bottom-3 left-3 right-24 text-white">
          <h3 className="text-lg sm:text-xl font-bold tracking-tight drop-shadow-sm leading-tight">
            {trip.title}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-white/90 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>{trip.destination}</span>
          </div>
        </div>
      </div>

      {/* Body Information */}
      <div className="p-4 space-y-3">
        {/* Date & Tags */}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{trip.dateRange}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>{trip.daysCount} dias</span>
          </div>
        </div>

        {/* Travel Style Tags */}
        <div className="flex flex-wrap gap-1.5">
          {trip.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Budget Progress Bar */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-slate-600 font-medium">
              <Wallet className="w-3.5 h-3.5 text-slate-400" />
              <span>Orçamento:</span>
            </div>
            <span className="font-bold text-slate-800">
              {trip.currency} {trip.budgetSpent.toLocaleString()} / {trip.budgetTotal.toLocaleString()}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                budgetPercentage > 85
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-blue-600 to-sky-500'
              }`}
              style={{ width: `${budgetPercentage}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onSelect(trip)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {isActive ? 'Viagem Selecionada' : 'Selecionar Viagem'}
          </button>
          <button
            onClick={() => onViewItinerary(trip)}
            className="py-2 px-3.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/70 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>Ver Roteiro</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
