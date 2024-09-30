// components/CategoryList.tsx
import React from "react";
import { cn } from "@/lib/utils";
import MainContextMenu, { MenuItem } from "@/components/main-context-menu";
import { ICategory } from "@/lib/category";

interface CategoryListProps {
  categories: ICategory[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  getContextMenuItems: (item: ICategory) => MenuItem[];
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  activeCategory,
  setActiveCategory,
  getContextMenuItems,
}) => {
  return (
    <div className="p-2 glass">
      <ul className="text-white text-sm gap-2 flex flex-row md:flex-col rounded-2xl overflow-auto">
        {categories.map((category) => (
          <MainContextMenu
            key={category.id}
            menuItems={getContextMenuItems(category)}
          >
            <li
              className={cn(
                "w-24 md:w-full nowrap flex items-center justify-center gap-2 cursor-pointer hover:glass rounded-full p-4 text-nowrap flex-shrink-0",
                {
                  "bg-[#FF5682]/90 hover:bg-[#FF5682] glass":
                    category.id === activeCategory,
                }
              )}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </li>
          </MainContextMenu>
        ))}
        <li
          className={cn(
            "w-24 md:w-full nowrap flex items-center justify-center gap-2 cursor-pointer hover:glass rounded-full p-4 text-nowrap flex-shrink-0",
            {
              "bg-[#FF5682]/90 hover:bg-[#FF5682] glass":
                activeCategory === "uncategorized",
            }
          )}
          onClick={() => setActiveCategory("uncategorized")}
        >
          未分类
        </li>
      </ul>
    </div>
  );
};

export default CategoryList;
