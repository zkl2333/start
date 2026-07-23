"use client";
import MainContextMenu, { MenuItem } from "@/components/main-context-menu";
import clock from "@/features/clock";
import getCustomizeNavigation from "@/features/customize-navigation";
import wallpaperFeature from "@/features/wallpaper";
import { useCoreStore } from "@/providers/core-store-provider";
import NiceModal from "@ebay/nice-modal-react";
import { useEffect } from "react";

export default function Home() {
  const features = useCoreStore((state) => state.features);
  const registerFeature = useCoreStore((state) => state.registerFeature);
  const enableFeature = useCoreStore((state) => state.enableFeature);
  const disableFeature = useCoreStore((state) => state.disableFeature);
  const updateContextMenu = useCoreStore((state) => state.updateContextMenu);

  const enabledFeatures = features.filter((feature) => feature.enabled);
  const enabledFeaturesContextMenus = enabledFeatures.flatMap(
    (feature) => feature.contextMenus || []
  );

  const menuItems: MenuItem[] = [
    ...features.map((feature) => {
      return {
        type: "checkbox",
        label: feature.name,
        checked: feature.enabled,
        onSelect: () => {
          if (feature.enabled) {
            disableFeature(feature.id);
          } else {
            enableFeature(feature.id);
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
    const init = async () => {
      await Promise.all([
        registerFeature(wallpaperFeature),
        registerFeature(clock),
        getCustomizeNavigation().then(registerFeature),
      ]);
    };
    void init();
  }, [registerFeature]);

  return (
    <NiceModal.Provider>
      <MainContextMenu
        menuItems={menuItems}
        updateMenuItem={(menuItem) => {
          if (menuItem.id) {
            updateContextMenu(menuItem.id, menuItem);
          }
        }}
      >
        <div className="main-content h-svh w-full">
          <div className="absolute inset-0 h-full w-full -z-10">
            {enabledFeatures.map((feature) => {
              return feature.render && <feature.render key={feature.id} />;
            })}
          </div>
          <div className="absolute h-full w-full flex flex-col overflow-auto">
            <div className="container flex flex-col justify-center gap-20 py-20">
              {enabledFeatures.map((feature) => {
                return (
                  feature.content && (
                    <feature.content
                      key={feature.id}
                      globalMenuItems={menuItems}
                      updateMenuItem={updateContextMenu}
                    />
                  )
                );
              })}
            </div>
          </div>
        </div>
      </MainContextMenu>
    </NiceModal.Provider>
  );
}
