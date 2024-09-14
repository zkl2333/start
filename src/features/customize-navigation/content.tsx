import MainContextMenu, {
  getContextMenu,
  MenuItem,
} from "@/components/main-context-menu";
import NavItem from "./components/nav-item";
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  SetStateAction,
} from "react";
import AddLinkModal from "./addDialog";
import { cn } from "@/lib/utils";
import { useModal } from "@ebay/nice-modal-react";
import { PlusIcon } from "@radix-ui/react-icons";
import { getCategorys, ICategroy } from "./actions";
import { INavItem } from "./types";

import GridLayout from "react-grid-layout";

export const Content = ({
  globalMenuItems,
  updateMenuItem,
}: {
  globalMenuItems: MenuItem[];
  updateMenuItem: (id: string, contextMenu: MenuItem) => void;
}) => {
  const [urls, setUrls] = useState<INavItem[]>([]);
  const [categorys, setCategorys] = useState<ICategroy[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [layout, setLayout] = useState<any[]>([]);

  const fetchUrls = async () => {
    const res = await fetch("/api/links").then((res) => res.json());
    setUrls(res.data);
  };

  const fetchCategory = async () => {
    const chategorys = await getCategorys();
    setCategorys(chategorys);
    chategorys[0] && setActiveCategory(chategorys[0].name);
  };

  const contextMenu = useMemo<MenuItem | null>(
    () => getContextMenu("customizeNavigationEditingMode", globalMenuItems),
    [globalMenuItems]
  );

  // 是否编辑模式
  const isEditing = !!contextMenu?.checked;

  const contentRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (!contextMenu) {
        return;
      }

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

  const getContextMenuItems = (item: any): MenuItem[] => {
    return [
      {
        type: "item",
        label: "删除",
        inset: true,
        onSelect: () => {
          fetch(`/api/links?id=${item.id}`, {
            method: "DELETE",
          }).then(() => {
            fetchUrls();
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
    ];
  };

  useEffect(() => {
    fetchUrls();
    fetchCategory();
  }, []);

  // 当 urls 或 activeCategory 改变时，更新布局
  useEffect(() => {
    const filteredUrls = urls.filter((item) => {
      return activeCategory ? item.category === activeCategory : !item.category;
    });

    const newLayout = filteredUrls.map((item, index) => ({
      i: item.id,
      x: index % 6,
      y: Math.floor(index / 6),
      w: 1,
      h: 1,
    }));

    if (isEditing) {
      newLayout.push({
        i: "add-button",
        x: filteredUrls.length % 6,
        y: Math.floor(filteredUrls.length / 6),
        w: 1,
        h: 1,
      });
    }

    setLayout(newLayout as any);
  }, [urls, activeCategory, isEditing]);

  const onLayoutChange = (newLayout: SetStateAction<any[]>) => {
    setLayout(newLayout);
  };

  return (
    <>
      <div className="absolute top-0 bottom-0 left-0 flex flex-col justify-center">
        <div className="ml-4 p-2 glass">
          <ul className="text-white text-sm space-y-2">
            {categorys.map((category) => {
              return (
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
              );
            })}
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
      </div>
      <div
        ref={contentRef}
        className={cn("p-2 min-h-[19rem] glass", {
          "bg-gray-100/20 rounded-3xl": isEditing,
        })}
      >
        <GridLayout
          className="layout"
          layout={layout}
          cols={6}
          rowHeight={100}
          width={1200}
          isDraggable={isEditing}
          isResizable={false}
          onLayoutChange={onLayoutChange}
        >
          {urls
            .filter((item) => {
              return activeCategory
                ? item.category === activeCategory
                : !item.category;
            })
            .map((item) => {
              return (
                <div key={item.id}>
                  <MainContextMenu
                    menuItems={getContextMenuItems(item)}
                    updateMenuItem={(menuItem) =>
                      menuItem.id && updateMenuItem(menuItem.id, menuItem)
                    }
                  >
                    <NavItem item={item} isEditing={isEditing} />
                  </MainContextMenu>
                </div>
              );
            })}
          {isEditing && (
            <div key="add-button">
              <NavItem
                onClick={() => {
                  addLinkmodal
                    .show()
                    .then(() => {
                      fetchUrls();
                    })
                    .catch(() => {
                      alert("添加失败");
                    });
                }}
                item={{
                  title: "添加",
                }}
                icon={<PlusIcon className="w-6 h-6" />}
                isEditing={isEditing}
              />
            </div>
          )}
        </GridLayout>
      </div>
    </>
  );
};
