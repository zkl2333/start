"use server";

import { v4 as uuidv4 } from "uuid";
import path from "path";
import YAML from "yaml";
import { promises as fs } from "fs";

// 数据文件路径
const dataFileName = "category.yaml";
const dataFilePath = path.join(process.cwd(), "data/storge", dataFileName);

// 检查文件和文件夹是否存在
async function checkFileAndDir() {
  try {
    await fs.access(dataFilePath);
  } catch (err) {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, "", "utf8");
  }
}

// 读取数据
async function readData() {
  try {
    await checkFileAndDir();
    const fileContents = await fs.readFile(dataFilePath, "utf8");
    return YAML.parse(fileContents) || [];
  } catch (err) {
    return [];
  }
}

// 写入数据
async function writeData(data: any) {
  await checkFileAndDir();
  const yamlStr = YAML.stringify(data);
  await fs.writeFile(dataFilePath, yamlStr, "utf8");
}

export interface ICategroy {
  id: string;
  name: string;
  icon?: string;
}

export const getCategorys = async () => {
  const category = await readData();
  if (category.length > 0) {
    return category;
  }

  return [];
};

export const addCategory = async (category: Omit<ICategroy, "id">) => {
  const categorys = await readData();
  categorys.push({
    id: uuidv4(),
    ...category,
  });
  await writeData(categorys);
};

export const updateCategory = async (category: ICategroy) => {
  const categorys = await readData();
  const index = categorys.findIndex(
    (item: ICategroy) => item.id === category.id
  );
  if (index === -1) {
    return;
  }

  categorys[index] = category;
  await writeData(categorys);
};

export const deleteCategory = async (id: string) => {
  let categorys = await readData();
  categorys = categorys.filter((item: ICategroy) => item.id !== id);
  await writeData(categorys);
};
