import { NextRequest, NextResponse } from "next/server";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategoryById,
} from "@/lib/category";
import { updateLinksOnCategoryDeletion } from "@/lib/links";
import { deleteLayoutsByCategory } from "@/lib/layouts";

// 获取所有分类
export async function GET() {
  const categories = await getCategories();
  return NextResponse.json(
    { success: true, data: categories },
    { status: 200 }
  );
}

// 创建新分类
export async function POST(request: NextRequest) {
  const body = await request.json();
  await addCategory(body);
  return NextResponse.json({ success: true }, { status: 201 });
}

// 更新分类
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, message: "需要提供分类 ID" },
      { status: 400 }
    );
  }

  try {
    await updateCategory({ id, ...body });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 404 }
    );
  }
}

// 删除分类
export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, message: "需要提供分类 ID" },
      { status: 400 }
    );
  }

  try {
    await deleteCategoryById(id);
    // 更新关联的链接
    await updateLinksOnCategoryDeletion(id);
    await deleteLayoutsByCategory(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 404 }
    );
  }
}
