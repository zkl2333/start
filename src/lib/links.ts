import { promises as fs } from "fs";
import path from "path";
import YAML from "yaml";
import { v4 as uuidv4 } from "uuid";

// 数据文件路径
const linksDataFileName = "links.yaml";
const linksDataFilePath = path.join(
  process.cwd(),
  "data/storage",
  linksDataFileName
);

// 检查文件和文件夹是否存在
async function checkFileAndDir() {
  try {
    await fs.access(linksDataFilePath);
  } catch (err) {
    await fs.mkdir(path.dirname(linksDataFilePath), { recursive: true });
    await fs.writeFile(linksDataFilePath, "", "utf8");
  }
}

// 读取数据
export async function readData() {
  try {
    await checkFileAndDir();
    const fileContents = await fs.readFile(linksDataFilePath, "utf8");
    return YAML.parse(fileContents) || [];
  } catch (err) {
    return [];
  }
}

// 写入数据
export async function writeData(data: any) {
  await checkFileAndDir();
  const yamlStr = YAML.stringify(data);
  await fs.writeFile(linksDataFilePath, yamlStr, "utf8");
}

// 添加链接
export async function addLink(link: any) {
  const links = await readData();
  links.push({ id: uuidv4(), ...link });
  await writeData(links);
}

// 更新链接
export async function updateLink(id: string, data: any) {
  const links = await readData();
  const index = links.findIndex((item: { id: string }) => item.id === id);
  if (index === -1) {
    throw new Error("链接未找到");
  }
  links[index] = { ...links[index], ...data };
  await writeData(links);
}

// 删除链接
export async function deleteLink(id: string) {
  let links = await readData();
  links = links.filter((item: { id: string }) => item.id !== id);
  await writeData(links);
}

// 当分类被删除时更新链接
export async function updateLinksOnCategoryDeletion(categoryId: string) {
  let links = await readData();
  links = links
    .map((link: any) => {
      if (link.category === categoryId) {
        // 选项 1：移除分类关联
        return { ...link, category: null };
        // 如果想要删除这些链接，可以使用以下代码：
        // return null;
      }
      return link;
    })
    .filter(Boolean);
  await writeData(links);
}
