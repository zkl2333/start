"use server";

export interface WallpaperItem {
  url: string;
  copyright: string;
  copyrightlink: string;
}

export const fetchImages = async () => {
  const res = await fetch(
    "https://cdn.jsdelivr.net/gh/asvow/bing-wallpaper@main/bing.json"
  );
  const data = (await res.json()) as Record<string, WallpaperItem>;
  return data;
};
