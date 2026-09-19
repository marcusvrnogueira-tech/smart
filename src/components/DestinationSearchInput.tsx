// ==========================================================
// SMARTTRIP - COMPONENTE DE AUTOCOMPLETE DE DESTINOS
// Consome exclusivamente o contrato NormalizedDestination
// Nunca expõe JSON bruto de provedores para a UI
// ==========================================================

import React, { useState, useRef, useEffect } from 'react';
import { useDestinationSearch } from '../hooks/useDestinationSearch';
import { NormalizedDestination } from '../lib/geocoding';
import {
  MapPin,
  Search,
  X,
  Loader2,
  AlertCircle,
  Globe,
  Compass,
} from 'lucide-react';

const POPULAR_FALLBACKS: { city: string; country: string; query: string }[] = [
  { city: 'Montevidéu', country: 'Uruguai', query: 'Montevidéu, Uruguai' },
  { city: 'Buenos Aires', country: 'Argentina', query: 'Buenos Aires, Argentina' },
  { city: 'Paraty', country: 'Brasil', query: 'Paraty, Brasil' },
  { city: 'Gramado', country: 'Brasil', query: 'Gramado, Brasil' },
  { city: 'Paris', country: 'França', query: 'Paris, França' },
];

interface DestinationSearchInputProps {
  initialValue?: string;
  onSelect: (destination: NormalizedDestination) => void;
  placeholder?: string;
  className?: string;
}

export const DestinationSearchInput: React.FC<DestinationSearchInputProps> = ({
  initialValue = '',
  onSelect,
  placeholder = 'Digite o nome da cidade ou destino (ex: Santiago, Gramado, Paris)...',
  className = '',
}) => {
  const {
    query,
    setQuery,
    results,
    isLoading,
    error,
    selectedDestination,
    selectDestination,
    clear,
  } = useDestinationSearch(initialValue);

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (dest: NormalizedDestination) => {
    selectDestination(dest);
    onSelect(dest);
    setIsOpen(false);
  };

  const handleFallbackClick = (term: string) => {
    setQuery(term);
    setIsOpen(true);
  };

  const showEmptyResults = !isLoading && !error && query.trim().length >= 3 && results.length === 0;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input de Busca */}
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <MapPin className="w-5 h-5 text-indigo-500" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 3 || results.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-11 pr-10 py-3 rounded-2xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-slate-900 dark:text-white transition-all"
        />

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />}
          {query && !isLoading && (
            <button
              type="button"
              onClick={clear}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              title="Limpar campo"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown de Resultados / Desambiguação */}
      {isOpen && (results.length > 0 || isLoading || showEmptyResults || error) && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 max-h-80 overflow-y-auto">
          {/* Estado de Carregamento */}
          {isLoading && results.length === 0 && (
            <div className="p-4 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Buscando e normalizando destinos...</span>
            </div>
          )}

          {/* Estado de Erro */}
          {error && (
            <div className="p-3.5 m-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 border border-rose-200/50">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Lista de Resultados Normalizados */}
          {results.length > 0 && (
            <div className="py-1 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">
                Selecione o destino correspondente:
              </div>
              {results.map((dest) => (
                <button
                  key={dest.id}
                  type="button"
                  onClick={() => handleSelect(dest)}
                  className="w-full px-4 py-3 text-left hover:bg-indigo-50/60 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {dest.city}
                      </span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase">
                        {dest.countryCode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {dest.state ? `${dest.state}, ` : ''}{dest.country}
                    </p>
                  </div>

                  <span className="text-[11px] font-medium text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Selecionar
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Estado de Destino Inexistente (Empty State) */}
          {showEmptyResults && (
            <div className="p-5 text-center space-y-3">
              <div className="inline-flex p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Nenhum destino encontrado para "{query}"
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Verifique a grafia ou selecione uma das opções populares sugeridas abaixo:
                </p>
              </div>

              {/* Chips de Destinos Populares */}
              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                {POPULAR_FALLBACKS.map((pop) => (
                  <button
                    key={pop.city}
                    type="button"
                    onClick={() => handleFallbackClick(pop.query)}
                    className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-all cursor-pointer"
                  >
                    {pop.city} ({pop.country})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
