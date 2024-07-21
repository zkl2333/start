export interface INavItem {
  id: string;
  title: string;
  url: string;
  category?: string;
  internalUrl?: string | undefined;
  iconUrl?: string | undefined;
  iconWrapper?: boolean | undefined;
}
