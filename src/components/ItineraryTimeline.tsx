import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  Utensils,
  Camera,
  Car,
  Palmtree,
  Moon,
  Compass,
  Edit3,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { Trip, DayPlan, ItineraryItem } from '../types';

interface ItineraryTimelineProps {
  trip: Trip;
  onEditActivityImage: (item: ItineraryItem, dayNumber: number) => void;
  onAddActivity: (dayNumber: number) => void;
}

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({
  trip,
  onEditActivityImage,
  onAddActivity,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const currentDay: DayPlan = trip.days[selectedDayIndex] || trip.days[0];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food':
        return <Utensils className="w-3.5 h-3.5" />;
      case 'culture':
        return <Camera className="w-3.5 h-3.5" />;
      case 'transport':
        return <Car className="w-3.5 h-3.5" />;
      case 'nature':
        return <Palmtree className="w-3.5 h-3.5" />;
      case 'nightlife':
        return <Moon className="w-3.5 h-3.5" />;
      default:
        return <Compass className="w-3.5 h-3.5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'culture':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'transport':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'nature':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'nightlife':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title & Day Selector */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
              <span>{trip.flag} {trip.destination}</span>
              <span>•</span>
              <span>{trip.daysCount} Dias de Viagem</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Roteiro & Concierge Diário
            </h2>
          </div>

          <button
            onClick={() => onAddActivity(currentDay.dayNumber)}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Atividade</span>
          </button>
        </div>

        {/* Day Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {trip.days.map((day, idx) => {
            const isSelected = selectedDayIndex === idx;
            return (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 ring-2 ring-blue-600/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>Dia {day.dayNumber}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                }`}>
                  {day.date.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Current Day Sub-header */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">
                Dia {currentDay.dayNumber}: {currentDay.title}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200/60">
                {currentDay.weather.temp} • {currentDay.weather.condition}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{currentDay.note}</p>
          </div>
          <span className="text-xs font-medium text-slate-400">
            {currentDay.items.length} paradas planejadas
          </span>
        </div>
      </div>

      {/* AI Suggestion Banner (Specified in Design System) */}
      <div className="rounded-2xl p-4 sm:p-5 border border-blue-200/60 shadow-sm relative overflow-hidden bg-gradient-to-r from-blue-500/8 via-sky-500/5 to-emerald-500/8">
        <div className="flex items-start gap-3 relative z-10">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-700">
                Sugestão Proativa do Concierge IA
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Otimizado
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              O fluxo de visitantes no <strong>{currentDay.items[0]?.title || 'ponto principal'}</strong> atinge o pico entre 11h e 13h. 
              Sua programação está perfeitamente alinhada para evitar filas e garantir luz fotográfica ideal!
            </p>
          </div>
        </div>
      </div>

      {/* Chronological Time-Rail with Connected Line */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-sky-400 before:to-emerald-400">
        {currentDay.items.map((item, index) => (
          <div key={item.id} className="relative group">
            {/* Time-Rail Bullet Node */}
            <div className="absolute -left-6 sm:-left-8 top-4 w-5 h-5 rounded-full bg-white border-2 border-blue-600 shadow-sm flex items-center justify-center z-10 group-hover:scale-125 transition-transform">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            </div>

            {/* Activity Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden p-4 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Image Media Container with Direct Link Preview */}
                <div className="md:col-span-4 relative rounded-xl overflow-hidden aspect-video md:aspect-[4/3] bg-slate-100 shadow-inner group/img">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  {/* Direct Link Tag overlay */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-mono px-2 py-0.5 rounded-md truncate max-w-[140px]" title={item.directImageLink}>
                      Link direto HTML
                    </span>
                    <button
                      onClick={() => onEditActivityImage(item, currentDay.dayNumber)}
                      className="bg-white text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow flex items-center gap-1 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                      title="Editar link direto de imagem HTML"
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                      <span>Trocar</span>
                    </button>
                  </div>
                </div>

                {/* Content & Details */}
                <div className="md:col-span-8 space-y-2.5">
                  {/* Top Bar: Time, Category & Booking */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60">
                        <Clock className="w-3 h-3" />
                        {item.time} ({item.duration})
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border flex items-center gap-1 capitalize ${getCategoryColor(
                          item.category
                        )}`}
                      >
                        {getCategoryIcon(item.category)}
                        {item.category}
                      </span>
                    </div>

                    {/* Booking / Confirmation Tag */}
                    {item.isConfirmed ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {item.bookingCode ? `Confirmado: ${item.bookingCode}` : 'Confirmado'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Em aberto
                      </span>
                    )}
                  </div>

                  {/* Title & Location */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.location}</span>
                    </div>
                  </div>

                  {/* Notes / Tips */}
                  {item.notes && (
                    <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600 border border-slate-200/50 flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span>{item.notes}</span>
                    </div>
                  )}

                  {/* Bottom: Cost Tag in Emerald (#10b981) */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400">Impacto no orçamento:</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.cost === 0 ? 'Gratuito' : `€ ${item.cost}`}
                      </span>
                    </div>
                    {item.rating && (
                      <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                        ★ {item.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
