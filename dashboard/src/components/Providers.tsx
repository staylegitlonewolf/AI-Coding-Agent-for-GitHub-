"use client";
import { createContext, useContext, useState, useEffect } from "react";

type AppContextType = {
  githubToken: string | null;
  openaiKey: string | null;
  setTokens: (gh: string, oai: string) => void;
  clearTokens: () => void;
  isLoaded: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function Providers({ children }: { children: React.ReactNode }) {
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [openaiKey, setOpenaiKey] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const gh = localStorage.getItem("github_pat");
    const oai = localStorage.getItem("openai_key");
    if (gh) setGithubToken(gh);
    if (oai) setOpenaiKey(oai);
    setIsLoaded(true);
  }, []);

  const setTokens = (gh: string, oai: string) => {
    localStorage.setItem("github_pat", gh);
    localStorage.setItem("openai_key", oai);
    setGithubToken(gh);
    setOpenaiKey(oai);
  };

  const clearTokens = () => {
    localStorage.removeItem("github_pat");
    localStorage.removeItem("openai_key");
    setGithubToken(null);
    setOpenaiKey(null);
  };

  return (
    <AppContext.Provider value={{ githubToken, openaiKey, setTokens, clearTokens, isLoaded }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within Providers");
  return context;
}
