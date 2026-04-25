import { useEffect } from "react";
import { TOOL_CONFIG } from "../constants/tools";

export function useKeyboardShortcuts({
  onSelectTool,
  onUndo,
  onRedo,
  onDeleteSelection,
  onClearSelection,
  onToggleHelp,
}) {
  useEffect(() => {
    const listener = (event) => {
      const tagName = event.target?.tagName;
      if (tagName === "INPUT" || tagName === "TEXTAREA") {
        return;
      }

      const key = event.key.toLowerCase();
      const tool = TOOL_CONFIG.find((item) => item.key === key);
      if (tool) {
        onSelectTool(tool.id);
        return;
      }

      const mod = event.metaKey || event.ctrlKey;
      if (mod && key === "z" && !event.shiftKey) {
        event.preventDefault();
        onUndo();
        return;
      }

      if (mod && (key === "y" || (event.shiftKey && key === "z"))) {
        event.preventDefault();
        onRedo();
        return;
      }

      if (key === "backspace" || key === "delete") {
        onDeleteSelection();
        return;
      }

      if (key === "escape") {
        onClearSelection();
        return;
      }

      if (key === "?") {
        event.preventDefault();
        onToggleHelp();
      }
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [
    onSelectTool,
    onUndo,
    onRedo,
    onDeleteSelection,
    onClearSelection,
    onToggleHelp,
  ]);
}
