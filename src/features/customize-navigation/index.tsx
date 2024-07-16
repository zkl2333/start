import { createFeature } from "@/stores/core-store";
import { Content } from "./content";

const customizeNavigation = createFeature({
  name: "自定义导航",
  id: "customizeNavigation",
  enabled: true,
  content: Content,
});

export default customizeNavigation;
