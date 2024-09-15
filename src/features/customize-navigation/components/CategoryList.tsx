// components/CategoryList.tsx
import React from "react";
import { ICategory } from "../types";
import { cn } from "@/lib/utils";

interface CategoryListProps {
  categories: ICategory[];
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  activeCategory,
  setActiveCategory,
}) => {
  return (
    <div className="ml-4 p-2 glass">
      <ul className="text-white text-sm space-y-2">
        {categories.map((category) => (
          <li
            key={category.id}
            className={cn(
              "nowrap flex items-center justify-center gap-2 cursor-pointer hover:glass rounded-full p-4",
              {
                "bg-[#FF5682]/90 hover:bg-[#FF5682] glass":
                  category.name === activeCategory,
              }
            )}
            onClick={() => setActiveCategory(category.name)}
          >
            {category.name}
          </li>
        ))}
        <li>
          <div
            className={cn(
              "nowrap flex items-center justify-center gap-2 cursor-pointer hover:glass rounded-full p-4",
              {
                "bg-[#FF5682]/90 hover:bg-[#FF5682] glass":
                  activeCategory === null,
              }
            )}
            onClick={() => setActiveCategory(null)}
          >
            未分类
          </div>
        </li>
      </ul>
    </div>
  );
};

export default CategoryList;
