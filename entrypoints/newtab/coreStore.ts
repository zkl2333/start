import { create } from "zustand";

interface IFeature {
  id: string;
  name: string;
  enabled: boolean;
  contextMenus?: MenuItem[];
  render: () => JSX.Element;
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
    console.log("enableFeature", id);
    return set((state) => ({
      features: state.features.map((feature) =>
        feature.id === id ? { ...feature, enabled: true } : feature
      ),
    }));
  },
  disableFeature: (id) => {
    console.log("disableFeature", id);
    return set((state) => ({
      features: state.features.map((feature) =>
        feature.id === id ? { ...feature, enabled: false } : feature
      ),
    }));
  },
}));
