import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import Image from "next/image";
import { fetchImages, WallpaperItem } from "./actions";

type DateString = string;

export interface WallpaperRef {
  next: () => void;
  prev: () => void;
}

const bingWallpaperLoader = ({
  src,
  width,
}: {
  src: string;
  width: number;
}) => {
  const url = new URL(src);
  const id = url.searchParams.get("id")!.match(/(.+?)_UHD\.jpg/)![1];
  url.hostname = "cn.bing.com";
  const size = width > 1920 ? "UHD" : "1920x1080";
  const newId = `${id}_${size}.jpg`;
  url.searchParams.set("id", newId);
  return url.toString();
};

const Wallpaper = forwardRef<WallpaperRef>((_, ref) => {
  const [wallpapers, setWallpapers] = useState<Record<
    DateString,
    WallpaperItem
  > | null>(null);
  const [date, setDate] = useState<DateString | null>(null);

  const setDateString = (date: string) => {
    localStorage.setItem("wallpaperDate", date);
    setDate(date);
  };

  useEffect(() => {
    fetchImages().then((images) => {
      setWallpapers(images);
      const date = localStorage.getItem("wallpaperDate");
      if (date) {
        setDate(date);
      } else {
        const dates = Object.keys(images || {});
        setDate(dates[dates.length - 1]);
      }
    });
  }, []);

  const dates = Object.keys(wallpapers || {});
  const length = dates.length;

  useImperativeHandle(ref, () => ({
    prev() {
      if (!wallpapers || !date) return;
      const index = dates.indexOf(date);
      setDateString(dates[(index + 1) % length]);
    },
    next() {
      if (!wallpapers || !date) return;
      const index = dates.indexOf(date);
      setDateString(dates[(index - 1 + length) % length]);
    },
  }));

  if (!wallpapers || !date) return;

  const currentWallpaper = wallpapers[date];

  return (
    <div className="relative w-full h-full">
      {currentWallpaper && (
        <>
          <Image
            priority
            loader={bingWallpaperLoader}
            className="w-full h-full object-cover"
            src={currentWallpaper.url}
            alt={currentWallpaper.copyright}
            sizes="100vw"
            width={3840}
            height={2160}
          />
          <div className="bg-gray-700/30 absolute inset-0">
            <div className="absolute bottom-0 right-4 p-4 opacity-80 text-white text-right [text-shadow:_0_0_4px_rgb(0_0_0)]">
              <a
                href={currentWallpaper.copyrightlink}
                target="_blank"
                rel="noreferrer noopener"
                className="text-xs"
              >
                {currentWallpaper.copyright}
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

Wallpaper.displayName = "Wallpaper";

export default Wallpaper;
