import React, { useState } from 'react';
import { useDemoState, ScreenDemoState } from '../../context/DemoContext';
import { Sliders, Check, Eye, AlertTriangle, Loader2, Inbox } from 'lucide-react';

export function DemoStateToggle() {
  const { demoState, setDemoState } = useDemoState();
  const [isOpen, setIsOpen] = useState(false);

  const states: { id: ScreenDemoState; label: string; icon: any; color: string }[] = [
    { id: 'normal', label: 'Normal (Dados)', icon: Check, color: 'text-emerald-500' },
    { id: 'loading', label: 'Carregando (Loading)', icon: Loader2, color: 'text-amber-500' },
    { id: 'empty', label: 'Vazio (Zero State)', icon: Inbox, color: 'text-blue-500' },
    { id: 'error', label: 'Erro (Falha/Error)', icon: AlertTriangle, color: 'text-rose-500' },
  ];

  return (
    <aside aria-label="Controles de demonstração" className="fixed bottom-20 md:bottom-6 right-6 z-50">
      <div className="relative">
        {isOpen && (
          <div className="absolute bottom-14 right-0 w-64 p-3 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl text-white animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                Simular Estado UI
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                SPEC-UI
              </span>
            </div>

            <div className="space-y-1">
              {states.map((st) => {
                const Icon = st.icon;
                const isSelected = demoState === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => {
                      setDemoState(st.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : st.color}`} />
                      {st.label}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Abrir alternador de estado de demonstração"
          className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-full shadow-lg border border-slate-700 backdrop-blur-md text-xs font-medium transition-all hover:scale-105 active:scale-95"
        >
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">Demo:</span>
          <span className="capitalize font-semibold text-indigo-300">{demoState}</span>
        </button>
      </div>
    </aside>
  );
}
