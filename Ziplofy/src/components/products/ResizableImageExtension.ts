import Image from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ResizableImageNodeView from "./ResizableImageNodeView";

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "480px",
        parseHTML: (element) =>
          element.getAttribute("data-width") || element.style.width || "480px",
        renderHTML: (attributes) => ({ "data-width": attributes.width }),
      },
      height: {
        default: "300px",
        parseHTML: (element) =>
          element.getAttribute("data-height") ||
          element.style.height ||
          "300px",
        renderHTML: (attributes) => ({ "data-height": attributes.height }),
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const width = node.attrs.width || "480px";
    const height = node.attrs.height || "300px";
    const baseStyle = HTMLAttributes.style ? `${HTMLAttributes.style}; ` : "";
    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        style: `${baseStyle}width: ${width}; height: ${height};`,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNodeView);
  },
});

export default ResizableImage;
