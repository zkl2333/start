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
import { useEffect } from "react";

const formSchema = z.object({
  title: z.string(),
  url: z.string().url({
    message: "URL必须是一个有效的URL。",
  }),
  internalUrl: z.string().optional(),
});

const AddLinkModal = NiceModal.create(
  (defaultValues: {
    id: string;
    title: string;
    url: string;
    internalUrl: string;
  }) => {
    const modal = useModal();

    const handlerClose = () => {
      form.reset();
      modal.resolve();
      modal.hide();
    };

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        title: "",
        url: "",
        internalUrl: "",
      },
    });

    useEffect(() => {
      if (defaultValues.id) {
        form.reset(defaultValues);
      } else {
        console.log("reset");
        form.reset({
          title: "",
          url: "",
          internalUrl: "",
        });
      }
    }, [defaultValues, form]);

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
      // Do something with the form values.
      // ✅ This will be type-safe and validated.
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
          if (!open) {
            handlerClose();
          } else {
            modal.show();
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
                      <Input placeholder="shadcn" {...field} />
                    </FormControl>
                    <FormDescription>这是一个链接的标题。</FormDescription>
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
                      <Input placeholder="https://shadcn.com" {...field} />
                    </FormControl>
                    <FormDescription>这是一个链接的网址。</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="internalUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>内网网址</FormLabel>
                    <FormControl>
                      <Input placeholder="http://localhost:3000" {...field} />
                    </FormControl>
                    <FormDescription>这是一个链接的内网网址。</FormDescription>
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
