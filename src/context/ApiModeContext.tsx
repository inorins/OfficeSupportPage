import { createContext, useContext, useState } from 'react';

interface ApiModeContextType {
  isApiMode: boolean;
  toggleApiMode: () => void;
}

const ApiModeContext = createContext<ApiModeContextType>({
  isApiMode: false,
  toggleApiMode: () => {},
});

export function ApiModeProvider({ children }: { children: React.ReactNode }) {
  const [isApiMode, setIsApiMode] = useState(() => {
    return localStorage.getItem('inorins_api_mode') === 'true';
  });

  const toggleApiMode = () => {
    setIsApiMode((prev) => {
      const next = !prev;
      localStorage.setItem('inorins_api_mode', String(next));
      return next;
    });
  };

  return (
    <ApiModeContext.Provider value={{ isApiMode, toggleApiMode }}>
      {children}
    </ApiModeContext.Provider>
  );
}

export function useApiMode() {
  return useContext(ApiModeContext);
}
