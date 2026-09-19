// ==========================================================
// SMARTTRIP - EXPORTAÇÃO PÚBLICA DOS REPOSITÓRIOS FIRESTORE
// ==========================================================

export { tripsRepository, validateTripData } from './tripsRepository';
export type { CreateTripDTO } from './tripsRepository';

export {
  availabilityRepository,
  calculateInclusiveDays,
  validateDateRange,
} from './availabilityRepository';
export type {
  CreateAvailabilityDTO,
  UpdateAvailabilityDTO,
  OverlapResult,
} from './availabilityRepository';

export {
  userRepository,
  validatePreferences,
  VALID_STYLES,
  VALID_BUDGETS,
  VALID_PACES,
  VALID_TRANSPORTS,
  VALID_WEATHER,
} from './userRepository';
