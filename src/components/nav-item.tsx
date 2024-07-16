import { ICardMeta } from "@/app/api/site-info/route";
import { cn } from "@/lib/utils";
import { useCoreStore } from "@/providers/core-store-provider";
import Image from "next/image";
import { useEffect, useState } from "react";

function faviconURL(u: string) {
  const url = new URL("https://www.google.com/s2/favicons");
  url.searchParams.set("domain", u);
  url.searchParams.set("size", "32");
  return url.toString();
}

const formatUrl = (url: string) => {
  if (url.startsWith("//")) {
    return "https:" + url;
  }

  return url;
};

const IconRenderer = ({
  cardMeta,
  url,
}: {
  cardMeta: ICardMeta | null;
  url: string;
}) => {
  if (cardMeta?.touchIcons || cardMeta?.touchIconsPrecomposed) {
    return (
      <Image
        src={formatUrl(
          (cardMeta.touchIcons || cardMeta.touchIconsPrecomposed)!
        )}
        alt=""
        className="w-full h-full rounded-sm"
        width={100}
        height={100}
      />
    );
  }
  if (
    cardMeta?.image?.url &&
    cardMeta?.image?.width &&
    cardMeta?.image?.width === cardMeta?.image?.height
  ) {
    return (
      <Image
        src={formatUrl(cardMeta.image.url)}
        alt=""
        className="w-full h-full rounded-sm"
        width={100}
        height={100}
      />
    );
  }

  if (cardMeta?.favicon || cardMeta?.itempropImage) {
    return (
      <Image
        src={formatUrl(cardMeta.favicon || cardMeta.itempropImage!)}
        alt=""
        width={24}
        height={24}
        className="w-7 h-7 rounded-sm"
      />
    );
  }

  return (
    <Image
      src={faviconURL(url)}
      alt=""
      width={24}
      height={24}
      className="w-7 h-7 rounded-sm"
    />
  );
};

const NavItem = (item: {
  url?: string;
  title: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}) => {
  const [cardMeta, setCardMeta] = useState<ICardMeta | null>(null);

  const hasImage = useCoreStore((state) =>
    state.features.some((f) => f.id === "wallpaper" && f.enabled)
  );

  useEffect(() => {
    const fetchCardMeta = async (url: string) => {
      const res = await fetch(`/api/site-info?url=${item.url}`);
      const data = await res.json();

      if (data.success) {
        setCardMeta(data.result);
      }
    };

    item.url && fetchCardMeta(item.url);
  }, [item.url]);

  return (
    <a
      href={item.url}
      onClick={item.onClick}
      target="_blank"
      rel="noreferrer noopener"
      className="flex flex-col items-center gap-2 justify-center hover:bg-gray-300/10 hover:backdrop-blur-sm rounded-xl w-24 h-24 p-2 cursor-pointer"
    >
      {cardMeta?.touchIcons || cardMeta?.touchIconsPrecomposed ? (
        <div className="w-10 h-10 flex items-center justify-center rounded-xl overflow-hidden">
          {item.icon && item.icon}
          {!item.icon && item.url && (
            <IconRenderer cardMeta={cardMeta} url={item.url} />
          )}
        </div>
      ) : (
        <div className="bg-gray-200/80 w-10 h-10 flex items-center justify-center rounded-xl overflow-hidden">
          {item.icon && item.icon}
          {!item.icon && item.url && (
            <IconRenderer cardMeta={cardMeta} url={item.url} />
          )}
        </div>
      )}
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
