import ogs, { ErrorResult, SuccessResult } from "open-graph-scraper";

const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36";

export interface ICardMeta {
  title: string;
  description: string;
  url: string;
  images?: SuccessResult["result"]["ogImage"];
  image?: { url: string; width?: number; height?: number };
  favicon: string;
}

// 拼接相对路径
const joinPath = (base: string, path = "favicon.ico") => {
  const url = new URL(base);
  url.pathname = path;
  return url.toString();
};

// 判断是否为绝对路径
const isAbsolute = (url?: string) => {
  return (
    url?.startsWith("http://") ||
    url?.startsWith("https://") ||
    url?.startsWith("//")
  );
};

// 获取最好的图片
const getBestImage = (images: SuccessResult["result"]["ogImage"]) => {
  if (!images) {
    return null;
  }

  if (images.length === 1) {
    return images[0];
  }

  // 如果有正方形图片，返回最接近 32 * 32 的图片
  const squareImages = images.filter((image) => image.width === image.height);

  if (squareImages.length) {
    return squareImages.reduce((prev, current) => {
      const prevDiff = Math.abs(prev.width! - 32) + Math.abs(prev.height! - 32);
      const currentDiff =
        Math.abs(current.width! - 32) + Math.abs(current.height! - 32);

      return prevDiff < currentDiff ? prev : current;
    });
  }

  // 返回最接近 32 * 32 的图片
  return images.reduce((prev, current) => {
    const prevDiff = Math.abs(prev.width! - 32) + Math.abs(prev.height! - 32);
    const currentDiff =
      Math.abs(current.width! - 32) + Math.abs(current.height! - 32);

    return prevDiff < currentDiff ? prev : current;
  });
};

const createCardMeta = (
  requestUrl: string,
  data: SuccessResult["result"]
): ICardMeta => {
  const image = getBestImage(data.ogImage || data.twitterImage);

  return {
    title: data.ogTitle || data.twitterTitle || data.dcTitle || "",
    description:
      data.ogDescription || data.twitterDescription || data.dcDescription || "",
    url: requestUrl,
    images: data.ogImage || data.twitterImage,
    image: image
      ? {
          ...image,
          url: isAbsolute(image.url)
            ? image.url
            : joinPath(requestUrl, image.url),
        }
      : undefined,
    favicon: isAbsolute(data.favicon)
      ? data.favicon!
      : joinPath(requestUrl, data.favicon),
  };
};

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return Response.json(
      { error: "Missing URL query parameter" },
      { status: 400 }
    );
  }

  const options = {
    url: url,
    fetchOptions: { headers: { "user-agent": userAgent } },
  };

  try {
    const data = await ogs(options);

    if (data.result.success) {
      return Response.json(
        {
          success: true,
          result: createCardMeta(url, data.result),
        },
        {
          headers: {
            "Cache-Control": "max-age=" + 60 * 60 * 24,
          },
        }
      );
    } else {
      return Response.json(
        {
          success: false,
          result: data.result,
        },
        {
          headers: {
            "Cache-Control": "max-age=" + 60 * 60 * 24,
          },
        }
      );
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      return Response.json(
        {
          success: false,
          error: e.message,
        },
        { status: 500 }
      );
    }

    if ((e as ErrorResult)?.result) {
      return Response.json(e, {
        headers: {
          "Cache-Control": "max-age=" + 60 * 60 * 1,
        },
        status: 500,
      });
    }

    return Response.json(
      {
        success: false,
        error: "Unknown error",
      },
      { status: 500 }
    );
  }
}
