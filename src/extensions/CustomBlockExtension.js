import { NodeExtension, NodeGroup } from "@remirror/core";
import { textblockTypeInputRule } from '@remirror/pm/inputrules';
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
      atom: true,
      block: true,
      content: null,
      draggable: true,
      group: NodeGroup.Block,
      toDOM: node => ["div", { class: "custom" }],
      parseDOM: [{
        tag: "div.custom",
        getAttrs: dom => {
          return true;
        }
      }]
    };
  }

  createCommands() {
    return {
      toggleCustomBlock: (custom) => ({ tr, dispatch }) => {
        dispatch(tr.insert(tr.selection.from, this.type.create()));
        return true;
      },
    };
  }

  createInputRules() {
    return [textblockTypeInputRule(/^\s*>\s$/, this.type)];
  }

  get name(): string {
    return "custom";
  }

  ReactComponent = ({ node }) => {
    return (
      <div contentEditable={false}>
        LOOK AT ME CUSTOM BLOCK
      </div>
    );
  };
}
