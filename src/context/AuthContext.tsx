// ==========================================================
// SMARTTRIP - CONTEXTO GLOBAL DE AUTENTICAÇÃO (AUTH CONTEXT)
// Gerencia sessão persistente, escuta de estado e proteção de rotas.
// Regra de Segurança: NUNCA logar senhas ou tokens sensíveis.
// ==========================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { isFirebaseConfigured } from '../lib/firebase/config';
import { getFirebaseAuth } from '../lib/firebase/client';
import {
  AuthUserProfile,
  RegisterInput,
  LoginInput,
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  resetPassword,
  ensureUserProfile,
  mockAuthService,
} from '../lib/firebase/auth';
import { mockStore, UserPreferences } from '../data/mockStore';
import { userRepository } from '../lib/firebase/firestore/userRepository';

interface AuthContextType {
  user: AuthUserProfile | null;
  isLoading: boolean;
  register: (input: RegisterInput) => Promise<AuthUserProfile>;
  login: (input: LoginInput) => Promise<AuthUserProfile>;
  loginWithGoogle: () => Promise<AuthUserProfile>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string>;
  updateUserPreferences: (preferences: UserPreferences) => Promise<UserPreferences>;
  updateUserProfile: (data: { displayName?: string; homeCity?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserProfile | null>(() => {
    // Inicialização segura
    if (!isFirebaseConfigured()) {
      return mockAuthService.getCurrentUser();
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Modo Firebase Real
    if (isFirebaseConfigured()) {
      try {
        const auth = getFirebaseAuth();
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              const profile = await ensureUserProfile(
                firebaseUser.uid,
                firebaseUser.email || '',
                firebaseUser.displayName || '',
                firebaseUser.photoURL
              );
              setUser(profile);
              mockStore.setLoggedIn(true);
            } catch {
              setUser(null);
              mockStore.setLoggedIn(false);
            }
          } else {
            setUser(null);
            mockStore.setLoggedIn(false);
          }
          setIsLoading(false);
        });
        return () => unsubscribe();
      } catch {
        setIsLoading(false);
      }
    } else {
      // Modo Mock Local
      const current = mockAuthService.getCurrentUser();
      setUser(current);
      mockStore.setLoggedIn(Boolean(current));
      setIsLoading(false);
    }
  }, []);

  const handleRegister = async (input: RegisterInput): Promise<AuthUserProfile> => {
    // Não logar senha
    const profile = await registerWithEmail(input);
    setUser(profile);
    mockStore.setLoggedIn(true);
    return profile;
  };

  const handleLogin = async (input: LoginInput): Promise<AuthUserProfile> => {
    // Não logar senha
    const profile = await loginWithEmail(input);
    setUser(profile);
    mockStore.setLoggedIn(true);
    return profile;
  };

  const handleGoogleLogin = async (): Promise<AuthUserProfile> => {
    const profile = await loginWithGoogle();
    setUser(profile);
    mockStore.setLoggedIn(true);
    return profile;
  };

  const handleLogout = async (): Promise<void> => {
    await logoutUser();
    setUser(null);
    mockStore.setLoggedIn(false);
  };

  const handleResetPassword = async (email: string): Promise<string> => {
    return await resetPassword(email);
  };

  const handleUpdatePreferences = async (preferences: UserPreferences): Promise<UserPreferences> => {
    if (!user) {
      throw new Error('[Security Violation] Usuário não autenticado.');
    }
    // SEGURANÇA: Identidade obtida compulsoriamente da sessão ativa (user.uid)
    const updated = await userRepository.updatePreferences(user.uid, user.uid, preferences);
    setUser((prev) => (prev ? { ...prev, preferences: updated } : null));
    return updated;
  };

  const handleUpdateProfile = async (data: { displayName?: string; homeCity?: string; photoURL?: string }): Promise<void> => {
    if (!user) {
      throw new Error('[Security Violation] Usuário não autenticado.');
    }
    const updated = await userRepository.updateProfileData(user.uid, user.uid, data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        register: handleRegister,
        login: handleLogin,
        loginWithGoogle: handleGoogleLogin,
        logout: handleLogout,
        requestPasswordReset: handleResetPassword,
        updateUserPreferences: handleUpdatePreferences,
        updateUserProfile: handleUpdateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
