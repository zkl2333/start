import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import Image from "next/image";

interface WallpaperItem {
  url: string;
  copyright: string;
  copyrightlink: string;
}

type DateString = string;

export interface WallpaperRef {
  next: () => void;
  prev: () => void;
}

const fetchImages = async () => {
  const res = await fetch(
    "https://cdn.jsdelivr.net/gh/asvow/bing-wallpaper@main/bing.json"
  );
  const data = (await res.json()) as Record<string, WallpaperItem>;
  return data;
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-full h-full object-cover"
            src={currentWallpaper.url}
            alt={currentWallpaper.copyright}
            // width={3840}
            // height={2160}
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
