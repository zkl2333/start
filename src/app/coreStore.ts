import { MenuItem } from "@/components/main-context-menu";
import { create } from "zustand";

interface IFeature {
  id: string;
  name: string;
  enabled: boolean;
  contextMenus?: MenuItem[];
  render?: () => JSX.Element;
  content?: () => JSX.Element;
}

interface ICoreStore {
  features: IFeature[];
  contextMenus: MenuItem[];
  registerFeature: (feature: IFeature) => void;
  enableFeature: (id: string) => void;
  disableFeature: (id: string) => void;
}

export const createFeature = (feature: IFeature) => feature;

export const useCoreStore = create<ICoreStore>()((set, get) => ({
  features: [] as IFeature[],
  contextMenus: [] as MenuItem[],
  registerFeature: async (feature) => {
    // const enabled = await storage.getItem<boolean>(
    //   `sync:feature:${feature.id}`
    // );
    // feature.enabled = enabled ?? feature.enabled;

    return set((state) => {
      if (state.features.some((f) => f.name === feature.name)) {
        console.log("feature already registered", feature);
        return state;
      }

      console.log("registerFeature", feature);

      return {
        features: [...state.features, feature],
      };
    });
  },
  enableFeature: (id) => {
    // storage.setItem(`sync:feature:${id}`, true);
    return set((state) => ({
      features: state.features.map((feature) =>
        feature.id === id ? { ...feature, enabled: true } : feature
      ),
    }));
  },
  disableFeature: (id) => {
    // storage.setItem(`sync:feature:${id}`, false);
    return set((state) => ({
      features: state.features.map((feature) =>
        feature.id === id ? { ...feature, enabled: false } : feature
      ),
    }));
  },
}));
