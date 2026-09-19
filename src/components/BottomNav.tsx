import React from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { Layers, Sparkles, MapPin, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentPath } = useRouter();

  const items = [
    { path: '/dashboard', label: 'Início', icon: Layers },
    { path: '/explore', label: 'Criar', icon: Sparkles },
    { path: '/trips', label: 'Viagens', icon: MapPin },
    { path: '/profile', label: 'Perfil', icon: User },
  ];

  return (
    <nav
      aria-label="Navegação mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-6 py-2 shadow-lg"
    >
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
