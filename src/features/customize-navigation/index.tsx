import { createFeature } from "@/stores/core-store";
import Content from "./content";
import { readSettingAction, updateSettingAction } from "./actions";

const getCustomizeNavigation = async () => {
  const defaultFlatMode = await readSettingAction(
    "features.customizeNavigation.flatMode",
    false
  );
  const setFlatMode = (checked: boolean) => {
    updateSettingAction("features.customizeNavigation.flatMode", checked);
  };
  return createFeature({
    name: "自定义导航",
    id: "customizeNavigation",
    enabled: true,
    content: Content,
    contextMenus: [
      {
        id: "customizeNavigationEditingMode",
        type: "checkbox",
        label: "布局模式",
        shortcut: ["alt", "s"],
        checked: false,
        onSelect: (_, item) => {
          return {
            checked: !item.checked,
          };
        },
      },
      {
        id: "customizeNavigationFlatMode",
        type: "checkbox",
        label: "分类平铺",
        checked: defaultFlatMode,
        onSelect: (_, item) => {
          setFlatMode(!item.checked);
          return {
            checked: !item.checked,
          };
        },
      },
      {
        id: "customizeNavigationIntranetMode",
        type: "checkbox",
        label: "内网模式",
        inset: true,
        checked: true,
        onSelect: (_, item) => {
          return {
            checked: !item.checked,
          };
        },
      },
    ],
  });
};

export default getCustomizeNavigation;
