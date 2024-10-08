"use server";

import { readSetting, updateSetting } from "@/lib/settings";

// 更新或添加设置项
export const updateSettingAction = async (key: string, value: any) => {
  await updateSetting(key, value);
};

// 读取指定设置项
export const readSettingAction = async <T>(key: string, defaultVale?: T) => {
  return (await readSetting(key)) || defaultVale;
};
