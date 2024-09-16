import React from "react";
import { Responsive, WidthProvider, Layouts, Layout } from "react-grid-layout";
import MainContextMenu, { MenuItem } from "@/components/main-context-menu";
import NavItem from "./nav-item";
import { INavItem } from "../types";
import { PlusIcon } from "@radix-ui/react-icons";
import { useModal } from "@ebay/nice-modal-react";
import AddLinkModal from "../addDialog";
import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface NavGridProps {
  urls: INavItem[];
  isEditing: boolean;
  layouts: Layouts;
  onLayoutChange: (currentLayout: Layout[], allLayouts: Layouts) => void;
  getContextMenuItems: (item: INavItem) => MenuItem[];
  updateMenuItem: (id: string, contextMenu: MenuItem) => void;
  fetchUrls: () => void;
  breakpoints: Record<string, number>;
  cols: Record<string, number>;
}

const NavGrid: React.FC<NavGridProps> = ({
  urls,
  isEditing,
  layouts,
  onLayoutChange,
  getContextMenuItems,
  updateMenuItem,
  fetchUrls,
  breakpoints,
  cols,
}) => {
  const addLinkModal = useModal(AddLinkModal);

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={breakpoints}
      cols={cols}
      rowHeight={100}
      isDraggable={isEditing}
      isResizable={isEditing}
      onLayoutChange={onLayoutChange}
      compactType="horizontal"
    >
      {urls.map((item) => (
        <div
          key={item.id}
          className="hover:bg-gray-300/10 hover:backdrop-blur-sm rounded-xl"
        >
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
        <div
          key="add-button"
          className="hover:bg-gray-300/10 hover:backdrop-blur-sm rounded-xl"
        >
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
