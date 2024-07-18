import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import NiceModal, { useModal } from "@ebay/nice-modal-react";

const AddLinkModal = NiceModal.create(() => {
  const modal = useModal();

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const handlerClose = () => {
    setTitle("");
    setUrl("");
    modal.resolve();
    modal.hide();
  };

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
          <DialogTitle>添加链接</DialogTitle>
          <DialogDescription>添加一个新的链接到你的导航</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              标题
            </Label>
            <Input
              id="title"
              className="col-span-4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="url" className="text-right">
              网址
            </Label>
            <Input
              id="url"
              className="col-span-4"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="submit"
              onClick={async () => {
                await fetch("/api/links", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    title,
                    url,
                  }),
                });
                await handlerClose();
              }}
              onSubmit={async (e) => {
                console.log(e);
              }}
            >
              保存
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default AddLinkModal;
