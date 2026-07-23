import React from "react";
import {
  horizontalCompactor,
  Responsive,
  useContainerWidth,
  type Layout,
  type ResponsiveLayouts,
} from "react-grid-layout";
import MainContextMenu, { MenuItem } from "@/components/main-context-menu";
import NavItem from "./nav-item";
import { INavItem } from "../types";
import { PlusIcon } from "@radix-ui/react-icons";
import { useModal } from "@ebay/nice-modal-react";
import AddLinkModal from "../addDialog";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

interface NavGridProps {
  urls: INavItem[];
  isEditing: boolean;
  layouts: ResponsiveLayouts;
  onLayoutChange: (
    currentLayout: Layout,
    allLayouts: ResponsiveLayouts
  ) => void;
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
  const { width, containerRef, mounted } = useContainerWidth({
    measureBeforeMount: true,
  });

  return (
    <>
      <div ref={containerRef}>
        {mounted && (
          <Responsive
            className="layout"
            breakpoints={breakpoints}
            cols={cols}
            layouts={layouts}
            width={width}
            rowHeight={100}
            dragConfig={{ enabled: isEditing }}
            resizeConfig={{ enabled: isEditing }}
            onLayoutChange={onLayoutChange}
            compactor={horizontalCompactor}
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
          </Responsive>
        )}
      </div>
      <div>
        {isEditing && (
          <div
            key="add-button"
            className="bg-gray-300/10 hover:backdrop-blur-sm rounded-xl w-20 p-2 m-4 text-gray-200 flex items-center justify-center cursor-pointer"
          >
            <PlusIcon className="w-6 h-6" />
            <div
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
            >
              添加
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NavGrid;
