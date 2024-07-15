import { ICardMeta } from "@/app/api/site-info/route";
import { useCoreStore } from "@/app/coreStore";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

function faviconURL(u: string) {
  const url = new URL("https://www.google.com/s2/favicons");
  url.searchParams.set("domain", u);
  url.searchParams.set("size", "32");
  return url.toString();
}

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
        src={(cardMeta.touchIcons || cardMeta.touchIconsPrecomposed)!}
        alt=""
        className="w-full h-full rounded-sm"
        width={100}
        height={100}
      />
    );
  }
  if (
    cardMeta?.image?.url &&
    cardMeta?.image?.width === cardMeta?.image?.height
  ) {
    return (
      <Image
        src={cardMeta.image.url}
        alt=""
        className="w-full h-full rounded-sm"
        width={100}
        height={100}
      />
    );
  }

  if (cardMeta?.favicon) {
    return (
      <Image
        src={cardMeta.favicon}
        alt=""
        width={24}
        height={24}
        className="rounded-sm"
      />
    );
  }

  return (
    <Image
      src={faviconURL(url)}
      alt=""
      width={24}
      height={24}
      className="rounded-sm"
    />
  );
};

const NavItem = (item: { url: string; title: string }) => {
  const [cardMeta, setCardMeta] = useState<ICardMeta | null>(null);

  const hasImage = useCoreStore((state) =>
    state.features.some((f) => f.id === "wallpaper" && f.enabled)
  );

  useEffect(() => {
    const fetchCardMeta = async () => {
      const res = await fetch(`/api/site-info?url=${item.url}`);
      const data = await res.json();

      if (data.success) {
        setCardMeta(data.result);
      }
    };

    fetchCardMeta();
  }, [item.url]);

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer noopener"
      className="flex flex-col items-center gap-2 justify-center hover:bg-gray-300/10 rounded-md w-24 h-24 p-2"
    >
      <div className="bg-gray-200/80 w-10 h-10 flex items-center justify-center rounded-lg overflow-hidden">
        <IconRenderer cardMeta={cardMeta} url={item.url} />
      </div>
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
