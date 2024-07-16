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
    updateMenuItem,
  }: {
    globalMenuItems: MenuItem[];
    updateMenuItem: (id: string, contextMenu: MenuItem) => void;
  }) => JSX.Element;
}

export interface ICoreStore {
  features: IFeature[];
  registerFeature: (feature: IFeature) => void;
  enableFeature: (id: string) => void;
  disableFeature: (id: string) => void;
  updateContextMenu: (id: string, contextMenu: MenuItem) => void;
}

export const createFeature = (feature: IFeature) => feature;

export const createCoreStore = () => {
  return createStore<ICoreStore>()((set, get) => ({
    features: [] as IFeature[],
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
      set((state) => ({
        features: state.features.map((f) =>
          f.id === id ? { ...f, enabled: true } : f
        ),
      }));
    },
    disableFeature: (id) => {
      localStorage.setItem(`feature:${id}`, "false");
      return set((state) => ({
        features: state.features.map((feature) =>
          feature.id === id ? { ...feature, enabled: false } : feature
        ),
      }));
    },
    updateContextMenu: (id: MenuItem["id"], contextMenu: MenuItem) => {
      set((state) => ({
        features: state.features.map((feature) => {
          if (feature.contextMenus) {
            return {
              ...feature,
              contextMenus: feature.contextMenus.map((item) => {
                if (item.children) {
                  return {
                    ...item,
                    children: item.children.map((child) =>
                      child.id === id ? contextMenu : child
                    ),
                  };
                }
                return item.id === id ? contextMenu : item;
              }),
            };
          }
          return feature;
        }),
      }));
    },
  }));
};
