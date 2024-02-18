import React, { useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";
import "./App.css";
const styleMap = {
  BOLD: {
    fontWeight: "bold",
  },
  RED_TEXT: {
    color: "red",
  },
  UNDERLINE: {
    textDecoration: "underline",
  },
};

const TextEditor = () => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  useEffect(() => {
    const savedContent = localStorage.getItem("editorContent");
    if (savedContent) {
      setEditorState(
        EditorState.createWithContent(convertFromRaw(JSON.parse(savedContent)))
      );
    }
  }, []);

  const saveContent = () => {
    const content = editorState.getCurrentContent();
    localStorage.setItem(
      "editorContent",
      JSON.stringify(convertToRaw(content))
    );
  };

  const handleBeforeInput = (chars, editorState) => {
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) return "not-handled";

    const currentContent = editorState.getCurrentContent();
    const startKey = selection.getStartKey();
    const currentBlock = currentContent.getBlockForKey(startKey);
    const blockText = currentBlock.getText();
    const blockLength = blockText.length;

    if (chars !== " ") return "not-handled";

    let newState = null;

    if (blockText === "#") {
      newState = RichUtils.toggleBlockType(editorState, "header-one");
    } else if (blockText === "*") {
      newState = RichUtils.toggleInlineStyle(editorState, "BOLD");
    } else if (blockText === "**") {
      newState = RichUtils.toggleInlineStyle(editorState, "RED_TEXT");
    } else if (blockText === "***") {
      newState = RichUtils.toggleInlineStyle(editorState, "UNDERLINE");
    }

    if (newState) {
      const newSelection = selection.merge({
        anchorOffset: 0,
        focusOffset: blockLength,
      });

      const newContentState = Modifier.removeRange(
        newState.getCurrentContent(),
        newSelection,
        "backward"
      );

      setEditorState(
        EditorState.push(newState, newContentState, "change-block-type")
      );
      return "handled";
    }

    return "not-handled";
  };
  const clearContent = () => {
    localStorage.removeItem("editorContent");
    setEditorState(EditorState.createEmpty());
  };

  return (
    <div className="text-editor">
      <h2>Demo editior by Abhishek</h2>
      <button onClick={saveContent}>Save</button>
      <button onClick={clearContent}>Clear</button>
      <Editor
        editorState={editorState}
        onChange={setEditorState}
        handleBeforeInput={handleBeforeInput}
        customStyleMap={styleMap}
        placeholder="Start typing here..."
      />
    </div>
  );
};

export default TextEditor;
