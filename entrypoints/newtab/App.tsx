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
