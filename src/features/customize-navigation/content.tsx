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
import useLocalStorage from "./hooks/useLocalStorage";
import { getContextMenu } from "@/components/main-context-menu";
import { cn } from "@/lib/utils";
import { Layout, Layouts } from "react-grid-layout";
import { INavItem } from "./types";
import { useModal } from "@ebay/nice-modal-react";
import AddLinkModal from "./addDialog";

const breakpoints: Record<string, number> = {
  lg: 1200,
  md: 768,
  xxs: 0,
};
const cols: Record<string, number> = {
  lg: 12,
  md: 8,
  xxs: 4,
};

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
  } = useFetchCategories();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [layoutsPerCategory, setLayoutsPerCategory] = useLocalStorage<
    Record<string, Layouts>
  >("layoutsPerCategory", {});

  const contextMenu = useMemo<MenuItem | null>(
    () => getContextMenu("customizeNavigationEditingMode", globalMenuItems),
    [globalMenuItems]
  );

  const isEditing = !!contextMenu?.checked;

  const contentRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (!contextMenu) return;
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        isEditing
      ) {
        updateMenuItem("customizeNavigationEditingMode", {
          ...contextMenu,
          checked: false,
        });
      }
    },
    [contextMenu, isEditing, updateMenuItem]
  );

  useEffect(() => {
    const mainContent = document.querySelector(".main-content") as HTMLElement;
    mainContent?.addEventListener("click", handleClickOutside);
    return () => {
      mainContent?.removeEventListener("click", handleClickOutside);
    };
  }, [handleClickOutside]);

  const addLinkmodal = useModal(AddLinkModal);

  const getContextMenuItems = useCallback(
    (item: INavItem): MenuItem[] => [
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
          addLinkmodal
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
        type: "separator",
      },
      ...globalMenuItems,
    ],
    [globalMenuItems, fetchUrls, addLinkmodal]
  );

  const generateLayoutsForCategory = useCallback(
    (category: string | null): Layouts => {
      const newLayouts: Layouts = {};
      const filteredUrls = urls.filter((item) =>
        category ? item.category === category : !item.category
      );

      Object.keys(cols).forEach((breakpoint) => {
        const colCount = cols[breakpoint];
        const layout = filteredUrls.map((item, index) => ({
          i: item.id,
          x: index % colCount,
          y: Math.floor(index / colCount),
          w: 1,
          h: 1,
        }));

        if (isEditing) {
          layout.push({
            i: "add-button",
            x: layout.length % colCount,
            y: Math.floor(layout.length / colCount),
            w: 1,
            h: 1,
          });
        }

        newLayouts[breakpoint] = layout;
      });

      return newLayouts;
    },
    [urls, isEditing]
  );

  useEffect(() => {
    if (categories.length > 0) {
      setActiveCategory(categories[0].name);
    }
  }, [categories]);

  useEffect(() => {
    if (!activeCategory && categories.length === 0) return;
    const categoryKey = activeCategory || "uncategorized";
    const categoryLayouts = layoutsPerCategory[categoryKey];
    if (!categoryLayouts) {
      const generatedLayouts = generateLayoutsForCategory(activeCategory);
      setLayoutsPerCategory({
        ...layoutsPerCategory,
        [categoryKey]: generatedLayouts,
      });
    }
  }, [
    activeCategory,
    layoutsPerCategory,
    generateLayoutsForCategory,
    categories.length,
    setLayoutsPerCategory,
  ]);

  const onLayoutChange = (currentLayout: Layout[], allLayouts: Layouts) => {
    if (isEditing) {
      console.log("onLayoutChange", currentLayout, allLayouts);
      setLayoutsPerCategory({
        ...layoutsPerCategory,
        [activeCategory || "uncategorized"]: allLayouts,
      });
    }
  };

  useEffect(() => {
    console.log("isEditing", isEditing);
  }, [isEditing]);

  if (urlsLoading || categoriesLoading) return <div>加载中...</div>;
  if (urlsError) return <div>错误: {urlsError}</div>;
  if (categoriesError) return <div>错误: {categoriesError}</div>;

  return (
    <div className="flex flex-col md:flex-row gap-2">
      <div className="md:w-28 w-full">
        <CategoryList
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      </div>
      <div
        ref={contentRef}
        className={cn("flex-1 p-2 min-h-[19rem] glass", {
          "bg-gray-100/20 rounded-3xl": isEditing,
        })}
      >
        {urls.length && (
          <NavGrid
            urls={urls}
            activeCategory={activeCategory}
            isEditing={isEditing}
            layouts={layoutsPerCategory[activeCategory || "uncategorized"]}
            onLayoutChange={onLayoutChange}
            getContextMenuItems={getContextMenuItems}
            updateMenuItem={updateMenuItem}
            fetchUrls={fetchUrls}
            breakpoints={breakpoints}
            cols={cols}
          />
        )}
      </div>
      <div className="w-28 hidden xl:block" />
    </div>
  );
};

export default Content;
