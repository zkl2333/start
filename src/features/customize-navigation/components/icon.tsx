import { cn } from "@/lib/utils";
import Image from "next/image";

interface IIcon {
  url: string;
  alt?: string;
  wrapper?: boolean;
  active?: boolean;
}

const SiteIcon = ({ url, alt, wrapper, active }: IIcon) => {
  return (
    <div
      className={cn(
        "w-10 h-10 flex items-center justify-center rounded-xl overflow-hidden",
        {
          "bg-gray-200/80": wrapper,
          "outline outline-primary": active,
        }
      )}
    >
      <Image
        src={url}
        alt={alt || ""}
        title={alt}
        className={cn("w-full h-full rounded-sm", {
          "w-7 h-7": wrapper,
        })}
        width={100}
        height={100}
      />
    </div>
  );
};

export default SiteIcon;
