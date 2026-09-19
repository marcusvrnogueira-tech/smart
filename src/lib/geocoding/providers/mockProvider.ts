// ==========================================================
// SMARTTRIP - PROVEDOR MOCK DE GEOCODIFICAÇÃO
// Fidelidade total para testes automatizados, CI e modo offline
// ==========================================================

import {
  NormalizedDestination,
  GeocodingSearchOptions,
  IGeocodingProvider,
} from '../types';
import { normalizeDestinationList } from '../normalizer';

export const MOCK_DATABASE = [
  {
    place_id: 101,
    lat: '-34.901112',
    lon: '-56.164531',
    display_name: 'Montevidéu, Departamento de Montevideo, Uruguai',
    importance: 0.85,
    type: 'city',
    address: {
      city: 'Montevidéu',
      state: 'Montevideo',
      country: 'Uruguai',
      country_code: 'uy',
    },
  },
  {
    place_id: 102,
    lat: '-34.603722',
    lon: '-58.381592',
    display_name: 'Buenos Aires, Cidade Autônoma de Buenos Aires, Argentina',
    importance: 0.92,
    type: 'city',
    address: {
      city: 'Buenos Aires',
      state: 'CABA',
      country: 'Argentina',
      country_code: 'ar',
    },
  },
  {
    place_id: 103,
    lat: '-23.220311',
    lon: '-44.717621',
    display_name: 'Paraty, Costa Verde, Rio de Janeiro, Brasil',
    importance: 0.72,
    type: 'town',
    address: {
      town: 'Paraty',
      state: 'Rio de Janeiro',
      country: 'Brasil',
      country_code: 'br',
    },
  },
  {
    place_id: 104,
    lat: '-29.374612',
    lon: '-50.876412',
    display_name: 'Gramado, Serra Gaúcha, Rio de Grande do Sul, Brasil',
    importance: 0.75,
    type: 'town',
    address: {
      town: 'Gramado',
      state: 'Rio Grande do Sul',
      country: 'Brasil',
      country_code: 'br',
    },
  },
  // Ambiguidade: Santiago (Chile vs Espanha)
  {
    place_id: 201,
    lat: '-33.448891',
    lon: '-70.669265',
    display_name: 'Santiago, Região Metropolitana de Santiago, Chile',
    importance: 0.90,
    type: 'city',
    address: {
      city: 'Santiago',
      state: 'Região Metropolitana',
      country: 'Chile',
      country_code: 'cl',
    },
  },
  {
    place_id: 202,
    lat: '42.878213',
    lon: '-8.544844',
    display_name: 'Santiago de Compostela, Galiza, Espanha',
    importance: 0.78,
    type: 'city',
    address: {
      city: 'Santiago de Compostela',
      state: 'Galiza',
      country: 'Espanha',
      country_code: 'es',
    },
  },
  // Cidade com acentuação e cedilha: São Paulo
  {
    place_id: 301,
    lat: '-23.550520',
    lon: '-46.633308',
    display_name: 'São Paulo, Região Metropolitana de São Paulo, São Paulo, Brasil',
    importance: 0.98,
    type: 'city',
    address: {
      city: 'São Paulo',
      state: 'São Paulo',
      country: 'Brasil',
      country_code: 'br',
    },
  },
  // Cidade conhecida: Paris
  {
    place_id: 401,
    lat: '48.856614',
    lon: '2.352222',
    display_name: 'Paris, Ilha de França, França',
    importance: 0.99,
    type: 'city',
    address: {
      city: 'Paris',
      state: 'Île-de-France',
      country: 'França',
      country_code: 'fr',
    },
  },
];

export class MockGeocodingProvider implements IGeocodingProvider {
  name = 'mock';

  // Opções de simulação para testes
  public simulateTimeout = false;
  public simulateNetworkError = false;
  public simulateIncompleteResponse = false;
  public customDelayMs = 0;

  async search(query: string, options?: GeocodingSearchOptions): Promise<NormalizedDestination[]> {
    if (this.simulateTimeout) {
      // Simula delay acima do limite de 4000ms
      await new Promise((resolve) => setTimeout(resolve, 4500));
      if (options?.signal?.aborted) {
        throw new DOMException('Busca cancelada por timeout.', 'AbortError');
      }
    }

    if (this.simulateNetworkError) {
      throw new Error('500 Internal Server Error: Provedor de geocodificação indisponível.');
    }

    if (this.customDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.customDelayMs));
    }

    if (options?.signal?.aborted) {
      throw new DOMException('Busca cancelada pelo cliente.', 'AbortError');
    }

    if (this.simulateIncompleteResponse) {
      // Simula itens com dados corrompidos ou faltando coordenadas
      const incompleteRaw = [
        { name: 'Cidade Quebrada 1' }, // sem lat e lon
        { lat: 'invalido', lon: 'invalido', name: 'Cidade Quebrada 2' },
        { lat: '12.34', lon: '56.78' }, // sem cidade e sem país
        {
          lat: '-22.9068',
          lon: '-43.1729',
          name: 'Rio de Janeiro',
          country: 'Brasil',
          address: { city: 'Rio de Janeiro', country: 'Brasil', country_code: 'br' },
        },
      ];
      return normalizeDestinationList(incompleteRaw, this.name);
    }

    const normalizedQuery = query.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const matches = MOCK_DATABASE.filter((item) => {
      const disp = (item.display_name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const cityName = item.address.city || (item.address as any).town || (item.address as any).municipality || '';
      const city = cityName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return disp.includes(normalizedQuery) || city.includes(normalizedQuery);
    });

    return normalizeDestinationList(matches, this.name);
  }

  reset() {
    this.simulateTimeout = false;
    this.simulateNetworkError = false;
    this.simulateIncompleteResponse = false;
    this.customDelayMs = 0;
  }
}

export const mockGeocodingProvider = new MockGeocodingProvider();
