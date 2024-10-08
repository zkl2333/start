"use server";

import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategoryById,
  ICategory,
} from "@/lib/category";
import { getLayouts, saveLayouts } from "@/lib/layouts";
import { readSetting, updateSetting } from "@/lib/settings";

// 获取所有分类
export const getCategorys = async () => {
  return await getCategories();
};

// 添加分类
export const addCategoryAction = async (category: Omit<ICategory, "id">) => {
  return await addCategory(category);
};

// 更新分类
export const updateCategoryAction = async (category: ICategory) => {
  await updateCategory(category);
};

// 删除分类
export const deleteCategoryAction = async (id: string) => {
  await deleteCategoryById(id);
  // 在这里可以调用更新链接的逻辑，但更好的方式是在 API 路由中处理
};

// 获取布局数据
export const getLayoutsAction = async () => {
  return await getLayouts();
};

// 保存布局数据
export const saveLayoutsAction = async (layouts: any) => {
  await saveLayouts(layouts);
};

// 更新或添加设置项
export const updateSettingAction = async (key: string, value: any) => {
  await updateSetting(key, value);
};

// 读取指定设置项
export const readSettingAction = async <T>(key: string, defaultVale?: T) => {
  return (await readSetting(key)) || defaultVale;
};
