import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface RouteMatch {
  path: string;
  params: Record<string, string>;
  searchParams: URLSearchParams;
}

interface RouterContextType {
  currentPath: string;
  navigate: (to: string) => void;
  match: RouteMatch;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

function parsePath(fullUrlOrPath: string): RouteMatch {
  const [pathname, search] = fullUrlOrPath.split('?');
  const searchParams = new URLSearchParams(search || '');

  // Detectar rota dinâmica /trips/:id
  const tripMatch = pathname.match(/^\/trips\/([^/]+)$/);
  if (tripMatch) {
    return {
      path: '/trips/[id]',
      params: { id: tripMatch[1] },
      searchParams,
    };
  }

  return {
    path: pathname || '/',
    params: {},
    searchParams,
  };
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [currentUrl, setCurrentUrl] = useState<string>(() => {
    return window.location.pathname + window.location.search || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentUrl(window.location.pathname + window.location.search || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    if (to !== currentUrl) {
      window.history.pushState({}, '', to);
      setCurrentUrl(to);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const match = parsePath(currentUrl);

  return (
    <RouterContext.Provider value={{ currentPath: currentUrl, navigate, match }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter deve ser usado dentro de um RouterProvider');
  }
  return context;
}

export function Link({
  to,
  children,
  className = '',
  onClick,
  ...props
}: {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  [key: string]: any;
}) {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) onClick(e);
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
}
