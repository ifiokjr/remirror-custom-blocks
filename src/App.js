import React, { useCallback } from 'react';
import { BoldExtension } from 'remirror/extension/bold';
import { RemirrorProvider, useManager, useRemirror } from 'remirror/react';
import CustomBlockExtension from "./CustomBlockExtension";
import { ReactComponentExtension } from "@remirror/extension-react-component";

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
  const manager = useManager([new BoldExtension(), new CustomBlockExtension(), new ReactComponentExtension()]);

  return (
    <RemirrorProvider manager={manager}>
      <Editor />
    </RemirrorProvider>
  );
};

export default App
;