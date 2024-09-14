import { ISiteMeta } from "@/app/api/site-info/route";
import { cn } from "@/lib/utils";
import { useCoreStore } from "@/providers/core-store-provider";
import { INavItem } from "../types";
import SiteIcon from "./icon";
import useSWRImmutable from "swr/immutable";
import { Skeleton } from "@/components/ui/skeleton";
import { MouseEvent, useMemo } from "react";

function faviconURL(u: string) {
  const url = new URL("https://t0.gstatic.com/faviconV2");
  url.searchParams.set("client", "SOCIAL");
  url.searchParams.set("type", "FAVICON");
  url.searchParams.set("fallback_opts", "TYPE,SIZE,URL");
  url.searchParams.set("url", u);
  url.searchParams.set("size", "256");
  return url.toString();
}

const getIconUrl = (cardMeta: ISiteMeta | null, url: string) => {
  if (cardMeta?.touchIcons || cardMeta?.touchIconsPrecomposed) {
    return cardMeta.touchIcons || cardMeta.touchIconsPrecomposed!;
  }
  if (
    cardMeta?.image?.url &&
    cardMeta?.image?.width === cardMeta?.image?.height
  ) {
    return cardMeta.image.url;
  }
  if (cardMeta?.favicon || cardMeta?.itempropImage) {
    return cardMeta.favicon || cardMeta.itempropImage!;
  }
  return faviconURL(url);
};

const getIconSize = (cardMeta: ISiteMeta | null) => {
  if (
    cardMeta?.touchIcons ||
    cardMeta?.touchIconsPrecomposed ||
    (cardMeta?.image?.url && cardMeta?.image?.width === cardMeta?.image?.height)
  ) {
    return false;
  }
  return true;
};

const IconRenderer = ({
  cardMeta,
  url,
}: {
  cardMeta: ISiteMeta | null;
  url: string;
}) => {
  const iconUrl = useMemo(() => getIconUrl(cardMeta, url), [cardMeta, url]);
  const wrapper = useMemo(() => getIconSize(cardMeta), [cardMeta]);

  return (
    <SiteIcon url={iconUrl} alt={cardMeta?.title || ""} wrapper={wrapper} />
  );
};

const NavItem = ({
  item,
  icon,
  isDragging,
  isEditing,
  onClick,
}: {
  item: Partial<INavItem>;
  icon?: React.ReactNode;
  isEditing: boolean;
  isDragging?: boolean;
  onClick?: () => void;
}) => {
  const hasImage = useCoreStore((state) =>
    state.features.some((f) => f.id === "wallpaper" && f.enabled)
  );

  const fetcher = (...rest: Parameters<typeof fetch>) =>
    fetch(...rest).then((res) => res.json());

  const { data, error, isLoading } = useSWRImmutable(
    item.url && !item.iconUrl ? `/api/site-info?url=${item.url}` : null,
    fetcher
  );

  const cardMeta = data?.success ? data.result : null;

  const renderIcon = () => {
    if (icon) {
      return icon;
    }

    if (item.iconUrl) {
      return (
        <SiteIcon
          url={item.iconUrl}
          alt={item.title}
          wrapper={item.iconWrapper}
        />
      );
    }

    if (isLoading) {
      return (
        <Skeleton className="w-10 h-10 flex items-center justify-center rounded-xl" />
      );
    }

    return <IconRenderer cardMeta={cardMeta} url={item.url!} />;
  };

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (isDragging) {
      // 如果正在拖拽，阻止点击事件
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // 如果有自定义的 onClick，则调用它
    if (onClick) {
      onClick();
    }
  };

  return (
    <a
      href={item.url}
      onClick={handleClick}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        "w-28 h-28 select-none flex flex-col items-center gap-2 justify-center hover:bg-gray-300/10 hover:backdrop-blur-sm rounded-xl p-2 cursor-pointer",
        {
          "animate-wiggle": isEditing,
        }
      )}
    >
      {renderIcon()}
      <div
        className={cn("text-sm truncate w-full text-center text-gray-800", {
          "text-shadow": hasImage,
          "text-gray-200": hasImage,
        })}
      >
        {item.title}
      </div>
    </a>
  );
};

export default NavItem;
