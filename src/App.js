import React, { useState, useMemo, useCallback } from 'react';
import { BoldExtension } from 'remirror/extension/bold';
import { StrikeExtension } from 'remirror/extension/strike';
import { ItalicExtension } from 'remirror/extension/italic';
import { UnderlineExtension } from 'remirror/extension/underline';
import { BlockquoteExtension } from 'remirror/extension/blockquote';
import { CodeExtension } from 'remirror/extension/code';
import { HeadingExtension } from 'remirror/extension/heading';
import { HardBreakExtension } from 'remirror/extension/hard-break';
import { ListPreset } from "remirror/preset/list";
import { EMPTY_PARAGRAPH_NODE } from "remirror/core"
import { RemirrorProvider, useManager, useRemirror, usePositioner } from 'remirror/react';
import CustomBlockExtension from "./CustomBlockExtension";
import UniqueIdExtension from "./extensions/UniqueIdExtension"

const idAttribute = "_id";

const settings = {
  managerSettings: {
    extraAttributes: [
      {
        identifiers: ['paragraph', 'heading', 'blockquote', 'custom', 'orderedList', 'bulletList'],
        attributes: { [idAttribute]: { default: null } },
      }
    ]
  }
}

function modifiedNodes(event) {
  let modifiedNodes = [];
  const { tr: transaction } = event;

  try {
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
  } catch (err) {
    // TODO: Remove this catch, solve underlying issues
    console.error(err);
  }
  

  return modifiedNodes;
}

function Menu() {
  const [activeCommands, setActiveCommands] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  // The use positioner hook allows for tracking the current selection in the editor.
  const { top, left, ref } = usePositioner('bubble');

  const { commands, active } = useRemirror(() => {
    setActiveCommands({
      bold: active.bold(),
      italic: active.italic(),
      underline: active.underline(),
    });
  });

  return (
    <div ref={ref} style={{ top, left, position: 'absolute' }}>
      <button
        onClick={() => commands.toggleBold()}
        style={{ fontWeight: activeCommands.bold ? 'bold' : undefined }}
      >
        B
      </button>
      <button
        onClick={() => commands.toggleItalic()}
        style={{ fontWeight: activeCommands.italic ? 'bold' : undefined }}
      >
        I
      </button>
      <button
        onClick={() => commands.toggleUnderline()}
        style={{ fontWeight: activeCommands.underline ? 'bold' : undefined }}
      >
        U
      </button>
    </div>
  );
}

const Editor = () => {
  const { getRootProps, commands } = useRemirror();

  const insertCustomBlock = useCallback(() => {
    commands.toggleCustomBlock();
  }, [commands]);

  return (
    <div className="editor">
      <div {...getRootProps()} />
      <Menu />
      <button onClick={insertCustomBlock}>
        Insert Custom Block
      </button>
    </div>
  );
};

const parsed = JSON.parse(localStorage.getItem("saved") || "{}")
console.log({ parsed })

function usePersistedValue(manager) {
  // TODO: This doesn't work here although it works in playground

  const [value, setValue] = useState(manager.createState({
    content: parsed
  }));

  const onChange = useCallback((event) => {
    if (event.tr && event.tr.docChanged) {
      // Persist state to localStorage for demo
      localStorage.setItem("saved", JSON.stringify(event.state.doc.toJSON()));
    }
    
    setValue(event.state);
  }, []);

  return { value, onChange }
}

const App = () => {
  const manager = useManager( [
    new BoldExtension(),
    new ItalicExtension(),
    new StrikeExtension(),
    new UnderlineExtension(),
    new BlockquoteExtension(),
    new CodeExtension(),
    new HeadingExtension(),
    new HardBreakExtension(),
    new ListPreset(),
    new UniqueIdExtension({ idAttribute }),
    new CustomBlockExtension(),
  ], settings);
  const { value, onChange } = usePersistedValue(manager);

  return (
    <RemirrorProvider
      manager={manager}
      value={value}
      onChange={onChange}
    >
      <Editor />
    </RemirrorProvider>
  );
};

export default App;