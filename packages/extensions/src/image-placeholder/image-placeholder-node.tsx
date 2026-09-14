"use client";

import { Button } from "@editorcn/ui/components/button";
import { Input } from "@editorcn/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@editorcn/ui/components/popover";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@editorcn/ui/components/tabs";
import { isValidUrl } from "../core/commands";
import { useToolbar } from "../core/context";
import { cn } from "@editorcn/ui/lib/utils";
import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { Image, Link, Upload } from "lucide-react";
import type { DragEvent, FormEvent } from "react";
import { useCallback, useId, useState } from "react";

export const ImagePlaceholderNode = ({
  editor,
  extension,
  getPos,
  node,
  selected,
}: NodeViewProps) => {
  const { labels } = useToolbar();
  const fileInputId = useId();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isDragReject, setIsDragReject] = useState(false);

  const replaceWithImage = useCallback(
    (src: string) => {
      const pos = getPos();
      if (typeof pos !== "number") {
        return;
      }
      editor
        .chain()
        .focus()
        .insertContentAt(
          { from: pos, to: pos + node.nodeSize },
          { type: "image", attrs: { src } }
        )
        .run();
    },
    [editor, getPos, node.nodeSize]
  );

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setIsDragReject(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setIsDragReject(false);

    const { files } = e.dataTransfer;
    const accepted: File[] = [];
    const rejected: File[] = [];

    for (const file of Array.from(files)) {
      const mimeTypes = extension.options.allowedMimeTypes as
        | Record<string, string[]>
        | undefined;
      const tooLarge =
        (extension.options.maxSize as number | undefined) &&
        file.size > (extension.options.maxSize as number);

      if (
        mimeTypes &&
        !Object.keys(mimeTypes).some((type) => file.type.match(type))
      ) {
        rejected.push(file);
      } else if (tooLarge) {
        rejected.push(file);
      } else {
        accepted.push(file);
      }
    }

    if (rejected.length > 0) {
      setIsDragReject(true);
      extension.options.onDropRejected?.(rejected, editor);
    }

    if (accepted.length > 0) {
      handleAcceptedFiles(accepted);
    }
  };

  const handleAcceptedFiles = (files: File[]) => {
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => replaceWithImage(reader.result as string);
      reader.readAsDataURL(file);
    }
    extension.options.onDrop?.(files, editor);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleAcceptedFiles(Array.from(e.target.files || []));
  };

  const handleInsertEmbed = (e: FormEvent) => {
    e.preventDefault();
    if (!isValidUrl(url)) {
      setUrlError(true);
      return;
    }
    replaceWithImage(url);
    extension.options.onEmbed?.(url, editor);
  };

  const mimeTypeList = Object.keys(
    (extension.options.allowedMimeTypes as Record<string, string[]> | undefined) ?? {
      "image/*": ["image/*"],
    }
  ).join(",");

  return (
    <NodeViewWrapper className="w-full">
      <Popover modal open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="w-full">
          <div
            className={cn(
              "flex w-full cursor-pointer items-center gap-3 rounded-md bg-accent px-3 py-3 text-sm text-accent-foreground transition-colors hover:bg-secondary",
              selected && "bg-primary/10 hover:bg-primary/20"
            )}
          >
            <Image className="size-6" />
            {labels.imagePlaceholder}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[450px] px-0 py-2">
          <Tabs defaultValue="upload" className="px-3 flex-col">
            <TabsList>
              <TabsTrigger className="px-2 py-1 text-sm" value="upload">
                <Upload className="mr-2 size-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger className="px-2 py-1 text-sm" value="url">
                <Link className="mr-2 size-4" />
                Embed link
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={cn(
                  "my-2 rounded-md border border-dashed text-sm transition-colors",
                  isDragActive && "border-primary bg-secondary",
                  isDragReject && "border-destructive bg-destructive/10",
                  "hover:bg-secondary"
                )}
              >
                <input
                  type="file"
                  accept={mimeTypeList}
                  multiple={(extension.options.maxFiles as number | undefined) !== 1}
                  onChange={handleFileInputChange}
                  className="sr-only"
                  id={fileInputId}
                />
                <label
                  htmlFor={fileInputId}
                  className="flex h-28 w-full cursor-pointer flex-col items-center justify-center text-center"
                >
                  <Upload className="mx-auto mb-2 size-6" />
                  Drag & drop or click to upload
                </label>
              </div>
            </TabsContent>
            <TabsContent value="url">
              <form onSubmit={handleInsertEmbed} className="grid gap-2">
                <Input
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (urlError) setUrlError(false);
                  }}
                  placeholder="Paste the image link..."
                />
                {urlError ? (
                  <p className="text-xs text-destructive">
                    Please enter a valid URL
                  </p>
                ) : null}
                <Button type="submit" size="sm" className="w-full">
                  Embed Image
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Works with any image from the web
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </NodeViewWrapper>
  );
};