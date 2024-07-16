import { MenuItem } from "@/components/main-context-menu";
import { createStore } from "zustand/vanilla";

interface IFeature {
  id: string;
  name: string;
  enabled: boolean;
  contextMenus?: MenuItem[];
  render?: () => JSX.Element;
  content?: ({
    globalMenuItems,
  }: {
    globalMenuItems: MenuItem[];
  }) => JSX.Element;
}

export interface ICoreStore {
  features: IFeature[];
  contextMenus: MenuItem[];
  registerFeature: (feature: IFeature) => void;
  enableFeature: (id: string) => void;
  disableFeature: (id: string) => void;
}

export const createFeature = (feature: IFeature) => feature;

export const createCoreStore = () => {
  return createStore<ICoreStore>()((set, get) => ({
    features: [] as IFeature[],
    contextMenus: [] as MenuItem[],
    registerFeature: async (feature) => {
      const enabled = localStorage.getItem(`feature:${feature.id}`);
      feature.enabled = enabled ? enabled === "true" : feature.enabled;

      return set((state) => {
        if (state.features.some((f) => f.name === feature.name)) {
          return state;
        }

        return {
          features: [...state.features, feature],
        };
      });
    },
    enableFeature: (id) => {
      localStorage.setItem(`feature:${id}`, "true");

      const feature = get().features.find((f) => f.id === id);

      if (feature) {
        if (feature.contextMenus) {
          // const contextMenuStore = useContextMenuStore.getState();
          // feature.contextMenus.forEach((menu) => {
          //   // contextMenuStore.addContextMenu(menu);
          // });
        }

        set((state) => ({
          features: state.features.map((f) =>
            f.id === id ? { ...f, enabled: true } : f
          ),
        }));
      }
    },
    disableFeature: (id) => {
      localStorage.setItem(`feature:${id}`, "false");
      return set((state) => ({
        features: state.features.map((feature) =>
          feature.id === id ? { ...feature, enabled: false } : feature
        ),
      }));
    },
  }));
};
