import { NodeExtension, NodeGroup, convertCommand } from "@remirror/core";
import { setBlockType } from "@remirror/pm/commands";
import * as React from "react";

export default class CustomBlockExtension extends NodeExtension<{
  useContent: boolean
}> {
  createNodeSpec(extra) {
    return {
      attrs: {
        ...extra.defaults(),
        custom: { default: "custom" }
      },
      content: "inline*",
      group: NodeGroup.Block,
      toDOM: node => ["nav", extra.dom(node), 0]
    };
  }

  createCommands() {
    return {
      toggleCustomBlock: () => convertCommand(setBlockType(this.type, {}))
    };
  }

  get name(): string {
    return "custom";
  }

  ReactComponent = ({ node, forwardRef }) => {
    if (this.options.useContent) {
      return <p {...node.attrs} ref={forwardRef} />;
    }

    return (
      <div contentEditable={false} ref={forwardRef}>
        Ignore content
      </div>
    );
  };
}
