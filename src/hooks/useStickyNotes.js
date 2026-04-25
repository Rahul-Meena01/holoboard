import { useCallback, useMemo, useState } from "react";
import { DEFAULT_STICKY_SIZE } from "../constants/defaults";
import { THEMES } from "../constants/theme";
import { useWhiteboardStore } from "../context/useWhiteboardStore";
import { uid } from "../utils/id";

export function useStickyNotes() {
  const themeName = useWhiteboardStore((state) => state.ui.theme);
  const stickies = useWhiteboardStore((state) => state.board.stickies);
  const addSticky = useWhiteboardStore((state) => state.addSticky);
  const updateSticky = useWhiteboardStore((state) => state.updateSticky);
  const removeSticky = useWhiteboardStore((state) => state.removeSticky);

  const [editingStickyId, setEditingStickyId] = useState("");

  const palette = useMemo(() => {
    const theme = THEMES[themeName] || THEMES.light;
    return theme.stickyPalette;
  }, [themeName]);

  const createStickyAt = useCallback(
    (point) => {
      const sticky = {
        id: uid("sticky"),
        x: point.x,
        y: point.y,
        text: "",
        color: palette[Math.floor(Math.random() * palette.length)],
        ...DEFAULT_STICKY_SIZE,
      };

      addSticky(sticky);
      setEditingStickyId(sticky.id);
      return sticky;
    },
    [addSticky, palette],
  );

  const patchSticky = useCallback(
    (stickyId, patch) => {
      const current = stickies.find((sticky) => sticky.id === stickyId);
      if (!current) {
        return null;
      }

      const updated = { ...current, ...patch };
      updateSticky(updated);
      return updated;
    },
    [stickies, updateSticky],
  );

  return {
    stickies,
    editingStickyId,
    setEditingStickyId,
    createStickyAt,
    patchSticky,
    removeSticky,
  };
}
