import React, { useState, useCallback } from 'react';
import { BoldExtension } from 'remirror/extension/bold';
import { StrikeExtension } from 'remirror/extension/strike';
import { ItalicExtension } from 'remirror/extension/italic';
import { UnderlineExtension } from 'remirror/extension/underline';
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

const App = () => {
  const manager = useManager([
  new BoldExtension(),
  new ItalicExtension(),
  new StrikeExtension(),
  new UnderlineExtension(),
  new CodeExtension(),
  new HeadingExtension(),
  new HardBreakExtension(),
  new UniqueIdExtension({idAttribute}),
  new ReactComponentExtension()
], {
  managerSettings: {
    extraAttributes: [
      {
        identifiers: ['paragraph', 'heading'],
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
        }

        setValue(event.state);
      }}>
      <Editor />
    </RemirrorProvider>
  );
};

export default App
;