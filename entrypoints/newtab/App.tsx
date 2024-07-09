import MainContextMenu, { MenuItem } from "@/components/main-context-menu";
import Wallpaper, { WallpaperRef } from "@/components/wallpaper";

function APP() {
  const wallpaperRef = useRef<WallpaperRef>(null);

  const menuItems: MenuItem[] = [
    {
      type: "item",
      label: "上一张壁纸",
      shortcut: ["alt", "["],
      inset: true,
      onSelect: () => wallpaperRef.current?.prev(),
    },
    {
      type: "item",
      label: "下一张壁纸",
      shortcut: ["alt", "]"],
      inset: true,
      onSelect: () => wallpaperRef.current?.next(),
    },
    {
      type: "item",
      label: "申请权限",
      inset: true,
      onSelect: () => {
        browser.permissions
          .request({
            origins: ["https://example.com/*"],
          })
          .then((granted) => {
            console.log("申请权限", granted);
          })
          .catch((error) => {
            console.error("申请权限失败", error);
          });
      },
    },
  ];

  return (
    <MainContextMenu menuItems={menuItems}>
      <div className="relative isolate flex min-h-svh w-full flex-col">
        <Wallpaper ref={wallpaperRef} />
      </div>
    </MainContextMenu>
  );
}

export default APP;
