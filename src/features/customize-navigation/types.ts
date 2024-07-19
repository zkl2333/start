export interface INavItem {
  id: string;
  title: string;
  url: string;
  internalUrl?: string | undefined;
  iconUrl?: string | undefined;
  iconWrapper?: boolean | undefined;
}
