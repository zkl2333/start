import { promises as fs } from "fs";
import path from "path";
import YAML from "yaml";
import { v4 as uuidv4 } from "uuid";

// 数据文件路径
const categoryDataFileName = "category.yaml";
const categoryDataFilePath = path.join(
  process.cwd(),
  "data/storage",
  categoryDataFileName
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
async function readData() {
  try {
    await checkFileAndDir(categoryDataFilePath);
    const fileContents = await fs.readFile(categoryDataFilePath, "utf8");
    return YAML.parse(fileContents) || [];
  } catch (err) {
    return [];
  }
}

// 写入数据
async function writeData(data: any) {
  await checkFileAndDir(categoryDataFilePath);
  const yamlStr = YAML.stringify(data);
  await fs.writeFile(categoryDataFilePath, yamlStr, "utf8");
}

// 分类接口
export interface ICategory {
  id: string;
  name: string;
  icon?: string;
}

// 获取所有分类
export const getCategories = async () => {
  return await readData();
};

// 添加分类
export const addCategory = async (category: Omit<ICategory, "id">) => {
  const categories = await readData();
  const newCategory: ICategory = {
    id: uuidv4(),
    ...category,
  };
  categories.push(newCategory);
  await writeData(categories);
  return newCategory;
};

// 更新分类
export const updateCategory = async (category: ICategory) => {
  const categories = await readData();
  const index = categories.findIndex(
    (item: ICategory) => item.id === category.id
  );
  if (index === -1) {
    throw new Error("分类未找到");
  }
  categories[index] = category;
  await writeData(categories);
};

export const updateCategoryById = async (id: string, data: ICategory) => {
  const categories = await readData();
  const index = categories.findIndex((item: ICategory) => item.id === id);
  if (index === -1) {
    throw new Error("分类未找到");
  }
  categories[index] = { ...categories[index], ...data };
  await writeData(categories);
};

// 删除分类
export const deleteCategoryById = async (id: string) => {
  let categories = await readData();
  categories = categories.filter((item: ICategory) => item.id !== id);
  await writeData(categories);
};
