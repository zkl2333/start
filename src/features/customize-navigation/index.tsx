import { createFeature } from "@/stores/core-store";
import Content from "./content";

const customizeNavigation = createFeature({
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

export default customizeNavigation;
