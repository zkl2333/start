import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { MenuItem } from "@/components/main-context-menu";
import CategoryList from "./components/CategoryList";
import NavGrid from "./components/NavGrid";
import useFetchUrls from "./hooks/useFetchUrls";
import useFetchCategories from "./hooks/useFetchCategories";
import useLayoutsPerCategoryStorage from "./hooks/useLayoutsPerCategoryStorage";
import { getContextMenu } from "@/components/main-context-menu";
import { cn } from "@/lib/utils";
import { Layout, Layouts } from "react-grid-layout";
import { INavItem } from "./types";
import { useModal } from "@ebay/nice-modal-react";
import AddLinkModal from "./addDialog";
import { ICategory } from "@/lib/category";
import { addCategoryAction } from "./actions";

const breakpoints: Record<string, number> = {
  lg: 1000,
  md: 768,
  xxs: 0,
};
const cols: Record<string, number> = {
  lg: 10,
  md: 8,
  xxs: 4,
};

// 获取某分类的链接
const getFilteredUrls = (
  urls: INavItem[],
  categories: ICategory[],
  categoryId: string
): INavItem[] => {
  const categoryExists = (id: string) =>
    categories.some((category) => category.id === id);

  return urls.filter((item) => {
    if (categoryId === "uncategorized") {
      return !item.category || !categoryExists(item.category);
    } else {
      return item.category === categoryId;
    }
  });
};

// 生成某分类的布局
const generateLayoutsForCategory = (
  urls: INavItem[],
  categories: ICategory[],
  categoryId: string
): Layouts => {
  const newLayouts: Layouts = {};
  const filteredUrls = getFilteredUrls(urls, categories, categoryId);

  Object.keys(cols).forEach((breakpoint) => {
    const colCount = cols[breakpoint];
    const layout = filteredUrls.map((item, index) => ({
      i: item.id,
      x: index % colCount,
      y: Math.floor(index / colCount),
      w: 1,
      h: 1,
    }));

    newLayouts[breakpoint] = layout;
  });

  return newLayouts;
};

// 生成链接的右键菜单
const generateNavItemContextMenu = (
  item: INavItem,
  categories: ICategory[],
  globalMenuItems: MenuItem[],
  fetchUrls: () => void,
  addLinkModal: any,
  reloadCategories: () => void
): MenuItem[] => [
  {
    type: "item",
    label: "删除",
    inset: true,
    onSelect: () => {
      fetch(`/api/links?id=${item.id}`, {
        method: "DELETE",
      })
        .then(() => {
          fetchUrls();
        })
        .catch(() => {
          alert("删除失败");
        });
    },
  },
  {
    type: "item",
    label: "编辑",
    inset: true,
    onSelect: () => {
      addLinkModal
        .show(item)
        .then(() => {
          fetchUrls();
        })
        .catch(() => {
          alert("编辑失败");
        });
    },
  },
  {
    type: "sub",
    label: "移动到",
    inset: true,
    children: [
      ...categories.map<MenuItem>((category) => ({
        type: "item",
        label: category.name,
        inset: true,
        onSelect: () => {
          fetch(`/api/links?id=${item.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ category: category.id }), // 使用分类的 ID
          })
            .then(() => {
              fetchUrls();
              reloadCategories();
            })
            .catch(() => {
              alert("移动失败");
            });
        },
      })),
      {
        type: "item",
        label: "新建分类",
        inset: true,
        onSelect: () => {
          const newCategoryName = prompt("请输入新的分类名称");
          if (newCategoryName)
            addCategoryAction({ name: newCategoryName }).then((category) => {
              fetch(`/api/links?id=${item.id}`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ category: category.id }), // 移动到未分类
              })
                .then(() => {
                  fetchUrls();
                  reloadCategories();
                })
                .catch(() => {
                  alert("移动失败");
                });
            });
        },
      },
    ],
  },
  {
    type: "separator",
  },
  ...globalMenuItems,
];

// 生成分类的右键菜单
const generateCategoryContextMenu = (
  category: ICategory,
  globalMenuItems: MenuItem[],
  reloadCategories: () => void,
  fetchUrls: () => void
): MenuItem[] => [
  {
    type: "item",
    label: "重命名分类",
    inset: true,
    onSelect: () => {
      const newCategoryName = prompt("请输入新的分类名称", category.name);
      if (newCategoryName && newCategoryName !== category.name) {
        fetch(`/api/categories?id=${category.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newCategoryName }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("重命名失败");
            }
            reloadCategories();
          })
          .catch((error) => {
            alert(error.message);
          });
      }
    },
  },
  {
    type: "item",
    label: "删除分类",
    inset: true,
    onSelect: () => {
      if (confirm("确认删除分类？")) {
        fetch(`/api/categories?id=${category.id}`, {
          method: "DELETE",
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("删除失败");
            }
            reloadCategories();
            fetchUrls();
          })
          .catch((error) => {
            alert(error.message);
          });
      }
    },
  },
  {
    type: "separator",
  },
  ...globalMenuItems,
];

const Content = ({
  globalMenuItems,
  updateMenuItem,
}: {
  globalMenuItems: MenuItem[];
  updateMenuItem: (id: string, contextMenu: MenuItem) => void;
}) => {
  const {
    urls,
    loading: urlsLoading,
    error: urlsError,
    refetch: fetchUrls,
  } = useFetchUrls();
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    reload: reloadCategories,
  } = useFetchCategories();
  const [activeCategory, setActiveCategory] = useState<string>("uncategorized");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && !categoriesLoading && categories.length > 0) {
      setActiveCategory(categories[0].id);
      setInitialized(true);
    }
  }, [categories, categoriesLoading, initialized]);

  const {
    layoutsPerCategory,
    setLayoutsPerCategory,
    loading: layoutsLoading,
    error: layoutsError,
  } = useLayoutsPerCategoryStorage();

  const customizeNavigationEditingMode = useMemo<MenuItem | null>(
    () => getContextMenu("customizeNavigationEditingMode", globalMenuItems),
    [globalMenuItems]
  );

  const customizeNavigationFlatMode = useMemo<MenuItem | null>(
    () => getContextMenu("customizeNavigationFlatMode", globalMenuItems),
    [globalMenuItems]
  );

  const isEditing = !!customizeNavigationEditingMode?.checked;
  const isFlatMode = !!customizeNavigationFlatMode?.checked;

  const contentRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (!customizeNavigationEditingMode) return;
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        isEditing
      ) {
        updateMenuItem("customizeNavigationEditingMode", {
          ...customizeNavigationEditingMode,
          checked: false,
        });
      }
    },
    [customizeNavigationEditingMode, isEditing, updateMenuItem]
  );

  useEffect(() => {
    const mainContent = document.querySelector(".main-content") as HTMLElement;
    mainContent?.addEventListener("click", handleClickOutside);
    return () => {
      mainContent?.removeEventListener("click", handleClickOutside);
    };
  }, [handleClickOutside]);

  const addLinkModal = useModal(AddLinkModal);

  const getContextMenuItems = useCallback(
    (item: INavItem) =>
      generateNavItemContextMenu(
        item,
        categories,
        globalMenuItems,
        fetchUrls,
        addLinkModal,
        reloadCategories
      ),
    [categories, globalMenuItems, fetchUrls, addLinkModal, reloadCategories]
  );

  const categoryContextMenuItems = useCallback(
    (category: ICategory) =>
      generateCategoryContextMenu(
        category,
        globalMenuItems,
        reloadCategories,
        fetchUrls
      ),
    [globalMenuItems, reloadCategories, fetchUrls]
  );

  const filteredUrls = getFilteredUrls(urls, categories, activeCategory);

  useEffect(() => {
    if (!layoutsLoading) {
      const existingLayout = layoutsPerCategory[activeCategory];
      const filteredUrlsIds = filteredUrls.map((item) => item.id);
      const layoutItemIds = existingLayout
        ? existingLayout.lg.map((layout) => layout.i)
        : [];

      const layoutsNeedUpdate =
        !existingLayout ||
        filteredUrlsIds.length !== layoutItemIds.length ||
        !filteredUrlsIds.every((id) => layoutItemIds.includes(id));

      if (layoutsNeedUpdate) {
        const newLayouts = generateLayoutsForCategory(
          urls,
          categories,
          activeCategory
        );
        const newLayoutsPerCategory: any = categories.reduce(
          (acc, category) => ({
            ...acc,
            [category.id]: layoutsPerCategory[category.id],
          }),
          {}
        );
        newLayoutsPerCategory["uncategorized"] =
          layoutsPerCategory["uncategorized"];
        newLayoutsPerCategory[activeCategory] = newLayouts;
        setLayoutsPerCategory(newLayoutsPerCategory);
      }
    }
  }, [
    urls,
    categories,
    activeCategory,
    filteredUrls,
    layoutsPerCategory,
    layoutsLoading,
    setLayoutsPerCategory,
  ]);

  const onLayoutChange = (
    _: Layout[],
    allLayouts: Layouts,
    activeCategoryId: string
  ) => {
    if (isEditing) {
      setLayoutsPerCategory({
        ...layoutsPerCategory,
        [activeCategoryId]: allLayouts,
      });
    }
  };

  if (urlsError) return <div>错误: {urlsError}</div>;
  if (categoriesError) return <div>错误: {categoriesError}</div>;
  if (layoutsError) return <div>错误: {layoutsError}</div>;

  return (
    <div className="flex flex-col md:flex-row gap-2">
      <div className="fixed top-4 left-4 z-10 md:w-28 w-full">
        {(urlsLoading || categoriesLoading || layoutsLoading) && (
          <div>加载中...</div>
        )}
      </div>
      {!isFlatMode && categories.length > 0 && (
        <div className="md:w-28 w-full">
          <CategoryList
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            getContextMenuItems={categoryContextMenuItems}
          />
        </div>
      )}
      <div ref={contentRef} className={"flex-1"}>
        {!isFlatMode && urls.length > 0 && (
          <div
            className={cn("p-2 min-h-[19rem] glass", {
              "bg-gray-100/20 rounded-3xl": isEditing,
            })}
          >
            <NavGrid
              urls={filteredUrls}
              isEditing={isEditing}
              layouts={layoutsPerCategory[activeCategory]}
              onLayoutChange={(currentLayout, allLayouts) =>
                onLayoutChange(currentLayout, allLayouts, activeCategory)
              }
              getContextMenuItems={getContextMenuItems}
              updateMenuItem={updateMenuItem}
              fetchUrls={fetchUrls}
              breakpoints={breakpoints}
              cols={cols}
            />
          </div>
        )}
        {isFlatMode && (
          <div className="flex flex-col gap-4">
            {categories.map((category) => (
              <div key={category.id}>
                <div
                  className={cn("p-2 glass", {
                    "bg-gray-100/20 rounded-3xl": isEditing,
                  })}
                >
                  <div
                    className={cn(
                      "pt-4 ps-4 text-lg font-bold text-shadow text-gray-200"
                    )}
                  >
                    {category.name}
                  </div>
                  <NavGrid
                    urls={getFilteredUrls(urls, categories, category.id)}
                    isEditing={isEditing}
                    layouts={layoutsPerCategory[category.id]}
                    onLayoutChange={(currentLayout, allLayouts) =>
                      onLayoutChange(currentLayout, allLayouts, category.id)
                    }
                    getContextMenuItems={getContextMenuItems}
                    updateMenuItem={updateMenuItem}
                    fetchUrls={fetchUrls}
                    breakpoints={breakpoints}
                    cols={cols}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="w-28 hidden xl:block" />
    </div>
  );
};

export default Content;
