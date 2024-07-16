import { v4 as uuidv4 } from "uuid";
import { promises as fs } from "fs";
import path from "path";
import YAML from "yaml";

// 数据文件路径
const dataFilePath = path.join(process.cwd(), "data/storge", "links.yaml");

// 读取数据
async function readData() {
  try {
    const fileContents = await fs.readFile(dataFilePath, "utf8");
    return YAML.parse(fileContents);
  } catch (err) {
    return [];
  }
}

// 写入数据
async function writeData(data: any) {
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
  const { url, title } = body;

  if (!url) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "url is required",
      }),
      { status: 400 }
    );
  }

  const links = await readData();
  links.push({ id: uuidv4(), url, title });
  await writeData(links);

  return new Response(
    JSON.stringify({
      success: true,
    }),
    { status: 201 }
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
  const { id, url, title } = body;

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

  links[index] = { url, title, id };
  await writeData(links);

  return new Response(
    JSON.stringify({
      success: true,
    }),
    { status: 200 }
  );
}
