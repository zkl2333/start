import MainContextMenu, { MenuItem } from "@/components/main-context-menu";
import wallpaperFeature from "./features/wallpaper";
// import historyFeature from "./features/history";
import topSitesFeature from "./features/topSites";
import { useCoreStore } from "./coreStore";
import customizeNavigation from "./features/customize-navigation";
import clock from "./features/clock";

const useAllFeatures = () => {
  const coreStore = useCoreStore();
  return coreStore.features;
};

let isSidepanelOpened = false;

browser.runtime.onConnect.addListener((port) => {
  if (port.name === "mySidepanel") {
    console.log("Sidepanel opened.");
    isSidepanelOpened = true;
    port.onDisconnect.addListener(() => {
      console.log("Sidepanel closed.");
      isSidepanelOpened = false;
    });
  }
});

const SidepanelBtn = () => {
  return isSidepanelOpened ? "关闭侧边栏" : "打开侧边栏";
};

function APP() {
  const coreStore = useCoreStore();

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
      label: <SidepanelBtn />,
      shortcut: ["alt", "s"],
      inset: true,
      onSelect: async () => {
        const tab = await browser.tabs.getCurrent();

        if (isSidepanelOpened) {
          // @ts-ignore
          await browser.sidePanel.setOptions({
            enabled: false,
          });
          return;
        }

        // @ts-ignore
        await browser.sidePanel.setOptions({
          enabled: true,
          path: "/sidePanel.html",
        });

        // @ts-ignore
        await browser.sidePanel.open({
          tabId: tab.id,
        });
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
    // coreStore.registerFeature(historyFeature);
    coreStore.registerFeature(topSitesFeature);
    coreStore.registerFeature(customizeNavigation);
  }, []);

  return (
    <MainContextMenu menuItems={menuItems}>
      <div className="relative h-svh w-full">
        <div className="absolute h-full w-full -z-10">
          {enabledFeatures.map((feature) => {
            return feature.render && <feature.render key={feature.id} />;
          })}
        </div>
        <div className="absolute h-full w-full flex flex-col overflow-auto">
          <div className="container">
            {enabledFeatures.map((feature) => {
              return feature.content && <feature.content key={feature.id} />;
            })}
          </div>
        </div>
      </div>
    </MainContextMenu>
  );
}

export default APP;
