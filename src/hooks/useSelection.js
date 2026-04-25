import { useCallback, useState } from "react";
import { isPointInRect, normalizeRect } from "../utils/geometry";
import { useWhiteboardStore } from "../context/useWhiteboardStore";

export function useSelection() {
  const selection = useWhiteboardStore((state) => state.selection);
  const setSelection = useWhiteboardStore((state) => state.setSelection);
  const clearSelection = useWhiteboardStore((state) => state.clearSelection);
  const strokes = useWhiteboardStore((state) => state.board.strokes);
  const removeStrokesByIds = useWhiteboardStore(
    (state) => state.removeStrokesByIds,
  );

  const [selectionStart, setSelectionStart] = useState(null);

  const beginSelection = useCallback(
    (point) => {
      setSelectionStart(point);
      setSelection(null);
    },
    [setSelection],
  );

  const updateSelection = useCallback(
    (point) => {
      if (!selectionStart) {
        return;
      }

      setSelection(normalizeRect(selectionStart, point));
    },
    [selectionStart, setSelection],
  );

  const completeSelection = useCallback(() => {
    setSelectionStart(null);
  }, []);

  const removeSelectedStrokes = useCallback(() => {
    if (!selection) {
      return [];
    }

    const idsToRemove = strokes
      .filter((stroke) =>
        stroke.points.some((point) => isPointInRect(point, selection)),
      )
      .map((stroke) => stroke.id);

    if (!idsToRemove.length) {
      return [];
    }

    removeStrokesByIds(idsToRemove);
    return idsToRemove;
  }, [selection, strokes, removeStrokesByIds]);

  return {
    selection,
    beginSelection,
    updateSelection,
    completeSelection,
    clearSelection,
    removeSelectedStrokes,
  };
}
