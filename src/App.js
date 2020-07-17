import React, { useState, useCallback } from 'react';
import { BoldExtension } from 'remirror/extension/bold';
import { StrikeExtension } from 'remirror/extension/strike';
import { ItalicExtension } from 'remirror/extension/italic';
import { UnderlineExtension } from 'remirror/extension/underline';
import { BlockquoteExtension } from 'remirror/extension/blockquote';
import { CodeExtension } from 'remirror/extension/code';
import { HeadingExtension } from 'remirror/extension/heading';
import { HardBreakExtension } from 'remirror/extension/hard-break';
import { ListPreset } from "remirror/preset/list";
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
  const {top, left, bottom, ref} = usePositioner('bubble');

  const { commands, active } = useRemirror(() => {
    setActiveCommands({
      bold: active.bold(),
      italic: active.italic(),
      underline: active.underline(),
    });
  });

  console.log({ top, left, bottom, position: 'absolute', })

  return (
    <div ref={ref} style={{ top, left, position: 'absolute', }}>
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
    <div>
      <div {...getRootProps()} />
      <Menu />
      <button onClick={insertCustomBlock}>
        Insert Custom Block
      </button>
    </div>
  );
};

const App = () => {

  const [manager] = useState(useManager([
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
  ], settings));

  console.log({ manager })

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

export default App;