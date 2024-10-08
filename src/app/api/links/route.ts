import { NextRequest, NextResponse } from "next/server";
import { addLink, updateLink, deleteLink, readData } from "@/lib/links";

// 获取所有链接
export async function GET() {
  const links = await readData();
  return NextResponse.json({ success: true, data: links }, { status: 200 });
}

// 创建新链接
export async function POST(request: NextRequest) {
  const body = await request.json();
  await addLink(body);
  return NextResponse.json({ success: true }, { status: 201 });
}

// 更新链接
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, message: "需要提供链接 ID" },
      { status: 400 }
    );
  }

  try {
    await updateLink(id, body);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 404 }
    );
  }
}

// 删除链接
export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, message: "需要提供链接 ID" },
      { status: 400 }
    );
  }

  try {
    await deleteLink(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 404 }
    );
  }
}
