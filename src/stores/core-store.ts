import { MenuItem } from "@/components/main-context-menu";
import { createStore } from "zustand/vanilla";
import { readSettingAction, updateSettingAction } from "./actions";

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
  registerFeature: (feature: IFeature) => Promise<void>;
  enableFeature: (id: string) => Promise<void>;
  disableFeature: (id: string) => Promise<void>;
  updateContextMenu: (id: string, contextMenu: MenuItem) => void;
}

export const createFeature = (feature: IFeature) => feature;

export const createCoreStore = () => {
  return createStore<ICoreStore>()((set, get) => ({
    features: [] as IFeature[],
    registerFeature: async (feature) => {
      // 从设置文件中读取特性是否启用
      const enabled = await readSettingAction(`features.${feature.id}.enabled`);
      feature.enabled = enabled !== undefined ? enabled : feature.enabled;

      set((state) => {
        if (state.features.some((f) => f.name === feature.name)) {
          return state;
        }

        return {
          features: [...state.features, feature],
        };
      });
    },
    enableFeature: async (id) => {
      await updateSettingAction(`features.${id}.enabled`, true);
      set((state) => ({
        features: state.features.map((f) =>
          f.id === id ? { ...f, enabled: true } : f
        ),
      }));
    },
    disableFeature: async (id) => {
      await updateSettingAction(`features.${id}.enabled`, false);
      set((state) => ({
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
