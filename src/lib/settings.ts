import { promises as fs } from "fs";
import path from "path";
import YAML from "yaml";

// 数据文件路径
const settingsDataFileName = "settings.yaml";
const settingsDataFilePath = path.join(
  process.cwd(),
  "data/storage",
  settingsDataFileName
);

// 检查文件和文件夹是否存在
async function checkFileAndDir() {
  try {
    await fs.access(settingsDataFilePath);
  } catch (err) {
    await fs.mkdir(path.dirname(settingsDataFilePath), { recursive: true });
    await fs.writeFile(settingsDataFilePath, "", "utf8");
  }
}

// 解析键，支持嵌套和数组语法
function parseKey(key: string): (string | number)[] {
  const regex = /(\w+)|\[(\d+)\]/g;
  const path: (string | number)[] = [];
  let match;
  while ((match = regex.exec(key)) !== null) {
    if (match[1]) {
      // 匹配到单词
      path.push(match[1]);
    } else if (match[2]) {
      // 匹配到数组索引
      path.push(Number(match[2]));
    }
  }
  return path;
}

// 读取设置
export async function readSettings() {
  try {
    await checkFileAndDir();
    const fileContents = await fs.readFile(settingsDataFilePath, "utf8");
    return YAML.parse(fileContents) || {};
  } catch (err) {
    return {};
  }
}

// 写入设置
export async function writeSettings(data: any) {
  await checkFileAndDir();
  const yamlStr = YAML.stringify(data);
  await fs.writeFile(settingsDataFilePath, yamlStr, "utf8");
}

// 更新设置，支持嵌套和数组语法
export async function updateSetting(key: string, value: any) {
  const settings = await readSettings();
  const keys = parseKey(key);
  let current = settings;

  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (typeof k === "number") {
      if (!Array.isArray(current)) {
        current = [];
      }
      if (!current[k]) {
        current[k] = {};
      }
    } else {
      if (!current[k] || typeof current[k] !== "object") {
        current[k] = {};
      }
    }
    current = current[k];
  }

  const lastKey = keys[keys.length - 1];
  current[lastKey] = value;
  await writeSettings(settings);
}

// 读取指定设置，支持嵌套和数组语法
export async function readSetting(key: string) {
  const settings = await readSettings();
  const keys = parseKey(key);
  let current = settings;

  for (const k of keys) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[k];
  }

  return current;
}

// 删除设置，支持嵌套和数组语法
export async function deleteSetting(key: string) {
  const settings = await readSettings();
  const keys = parseKey(key);
  let current = settings;

  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (current[k] === undefined) {
      return; // 路径不存在，直接返回
    }
    current = current[k];
  }

  const lastKey = keys[keys.length - 1];
  if (Array.isArray(current) && typeof lastKey === "number") {
    current.splice(lastKey, 1);
  } else {
    delete current[lastKey];
  }

  await writeSettings(settings);
}
