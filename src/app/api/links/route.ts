import { v4 as uuidv4 } from "uuid";
import { promises as fs } from "fs";
import path from "path";
import YAML from "yaml";

// 数据文件路径
const dataFileName = "links.yaml";
const dataFilePath = path.join(process.cwd(), "data/storage", dataFileName);

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

export async function GET() {
  const links = await readData();
  return new Response(
    JSON.stringify({
      success: true,
      data: links,
    }),
    { status: 200 }
  );
}

export async function POST(request: Request) {
  const body = await request.json();

  const links = await readData();
  links.push({ id: uuidv4(), ...body });
  await writeData(links);

  return new Response(
    JSON.stringify({
      success: true,
    }),
    { status: 201 }
  );
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const searchParams = new URL(request.url).searchParams;
  const id = searchParams.get("id");

  let links = await readData();
  const index = links.findIndex((item: { id: any }) => item.id === id);

  if (index === -1) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "id not found",
      }),
      { status: 404 }
    );
  }

  links[index] = { ...links[index], ...body };
  await writeData(links);

  return new Response(
    JSON.stringify({
      success: true,
    }),
    { status: 200 }
  );
}

export async function DELETE(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const id = searchParams.get("id");

  let links = await readData();
  links = links.filter((item: { id: any }) => item.id !== id);
  await writeData(links);

  return new Response(
    JSON.stringify({
      success: true,
    }),
    { status: 200 }
  );
}

export async function PUT(request: Request) {
  const body = await request.json();

  let links = await readData();
  const index = links.findIndex((item: { id: any }) => item.id === body.id);

  if (index === -1) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "id not found",
      }),
      { status: 404 }
    );
  }

  links[index] = body;
  await writeData(links);

  return new Response(
    JSON.stringify({
      success: true,
    }),
    { status: 200 }
  );
}
