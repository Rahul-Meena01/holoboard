import { useEffect } from "react";
import { ZOOM_BOUNDS } from "../constants/defaults";
import { THEMES } from "../constants/theme";
import {
  loadBoardFromStorage,
  saveBoardToStorage,
} from "../services/storageService";
import { clamp } from "../utils/geometry";

export function useBoardPersistence({
  strokes,
  stickies,
  theme,
  zoom,
  pan,
  setSnapshot,
  setTheme,
  setZoom,
  setPan,
  setLoading,
}) {
  useEffect(() => {
    const cached = loadBoardFromStorage();
    if (!cached) {
      setLoading(false);
      return;
    }

    if (Array.isArray(cached.strokes) || Array.isArray(cached.stickies)) {
      setSnapshot({
        strokes: cached.strokes || [],
        stickies: cached.stickies || [],
      });
    }

    if (typeof cached.theme === "string" && THEMES[cached.theme]) {
      setTheme(cached.theme);
    }

    if (typeof cached.zoom === "number" && Number.isFinite(cached.zoom)) {
      setZoom(clamp(cached.zoom, ZOOM_BOUNDS.min, ZOOM_BOUNDS.max));
    }

    if (
      cached.pan &&
      typeof cached.pan.x === "number" &&
      typeof cached.pan.y === "number" &&
      Number.isFinite(cached.pan.x) &&
      Number.isFinite(cached.pan.y)
    ) {
      setPan(cached.pan);
    }

    setLoading(false);
  }, [setSnapshot, setTheme, setZoom, setPan, setLoading]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      saveBoardToStorage({
        strokes,
        stickies,
        theme,
        zoom,
        pan,
        savedAt: Date.now(),
      });
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [strokes, stickies, theme, zoom, pan]);
}
