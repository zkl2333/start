"use client";
import MainContextMenu, { MenuItem } from "@/components/main-context-menu";
import clock from "@/features/clock";
import customizeNavigation from "@/features/customize-navigation";
import wallpaperFeature from "@/features/wallpaper";
import { useCoreStore } from "@/providers/core-store-provider";
import { useEffect } from "react";

const useAllFeatures = () => {
  return useCoreStore((state) => state.features);
};

export default function Home() {
  const coreStore = useCoreStore((state) => state);

  const allFeatures = useAllFeatures();
  const enabledFeatures = coreStore.features.filter(
    (feature) => feature.enabled
  );
  const enabledFeaturesContextMenus = enabledFeatures.flatMap(
    (feature) => feature.contextMenus || []
  );

  const menuItems: MenuItem[] = [
    ...allFeatures.map((feature) => {
      return {
        type: "checkbox",
        label: feature.name,
        checked: feature.enabled,
        onSelect: () => {
          if (feature.enabled) {
            coreStore.disableFeature(feature.id);
          } else {
            coreStore.enableFeature(feature.id);
          }
        },
      } as const;
    }),
    {
      type: "separator",
    },
    {
      type: "item",
      label: "刷新",
      inset: true,
      shortcut: ["ctrl", "r"],
      onSelect: () => {
        window.location.reload();
      },
    },
    enabledFeaturesContextMenus.length > 0 && {
      type: "separator",
    },
    ...enabledFeaturesContextMenus,
  ].filter(Boolean) as MenuItem[];

  useEffect(() => {
    coreStore.registerFeature(wallpaperFeature);
    coreStore.registerFeature(clock);
    coreStore.registerFeature(customizeNavigation);
  }, [coreStore]);

  return (
    <MainContextMenu menuItems={menuItems}>
      <div className="h-svh w-full">
        <div className="absolute inset-0 h-full w-full -z-10">
          {enabledFeatures.map((feature) => {
            return feature.render && <feature.render key={feature.id} />;
          })}
        </div>
        <div className="absolute h-full w-full flex flex-col overflow-auto">
          <div className="container h-full flex flex-col justify-center gap-20">
            {enabledFeatures.map((feature) => {
              return (
                feature.content && (
                  <feature.content
                    key={feature.id}
                    globalMenuItems={menuItems}
                  />
                )
              );
            })}
          </div>
        </div>
      </div>
    </MainContextMenu>
  );
}
