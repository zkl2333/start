import { useCoreStore } from "@/app/coreStore";
import { cn } from "@/lib/utils";
import Image from "next/image";

function faviconURL(u: string) {
  const url = new URL("https://www.google.com/s2/favicons");
  url.searchParams.set("domain", u);
  url.searchParams.set("size", "32");
  return url.toString();
}

const NavItem = (item: { url: string; title: string }) => {
  const hasImage = useCoreStore((state) =>
    state.features.some((f) => f.id === "wallpaper" && f.enabled)
  );

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer noopener"
      className="flex flex-col items-center gap-2 justify-center hover:bg-gray-300/10 rounded-md w-24 h-24 p-2"
    >
      <div className="bg-gray-200/80 w-10 h-10 flex items-center justify-center rounded-full">
        <Image
          src={faviconURL(item.url)}
          alt=""
          width={16}
          height={16}
          className="rounded-sm"
        />
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
