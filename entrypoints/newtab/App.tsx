import MainContextMenu, { MenuItem } from "@/components/main-context-menu";
import wallpaperFeature from "./features/wallpaper";
import historyFeature from "./features/history";
import topSitesFeature from "./features/topSites";
import { useCoreStore } from "./coreStore";

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
    coreStore.registerFeature(historyFeature);
    coreStore.registerFeature(topSitesFeature);
  }, []);

  return (
    <MainContextMenu menuItems={menuItems}>
      <div className="relative isolate flex min-h-svh w-full flex-col">
        {coreStore.features
          .filter((feature) => feature.enabled)
          .map((feature) => {
            return <feature.render key={feature.id} />;
          })}
      </div>
    </MainContextMenu>
  );
}

export default APP;
