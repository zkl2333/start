import { createFeature } from "@/app/coreStore";
import Wallpaper, { WallpaperRef } from "@/components/wallpaper";
import { createEventBus } from "@/lib/utils";
import { useRef, useEffect } from "react";

const eventBus = createEventBus();

const Render = () => {
  const wallpaperRef = useRef<WallpaperRef>(null);

  useEffect(() => {
    const prev = () => {
      wallpaperRef.current?.prev();
    };

    const next = () => {
      wallpaperRef.current?.next();
    };

    eventBus.on("prev", prev);
    eventBus.on("next", next);

    return () => {
      eventBus.off("prev", prev);
      eventBus.off("next", next);
    };
  }, [wallpaperRef]);

  return <Wallpaper ref={wallpaperRef} />;
};

const wallpaperFeature = createFeature({
  name: "Bing 壁纸",
  id: "wallpaper",
  enabled: true,
  contextMenus: [
    {
      type: "item",
      label: "上一张壁纸",
      shortcut: ["alt", "["],
      inset: true,
      onSelect: () => eventBus.emit("prev"),
    },
    {
      type: "item",
      label: "下一张壁纸",
      shortcut: ["alt", "]"],
      inset: true,
      onSelect: () => eventBus.emit("next"),
    },
  ],
  render: Render,
});

export default wallpaperFeature;