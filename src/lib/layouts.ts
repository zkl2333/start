import { promises as fs } from "fs";
import path from "path";
import YAML from "yaml";

// 数据文件路径
const layoutsDataFileName = "layouts.yaml";
const layoutsDataFilePath = path.join(
  process.cwd(),
  "data/storage",
  layoutsDataFileName
);

// 检查文件和文件夹是否存在
async function checkFileAndDir() {
  try {
    await fs.access(layoutsDataFilePath);
  } catch (err) {
    await fs.mkdir(path.dirname(layoutsDataFilePath), { recursive: true });
    await fs.writeFile(layoutsDataFilePath, "", "utf8");
  }
}

// 读取数据
export async function getLayouts() {
  try {
    await checkFileAndDir();
    const fileContents = await fs.readFile(layoutsDataFilePath, "utf8");
    return YAML.parse(fileContents) || {};
  } catch (err) {
    return {};
  }
}

// 写入数据
export async function saveLayouts(data: any) {
  await checkFileAndDir();
  const yamlStr = YAML.stringify(data);
  await fs.writeFile(layoutsDataFilePath, yamlStr, "utf8");
}

// 删除指定分类的布局
export async function deleteLayoutsByCategory(categoryId: string) {
  const layouts = await getLayouts();
  delete layouts[categoryId];
  await saveLayouts(layouts);
}
