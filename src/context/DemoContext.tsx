import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ScreenDemoState = 'normal' | 'empty' | 'loading' | 'error';

interface DemoContextType {
  demoState: ScreenDemoState;
  setDemoState: (state: ScreenDemoState) => void;
  resetDemoState: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [demoState, setDemoState] = useState<ScreenDemoState>('normal');

  const resetDemoState = () => setDemoState('normal');

  return (
    <DemoContext.Provider value={{ demoState, setDemoState, resetDemoState }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoState() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoState deve ser usado dentro de um DemoProvider');
  }
  return context;
}
