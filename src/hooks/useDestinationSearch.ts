// ==========================================================
// SMARTTRIP - HOOK REACT DE BUSCA DE DESTINOS COM DEBOUNCE
// Aplica debounce de 350ms, cancelamento e estados de loading/erro
// ==========================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  NormalizedDestination,
  geocodingService,
  MIN_QUERY_LENGTH,
} from '../lib/geocoding';

export const DEBOUNCE_DELAY_MS = 350;

export interface UseDestinationSearchResult {
  query: string;
  setQuery: (text: string) => void;
  results: NormalizedDestination[];
  isLoading: boolean;
  error: string | null;
  selectedDestination: NormalizedDestination | null;
  selectDestination: (dest: NormalizedDestination) => void;
  clear: () => void;
}

export function useDestinationSearch(initialValue: string = ''): UseDestinationSearchResult {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<NormalizedDestination[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<NormalizedDestination | null>(null);

  const debounceTimerRef = useRef<any>(null);

  useEffect(() => {
    // Limpa timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = query.trim();

    // Se o usuário selecionou uma cidade e a query é idêntica ao display name, não refaz a busca
    if (selectedDestination && selectedDestination.displayName === trimmed) {
      return;
    }

    // Regra de 3 caracteres
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      geocodingService.cancelInFlight();
      return;
    }

    setIsLoading(true);
    setError(null);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const list = await geocodingService.search(trimmed);
        setResults(list);
      } catch (err: any) {
        setError(err.message || 'Erro ao buscar destinos.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_DELAY_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, selectedDestination]);

  const selectDestination = useCallback((dest: NormalizedDestination) => {
    setSelectedDestination(dest);
    setQuery(dest.displayName);
    setResults([]);
    setError(null);
  }, []);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    setSelectedDestination(null);
    geocodingService.cancelInFlight();
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    selectedDestination,
    selectDestination,
    clear,
  };
}
