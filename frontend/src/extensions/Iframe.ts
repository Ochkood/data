import { Node, mergeAttributes } from "@tiptap/core";
import { CommandProps } from "@tiptap/core";

export interface IframeOptions {
  src: string;
  frameborder?: number;
  allowfullscreen?: boolean;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    iframe: {
      /**
       * Insert an iframe node
       */
      setIframe: (options: IframeOptions) => ReturnType;
    };
  }
}

const Iframe = Node.create({
  name: "iframe",

  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      frameborder: { default: 0 },
      allowfullscreen: { default: true },
    };
  },

  parseHTML() {
    return [{ tag: "iframe" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "iframe",
      mergeAttributes(HTMLAttributes, {
        class: "rounded-lg my-3 w-full aspect-video border border-gray-300",
      }),
    ];
  },

  addCommands() {
    return {
      setIframe:
        (options: IframeOptions) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

export default Iframe;