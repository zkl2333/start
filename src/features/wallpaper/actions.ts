"use server";

import { updateSetting, readSetting } from "@/lib/settings";

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

// 更新或添加设置项
export const updateSettingAction = async (key: string, value: any) => {
  await updateSetting(key, value);
};

// 读取指定设置项
export const readSettingAction = async <T>(key: string, defaultVale?: T) => {
  return (await readSetting(key)) || defaultVale;
};
