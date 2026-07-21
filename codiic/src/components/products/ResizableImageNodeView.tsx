import React, { useMemo, useRef, useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

type Corner = "nw" | "ne" | "sw" | "se";

const MIN_SIZE = 80;

const toNumber = (value: string | null | undefined, fallback: number) => {
  if (!value) return fallback;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
};

const ResizableImageNodeView: React.FC<NodeViewProps> = ({
  node,
  selected,
  editor,
  getPos,
  updateAttributes,
}) => {
  const initialWidth = useMemo(
    () => toNumber(node.attrs.width as string, 480),
    [node.attrs.width]
  );
  const initialHeight = useMemo(
    () => toNumber(node.attrs.height as string, 300),
    [node.attrs.height]
  );

  const [draftSize, setDraftSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const latestDraftRef = useRef<{ width: number; height: number } | null>(null);

  const width = draftSize?.width ?? initialWidth;
  const height = draftSize?.height ?? initialHeight;

  const startResize = (corner: Corner, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const baseW = width;
    const baseH = height;

    const onMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      const nextW =
        corner === "nw" || corner === "sw"
          ? Math.max(MIN_SIZE, baseW - dx)
          : Math.max(MIN_SIZE, baseW + dx);
      const nextH =
        corner === "nw" || corner === "ne"
          ? Math.max(MIN_SIZE, baseH - dy)
          : Math.max(MIN_SIZE, baseH + dy);

      const next = { width: nextW, height: nextH };
      latestDraftRef.current = next;
      setDraftSize(next);
    };

    const onUp = () => {
      const final = latestDraftRef.current ?? { width: baseW, height: baseH };
      updateAttributes({
        width: `${Math.round(final.width)}px`,
        height: `${Math.round(final.height)}px`,
      });
      setDraftSize(null);
      latestDraftRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <NodeViewWrapper
      as="span"
      className={`group relative my-3 inline-block align-top ${
        selected ? "ring-2 ring-blue-400 ring-offset-1" : ""
      }`}
      data-drag-handle
    >
      <img
        src={node.attrs.src as string}
        alt={(node.attrs.alt as string) || ""}
        title={(node.attrs.title as string) || ""}
        draggable={false}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          maxWidth: "100%",
          objectFit: "cover",
        }}
        className="rounded-lg border border-gray-200 bg-white shadow-sm"
        onMouseDown={() => {
          const pos = typeof getPos === "function" ? getPos() : getPos;
          if (typeof pos === "number") {
            editor.commands.setNodeSelection(pos);
          }
        }}
      />

      <button
        type="button"
        className={`absolute -left-1.5 -top-1.5 h-3.5 w-3.5 cursor-nwse-resize border border-gray-900 bg-white ${
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        onMouseDown={(e) => startResize("nw", e)}
        aria-label="Resize image from top left"
      />
      <button
        type="button"
        className={`absolute -right-1.5 -top-1.5 h-3.5 w-3.5 cursor-nesw-resize border border-gray-900 bg-white ${
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        onMouseDown={(e) => startResize("ne", e)}
        aria-label="Resize image from top right"
      />
      <button
        type="button"
        className={`absolute -bottom-1.5 -left-1.5 h-3.5 w-3.5 cursor-nesw-resize border border-gray-900 bg-white ${
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        onMouseDown={(e) => startResize("sw", e)}
        aria-label="Resize image from bottom left"
      />
      <button
        type="button"
        className={`absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 cursor-nwse-resize border border-gray-900 bg-white ${
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        onMouseDown={(e) => startResize("se", e)}
        aria-label="Resize image from bottom right"
      />
    </NodeViewWrapper>
  );
};

export default ResizableImageNodeView;
