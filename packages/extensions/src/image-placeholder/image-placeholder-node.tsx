"use client";

import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { Image, Link, Upload } from "lucide-react";
import type { DragEvent, FormEvent } from "react";
import { useCallback, useId, useState } from "react";

import { isValidUrl } from "../core/commands";
import { useToolbar } from "../core/context";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Popover } from "../ui/popover";
import { PopoverContent } from "../ui/popover-content";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();
};

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
          { attrs: { src }, type: "image" }
        )
        .run();
    },
    [editor, getPos, node.nodeSize]
  );

  const handleAcceptedFiles = (files: File[]) => {
    for (const file of files) {
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        replaceWithImage(reader.result as string)
      );
      reader.readAsDataURL(file);
    }
    extension.options.onDrop?.(files, editor);
  };

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

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setIsDragReject(false);

    const { files } = e.dataTransfer;
    const accepted: File[] = [];
    const rejected: File[] = [];

    for (const file of files) {
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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleAcceptedFiles([...(e.target.files || [])]);
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
    (extension.options.allowedMimeTypes as
      | Record<string, string[]>
      | undefined) ?? {
      "image/*": ["image/*"],
    }
  ).join(",");

  const triggerClass = [
    "ext-image-placeholder-trigger",
    selected ? "ext-image-placeholder-trigger--selected" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const uploadZoneClass = [
    "ext-image-upload-zone",
    isDragActive ? "ext-image-upload-zone--dragging" : "",
    isDragReject ? "ext-image-upload-zone--reject" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <NodeViewWrapper className="ext-image-placeholder">
      <Popover
        open={open}
        onOpenChange={setOpen}
        trigger={
          <button
            aria-label={labels.imagePlaceholder}
            className={triggerClass}
            type="button"
          >
            <Image />
            {labels.imagePlaceholder}
          </button>
        }
      >
        <PopoverContent className="ext-image-placeholder-popover">
          <Tabs defaultValue="upload">
            <TabsList>
              <TabsTrigger value="upload">
                <Upload />
                Upload
              </TabsTrigger>
              <TabsTrigger value="url">
                <Link />
                Embed link
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={uploadZoneClass}
              >
                <input
                  type="file"
                  accept={mimeTypeList}
                  multiple={
                    (extension.options.maxFiles as number | undefined) !== 1
                  }
                  onChange={handleFileInputChange}
                  className="ext-sr-only"
                  id={fileInputId}
                />
                <label htmlFor={fileInputId} className="ext-image-upload-label">
                  <Upload />
                  Drag & drop or click to upload
                </label>
              </div>
            </TabsContent>
            <TabsContent value="url">
              <form onSubmit={handleInsertEmbed} className="ext-image-embed">
                <Input
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (urlError) {
                      setUrlError(false);
                    }
                  }}
                  placeholder="Paste the image link..."
                />
                {urlError ? (
                  <p className="ext-image-error">Please enter a valid URL</p>
                ) : null}
                <Button type="submit" className="ext-image-embed-submit">
                  Embed Image
                </Button>
                <p className="ext-image-hint">
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
