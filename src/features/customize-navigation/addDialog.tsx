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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";

const DEFAULT_VALUES = {
  title: "",
  url: "",
};

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "标题不能为空。" }),
  url: z.string().url({
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{defaultValues.id ? "编辑" : "添加"}链接</DialogTitle>
            <DialogDescription>添加一个新的链接到你的导航</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
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
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>网址</FormLabel>
                    <FormControl>
                      <Input placeholder="https://domain.com" {...field} />
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
