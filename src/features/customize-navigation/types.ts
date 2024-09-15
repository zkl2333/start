export interface INavItem {
  id: string;
  title: string;
  url: string;
  category?: string;
  internalUrl?: string | undefined;
  iconUrl?: string | undefined;
  iconWrapper?: boolean | undefined;
}

export interface ICategory {
  id: string;
  name: string;
}

export interface MenuItem {
  type: string;
  label?: string;
  inset?: boolean;
  onSelect?: () => void;
  checked?: boolean;
  id?: string;
}