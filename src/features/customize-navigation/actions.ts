"use server";

import { v4 as uuidv4 } from "uuid";
import path from "path";
import YAML from "yaml";
import { promises as fs } from "fs";

// 数据文件路径
const categoryDataFileName = "category.yaml";
const layoutsDataFileName = "layouts.yaml";
const categoryDataFilePath = path.join(
  process.cwd(),
  "data/storage",
  categoryDataFileName
);
const layoutsDataFilePath = path.join(
  process.cwd(),
  "data/storage",
  layoutsDataFileName
);

// 检查文件和文件夹是否存在
async function checkFileAndDir(filePath: string) {
  try {
    await fs.access(filePath);
  } catch (err) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, "", "utf8");
  }
}

// 读取数据
async function readData(categoryDataFilePath: string) {
  try {
    await checkFileAndDir(categoryDataFilePath);
    const fileContents = await fs.readFile(categoryDataFilePath, "utf8");
    if (!fileContents) {
      return null;
    }
    return YAML.parse(fileContents);
  } catch (err) {
    return null;
  }
}

// 写入数据
async function writeData(categoryDataFilePath: string, data: any) {
  await checkFileAndDir(categoryDataFilePath);
  const yamlStr = YAML.stringify(data);
  await fs.writeFile(categoryDataFilePath, yamlStr, "utf8");
}

export interface ICategroy {
  id: string;
  name: string;
  icon?: string;
}

export const getCategorys = async () => {
  return (await readData(categoryDataFilePath)) || [];
};

export const addCategory = async (category: Omit<ICategroy, "id">) => {
  const categorys = (await readData(categoryDataFilePath)) || [];
  categorys.push({
    id: uuidv4(),
    ...category,
  });
  await writeData(categoryDataFilePath, categorys);
};

export const updateCategory = async (category: ICategroy) => {
  const categorys = (await readData(categoryDataFilePath)) || [];
  const index = categorys.findIndex(
    (item: ICategroy) => item.id === category.id
  );
  if (index === -1) {
    return;
  }

  categorys[index] = category;
  await writeData(categoryDataFilePath, categorys);
};

export const deleteCategory = async (id: string) => {
  let categorys = (await readData(categoryDataFilePath)) || [];
  categorys = categorys.filter((item: ICategroy) => item.id !== id);
  await writeData(categoryDataFilePath, categorys);
};

// 获取布局数据
export const getLayouts = async () => {
  return (await readData(layoutsDataFilePath)) || {};
};

// 保存布局数据
export const saveLayouts = async (layouts: any) => {
  return await writeData(layoutsDataFilePath, layouts);
};
