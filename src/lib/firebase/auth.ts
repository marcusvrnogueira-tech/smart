// ==========================================================
// SMARTTRIP - SERVIÇO DE AUTENTICAÇÃO E PERFIL DO USUÁRIO
// Implementa cadastro, login, logout, recuperação e perfil idempotente.
// Regra de Segurança: Role fixo 'user' (sem autoelevação).
// ==========================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { isFirebaseConfigured } from './config';
import { getFirebaseAuth, getFirebaseFirestore } from './client';

import { UserPreferences } from '../../data/mockStore';

// ----------------------------------------------------------------------
// TIPOS E CONTRATOS
// ----------------------------------------------------------------------

export interface AuthUserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  homeCity: string;
  role: 'user' | 'admin';
  preferences: UserPreferences;
  createdAt?: any;
  updatedAt?: any;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// ----------------------------------------------------------------------
// DICIONÁRIO DE ERROS DO FIREBASE EM PORTUGUÊS
// ----------------------------------------------------------------------

export function translateAuthError(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'O endereço de e-mail informado é inválido.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos. Verifique suas credenciais.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado. Faça login ou recupere sua senha.';
    case 'auth/weak-password':
      return 'A senha deve conter no mínimo 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas sem sucesso. Aguarde alguns minutos antes de tentar novamente.';
    case 'auth/popup-closed-by-user':
      return 'O processo de login com o Google foi cancelado antes da conclusão.';
    case 'auth/network-request-failed':
      return 'Falha de conexão com a internet. Verifique sua rede e tente novamente.';
    default:
      return 'Ocorreu um erro na autenticação. Tente novamente.';
  }
}

// ----------------------------------------------------------------------
// GESTÃO IDEMPOTENTE DO PERFIL (users/{uid})
// ----------------------------------------------------------------------

/**
 * Cria ou recupera o perfil em users/{uid} de forma rigorosamente idempotente.
 * SEGURANÇA: O role é compulsoriamente 'user' e não pode ser injetado pelo cliente.
 */
export async function ensureUserProfile(
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string | null
): Promise<AuthUserProfile> {
  const defaultProfile: AuthUserProfile = {
    uid,
    email,
    displayName: displayName || email.split('@')[0] || 'Viajante',
    photoURL: photoURL || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    homeCity: 'São Paulo, SP',
    role: 'user', // Regra de segurança: Role 'user' obrigatório na criação
    preferences: {
      styles: ['Gastronomia', 'Cultura', 'Caminhadas Urbanas'],
      pace: 'moderado',
      budget: 'moderado',
      transportation: ['caminhada', 'transporte_publico'],
      preferredWeather: 'ameno_primavera',
      maxDistanceKm: 15,
    },
  };

  if (!isFirebaseConfigured()) {
    // Modo simulação local/mock quando chaves não estiverem configuradas
    return mockAuthService.ensureProfile(uid, defaultProfile);
  }

  const db = getFirebaseFirestore();
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    // Perfil já existe, retorna os dados persistidos sem sobrescrever
    return snap.data() as AuthUserProfile;
  }

  // Cria perfil inicial no Firestore com timestamps do servidor
  const profileToSave = {
    ...defaultProfile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, profileToSave);
  return defaultProfile;
}

// ----------------------------------------------------------------------
// OPERAÇÕES DO FIREBASE AUTH CLIENT
// ----------------------------------------------------------------------

export async function registerWithEmail(input: RegisterInput): Promise<AuthUserProfile> {
  if (!input.name.trim()) {
    throw new Error('O nome completo é obrigatório.');
  }
  if (!input.email || !input.email.includes('@')) {
    throw new Error('Informe um e-mail válido.');
  }
  if (!input.password || input.password.length < 6) {
    throw new Error(translateAuthError('auth/weak-password'));
  }

  if (!isFirebaseConfigured()) {
    return mockAuthService.register(input);
  }

  const auth = getFirebaseAuth();
  try {
    const cred = await createUserWithEmailAndPassword(auth, input.email, input.password);
    return await ensureUserProfile(cred.user.uid, input.email, input.name);
  } catch (error: any) {
    throw new Error(translateAuthError(error.code || ''));
  }
}

export async function loginWithEmail(input: LoginInput): Promise<AuthUserProfile> {
  if (!input.email || !input.password) {
    throw new Error('E-mail e senha são obrigatórios.');
  }

  if (!isFirebaseConfigured()) {
    return mockAuthService.login(input);
  }

  const auth = getFirebaseAuth();
  try {
    const cred = await signInWithEmailAndPassword(auth, input.email, input.password);
    return await ensureUserProfile(cred.user.uid, cred.user.email || input.email, cred.user.displayName || '');
  } catch (error: any) {
    throw new Error(translateAuthError(error.code || ''));
  }
}

export async function loginWithGoogle(): Promise<AuthUserProfile> {
  if (!isFirebaseConfigured()) {
    return mockAuthService.loginWithGoogle();
  }

  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  try {
    const cred = await signInWithPopup(auth, provider);
    return await ensureUserProfile(
      cred.user.uid,
      cred.user.email || '',
      cred.user.displayName || '',
      cred.user.photoURL
    );
  } catch (error: any) {
    throw new Error(translateAuthError(error.code || ''));
  }
}

export async function logoutUser(): Promise<void> {
  if (!isFirebaseConfigured()) {
    mockAuthService.logout();
    return;
  }

  const auth = getFirebaseAuth();
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<string> {
  if (!email || !email.includes('@')) {
    throw new Error('Informe um endereço de e-mail válido.');
  }

  if (!isFirebaseConfigured()) {
    return mockAuthService.resetPassword(email);
  }

  const auth = getFirebaseAuth();
  try {
    await sendPasswordResetEmail(auth, email);
    return 'Se houver uma conta cadastrada com este e-mail, as instruções de redefinição foram enviadas.';
  } catch (error: any) {
    // Mitigação de enumeração: sempre retorna mensagem neutra de sucesso
    return 'Se houver uma conta cadastrada com este e-mail, as instruções de redefinição foram enviadas.';
  }
}

// ----------------------------------------------------------------------
// SERVIÇO MOCK AUTÔNOMO (FIDELIDADE TOTAL PARA TESTES E DEV SEM CHAVES)
// ----------------------------------------------------------------------

class MockAuthService {
  private users: Map<string, { profile: AuthUserProfile; passwordHash: string }> = new Map();
  private profilesByUid: Map<string, AuthUserProfile> = new Map();
  private currentUserId: string | null = 'usr_larissa_001';
  private profileCreationCounts: Map<string, number> = new Map();

  constructor() {
    const initialLarissa: AuthUserProfile = {
      uid: 'usr_larissa_001',
      email: 'larissa.mendes@email.com',
      displayName: 'Larissa Mendes',
      photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
      homeCity: 'São Paulo, SP',
      role: 'user',
      preferences: {
        styles: ['Gastronomia', 'Cultura', 'Caminhadas Urbanas'],
        pace: 'moderado',
        budget: 'moderado',
        transportation: ['caminhada', 'transporte_publico'],
        preferredWeather: 'ameno_primavera',
        maxDistanceKm: 15,
      },
    };
    this.users.set('larissa.mendes@email.com', {
      profile: initialLarissa,
      passwordHash: 'segredo123',
    });
    this.profilesByUid.set('usr_larissa_001', initialLarissa);
    this.profileCreationCounts.set('usr_larissa_001', 1);
  }

  getCurrentUser(): AuthUserProfile | null {
    if (!this.currentUserId) return null;
    return this.profilesByUid.get(this.currentUserId) || null;
  }

  ensureProfile(uid: string, defaultProfile: AuthUserProfile): AuthUserProfile {
    if (this.profilesByUid.has(uid)) {
      // Já criado anteriormente (idempotência garantida)
      return this.profilesByUid.get(uid)!;
    }

    this.profilesByUid.set(uid, defaultProfile);
    const existingCount = this.profileCreationCounts.get(uid) || 0;
    this.profileCreationCounts.set(uid, existingCount + 1);
    return defaultProfile;
  }

  getProfileCreationCount(uid: string): number {
    return this.profileCreationCounts.get(uid) || 0;
  }

  register(input: RegisterInput): AuthUserProfile {
    const normalizedEmail = input.email.toLowerCase().trim();
    if (this.users.has(normalizedEmail)) {
      throw new Error(translateAuthError('auth/email-already-in-use'));
    }

    const uid = `usr_${Date.now()}`;
    const profile: AuthUserProfile = {
      uid,
      email: normalizedEmail,
      displayName: input.name.trim(),
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face',
      homeCity: 'São Paulo, SP',
      role: 'user', // Garantia de segurança: role 'user'
      preferences: {
        styles: ['Gastronomia', 'Cultura'],
        pace: 'moderado',
        budget: 'moderado',
        transportation: ['caminhada', 'transporte_publico'],
        preferredWeather: 'ameno_primavera',
        maxDistanceKm: 15,
      },
    };

    this.users.set(normalizedEmail, { profile, passwordHash: input.password });
    this.profilesByUid.set(uid, profile);
    this.profileCreationCounts.set(uid, 1);
    this.currentUserId = uid;
    return profile;
  }

  login(input: LoginInput): AuthUserProfile {
    const normalizedEmail = input.email.toLowerCase().trim();
    const entry = this.users.get(normalizedEmail);

    if (!entry || entry.passwordHash !== input.password) {
      throw new Error(translateAuthError('auth/invalid-credential'));
    }

    this.currentUserId = entry.profile.uid;
    return entry.profile;
  }

  loginWithGoogle(): AuthUserProfile {
    const googleUser: AuthUserProfile = {
      uid: 'usr_google_guest',
      email: 'viajante.google@gmail.com',
      displayName: 'Viajante Google',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
      homeCity: 'Rio de Janeiro, RJ',
      role: 'user',
      preferences: {
        styles: ['Praia & Mar', 'Natureza & Trilhas'],
        pace: 'tranquilo',
        budget: 'moderado',
        transportation: ['caminhada', 'transporte_publico'],
        preferredWeather: 'calor_sol',
        maxDistanceKm: 25,
      },
    };

    this.users.set(googleUser.email, { profile: googleUser, passwordHash: 'oauth_token' });
    this.ensureProfile(googleUser.uid, googleUser);
    this.currentUserId = googleUser.uid;
    return googleUser;
  }

  updateProfile(uid: string, updates: Partial<AuthUserProfile>) {
    const existing = this.profilesByUid.get(uid);
    if (existing) {
      const merged: AuthUserProfile = {
        ...existing,
        ...updates,
        preferences: {
          ...existing.preferences,
          ...(updates.preferences || {}),
        },
      };
      this.profilesByUid.set(uid, merged);
      for (const [email, userEntry] of this.users.entries()) {
        if (userEntry.profile.uid === uid) {
          userEntry.profile = merged;
          this.users.set(email, userEntry);
        }
      }
    }
  }

  logout() {
    this.currentUserId = null;
  }

  resetPassword(email: string): string {
    return 'Se houver uma conta cadastrada com este e-mail, as instruções de redefinição foram enviadas.';
  }

  resetForTests() {
    this.users.clear();
    this.profilesByUid.clear();
    this.profileCreationCounts.clear();
    this.currentUserId = null;
  }
}

export const mockAuthService = new MockAuthService();
