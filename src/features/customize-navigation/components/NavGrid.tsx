// components/NavGrid.tsx
import React, { useCallback } from "react";
import { Responsive, WidthProvider, Layouts, Layout } from "react-grid-layout";
import MainContextMenu, { MenuItem } from "@/components/main-context-menu";
import NavItem from "./nav-item";
import { INavItem } from "../types";
import { PlusIcon } from "@radix-ui/react-icons";
import { useModal } from "@ebay/nice-modal-react";
import AddLinkModal from "../addDialog";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface NavGridProps {
  urls: INavItem[];
  activeCategory: string | null;
  isEditing: boolean;
  layouts: Layouts;
  onLayoutChange: (currentLayout: Layout[], allLayouts: Layouts) => void;
  getContextMenuItems: (item: INavItem) => MenuItem[];
  updateMenuItem: (id: string, contextMenu: MenuItem) => void;
  fetchUrls: () => void;
}

const NavGrid: React.FC<NavGridProps> = ({
  urls,
  activeCategory,
  isEditing,
  layouts,
  onLayoutChange,
  getContextMenuItems,
  updateMenuItem,
  fetchUrls,
}) => {
  const addLinkModal = useModal(AddLinkModal);

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{
        lg: 1200,
        md: 996,
        sm: 768,
        xs: 480,
        xxs: 0,
      }}
      cols={{
        lg: 12,
        md: 10,
        sm: 8,
        xs: 6,
        xxs: 4,
      }}
      rowHeight={100}
      autoSize
      isDraggable={isEditing}
      isResizable={false}
      onLayoutChange={onLayoutChange}
    >
      {urls
        .filter((item) =>
          activeCategory ? item.category === activeCategory : !item.category
        )
        .map((item) => (
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
        ))}
      {isEditing && (
        <div key="add-button">
          <NavItem
            onClick={() => {
              addLinkModal
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
    </ResponsiveGridLayout>
  );
};

export default NavGrid;
