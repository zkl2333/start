import Wallpaper from "@/components/wallpaper";
import { createEventBus } from "@/lib/utils";
import { createFeature } from "../coreStore";

const eventBus = createEventBus();

const wallpaper = createFeature({
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
  render: () => {
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

    return (
      <div className="relative isolate flex min-h-svh w-full flex-col">
        <Wallpaper ref={wallpaperRef} />
      </div>
    );
  },
});

export default wallpaper;
