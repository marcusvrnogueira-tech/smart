// ==========================================================
// SMARTTRIP - NORMALIZADOR E VALIDADOR DE ENTIDADES GEOGRÁFICAS
// Transforma respostas heterogêneas de provedores no contrato canônico
// ==========================================================

import {
  NormalizedDestination,
  DestinationRawType,
} from './types';

/**
 * Sanitiza a entrada textual do usuário:
 * - trim
 * - normalização Unicode NFC (preserva acentuação estável)
 * - remoção de caracteres de controle e tags perigosas
 */
export function sanitizeQuery(raw: string): string {
  if (!raw) return '';
  return raw
    .trim()
    .normalize('NFC')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove caracteres de controle
    .replace(/[<>]/g, '')                          // Remove potenciais tags HTML
    .replace(/\s+/g, ' ');                         // Colapsa espaços múltiplos
}

/**
 * Validação estrita de coordenadas geográficas:
 * - Latitude: [-90.0, 90.0]
 * - Longitude: [-180.0, 180.0]
 */
export function validateCoordinates(lat: number, lng: number): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  return true;
}

/**
 * Arredonda coordenada para 6 casas decimais (~0.1 metro de precisão)
 */
export function roundCoordinate(val: number, decimals: number = 6): number {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

/**
 * Mapeia o tipo geográfico bruto do provedor para os tipos suportados
 */
function mapRawType(typeStr?: string): DestinationRawType {
  const lower = (typeStr || '').toLowerCase();
  if (lower === 'city') return 'city';
  if (lower === 'town') return 'town';
  if (lower === 'village') return 'village';
  if (lower.includes('admin') || lower === 'state' || lower === 'county') return 'administrative';
  return 'destination';
}

/**
 * Normaliza um item bruto retornado por provedores (ex: Nominatim/OSM, Photon)
 * Garante que dados incompletos ou inválidos sejam descartados ou tratados graciosamente.
 */
export function normalizeProviderItem(raw: any, providerName: string = 'osm'): NormalizedDestination | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  // 1. Extração e validação de latitude e longitude
  const rawLat = parseFloat(raw.lat ?? raw.latitude ?? raw.geometry?.coordinates?.[1]);
  const rawLng = parseFloat(raw.lon ?? raw.lng ?? raw.longitude ?? raw.geometry?.coordinates?.[0]);

  if (!validateCoordinates(rawLat, rawLng)) {
    return null; // Descarta itens com coordenadas inválidas ou ausentes
  }

  const latitude = roundCoordinate(rawLat);
  const longitude = roundCoordinate(rawLng);

  // 2. Extração de endereço e nomes
  const address = raw.address || raw.properties || {};

  const cityCandidate =
    address.city ||
    address.town ||
    address.municipality ||
    address.village ||
    address.hamlet ||
    address.suburb ||
    raw.name ||
    raw.display_name?.split(',')[0];

  const city = (cityCandidate || '').trim();
  if (!city) {
    return null; // Cidade ou nome principal é obrigatório
  }

  const state = (
    address.state ||
    address.province ||
    address.region ||
    address.state_district ||
    ''
  ).trim() || undefined;

  const country = (
    address.country ||
    raw.country ||
    ''
  ).trim();

  if (!country) {
    return null; // País é obrigatório para localização canônica
  }

  const countryCode = (
    address.country_code ||
    raw.country_code ||
    address.countryCode ||
    'XX'
  ).toUpperCase().trim();

  // 3. Montagem do DisplayName amigável
  let displayName = `${city}`;
  if (state && state.toLowerCase() !== city.toLowerCase()) {
    displayName += `, ${state}`;
  }
  displayName += `, ${country}`;

  // 4. Bounding box se presente
  let boundingBox: [number, number, number, number] | undefined;
  if (Array.isArray(raw.boundingbox) && raw.boundingbox.length === 4) {
    const minLat = parseFloat(raw.boundingbox[0]);
    const maxLat = parseFloat(raw.boundingbox[1]);
    const minLon = parseFloat(raw.boundingbox[2]);
    const maxLon = parseFloat(raw.boundingbox[3]);
    if (validateCoordinates(minLat, minLon) && validateCoordinates(maxLat, maxLon)) {
      boundingBox = [
        roundCoordinate(minLat),
        roundCoordinate(maxLat),
        roundCoordinate(minLon),
        roundCoordinate(maxLon),
      ];
    }
  }

  // 5. Importance / Relevância
  let importance = typeof raw.importance === 'number' ? raw.importance : 0.5;
  if (importance > 1) importance = 1;
  if (importance < 0) importance = 0;

  const rawId = raw.place_id || raw.osm_id || raw.id || `${latitude}_${longitude}`;
  const id = `geo_${providerName}_${rawId}`;

  return {
    id,
    city,
    state,
    country,
    countryCode: countryCode.length === 2 ? countryCode : 'XX',
    displayName,
    coordinates: { latitude, longitude },
    rawType: mapRawType(raw.type || raw.class || raw.addresstype),
    importance: Math.round(importance * 100) / 100,
    boundingBox,
  };
}

/**
 * Normaliza uma lista de itens brutos, filtrando nulos e removendo duplicatas de coordenadas
 */
export function normalizeDestinationList(
  rawList: any[],
  providerName: string = 'osm'
): NormalizedDestination[] {
  if (!Array.isArray(rawList)) return [];

  const results: NormalizedDestination[] = [];
  const seenCoordinates = new Set<string>();

  for (const raw of rawList) {
    const item = normalizeProviderItem(raw, providerName);
    if (!item) continue;

    // Evita duplicatas da mesma cidade/coordenada
    const coordKey = `${item.coordinates.latitude.toFixed(3)}_${item.coordinates.longitude.toFixed(3)}`;
    if (seenCoordinates.has(coordKey)) continue;

    seenCoordinates.add(coordKey);
    results.push(item);
  }

  // Ordena por importância decrescente
  return results.sort((a, b) => b.importance - a.importance);
}
