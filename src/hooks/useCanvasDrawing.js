import { useCallback, useMemo, useRef, useState } from "react";
import { DRAWING_TOOLS, TOOL_IDS } from "../constants/tools";
import { useWhiteboardStore } from "../context/useWhiteboardStore";
import { uid } from "../utils/id";

export function useCanvasDrawing({ onStrokeCommitted, onStickyCreated }) {
  const tool = useWhiteboardStore((state) => state.ui.tool);
  const inkColor = useWhiteboardStore((state) => state.ui.inkColor);
  const strokeWidth = useWhiteboardStore((state) => state.ui.strokeWidth);

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(null);
  const textInputRef = useRef(null);

  const startDrawing = useCallback(
    (point) => {
      if (!DRAWING_TOOLS.includes(tool)) {
        return false;
      }

      if (tool === TOOL_IDS.TEXT) {
        const text = window.prompt("Enter text");
        if (!text?.trim()) {
          return false;
        }

        const stroke = {
          id: uid("stroke"),
          tool,
          color: inkColor,
          width: strokeWidth,
          points: [point],
          text,
        };
        onStrokeCommitted(stroke);
        return true;
      }

      setIsDrawing(true);
      setCurrentStroke({
        id: uid("stroke"),
        tool,
        color: inkColor,
        width: strokeWidth,
        points: [point],
        text: "",
      });
      return true;
    },
    [tool, inkColor, strokeWidth, onStrokeCommitted],
  );

  const moveDrawing = useCallback(
    (point) => {
      if (!isDrawing || !currentStroke) {
        return;
      }

      if ([TOOL_IDS.PEN, TOOL_IDS.ERASER].includes(currentStroke.tool)) {
        setCurrentStroke((prev) => ({
          ...prev,
          points: [...prev.points, point],
        }));
        return;
      }

      setCurrentStroke((prev) => ({
        ...prev,
        points: [prev.points[0], point],
      }));
    },
    [isDrawing, currentStroke],
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawing || !currentStroke) {
      setIsDrawing(false);
      setCurrentStroke(null);
      return null;
    }

    if (currentStroke.points.length) {
      onStrokeCommitted(currentStroke);
    }

    setIsDrawing(false);
    setCurrentStroke(null);
    return currentStroke;
  }, [isDrawing, currentStroke, onStrokeCommitted]);

  const startSticky = useCallback(
    (point) => {
      if (tool !== TOOL_IDS.STICKY) {
        return null;
      }

      return onStickyCreated(point);
    },
    [tool, onStickyCreated],
  );

  const cursor = useMemo(() => {
    if (tool === TOOL_IDS.HAND) return "grab";
    if (tool === TOOL_IDS.ERASER) return "cell";
    if (tool === TOOL_IDS.TEXT) return "text";
    if (tool === TOOL_IDS.STICKY) return "copy";
    return "crosshair";
  }, [tool]);

  return {
    isDrawing,
    currentStroke,
    cursor,
    textInputRef,
    startDrawing,
    moveDrawing,
    stopDrawing,
    startSticky,
  };
}
