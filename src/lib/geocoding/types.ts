// ==========================================================
// SMARTTRIP - TIPOS E CONTRATOS DO SERVIÇO DE GEOCODIFICAÇÃO
// Contrato canônico e independente de provedores externos
// ==========================================================

export interface GeocodingCoordinates {
  latitude: number;  // Intervalo [-90.0, 90.0]
  longitude: number; // Intervalo [-180.0, 180.0]
}

export type DestinationRawType = 'city' | 'town' | 'village' | 'administrative' | 'destination';

export interface NormalizedDestination {
  id: string;                  // Identificador canônico único (ex: 'geo_osm_123456')
  city: string;                // Nome oficial da cidade (ex: 'Santiago')
  state?: string;              // Estado / Província / Região (ex: 'Região Metropolitana de Santiago')
  country: string;             // Nome do país traduzido (ex: 'Chile')
  countryCode: string;         // ISO 3166-1 alpha-2 em maiúsculas (ex: 'CL', 'BR', 'UY')
  displayName: string;         // Rótulo completo formatado (ex: 'Santiago, Região Metropolitana, Chile')
  coordinates: GeocodingCoordinates;
  rawType: DestinationRawType;
  importance: number;          // Score de relevância normalizado (0.0 a 1.0)
  boundingBox?: [number, number, number, number]; // [minLat, maxLat, minLon, maxLon]
}

export interface GeocodingSearchOptions {
  limit?: number;              // Limite de resultados (padrão: 5)
  language?: string;           // Idioma preferido (padrão: 'pt-BR,pt;q=0.9,en;q=0.8')
  countryCodes?: string[];     // Filtro opcional por países (ex: ['br', 'uy', 'ar', 'cl'])
  signal?: AbortSignal;        // Sinal para cancelamento ou timeout
}

export interface IGeocodingProvider {
  name: string;
  search(query: string, options?: GeocodingSearchOptions): Promise<NormalizedDestination[]>;
}
