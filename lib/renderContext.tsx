import React, { useContext, useMemo } from 'react';
import { createContext } from "react";
import { GetApiProvider } from "./apiUtil";

interface RenderContextType {
  apiProvider: GetApiProvider
}

const RenderContext = createContext<RenderContextType|null>(null);

export function RenderContextProvider({apiProvider, children}: {
  apiProvider: GetApiProvider,
  children: React.ReactNode,
}) {
  const context: RenderContextType = useMemo(() => ({
    apiProvider
  }), [
    apiProvider
  ]);

  return <RenderContext.Provider value={context}>
    {children}
  </RenderContext.Provider>
}

export function useRenderContext(): RenderContextType {
  const context = useContext(RenderContext);
  if (!context) {
    throw new Error("Tried to render a page without RenderContextProvider");
  }
  return context;
}
