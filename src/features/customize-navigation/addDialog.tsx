import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import SiteIcon from "./components/icon";
import { ISiteMeta } from "@/app/api/site-info/route";

function faviconURL(u: string) {
  const url = new URL("https://t0.gstatic.com/faviconV2");
  url.searchParams.set("client", "SOCIAL");
  url.searchParams.set("type", "FAVICON");
  url.searchParams.set("fallback_opts", "TYPE,SIZE,URL");
  url.searchParams.set("url", u);
  url.searchParams.set("size", "256");
  return url.toString();
}

const fetchSiteInfo = async (url: string) => {
  const res = await fetch(`/api/site-info?url=${url}`);
  const data = await res.json();

  if (data.success) {
    return data.result as ISiteMeta;
  }

  return null;
};

const getIcons = async (url: string) => {
  const data = await fetchSiteInfo(url);

  const icons: Icon[] = [];

  if (data?.touchIcons) {
    icons.push({
      url: data.touchIcons,
      wrapper: false,
      alt: "touch icon",
    });
  }

  if (data?.touchIconsPrecomposed) {
    icons.push({
      url: data.touchIconsPrecomposed,
      wrapper: false,
      alt: "touch icon precomposed",
    });
  }

  if (data?.ogImage) {
    icons.push(
      ...data.ogImage.map((item) => ({
        alt: "og:image",
        ...item,
        wrapper: false,
      }))
    );
  }

  if (data?.twitterImage) {
    icons.push(
      ...data.twitterImage.map((item) => ({
        alt: "twitter:image",
        ...item,
        wrapper: false,
      }))
    );
  }

  if (data?.itempropImage) {
    icons.push({
      url: data.itempropImage,
      wrapper: true,
      alt: "itemprop image",
    });
  }

  if (data?.favicon) {
    icons.push({
      url: data.favicon,
      wrapper: true,
      alt: "favicon",
    });
  }

  if (data?.favicon_32) {
    icons.push({
      url: data.favicon_32,
      wrapper: true,
      alt: "favicon 32x32",
    });
  }

  icons.push({
    url: faviconURL(url),
    wrapper: true,
    alt: "google favicon",
  });

  // 去重 根据url
  const map = new Map();
  icons.forEach((item) => {
    map.set(item.url, item);
  });

  return {
    icons: Array.from(map.values()),
    title: data?.title,
  };
};

interface Icon {
  alt?: string;
  height?: number;
  url: string;
  width?: number;
  wrapper: boolean;
}

const DEFAULT_VALUES = {
  title: "",
  url: "",
};

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string({
    required_error: "标题不能为空。",
  }),
  url: z
    .string({
      required_error: "URL 不能为空。",
    })
    .url({
      message: "URL必须是一个有效的URL。",
    }),
  internalUrl: z
    .string()
    .url({
      message: "URL必须是一个有效的URL。",
    })
    .optional(),
  iconUrl: z.string().optional(),
  iconWrapper: z.boolean().optional(),
});

const AddLinkModal = NiceModal.create(
  (defaultValues: z.infer<typeof formSchema>) => {
    const modal = useModal();

    const handlerClose = () => {
      form.reset(DEFAULT_VALUES);
      modal.resolve();
      modal.remove();
    };

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: defaultValues || DEFAULT_VALUES,
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
      await fetch("/api/links", {
        method: defaultValues.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          defaultValues.id ? { ...values, id: defaultValues.id } : values
        ),
      });

      await handlerClose();
    }

    const [icons, setIcons] = useState<Icon[]>([]);

    useEffect(() => {
      if (defaultValues.iconUrl) {
        setIcons([
          {
            url: defaultValues.iconUrl,
            wrapper: !!defaultValues.iconWrapper,
            alt: "saved icon",
          },
        ]);
      }
    }, [defaultValues.iconUrl, defaultValues.iconWrapper]);

    return (
      <Dialog
        open={modal.visible}
        onOpenChange={(open) => {
          if (open) {
            modal.show();
          } else {
            handlerClose();
          }
        }}
      >
        <DialogContent className="sm:max-w-[520px] flex flex-col">
          <DialogHeader>
            <DialogTitle>{defaultValues.id ? "编辑" : "添加"}链接</DialogTitle>
            <DialogDescription>添加一个新的链接到你的导航</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>网址</FormLabel>
                    <div className="flex w-full items-center space-x-2">
                      <FormControl>
                        <Input placeholder="https://domain.com" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        onClick={() => {
                          return getIcons(field.value).then(
                            ({ icons, title }) => {
                              setIcons(icons);
                              form.setValue("iconUrl", icons[0].url);
                              form.setValue("iconWrapper", icons[0].wrapper);
                              if (title && !form.getValues("title")) {
                                form.setValue("title", title);
                              }
                            }
                          );
                        }}
                      >
                        自动获取
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>标题</FormLabel>
                    <FormControl>
                      <Input placeholder="链接标题" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="internalUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>内网地址</FormLabel>
                    <FormControl>
                      <Input placeholder="https://domain.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="iconUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>图标地址</FormLabel>
                    <FormControl>
                      <Input placeholder="https://domain.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {icons.length > 0 && (
                <FormField
                  control={form.control}
                  name="iconUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>选择图标</FormLabel>
                      <FormControl>
                        <div className="px-12 flex-1">
                          <Carousel
                            className="flex-1 p-2"
                            opts={{
                              loop: true,
                              slidesToScroll: "auto",
                              dragFree: true,
                            }}
                          >
                            <CarouselContent className="-ml-4">
                              {icons.map((item, index) => (
                                <CarouselItem
                                  key={index}
                                  className="pl-4 basis-1/5 flex justify-center"
                                >
                                  <div
                                    onClick={() => {
                                      field.onChange(item.url);
                                      form.setValue(
                                        "iconWrapper",
                                        item.wrapper
                                      );
                                    }}
                                    className={cn(
                                      "w-full aspect-square checkerboard flex justify-center items-center rounded-xl overflow-hidden"
                                    )}
                                  >
                                    <SiteIcon
                                      url={item.url}
                                      alt={item.alt}
                                      wrapper={item.wrapper}
                                      active={
                                        item.url === form.getValues("iconUrl")
                                      }
                                    />
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious type="button" />
                            <CarouselNext type="button" />
                          </Carousel>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="iconWrapper"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(e) => {
                          setIcons((icons) =>
                            icons.map((icon) => {
                              if (icon.url === form.getValues("iconUrl")) {
                                return {
                                  ...icon,
                                  wrapper: e,
                                };
                              }

                              return icon;
                            })
                          );
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>图标底色</FormLabel>
                      <FormDescription>
                        当图标较小时，添加一个背景色以增加可见性。
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">保存</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }
);

export default AddLinkModal;
