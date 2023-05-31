import React, { useState, useEffect } from "react";

interface ViewportContextProps {
  isMobile: boolean;
  isDesktop: boolean;
  isTablet: boolean; // Aggiunta isTablet
}

interface ViewportProviderProps {
  children: React.ReactNode;
}

const ViewportContext = React.createContext<ViewportContextProps | undefined>(
  undefined
);

const ViewportProvider: React.FC<ViewportProviderProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isTablet, setIsTablet] = useState(false); // Aggiunta isTablet

  useEffect(() => {
    // Logica per determinare se la viewport è mobile, tablet o desktop
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;
      setIsMobile(mobile);
      setIsTablet(tablet);
      setIsDesktop(!mobile && !tablet);
    };

    handleResize(); // Esegui all'avvio per impostare lo stato iniziale

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <ViewportContext.Provider value={{ isMobile, isDesktop, isTablet }}>
      {children}
    </ViewportContext.Provider>
  );
};

export { ViewportContext, ViewportProvider };
