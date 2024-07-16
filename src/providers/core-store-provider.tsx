"use client";

import { type ReactNode, createContext, useContext, useRef } from "react";
import { createCoreStore, ICoreStore } from "@/stores/core-store";
import { useStore } from "zustand";

export type CoreStoreApi = ReturnType<typeof createCoreStore>;

export const CoreStoreContext = createContext<CoreStoreApi | null>(null);

export const CoreStoreProvider = ({ children }: { children: ReactNode }) => {
  const coreStore = useRef<CoreStoreApi | null>(null);

  if (!coreStore.current) {
    coreStore.current = createCoreStore();
  }

  return (
    <CoreStoreContext.Provider value={coreStore.current}>
      {children}
    </CoreStoreContext.Provider>
  );
};

export const useCoreStore = <T,>(selector: (store: ICoreStore) => T): T => {
  const coreStoreContext = useContext(CoreStoreContext);

  if (!coreStoreContext) {
    throw new Error("useCoreStore must be used within a CoreStoreProvider");
  }

  return useStore(coreStoreContext, selector);
};
