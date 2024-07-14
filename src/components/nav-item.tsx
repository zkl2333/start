/* eslint-disable @next/next/no-img-element */
import { ICardMeta } from "@/app/api/card-meta/route";
import { useCoreStore } from "@/app/coreStore";
import { cn } from "@/lib/utils";
// import Image from "next/image";
import { useEffect, useState } from "react";

function faviconURL(u: string) {
  const url = new URL("https://www.google.com/s2/favicons");
  url.searchParams.set("domain", u);
  url.searchParams.set("size", "32");
  return url.toString();
}

const NavItem = (item: { url: string; title: string }) => {
  const [cardMeta, setCardMeta] = useState<ICardMeta | null>(null);

  const hasImage = useCoreStore((state) =>
    state.features.some((f) => f.id === "wallpaper" && f.enabled)
  );

  useEffect(() => {
    const fetchCardMeta = async () => {
      const res = await fetch(`/api/card-meta?url=${item.url}`);
      const data = await res.json();

      if (!data.success) {
        return;
      }

      setCardMeta(data.result);
    };
    if (!cardMeta) {
      fetchCardMeta();
    }
  }, [setCardMeta, item.url, cardMeta]);

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer noopener"
      className="flex flex-col items-center gap-2 justify-center hover:bg-gray-300/10 rounded-md w-24 h-24 p-2"
    >
      <div className="bg-gray-200/80 w-10 h-10 flex items-center justify-center rounded-full overflow-hidden">
        {/* {(cardMeta?.image?.url || cardMeta?.favicon) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cardMeta?.image?.url || cardMeta.favicon}
            alt=""
            width={24}
            height={24}
            className="rounded-sm"
          />
        )} */}
        {cardMeta?.image?.url &&
        cardMeta?.image?.width &&
        cardMeta?.image?.width === cardMeta?.image?.height ? (
          <img
            src={cardMeta.image.url}
            alt=""
            className="w-full h-full rounded-sm"
          />
        ) : cardMeta?.favicon ? (
          <img
            src={cardMeta.favicon}
            alt=""
            width={24}
            height={24}
            className="rounded-sm"
          />
        ) : (
          <img
            src={faviconURL(item.url)}
            alt=""
            width={24}
            height={24}
            className="rounded-sm"
          />
        )}
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
