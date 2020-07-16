import React, { useState, useCallback } from 'react';
import { BoldExtension } from 'remirror/extension/bold';
import { StrikeExtension } from 'remirror/extension/strike';
import { ItalicExtension } from 'remirror/extension/italic';
import { UnderlineExtension } from 'remirror/extension/underline';
import { BlockquoteExtension } from 'remirror/extension/blockquote';
import { CodeExtension } from 'remirror/extension/code';
import { HeadingExtension } from 'remirror/extension/heading';
import { HardBreakExtension } from 'remirror/extension/hard-break';
import { RemirrorProvider, useManager, useRemirror } from 'remirror/react';
import CustomBlockExtension from "./CustomBlockExtension";
import { ReactComponentExtension } from "@remirror/extension-react-component";
import UniqueIdExtension from "./extensions/UniqueIdExtension"

const idAttribute = "_id";

const Editor = () => {
  const { getRootProps, commands } = useRemirror();

  const toggleCustomBlock = useCallback(() => {
    commands.toggleCustomBlock();
  }, [commands]);

  return (
    <div>
      <div {...getRootProps()} />
      <button onClick={toggleCustomBlock}>
        Toggle Custom Block
      </button>
    </div>
  );
};

function modifiedNodes(event) {
  let modifiedNodes = [];
  const { tr: transaction } = event;

  transaction.mapping.maps.forEach((step, index) => {
    const doc = event.state.doc; // transaction.docs[index];

    let topLevelBlocks = [];
    doc.descendants(node => {
      topLevelBlocks.push(node);
      return false;
    })

    doc.nodesBetween(step.ranges[0], step.ranges[0] + step.ranges[1], node => {
      if (topLevelBlocks.includes(node)) {
        modifiedNodes.push(node);
      }
    })
  });

  return modifiedNodes;
}

const App = () => {
  const manager = useManager([
  new BoldExtension(),
  new ItalicExtension(),
  new StrikeExtension(),
  new UnderlineExtension(),
  new BlockquoteExtension(),
  new CodeExtension(),
  new HeadingExtension(),
  new HardBreakExtension(),
  new UniqueIdExtension({idAttribute}),
  new ReactComponentExtension()
], {
  managerSettings: {
    extraAttributes: [
      {
        identifiers: ['paragraph', 'heading', 'blockquote'],
        attributes: { [idAttribute]: { default: null } },
      }
    ]
  }
});
  const initialValue = manager.createState({
    content: JSON.parse(localStorage.getItem("saved") || "{}")
  });

  const [value, setValue] = useState(initialValue);

  return (
    <RemirrorProvider manager={manager}       value={value}
      onChange={event => {
        if (event.tr && event.tr.docChanged) {
          const saved = event.getRemirrorJSON();
          localStorage.setItem("saved", JSON.stringify(saved));

          console.log(modifiedNodes(event).map(node => node.attrs._id));
        }

        setValue(event.state);
      }}>
      <Editor />
    </RemirrorProvider>
  );
};

export default App
;