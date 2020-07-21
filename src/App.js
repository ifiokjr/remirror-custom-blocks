import React, { FC, useState, useCallback } from "react";
import { BoldExtension } from "remirror/extension/bold";
import { ItalicExtension } from "remirror/extension/italic";
import { HeadingExtension } from "remirror/extension/heading";
import { ListPreset } from "remirror/preset/list";
import { RemirrorProvider, useManager, useRemirror, usePositioner } from "remirror/react";
import { bubblePositioner } from 'remirror/extension/positioner';
const EXTENSIONS = [
  new HeadingExtension(),
  new BoldExtension(),
  new ItalicExtension(),
  new ListPreset(),
];

function Menu() {
    const [activeCommands, setActiveCommands] = useState({
      bold: false,
      italic: false,
      underline: false,
    });

    // The use positioner hook allows for tracking the current selection in the editor.
    const { top, left, ref, bottom, right } = usePositioner({ ...bubblePositioner, hasChanged: () => true });

    const { commands, active } = useRemirror(() => {
      setActiveCommands({
        bold: active.bold(),
        italic: active.italic(),
        underline: active.underline(),
      });
    });

    console.log('rerendering', {top, left, ref, activeCommands, bottom, right})

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

function usePersistedValue(manager) {
  const [value, setValue] = useState(
    manager.createState({
      content: JSON.parse(localStorage.getItem("saved"))
    })
  );

  const onChange = useCallback((event) => {
    if (event.tr && event.tr.docChanged) {
      // Persist state to localStorage for demo
      const saved = event.state.doc.toJSON();
      localStorage.setItem("saved", JSON.stringify(saved));
    }

    setValue(event.state);
  }, []);

  return { value, onChange }
}

/**
 * This component contains the editor and any toolbars/chrome it requires.
 */
const SmallEditor = () => {
  const { getRootProps } = useRemirror();
  return (
    <div>
      <div {...getRootProps()} />
      <Menu />
    </div>
  );
};
const SmallEditorWrapper = () => {
  console.log('starting')
  const extensionManager = useManager(EXTENSIONS);
  const { value, onChange } = usePersistedValue(extensionManager);

  return (
    <RemirrorProvider
      manager={extensionManager}
      value={value}
      onChange={onChange}
    >
      <SmallEditor />
    </RemirrorProvider>
  );
};

export default SmallEditorWrapper;