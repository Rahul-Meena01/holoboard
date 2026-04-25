import { useCallback, useRef } from "react";
import { ZOOM_BOUNDS } from "../constants/defaults";
import { useWhiteboardStore } from "../context/useWhiteboardStore";
import { clamp } from "../utils/geometry";

export function usePanZoom() {
  const zoom = useWhiteboardStore((state) => state.viewport.zoom);
  const pan = useWhiteboardStore((state) => state.viewport.pan);
  const isPanning = useWhiteboardStore((state) => state.viewport.isPanning);
  const setPan = useWhiteboardStore((state) => state.setPan);
  const setZoom = useWhiteboardStore((state) => state.setZoom);
  const setIsPanning = useWhiteboardStore((state) => state.setIsPanning);
  const resetViewport = useWhiteboardStore((state) => state.resetViewport);

  const panStartRef = useRef(null);

  const zoomByFactor = useCallback(
    (factor) => {
      setZoom(clamp(zoom * factor, ZOOM_BOUNDS.min, ZOOM_BOUNDS.max));
    },
    [zoom, setZoom],
  );

  const startPanning = useCallback(
    (clientPoint) => {
      setIsPanning(true);
      panStartRef.current = {
        x: clientPoint.x - pan.x,
        y: clientPoint.y - pan.y,
      };
    },
    [pan, setIsPanning],
  );

  const updatePanning = useCallback(
    (clientPoint) => {
      if (!panStartRef.current) {
        return;
      }

      setPan({
        x: clientPoint.x - panStartRef.current.x,
        y: clientPoint.y - panStartRef.current.y,
      });
    },
    [setPan],
  );

  const stopPanning = useCallback(() => {
    setIsPanning(false);
    panStartRef.current = null;
  }, [setIsPanning]);

  const onWheel = useCallback(
    (event) => {
      event.preventDefault();
      zoomByFactor(
        event.deltaY < 0 ? ZOOM_BOUNDS.wheelIn : ZOOM_BOUNDS.wheelOut,
      );
    },
    [zoomByFactor],
  );

  return {
    zoom,
    pan,
    isPanning,
    onWheel,
    startPanning,
    updatePanning,
    stopPanning,
    zoomIn: () => zoomByFactor(ZOOM_BOUNDS.step),
    zoomOut: () => zoomByFactor(1 / ZOOM_BOUNDS.step),
    resetViewport,
    setZoom,
  };
}
