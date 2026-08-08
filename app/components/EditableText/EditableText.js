"use client";

import { useState, useEffect } from "react";

export default function EditableText({
  value,
  onSave,
  className = "",
  placeholder = "Click to edit...",
  style = {},
  multiline = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value || "");

  useEffect(() => {
    setText(value || "");
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (text !== value && onSave) {
      onSave(text);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !multiline) {
      handleBlur();
    }
  };

  const inlineInputStyle = {
    background: "transparent",
    border: "none",
    borderBottom: "1.5px dashed #2563eb",
    outline: "none",
    font: "inherit",
    color: "inherit",
    width: "100%",
    boxSizing: "border-box",
    padding: "0 2px",
    display: "inline-block",
    cursor: "text",
    ...style,
  };

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          autoFocus
          rows={3}
          style={{ ...inlineInputStyle, resize: "none" }}
        />
      );
    }
    return (
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        style={inlineInputStyle}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      title="Click to edit"
      style={{ cursor: "pointer", display: "inline-block", maxWidth: "100%", wordBreak: "break-word" }}
      className={className}
    >
      {text || placeholder}
    </span>
  );
}
