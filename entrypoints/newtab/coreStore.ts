import { create } from "zustand";
import { storage } from "wxt/storage";

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

export const createFeature = (feature: IFeature) => {
  storage.getItem<boolean>(`sync:feature:${feature.id}`).then((enabled) => {
    feature.enabled = enabled ?? feature.enabled;
  });

  return feature;
};

export const useCoreStore = create<ICoreStore>()((set, get) => ({
  features: [] as IFeature[],
  contextMenus: [] as MenuItem[],
  registerFeature: (feature) => {
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
    storage.setItem(`sync:feature:${id}`, true);
    return set((state) => ({
      features: state.features.map((feature) =>
        feature.id === id ? { ...feature, enabled: true } : feature
      ),
    }));
  },
  disableFeature: (id) => {
    storage.setItem(`sync:feature:${id}`, false);
    return set((state) => ({
      features: state.features.map((feature) =>
        feature.id === id ? { ...feature, enabled: false } : feature
      ),
    }));
  },
}));
