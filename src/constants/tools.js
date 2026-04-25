export const TOOL_IDS = {
  HAND: "hand",
  SELECT: "select",
  PEN: "pen",
  ERASER: "eraser",
  LINE: "line",
  RECT: "rect",
  CIRCLE: "circle",
  ARROW: "arrow",
  STICKY: "sticky",
  TEXT: "text",
};

export const TOOL_CONFIG = [
  {
    id: TOOL_IDS.HAND,
    label: "Pan",
    key: "h",
    icon: "M9 11l0-6a2 2 0 114 0v5m0 0l0-2a2 2 0 114 0v6a6 6 0 01-12 0v-3a2 2 0 114 0v0",
  },
  {
    id: TOOL_IDS.SELECT,
    label: "Select",
    key: "s",
    icon: "M5 3l14 9-7 1.5-2.5 6.5L5 3z",
  },
  {
    id: TOOL_IDS.PEN,
    label: "Pen",
    key: "p",
    icon: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
  },
  {
    id: TOOL_IDS.ERASER,
    label: "Eraser",
    key: "e",
    icon: "M20 20H7L3 16l10-10 7 7-2.5 2.5M6.5 17.5l8-8",
  },
  { id: TOOL_IDS.LINE, label: "Line", key: "l", icon: "M5 19L19 5" },
  {
    id: TOOL_IDS.RECT,
    label: "Rectangle",
    key: "r",
    icon: "M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z",
  },
  {
    id: TOOL_IDS.CIRCLE,
    label: "Ellipse",
    key: "o",
    icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
  },
  {
    id: TOOL_IDS.ARROW,
    label: "Arrow",
    key: "a",
    icon: "M5 12h14M12 5l7 7-7 7",
  },
  {
    id: TOOL_IDS.STICKY,
    label: "Sticky",
    key: "n",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  {
    id: TOOL_IDS.TEXT,
    label: "Text",
    key: "t",
    icon: "M4 6h16M4 12h16M4 18h7",
  },
];

export const DRAWING_TOOLS = [
  TOOL_IDS.PEN,
  TOOL_IDS.ERASER,
  TOOL_IDS.LINE,
  TOOL_IDS.RECT,
  TOOL_IDS.CIRCLE,
  TOOL_IDS.ARROW,
  TOOL_IDS.TEXT,
];
