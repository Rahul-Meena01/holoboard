import { create } from "zustand";
import { HISTORY_LIMIT } from "../constants/defaults";
import { THEMES } from "../constants/theme";
import { TOOL_IDS } from "../constants/tools";

function snapshot(strokes, stickies) {
  return {
    strokes: [...strokes],
    stickies: [...stickies],
  };
}

function pushHistory(past, current) {
  const next = [...past, current];
  return next.length > HISTORY_LIMIT
    ? next.slice(next.length - HISTORY_LIMIT)
    : next;
}

export const useWhiteboardStore = create((set, get) => ({
  ui: {
    tool: TOOL_IDS.PEN,
    inkColor: THEMES.light.inkPalette[0],
    strokeWidth: 3,
    theme: "light",
    showCollaborationPanel: false,
    showShortcutsHelp: false,
    loading: true,
    error: "",
  },
  peers: {
    status: "loading",
    peerId: "",
    joinId: "",
    copied: false,
    connections: [],
  },
  viewport: {
    zoom: 1,
    pan: { x: 0, y: 0 },
    isPanning: false,
  },
  selection: null,
  board: {
    strokes: [],
    stickies: [],
  },
  history: {
    past: [],
    future: [],
  },

  setLoading: (loading) => set((state) => ({ ui: { ...state.ui, loading } })),

  setTheme: (theme) => set((state) => ({ ui: { ...state.ui, theme } })),

  setError: (error) => set((state) => ({ ui: { ...state.ui, error } })),

  setPeerStatus: (status) =>
    set((state) => ({ peers: { ...state.peers, status } })),

  setPeerId: (peerId) =>
    set((state) => ({ peers: { ...state.peers, peerId } })),

  setJoinId: (joinId) =>
    set((state) => ({ peers: { ...state.peers, joinId } })),

  setCopied: (copied) =>
    set((state) => ({ peers: { ...state.peers, copied } })),

  setConnections: (connectionsOrUpdater) =>
    set((state) => ({
      peers: {
        ...state.peers,
        connections:
          typeof connectionsOrUpdater === "function"
            ? connectionsOrUpdater(state.peers.connections)
            : connectionsOrUpdater,
      },
    })),

  setTool: (tool) => set((state) => ({ ui: { ...state.ui, tool } })),

  setInkColor: (inkColor) =>
    set((state) => ({ ui: { ...state.ui, inkColor } })),

  setStrokeWidth: (strokeWidth) =>
    set((state) => ({ ui: { ...state.ui, strokeWidth } })),

  toggleTheme: () =>
    set((state) => ({
      ui: { ...state.ui, theme: state.ui.theme === "dark" ? "light" : "dark" },
    })),

  toggleCollaborationPanel: () =>
    set((state) => ({
      ui: {
        ...state.ui,
        showCollaborationPanel: !state.ui.showCollaborationPanel,
      },
    })),

  openShortcutsHelp: () =>
    set((state) => ({ ui: { ...state.ui, showShortcutsHelp: true } })),

  closeShortcutsHelp: () =>
    set((state) => ({ ui: { ...state.ui, showShortcutsHelp: false } })),

  setPan: (pan) => set((state) => ({ viewport: { ...state.viewport, pan } })),

  setZoom: (zoom) =>
    set((state) => ({ viewport: { ...state.viewport, zoom } })),

  resetViewport: () =>
    set((state) => ({
      viewport: { ...state.viewport, zoom: 1, pan: { x: 0, y: 0 } },
    })),

  setIsPanning: (isPanning) =>
    set((state) => ({ viewport: { ...state.viewport, isPanning } })),

  setSelection: (selection) => set({ selection }),
  clearSelection: () => set({ selection: null }),

  setBoardSnapshot: ({ strokes, stickies, pushToHistory = false }) => {
    const state = get();
    const current = snapshot(state.board.strokes, state.board.stickies);
    set((prev) => ({
      board: {
        strokes: [...strokes],
        stickies: [...stickies],
      },
      history: pushToHistory
        ? {
            past: pushHistory(prev.history.past, current),
            future: [],
          }
        : prev.history,
    }));
  },

  addStroke: (stroke, pushToHistory = true) => {
    const state = get();
    const current = snapshot(state.board.strokes, state.board.stickies);

    set((prev) => ({
      board: {
        ...prev.board,
        strokes: [...prev.board.strokes, stroke],
      },
      history: pushToHistory
        ? {
            past: pushHistory(prev.history.past, current),
            future: [],
          }
        : prev.history,
    }));
  },

  removeStrokesByIds: (ids, pushToHistory = true) => {
    const state = get();
    const current = snapshot(state.board.strokes, state.board.stickies);
    set((prev) => ({
      board: {
        ...prev.board,
        strokes: prev.board.strokes.filter(
          (stroke) => !ids.includes(stroke.id),
        ),
      },
      selection: null,
      history: pushToHistory
        ? {
            past: pushHistory(prev.history.past, current),
            future: [],
          }
        : prev.history,
    }));
  },

  addSticky: (sticky, pushToHistory = true) => {
    const state = get();
    const current = snapshot(state.board.strokes, state.board.stickies);
    set((prev) => ({
      board: {
        ...prev.board,
        stickies: [...prev.board.stickies, sticky],
      },
      history: pushToHistory
        ? {
            past: pushHistory(prev.history.past, current),
            future: [],
          }
        : prev.history,
    }));
  },

  updateSticky: (sticky, pushToHistory = false) => {
    set((prev) => ({
      board: {
        ...prev.board,
        stickies: prev.board.stickies.map((note) =>
          note.id === sticky.id ? sticky : note,
        ),
      },
      history: pushToHistory
        ? {
            past: pushHistory(
              prev.history.past,
              snapshot(prev.board.strokes, prev.board.stickies),
            ),
            future: [],
          }
        : prev.history,
    }));
  },

  removeSticky: (stickyId, pushToHistory = true) => {
    const state = get();
    const current = snapshot(state.board.strokes, state.board.stickies);
    set((prev) => ({
      board: {
        ...prev.board,
        stickies: prev.board.stickies.filter((note) => note.id !== stickyId),
      },
      history: pushToHistory
        ? {
            past: pushHistory(prev.history.past, current),
            future: [],
          }
        : prev.history,
    }));
  },

  clearBoard: (pushToHistory = true) => {
    const state = get();
    const current = snapshot(state.board.strokes, state.board.stickies);
    set((prev) => ({
      board: { strokes: [], stickies: [] },
      selection: null,
      history: pushToHistory
        ? {
            past: pushHistory(prev.history.past, current),
            future: [],
          }
        : prev.history,
    }));
  },

  undo: () =>
    set((state) => {
      if (!state.history.past.length) {
        return state;
      }
      const previous = state.history.past[state.history.past.length - 1];
      const current = snapshot(state.board.strokes, state.board.stickies);

      return {
        board: {
          strokes: [...previous.strokes],
          stickies: [...previous.stickies],
        },
        history: {
          past: state.history.past.slice(0, -1),
          future: [current, ...state.history.future],
        },
        selection: null,
      };
    }),

  redo: () =>
    set((state) => {
      if (!state.history.future.length) {
        return state;
      }

      const next = state.history.future[0];
      const current = snapshot(state.board.strokes, state.board.stickies);
      return {
        board: {
          strokes: [...next.strokes],
          stickies: [...next.stickies],
        },
        history: {
          past: pushHistory(state.history.past, current),
          future: state.history.future.slice(1),
        },
        selection: null,
      };
    }),
}));
