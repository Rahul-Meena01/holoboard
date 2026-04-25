import { useCallback, useEffect, useMemo, useRef } from "react";
import { TOOL_IDS } from "../../constants/tools";
import { drawBoard } from "../../services/canvasRenderer";
import styles from "./CanvasBoard.module.css";

export default function CanvasBoard({
  theme,
  tool,
  strokes,
  selection,
  currentStroke,
  zoom,
  pan,
  isPanning,
  onWheel,
  onPanStart,
  onPanMove,
  onPanEnd,
  onSelectionStart,
  onSelectionChange,
  onSelectionEnd,
  onDrawingStart,
  onDrawingMove,
  onDrawingEnd,
  onStickyRequest,
  onCanvasReady,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const pointerModeRef = useRef("none");
  const rafRef = useRef(null);

  const cursor = useMemo(() => {
    if (isPanning) {
      return "grabbing";
    }

    if (tool === TOOL_IDS.HAND) return "grab";
    if (tool === TOOL_IDS.ERASER) return "cell";
    if (tool === TOOL_IDS.TEXT) return "text";
    if (tool === TOOL_IDS.STICKY) return "copy";
    return "crosshair";
  }, [tool, isPanning]);

  const toCanvasPoint = useCallback(
    (event) => {
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left - pan.x) / zoom,
        y: (event.clientY - rect.top - pan.y) / zoom,
      };
    },
    [pan.x, pan.y, zoom],
  );

  const scheduleDraw = useCallback(() => {
    if (rafRef.current) {
      return;
    }

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const ctx = canvas.getContext("2d");
      drawBoard({
        ctx,
        width: canvas.width,
        height: canvas.height,
        pan,
        zoom,
        strokes,
        selection,
        currentStroke,
        theme,
      });
    });
  }, [pan, zoom, strokes, selection, currentStroke, theme]);

  useEffect(() => {
    scheduleDraw();
  }, [scheduleDraw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      return undefined;
    }

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      scheduleDraw();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [scheduleDraw]);

  useEffect(() => {
    onCanvasReady(canvasRef.current);
  }, [onCanvasReady]);

  useEffect(
    () => () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    },
    [],
  );

  const handlePointerDown = useCallback(
    (event) => {
      if (event.pointerType === "touch") {
        event.preventDefault();
      }

      if (
        event.button === 1 ||
        tool === TOOL_IDS.HAND ||
        (event.pointerType === "touch" && event.isPrimary === false)
      ) {
        pointerModeRef.current = "pan";
        onPanStart({ x: event.clientX, y: event.clientY });
        return;
      }

      const point = toCanvasPoint(event);

      if (tool === TOOL_IDS.STICKY) {
        onStickyRequest(point);
        return;
      }

      if (tool === TOOL_IDS.SELECT) {
        pointerModeRef.current = "select";
        onSelectionStart(point);
        return;
      }

      pointerModeRef.current = "draw";
      onDrawingStart(point);
    },
    [
      onPanStart,
      toCanvasPoint,
      tool,
      onStickyRequest,
      onSelectionStart,
      onDrawingStart,
    ],
  );

  const handlePointerMove = useCallback(
    (event) => {
      if (pointerModeRef.current === "pan") {
        onPanMove({ x: event.clientX, y: event.clientY });
        return;
      }

      if (pointerModeRef.current === "select") {
        onSelectionChange(toCanvasPoint(event));
        return;
      }

      if (pointerModeRef.current === "draw") {
        onDrawingMove(toCanvasPoint(event));
      }
    },
    [onPanMove, onSelectionChange, toCanvasPoint, onDrawingMove],
  );

  const handlePointerUp = useCallback(() => {
    if (pointerModeRef.current === "pan") {
      onPanEnd();
    }

    if (pointerModeRef.current === "select") {
      onSelectionEnd();
    }

    if (pointerModeRef.current === "draw") {
      onDrawingEnd();
    }

    pointerModeRef.current = "none";
  }, [onPanEnd, onSelectionEnd, onDrawingEnd]);

  return (
    <div ref={containerRef} className={styles.container}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        style={{ cursor }}
        onWheel={onWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
}
