import React, { createContext, useContext, useMemo } from 'react';
import type { GetApiProvider } from "./apiUtil";
import { getPublicConfig } from './getPublicConfig';

interface RenderContextType {
  apiProvider: GetApiProvider
  setPageTitle: (title: string)=>void
}

const RenderContext = createContext<RenderContextType|null>(null);

export function RenderContextProvider({apiProvider, setPageTitle, children}: {
  apiProvider: GetApiProvider,
  setPageTitle: (title: string)=>void
  children: React.ReactNode,
}) {
  const context: RenderContextType = useMemo(() => ({
    apiProvider, setPageTitle
  }), [
    apiProvider, setPageTitle
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

export function PageTitle({title}: {
  title?: string
}) {
  const context = useRenderContext();
  if (title) {
    const titleSuffix = getPublicConfig().pageTitle;
    context.setPageTitle(`${title} - ${titleSuffix}`);
  }
  return <></>;
}
