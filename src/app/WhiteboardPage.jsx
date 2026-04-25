import { useState, useEffect, useRef, useCallback } from "react";

/* ── THEME ─────────────────────────────────────────────────────────────── */
const C = {
  bg: "#030310",
  glass: "rgba(4,4,18,0.93)",
  border: "rgba(0,218,255,0.16)",
  borderHi: "rgba(0,218,255,0.45)",
  faint: "rgba(0,218,255,0.06)",
  cyan: "#00DAFF",
  cyanDim: "rgba(0,218,255,0.09)",
  violet: "#A855F7",
  violetDim: "rgba(168,85,247,0.1)",
  coral: "#FF3F6C",
  coralDim: "rgba(255,63,108,0.1)",
  amber: "#FFB800",
  green: "#00FFA3",
  greenDim: "rgba(0,255,163,0.1)",
  text: "#D8F0FF",
  muted: "rgba(140,175,210,0.48)",
  dim: "rgba(210,238,255,0.7)",
  ink: [
    "#00DAFF",
    "#FFFFFF",
    "#FF3F6C",
    "#FFB800",
    "#00FFA3",
    "#A855F7",
    "#FF6B2B",
    "#FF00CC",
    "#AAFF00",
    "#FF9500",
  ],
  peers: ["#FF3F6C", "#FFB800", "#00FFA3", "#A855F7", "#FF6B2B", "#00DAFF"],
  sticky: [
    "rgba(255,184,8,0.13)",
    "rgba(0,255,163,0.09)",
    "rgba(0,218,255,0.09)",
    "rgba(255,63,108,0.09)",
    "rgba(168,85,247,0.09)",
  ],
};

/* ── TOOLS ─────────────────────────────────────────────────────────────── */
const TOOLS = [
  {
    id: "hand",
    label: "Pan",
    key: "h",
    g: "nav",
    d: "M9 11V5a2 2 0 114 0v5m0 0V8a2 2 0 114 0v5m0 0a2 2 0 114 0v3a6 6 0 01-12 0v-4a2 2 0 114 0",
  },
  {
    id: "select",
    label: "Select",
    key: "v",
    g: "nav",
    d: "M5 3l14 9-7 1.5L9.5 20 5 3z",
  },
  {
    id: "pen",
    label: "Pen",
    key: "p",
    g: "draw",
    d: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
  },
  {
    id: "highlight",
    label: "Highlight",
    key: "i",
    g: "draw",
    d: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
  },
  {
    id: "eraser",
    label: "Eraser",
    key: "e",
    g: "draw",
    d: "M20 20H7L3 16 13 6l7 7-2.5 2.5M6.5 17.5l8-8",
  },
  { id: "line", label: "Line", key: "l", g: "shape", d: "M5 19L19 5" },
  {
    id: "arrow",
    label: "Arrow",
    key: "a",
    g: "shape",
    d: "M5 12h14M12 5l7 7-7 7",
  },
  {
    id: "rect",
    label: "Rect",
    key: "r",
    g: "shape",
    d: "M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z",
  },
  {
    id: "circle",
    label: "Ellipse",
    key: "o",
    g: "shape",
    d: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
  },
  {
    id: "diamond",
    label: "Diamond",
    key: "d",
    g: "shape",
    d: "M12 2l10 10-10 10L2 12 12 2z",
  },
  {
    id: "sticky",
    label: "Note",
    key: "n",
    g: "extra",
    d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  {
    id: "laser",
    label: "Laser",
    key: "z",
    g: "extra",
    d: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  },
];

/* ── UTILS ─────────────────────────────────────────────────────────────── */
let _gc = 0;
const uid = () =>
  `n${(_gc++).toString(36)}${Date.now().toString(36).slice(-5)}`;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const isNeon = (col) =>
  [
    "#00DAFF",
    "#FF3F6C",
    "#FFB800",
    "#00FFA3",
    "#A855F7",
    "#AAFF00",
    "#FF6B2B",
    "#FF00CC",
  ].includes(col);
const mono = "'Courier New', 'SF Mono', monospace";
const STORAGE_KEY = "holoboard.state.v1";

function pointNear(pointA, pointB, radius) {
  const dx = pointA.x - pointB.x;
  const dy = pointA.y - pointB.y;
  return dx * dx + dy * dy <= radius * radius;
}

function strokeHitByEraser(stroke, eraserPoints, eraserWidth) {
  if (!stroke?.points?.length || !eraserPoints?.length) {
    return false;
  }

  const radius = Math.max(8, eraserWidth * 9);
  const radiusPad = radius * 0.7;

  // Fast path for freehand-like strokes.
  if (
    stroke.points.some((strokePoint) =>
      eraserPoints.some((eraserPoint) => pointNear(strokePoint, eraserPoint, radius)),
    )
  ) {
    return true;
  }

  // Shapes typically have only start/end points. Also test expanded bounds.
  const xs = stroke.points.map((p) => p.x);
  const ys = stroke.points.map((p) => p.y);
  const minX = Math.min(...xs) - radiusPad;
  const maxX = Math.max(...xs) + radiusPad;
  const minY = Math.min(...ys) - radiusPad;
  const maxY = Math.max(...ys) + radiusPad;

  return eraserPoints.some(
    (eraserPoint) =>
      eraserPoint.x >= minX &&
      eraserPoint.x <= maxX &&
      eraserPoint.y >= minY &&
      eraserPoint.y <= maxY,
  );
}

function getClientPoint(event) {
  if (event.touches?.length) {
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  }

  if (event.changedTouches?.length) {
    return {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY,
    };
  }

  return {
    x: event.clientX,
    y: event.clientY,
  };
}

/* ── ICON ──────────────────────────────────────────────────────────────── */
function Icon({
  d,
  size = 14,
  sw = 1.6,
  stroke = "currentColor",
  fill = "none",
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0 }}
    >
      <path d={d} />
    </svg>
  );
}

/* ── HUD CORNER BRACKETS ────────────────────────────────────────────────── */
function Brackets({ size = 8, color = C.borderHi }) {
  const corners = [
    {
      top: 0,
      left: 0,
      borderTop: `1px solid ${color}`,
      borderLeft: `1px solid ${color}`,
    },
    {
      top: 0,
      right: 0,
      borderTop: `1px solid ${color}`,
      borderRight: `1px solid ${color}`,
    },
    {
      bottom: 0,
      left: 0,
      borderBottom: `1px solid ${color}`,
      borderLeft: `1px solid ${color}`,
    },
    {
      bottom: 0,
      right: 0,
      borderBottom: `1px solid ${color}`,
      borderRight: `1px solid ${color}`,
    },
  ];
  return corners.map((st, i) => (
    <div
      key={i}
      style={{
        position: "absolute",
        width: size,
        height: size,
        ...st,
        pointerEvents: "none",
      }}
    />
  ));
}

/* ── STICKY NOTE ────────────────────────────────────────────────────────── */
function StickyNote({
  note,
  zoom,
  pan,
  editing,
  onActivate,
  onDeactivate,
  onChange,
  onMove,
  onDelete,
}) {
  const drag = useRef(null);
  const sx = note.x * zoom + pan.x,
    sy = note.y * zoom + pan.y;
  const fs = Math.max(10, 12 * zoom);

  const onMouseDown = (e) => {
    if (editing) return;
    e.stopPropagation();
    drag.current = { sx: e.clientX, sy: e.clientY, ox: note.x, oy: note.y };
    const mv = (me) =>
      drag.current &&
      onMove(
        drag.current.ox + (me.clientX - drag.current.sx) / zoom,
        drag.current.oy + (me.clientY - drag.current.sy) / zoom,
      );
    const up = () => {
      drag.current = null;
      window.removeEventListener("mousemove", mv);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", mv);
    window.addEventListener("mouseup", up);
  };

  return (
    <div
      style={{
        position: "absolute",
        left: sx,
        top: sy,
        width: 180 * zoom,
        height: 140 * zoom,
        background: note.color,
        borderRadius: 4 * zoom,
        border: `1px solid rgba(255,255,255,0.12)`,
        boxSizing: "border-box",
        zIndex: 8,
        boxShadow: `0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backdropFilter: "blur(12px)",
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onActivate();
      }}
    >
      <div
        style={{
          height: Math.max(20, 20 * zoom),
          background: "rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `0 ${8 * zoom}px`,
          cursor: editing ? "default" : "move",
          flexShrink: 0,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            width: 5 * zoom,
            height: 5 * zoom,
            borderRadius: "50%",
            background: C.cyan,
            boxShadow: `0 0 5px ${C.cyan}`,
          }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            fontSize: Math.max(8, 10 * zoom),
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.3)",
            padding: `0 ${3 * zoom}px`,
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>
      <div style={{ flex: 1, padding: `${7 * zoom}px`, overflow: "hidden" }}>
        {editing ? (
          <textarea
            autoFocus
            style={{
              width: "100%",
              height: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              fontFamily: mono,
              fontSize: fs,
              color: C.text,
              lineHeight: 1.6,
              padding: 0,
              boxSizing: "border-box",
            }}
            value={note.text}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onDeactivate}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
        ) : (
          <div
            style={{
              fontSize: fs,
              color: C.text,
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflow: "hidden",
              fontFamily: mono,
            }}
          >
            {note.text || (
              <span style={{ opacity: 0.28 }}>double-click to edit_</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── MAIN ──────────────────────────────────────────────────────────────── */
export default function HoloBoard() {
  /* Drawing */
  const [tool, setTool] = useState("pen");
  const [inkColor, setInk] = useState(C.ink[0]);
  const [strokeW, setSW] = useState(3);
  const [opacity, setOp] = useState(1);
  const [fillShape, setFill] = useState(false);
  const [gridMode, setGrid] = useState("dots");
  const [strokes, setStrokes] = useState([]);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [stickies, setStickies] = useState([]);
  const [cur, setCur] = useState(null);
  const [laserPts, setLaser] = useState([]);
  const [peerCurs, setPeerCurs] = useState({});
  const [drawing, setDrawing] = useState(false);
  const [panning, setPanning] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [sel, setSel] = useState(null);
  const [selStart, setSelStart] = useState(null);
  const [editNote, setEditNote] = useState(null);
  const [showHelp, setHelp] = useState(false);
  const [showP2P, setP2P] = useState(false);
  const [toast, setToast] = useState("");

  /* P2P */
  const [Peer, setPeerLib] = useState(null);
  const [peer, setPeer] = useState(null);
  const [myId, setMyId] = useState("");
  const [conns, setConns] = useState([]);
  const [p2pStatus, setP2PS] = useState("loading");
  const [joinId, setJoinId] = useState("");
  const [copied, setCopied] = useState(false);

  /* Refs */
  const cvs = useRef(null);
  const mini = useRef(null);
  const wrap = useRef(null);
  const panRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const panStart = useRef(null);
  const connsRef = useRef([]);
  const strokesRef = useRef([]);
  const stickRef = useRef([]);
  const laserRef = useRef([]);
  const pcRef = useRef({});
  const throttle = useRef(0);
  const myColor = useRef(C.peers[Math.floor(Math.random() * C.peers.length)]);

  strokesRef.current = strokes;
  stickRef.current = stickies;
  connsRef.current = conns;
  laserRef.current = laserPts;
  pcRef.current = peerCurs;
  zoomRef.current = zoom;
  panRef.current = pan;

  /* ── RESIZE ── */
  useEffect(() => {
    const resize = () => {
      if (!cvs.current || !wrap.current) return;
      cvs.current.width = wrap.current.clientWidth;
      cvs.current.height = wrap.current.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed.strokes)) setStrokes(parsed.strokes);
      if (Array.isArray(parsed.stickies)) setStickies(parsed.stickies);
      if (typeof parsed.zoom === "number" && Number.isFinite(parsed.zoom)) {
        const z = clamp(parsed.zoom, 0.1, 10);
        setZoom(z);
        zoomRef.current = z;
      }
      if (
        parsed.pan &&
        typeof parsed.pan.x === "number" &&
        typeof parsed.pan.y === "number"
      ) {
        setPan(parsed.pan);
        panRef.current = parsed.pan;
      }
    } catch {
      // ignore invalid persisted payload
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            strokes,
            stickies,
            zoom,
            pan,
            savedAt: Date.now(),
          }),
        );
      } catch {
        // ignore storage quota errors
      }
    }, 160);

    return () => window.clearTimeout(timeout);
  }, [strokes, stickies, zoom, pan]);

  /* ── PEERJS ── */
  useEffect(() => {
    if (window.Peer) {
      setPeerLib(() => window.Peer);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js";
    s.onload = () => setPeerLib(() => window.Peer);
    s.onerror = () => setP2PS("error");
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (!Peer) return;
    const id = "holo-" + Math.random().toString(36).slice(2, 8);
    const p = new Peer(id, { debug: 0 });
    p.on("open", (pid) => {
      setMyId(pid);
      setP2PS("idle");
    });
    p.on("connection", (conn) => regConn(conn));
    p.on("error", () => setP2PS("error"));
    setPeer(p);
    return () => p.destroy();
  }, [Peer]);

  const regConn = useCallback((conn) => {
    conn.on("open", () => {
      setConns((prev) => {
        const n = [...prev.filter((c) => c.peer !== conn.peer), conn];
        connsRef.current = n;
        return n;
      });
      setP2PS("online");
      conn.send({
        t: "sync",
        strokes: strokesRef.current,
        stickies: stickRef.current,
      });
    });
    conn.on("data", (d) => recv(d, conn.peer));
    conn.on("close", () => {
      setConns((prev) => {
        const n = prev.filter((c) => c.peer !== conn.peer);
        connsRef.current = n;
        if (!n.length) setP2PS("idle");
        return n;
      });
      setPeerCurs((p) => {
        const n = { ...p };
        delete n[conn.peer];
        return n;
      });
    });
    conn.on("error", () => {});
  }, []);

  const recv = useCallback((d, pid) => {
    if (d.t === "sync") {
      setStrokes(d.strokes || []);
      setStickies(d.stickies || []);
    } else if (d.t === "s") {
      setStrokes((p) => [...p, d.v]);
    } else if (d.t === "e") {
      setStrokes((p) => p.filter((s) => !d.ids.includes(s.id)));
    } else if (d.t === "na") {
      setStickies((p) => [...p, d.v]);
    } else if (d.t === "nu") {
      setStickies((p) => p.map((s) => (s.id === d.v.id ? d.v : s)));
    } else if (d.t === "nd") {
      setStickies((p) => p.filter((s) => s.id !== d.id));
    } else if (d.t === "cl") {
      setStrokes([]);
      setStickies([]);
    } else if (d.t === "c") {
      setPeerCurs((p) => ({
        ...p,
        [pid]: { x: d.x, y: d.y, color: d.col, name: pid.slice(5, 10) },
      }));
    }
  }, []);

  const bcast = useCallback((msg) => {
    connsRef.current.forEach((c) => {
      try {
        if (c.open) c.send(msg);
      } catch {}
    });
  }, []);

  const joinRoom = () => {
    if (!peer || !joinId.trim()) return;
    setP2PS("connecting");
    regConn(peer.connect(joinId.trim(), { reliable: true }));
    setJoinId("");
  };

  /* ── DRAW ALL ── */
  const drawAll = useCallback(() => {
    const c = cvs.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const W = c.width,
      H = c.height;
    const p = panRef.current,
      z = zoomRef.current,
      now = Date.now();

    // Background gradient
    const bg = ctx.createRadialGradient(
      W * 0.5,
      H * 0.4,
      0,
      W * 0.5,
      H * 0.5,
      Math.max(W, H) * 0.8,
    );
    bg.addColorStop(0, "#050518");
    bg.addColorStop(1, "#020208");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(z, z);
    const gs = 32,
      ox = (-p.x / z) % gs,
      oy = (-p.y / z) % gs;

    // Grid
    if (gridMode === "dots") {
      ctx.fillStyle = "rgba(0,218,255,0.1)";
      for (let x = ox - gs; x < W / z + gs; x += gs)
        for (let y = oy - gs; y < H / z + gs; y += gs) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
    } else if (gridMode === "lines") {
      ctx.strokeStyle = "rgba(0,218,255,0.05)";
      ctx.lineWidth = 0.5 / z;
      for (let x = ox - gs; x < W / z + gs; x += gs) {
        ctx.beginPath();
        ctx.moveTo(x, -p.y / z);
        ctx.lineTo(x, (H - p.y) / z);
        ctx.stroke();
      }
      for (let y = oy - gs; y < H / z + gs; y += gs) {
        ctx.beginPath();
        ctx.moveTo(-p.x / z, y);
        ctx.lineTo((W - p.x) / z, y);
        ctx.stroke();
      }
    }

    // Strokes
    strokesRef.current.forEach((s) => drawStroke(ctx, s));
    if (cur) drawStroke(ctx, cur);

    // Laser decay
    laserRef.current.forEach((pt) => {
      const age = (now - pt.t) / 1300;
      if (age >= 1) return;
      const a = (1 - age) * 0.85;
      ctx.save();
      ctx.shadowColor = C.coral;
      ctx.shadowBlur = 18 / z;
      ctx.fillStyle = `rgba(255,63,108,${a})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, (4 * (1 - age * 0.4)) / z, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Peer cursors
    Object.values(pcRef.current).forEach((pc) => {
      ctx.save();
      ctx.shadowColor = pc.color;
      ctx.shadowBlur = 12 / z;
      ctx.fillStyle = pc.color + "44";
      ctx.strokeStyle = pc.color;
      ctx.lineWidth = 1.5 / z;
      ctx.beginPath();
      ctx.moveTo(pc.x, pc.y);
      ctx.lineTo(pc.x + 8 / z, pc.y + 12 / z);
      ctx.lineTo(pc.x + 4 / z, pc.y + 8 / z);
      ctx.lineTo(pc.x + 10 / z, pc.y + 13 / z);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = pc.color;
      ctx.font = `${11 / z}px ${mono}`;
      ctx.fillText(pc.name, pc.x + 12 / z, pc.y + 8 / z);
      ctx.restore();
    });

    // Selection
    if (sel) {
      ctx.save();
      ctx.strokeStyle = C.cyan;
      ctx.lineWidth = 1 / z;
      ctx.setLineDash([6 / z, 3 / z]);
      ctx.shadowColor = C.cyan;
      ctx.shadowBlur = 6 / z;
      ctx.strokeRect(sel.x, sel.y, sel.w, sel.h);
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(0,218,255,0.04)";
      ctx.fillRect(sel.x, sel.y, sel.w, sel.h);
      ctx.restore();
    }
    ctx.restore();
  }, [gridMode, cur, sel]);

  function drawStroke(ctx, s) {
    if (!s?.points?.length) return;
    const pts = s.points;
    ctx.save();
    if (isNeon(s.color) && s.tool !== "eraser" && s.tool !== "highlight") {
      ctx.shadowColor = s.color;
      ctx.shadowBlur = s.width * 3;
    }
    ctx.globalAlpha = s.opacity ?? 1;

    if (s.tool === "pen") {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      if (pts.length === 1) {
        ctx.arc(pts[0].x, pts[0].y, s.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();
      } else {
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++)
          ctx.quadraticCurveTo(
            pts[i].x,
            pts[i].y,
            (pts[i].x + pts[i + 1].x) / 2,
            (pts[i].y + pts[i + 1].y) / 2,
          );
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();
      }
    } else if (s.tool === "highlight") {
      ctx.globalAlpha = s.opacity ?? 0.32;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width * 9;
      ctx.lineCap = "butt";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    } else if (s.tool === "eraser") {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#020208";
      ctx.lineWidth = s.width * 9;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    } else {
      const [a, b] = [pts[0], pts[pts.length - 1]];
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.lineCap = "round";
      if (s.tool === "rect") {
        if (s.fill) {
          ctx.fillStyle = s.color + "1A";
          ctx.fillRect(a.x, a.y, b.x - a.x, b.y - a.y);
        }
        ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
      } else if (s.tool === "circle") {
        const cx = (a.x + b.x) / 2,
          cy = (a.y + b.y) / 2,
          rx = Math.abs(b.x - a.x) / 2,
          ry = Math.abs(b.y - a.y) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        if (s.fill) {
          ctx.fillStyle = s.color + "1A";
          ctx.fill();
        }
        ctx.stroke();
      } else if (s.tool === "diamond") {
        const cx = (a.x + b.x) / 2,
          cy = (a.y + b.y) / 2,
          hw = Math.abs(b.x - a.x) / 2,
          hh = Math.abs(b.y - a.y) / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - hh);
        ctx.lineTo(cx + hw, cy);
        ctx.lineTo(cx, cy + hh);
        ctx.lineTo(cx - hw, cy);
        ctx.closePath();
        if (s.fill) {
          ctx.fillStyle = s.color + "1A";
          ctx.fill();
        }
        ctx.stroke();
      } else if (s.tool === "line") {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      } else if (s.tool === "arrow") {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        const ang = Math.atan2(b.y - a.y, b.x - a.x),
          hs = Math.max(12, s.width * 4);
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(
          b.x - hs * Math.cos(ang - 0.42),
          b.y - hs * Math.sin(ang - 0.42),
        );
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(
          b.x - hs * Math.cos(ang + 0.42),
          b.y - hs * Math.sin(ang + 0.42),
        );
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /* ── RAF ── */
  useEffect(() => {
    let raf;
    const loop = () => {
      drawAll();
      const now = Date.now();
      setLaser((p) => p.filter((pt) => now - pt.t < 1500));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [drawAll]);

  /* ── MINIMAP ── */
  useEffect(() => {
    const mc = mini.current;
    if (!mc) return;
    const ctx = mc.getContext("2d");
    ctx.clearRect(0, 0, mc.width, mc.height);
    ctx.fillStyle = "#020208";
    ctx.fillRect(0, 0, mc.width, mc.height);
    ctx.save();
    ctx.translate(mc.width / 2, mc.height / 2);
    ctx.scale(0.062, 0.062);
    strokes.forEach((s) => {
      if (!s.points?.length) return;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = Math.max(2, s.width);
      ctx.lineCap = "round";
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      s.points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });
    const c = cvs.current;
    if (c) {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = C.cyan;
      ctx.lineWidth = 4 / 0.062;
      ctx.shadowColor = C.cyan;
      ctx.shadowBlur = 8 / 0.062;
      ctx.strokeRect(
        -pan.x / zoom,
        -pan.y / zoom,
        c.width / zoom,
        c.height / zoom,
      );
    }
    ctx.restore();
  }, [strokes, pan, zoom]);

  /* ── COORDS ── */
  const toCanvas = useCallback((e) => {
    const r = cvs.current.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (cx - r.left - panRef.current.x) / zoomRef.current,
      y: (cy - r.top - panRef.current.y) / zoomRef.current,
    };
  }, []);

  /* ── POINTER DOWN ── */
  const onDown = useCallback(
    (e) => {
      const point = getClientPoint(e);

      if (e.button === 1 || tool === "hand") {
        setPanning(true);
        panStart.current = {
          mx: point.x - panRef.current.x,
          my: point.y - panRef.current.y,
        };
        return;
      }
      const pos = toCanvas(e);
      if (tool === "sticky") {
        const s = {
          id: uid(),
          x: pos.x,
          y: pos.y,
          text: "",
          color: C.sticky[Math.floor(Math.random() * C.sticky.length)],
        };
        setStickies((p) => [...p, s]);
        setEditNote(s.id);
        bcast({ t: "na", v: s });
        return;
      }
      if (tool === "select") {
        setSelStart(pos);
        setSel(null);
        return;
      }
      if (tool === "laser") {
        setDrawing(true);
        return;
      }
      setDrawing(true);
      setCur({
        id: uid(),
        tool,
        color: inkColor,
        width: strokeW,
        opacity,
        fill: fillShape,
        points: [pos],
      });
    },
    [tool, inkColor, strokeW, opacity, fillShape, toCanvas, bcast],
  );

  /* ── POINTER MOVE ── */
  const onMove = useCallback(
    (e) => {
      const point = getClientPoint(e);

      if (panning && panStart.current) {
        const np = {
          x: point.x - panStart.current.mx,
          y: point.y - panStart.current.my,
        };
        setPan(np);
        panRef.current = np;
        return;
      }
      // Cursor broadcast
      if (connsRef.current.length && Date.now() - throttle.current > 48) {
        throttle.current = Date.now();
        const pos = toCanvas(e);
        bcast({ t: "c", x: pos.x, y: pos.y, col: myColor.current });
      }
      if (tool === "select" && selStart) {
        const pos = toCanvas(e);
        setSel({
          x: Math.min(selStart.x, pos.x),
          y: Math.min(selStart.y, pos.y),
          w: Math.abs(pos.x - selStart.x),
          h: Math.abs(pos.y - selStart.y),
        });
        return;
      }
      if (!drawing) return;
      const pos = toCanvas(e);
      if (tool === "laser") {
        setLaser((p) => [...p, { x: pos.x, y: pos.y, t: Date.now() }]);
        return;
      }
      if (!cur) return;
      if (["pen", "highlight", "eraser"].includes(cur.tool))
        setCur((p) => ({ ...p, points: [...p.points, pos] }));
      else setCur((p) => ({ ...p, points: [p.points[0], pos] }));
    },
    [panning, drawing, cur, selStart, tool, toCanvas, bcast],
  );

  /* ── POINTER UP ── */
  const onUp = useCallback(() => {
    if (panning) {
      setPanning(false);
      panStart.current = null;
      return;
    }
    if (tool === "select") {
      setSelStart(null);
      return;
    }
    if (tool === "laser") {
      setDrawing(false);
      return;
    }

    if (tool === "eraser" && drawing && cur?.points?.length) {
      const currentStrokes = strokesRef.current;
      const idsToRemove = currentStrokes
        .filter((stroke) => strokeHitByEraser(stroke, cur.points, cur.width))
        .map((stroke) => stroke.id);

      if (idsToRemove.length) {
        setHistory((prev) => [...prev.slice(-29), currentStrokes]);
        setFuture([]);
        setStrokes((prev) => prev.filter((stroke) => !idsToRemove.includes(stroke.id)));
        bcast({ t: "e", ids: idsToRemove });
      }

      setCur(null);
      setDrawing(false);
      return;
    }

    if (drawing && cur?.points?.length) {
      const final = { ...cur };
      setHistory((p) => [...p.slice(-29), strokesRef.current]);
      setFuture([]);
      setStrokes((p) => [...p, final]);
      bcast({ t: "s", v: final });
      setCur(null);
      setDrawing(false);
    }
  }, [panning, drawing, cur, tool, bcast]);

  /* ── WHEEL ── */
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.09 : 0.91;
    const r = cvs.current.getBoundingClientRect();
    const mx = e.clientX - r.left,
      my = e.clientY - r.top;
    setZoom((z) => {
      const nz = clamp(z * factor, 0.1, 10);
      const ratio = nz / z;
      const np = {
        x: mx - (mx - panRef.current.x) * ratio,
        y: my - (my - panRef.current.y) * ratio,
      };
      setPan(np);
      panRef.current = np;
      zoomRef.current = nz;
      return nz;
    });
  }, []);

  /* ── KEYBOARD ── */
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT")
        return;
      const t = TOOLS.find((t) => t.key === e.key.toLowerCase());
      if (t) {
        setTool(t.id);
        return;
      }
      if (e.key === "?") {
        setHelp((v) => !v);
        return;
      }
      if (e.key === "Escape") {
        setSel(null);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        setHistory((prev) => {
          if (!prev.length) return prev;
          const last = prev[prev.length - 1];
          setFuture((f) => [strokesRef.current, ...f.slice(0, 19)]);
          setStrokes(last);
          return prev.slice(0, -1);
        });
        return;
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.shiftKey && e.key === "z"))
      ) {
        setFuture((prev) => {
          if (!prev.length) return prev;
          const next = prev[0];
          setHistory((h) => [...h.slice(-29), strokesRef.current]);
          setStrokes(next);
          return prev.slice(1);
        });
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && sel) {
        const s = sel;
        setStrokes((prev) => {
          const rem = prev.filter((sk) =>
            sk.points?.some(
              (p) =>
                p.x >= s.x &&
                p.x <= s.x + s.w &&
                p.y >= s.y &&
                p.y <= s.y + s.h,
            ),
          );
          if (rem.length) {
            setHistory((h) => [...h.slice(-29), prev]);
            setFuture([]);
            bcast({ t: "e", ids: rem.map((r) => r.id) });
          }
          return prev.filter((sk) => !rem.includes(sk));
        });
        setSel(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [sel, bcast]);

  /* ── ACTIONS ── */
  const undo = () =>
    setHistory((prev) => {
      if (!prev.length) return prev;
      const last = prev[prev.length - 1];
      setFuture((f) => [strokesRef.current, ...f.slice(0, 19)]);
      setStrokes(last);
      return prev.slice(0, -1);
    });
  const redo = () =>
    setFuture((prev) => {
      if (!prev.length) return prev;
      const next = prev[0];
      setHistory((h) => [...h.slice(-29), strokesRef.current]);
      setStrokes(next);
      return prev.slice(1);
    });
  const clearAll = () => {
    setHistory((h) => [...h.slice(-29), strokes]);
    setFuture([]);
    setStrokes([]);
    setStickies([]);
    setSel(null);
    bcast({ t: "cl" });
  };
  const exportPNG = () => {
    const a = document.createElement("a");
    a.href = cvs.current.toDataURL("image/png");
    a.download = `holoboard-${Date.now()}.png`;
    a.click();
    notify("Board exported as PNG");
  };
  const zoomFit = () => {
    const pts = strokes.flatMap((s) => s.points || []);
    if (!pts.length) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      panRef.current = { x: 0, y: 0 };
      zoomRef.current = 1;
      return;
    }
    const minX = Math.min(...pts.map((p) => p.x)),
      maxX = Math.max(...pts.map((p) => p.x));
    const minY = Math.min(...pts.map((p) => p.y)),
      maxY = Math.max(...pts.map((p) => p.y));
    const c = cvs.current;
    if (!c) return;
    const nz = clamp(
      Math.min(
        (c.width - 120) / (maxX - minX || 1),
        (c.height - 120) / (maxY - minY || 1),
      ),
      0.1,
      4,
    );
    const np = {
      x: c.width / 2 - ((minX + maxX) / 2) * nz,
      y: c.height / 2 - ((minY + maxY) / 2) * nz,
    };
    setZoom(nz);
    zoomRef.current = nz;
    setPan(np);
    panRef.current = np;
    notify("Zoomed to fit content");
  };
  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };
  const copyId = () => {
    navigator.clipboard.writeText(myId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
      notify("Room ID copied to clipboard");
    });
  };

  const cursor = panning
    ? "grabbing"
    : tool === "hand"
      ? "grab"
      : tool === "eraser"
        ? "cell"
        : tool === "laser"
          ? "none"
          : tool === "sticky"
            ? "copy"
            : "crosshair";
  const connCount = conns.length;
  const isShape = ["rect", "circle", "diamond"].includes(tool);

  /* ── GLASS STYLE ── */
  const glass = {
    background: "rgba(3,3,16,0.93)",
    backdropFilter: "blur(20px)",
    border: `1px solid ${C.border}`,
    boxShadow:
      "0 0 0 1px rgba(0,218,255,0.03), 0 8px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(0,218,255,0.05)",
  };
  const btnBase = {
    fontSize: 11,
    padding: "4px 11px",
    borderRadius: 7,
    border: `1px solid ${C.border}`,
    background: "transparent",
    color: C.dim,
    cursor: "pointer",
    fontFamily: mono,
  };
  const btnCyan = {
    ...btnBase,
    border: `1px solid ${C.borderHi}`,
    background: C.cyanDim,
    color: C.cyan,
    fontWeight: 700,
    boxShadow: "0 0 10px rgba(0,218,255,0.18)",
  };
  const sep16 = { width: 1, height: 16, background: C.border, flexShrink: 0 };

  return (
    <div
      ref={wrap}
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: C.bg,
        fontFamily: mono,
        userSelect: "none",
      }}
    >
      {/* CSS Animations */}
      <style>{`
        @keyframes pulse { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
        @keyframes fadein { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes glow-pulse { 0%,100%{box-shadow:0 0 8px rgba(0,218,255,.3)} 50%{box-shadow:0 0 18px rgba(0,218,255,.7)} }
      `}</style>

      {/* Scanline overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,218,255,0.014) 2px,rgba(0,218,255,0.014) 4px)",
        }}
      />

      {/* Canvas */}
      <canvas
        ref={cvs}
        style={{
          position: "absolute",
          inset: 0,
          display: "block",
          cursor,
          touchAction: "none",
          zIndex: 2,
        }}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchStart={onDown}
        onTouchMove={onMove}
        onTouchEnd={onUp}
        onWheel={onWheel}
      />

      {/* Sticky notes */}
      {stickies.map((st) => (
        <StickyNote
          key={st.id}
          note={st}
          zoom={zoom}
          pan={pan}
          editing={editNote === st.id}
          onActivate={() => setEditNote(st.id)}
          onDeactivate={() => setEditNote(null)}
          onChange={(text) => {
            const u = { ...st, text };
            setStickies((p) => p.map((n) => (n.id === st.id ? u : n)));
            bcast({ t: "nu", v: u });
          }}
          onMove={(x, y) => {
            const u = { ...st, x, y };
            setStickies((p) => p.map((n) => (n.id === st.id ? u : n)));
            bcast({ t: "nu", v: u });
          }}
          onDelete={() => {
            setStickies((p) => p.filter((n) => n.id !== st.id));
            bcast({ t: "nd", id: st.id });
          }}
        />
      ))}

      {/* ── TOOLBAR ── */}
      <div
        style={{
          position: "absolute",
          left: 14,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          borderRadius: 16,
          padding: "10px 7px",
          ...glass,
        }}
      >
        <Brackets size={7} />
        {TOOLS.map((t, i) => {
          const sep = i > 0 && t.g !== TOOLS[i - 1].g;
          const active = tool === t.id;
          return (
            <span key={t.id}>
              {sep && (
                <div
                  style={{ height: 1, background: C.border, margin: "4px 3px" }}
                />
              )}
              <button
                title={`${t.label} [${t.key.toUpperCase()}]`}
                onClick={() => setTool(t.id)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  border: `1px solid ${active ? C.borderHi : "transparent"}`,
                  background: active ? C.cyanDim : "transparent",
                  color: active ? C.cyan : C.muted,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all .12s",
                  boxShadow: active
                    ? `0 0 12px rgba(0,218,255,.28),inset 0 0 8px rgba(0,218,255,.08)`
                    : "none",
                  position: "relative",
                }}
              >
                <Icon d={t.d} size={14} />
                {active && (
                  <div
                    style={{
                      position: "absolute",
                      left: -7,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 3,
                      height: 18,
                      background: C.cyan,
                      borderRadius: 2,
                      boxShadow: `0 0 8px ${C.cyan}`,
                    }}
                  />
                )}
              </button>
            </span>
          );
        })}
      </div>

      {/* ── TOP BAR ── */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: 10,
          ...glass,
          borderRadius: 12,
          padding: "7px 16px",
          whiteSpace: "nowrap",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: C.cyanDim,
              border: `1px solid ${C.borderHi}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 10px rgba(0,218,255,.2)",
              animation: "glow-pulse 3s infinite",
            }}
          >
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: 3,
                background: C.cyan,
                boxShadow: `0 0 8px ${C.cyan}`,
              }}
            />
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: C.text,
              letterSpacing: "0.06em",
            }}
          >
            HOLO<span style={{ color: C.cyan }}>BOARD</span>
          </span>
        </div>
        <div style={sep16} />
        {/* Status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: connCount > 0 ? C.green : C.muted,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: connCount > 0 ? C.green : C.muted,
              boxShadow: connCount > 0 ? `0 0 10px ${C.green}` : "none",
              animation: connCount > 0 ? "pulse 2s infinite" : "none",
            }}
          />
          {connCount > 0
            ? `${connCount} peer${connCount > 1 ? "s" : ""} live`
            : "solo mode"}
        </div>
        <div style={sep16} />
        {/* Action buttons */}
        <button
          onClick={undo}
          disabled={!history.length}
          style={{ ...btnBase, opacity: history.length ? 1 : 0.35 }}
        >
          Undo
        </button>
        <button
          onClick={redo}
          disabled={!future.length}
          style={{ ...btnBase, opacity: future.length ? 1 : 0.35 }}
        >
          Redo
        </button>
        <button onClick={zoomFit} style={btnBase}>
          Fit
        </button>
        <button onClick={exportPNG} style={btnBase}>
          Export PNG
        </button>
        <button
          onClick={clearAll}
          style={{
            ...btnBase,
            border: `1px solid rgba(255,63,108,.3)`,
            background: C.coralDim,
            color: C.coral,
          }}
        >
          Clear
        </button>
        <div style={sep16} />
        <button
          onClick={() => setP2P((v) => !v)}
          style={showP2P ? btnCyan : btnBase}
        >
          ⇌ Share
        </button>
        <button
          onClick={() => setHelp((v) => !v)}
          style={{ ...btnBase, padding: "4px 9px", color: C.muted }}
        >
          ?
        </button>
      </div>

      {/* ── BOTTOM OPTIONS BAR ── */}
      <div
        style={{
          position: "absolute",
          bottom: 18,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: 10,
          ...glass,
          borderRadius: 40,
          padding: "8px 18px",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: 10, color: C.muted, letterSpacing: "0.08em" }}>
          INK
        </span>
        {C.ink.map((c) => (
          <div
            key={c}
            onClick={() => setInk(c)}
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: c,
              cursor: "pointer",
              outline:
                inkColor === c ? `2px solid ${c}` : "2px solid transparent",
              outlineOffset: 2,
              boxShadow: inkColor === c ? `0 0 10px ${c}99` : "none",
              transition: "transform .1s,box-shadow .1s",
              transform: inkColor === c ? "scale(1.25)" : "scale(1)",
              flexShrink: 0,
            }}
          />
        ))}
        <div style={sep16} />
        <span style={{ fontSize: 10, color: C.muted, letterSpacing: "0.08em" }}>
          W
        </span>
        {[1, 2, 4, 8].map((w) => (
          <button
            key={w}
            onClick={() => setSW(w)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              border: `1px solid ${strokeW === w ? C.borderHi : C.border}`,
              background: strokeW === w ? C.cyanDim : "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all .12s",
            }}
          >
            <div
              style={{
                width: clamp(w * 2.5 + 1, 3, 18),
                height: clamp(w * 2.5 + 1, 3, 18),
                borderRadius: "50%",
                background: strokeW === w ? C.cyan : C.muted,
                boxShadow: strokeW === w ? `0 0 6px ${C.cyan}` : "none",
              }}
            />
          </button>
        ))}
        <div style={sep16} />
        <span style={{ fontSize: 10, color: C.muted, letterSpacing: "0.08em" }}>
          α
        </span>
        {[0.25, 0.5, 0.75, 1].map((o) => (
          <button
            key={o}
            onClick={() => setOp(o)}
            style={{
              fontSize: 10,
              padding: "3px 8px",
              borderRadius: 20,
              border: `1px solid ${opacity === o ? C.borderHi : C.border}`,
              background: opacity === o ? C.cyanDim : "transparent",
              color: opacity === o ? C.cyan : C.muted,
              cursor: "pointer",
              fontFamily: mono,
            }}
          >
            {Math.round(o * 100)}
          </button>
        ))}
        {isShape && (
          <>
            <div style={sep16} />
            <button
              onClick={() => setFill((v) => !v)}
              style={{
                fontSize: 10,
                padding: "3px 11px",
                borderRadius: 20,
                border: `1px solid ${fillShape ? C.borderHi : C.border}`,
                background: fillShape ? C.cyanDim : "transparent",
                color: fillShape ? C.cyan : C.muted,
                cursor: "pointer",
                fontFamily: mono,
              }}
            >
              FILL
            </button>
          </>
        )}
        <div style={sep16} />
        <span style={{ fontSize: 10, color: C.muted, letterSpacing: "0.08em" }}>
          GRID
        </span>
        {["dots", "lines", "off"].map((g) => (
          <button
            key={g}
            onClick={() => setGrid(g)}
            style={{
              fontSize: 10,
              padding: "3px 8px",
              borderRadius: 20,
              border: `1px solid ${gridMode === g ? C.borderHi : C.border}`,
              background: gridMode === g ? C.cyanDim : "transparent",
              color: gridMode === g ? C.cyan : C.muted,
              cursor: "pointer",
              fontFamily: mono,
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* ── ZOOM ── */}
      <div
        style={{
          position: "absolute",
          right: 14,
          bottom: 18,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: 5,
          ...glass,
          borderRadius: 10,
          padding: "5px 8px",
        }}
      >
        {["+", "−"].map((lbl, i) => (
          <button
            key={lbl}
            onClick={() =>
              setZoom((z) => clamp(z * (i === 0 ? 1.15 : 0.87), 0.1, 10))
            }
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              border: `1px solid ${C.border}`,
              background: "transparent",
              color: C.text,
              fontSize: 15,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: mono,
            }}
          >
            {lbl}
          </button>
        ))}
        <span
          style={{
            fontSize: 11,
            color: C.muted,
            minWidth: 40,
            textAlign: "center",
            fontFamily: "monospace",
          }}
        >
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
            panRef.current = { x: 0, y: 0 };
            zoomRef.current = 1;
          }}
          style={{
            fontSize: 10,
            padding: "3px 8px",
            borderRadius: 6,
            border: `1px solid ${C.border}`,
            background: "transparent",
            color: C.muted,
            cursor: "pointer",
            fontFamily: mono,
          }}
        >
          reset
        </button>
      </div>

      {/* ── MINIMAP ── */}
      <div
        style={{
          position: "absolute",
          right: 14,
          bottom: 64,
          zIndex: 20,
          ...glass,
          borderRadius: 8,
          padding: 3,
          overflow: "hidden",
        }}
      >
        <canvas
          ref={mini}
          width={150}
          height={90}
          style={{ display: "block", borderRadius: 5, opacity: 0.9 }}
        />
        <div
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            fontSize: 9,
            color: C.muted,
            letterSpacing: "0.1em",
          }}
        >
          MINIMAP
        </div>
      </div>

      {/* ── STATUS BAR ── */}
      <div
        style={{
          position: "absolute",
          left: 64,
          bottom: 18,
          zIndex: 10,
          fontSize: 10,
          color: C.muted,
          ...glass,
          padding: "4px 12px",
          borderRadius: 8,
        }}
      >
        {strokes.length} strokes · {stickies.length} notes · {history.length}{" "}
        undo levels · scroll=zoom · mid=pan · del=erase sel · ⌘Z / ⌘Y
      </div>

      {/* ── P2P PANEL ── */}
      {showP2P && (
        <div
          style={{
            position: "absolute",
            right: 14,
            top: 58,
            width: 288,
            zIndex: 30,
            ...glass,
            borderRadius: 14,
            padding: "18px",
            animation: "fadein .15s ease",
          }}
        >
          <div style={{ position: "relative" }}>
            <Brackets size={7} />
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: C.cyan,
              letterSpacing: "0.12em",
              marginBottom: 14,
            }}
          >
            P2P COLLABORATION
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 5 }}>
            YOUR ROOM ID
          </div>
          <div
            style={{
              background: C.faint,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: "8px 10px",
              fontFamily: "monospace",
              fontSize: 11,
              color: C.cyan,
              wordBreak: "break-all",
              marginBottom: 8,
              lineHeight: 1.6,
            }}
          >
            {myId || (
              <span
                style={{
                  animation: "blink 1s infinite",
                  display: "inline-block",
                }}
              >
                initializing_
              </span>
            )}
          </div>
          <button
            onClick={copyId}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: 8,
              border: `1px solid ${copied ? C.green : C.borderHi}`,
              background: copied ? `rgba(0,255,163,0.1)` : C.cyanDim,
              color: copied ? C.green : C.cyan,
              cursor: "pointer",
              fontFamily: mono,
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 16,
              boxShadow: copied
                ? `0 0 14px ${C.green}44`
                : `0 0 10px rgba(0,218,255,.15)`,
            }}
          >
            {copied ? "✓ COPIED" : "COPY ROOM ID"}
          </button>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 5 }}>
            JOIN A ROOM
          </div>
          <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
            <input
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && joinRoom()}
              placeholder="Paste peer Room ID…"
              style={{
                flex: 1,
                background: C.faint,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: "7px 10px",
                color: C.text,
                fontSize: 11,
                outline: "none",
                fontFamily: "monospace",
              }}
            />
            <button
              onClick={joinRoom}
              style={{
                padding: "7px 12px",
                borderRadius: 8,
                border: "none",
                background: C.cyan,
                color: "#030310",
                cursor: "pointer",
                fontFamily: mono,
                fontSize: 11,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              JOIN
            </button>
          </div>
          {p2pStatus === "online" && (
            <div
              style={{
                fontSize: 11,
                background: C.greenDim,
                border: `1px solid rgba(0,255,163,.25)`,
                borderRadius: 8,
                padding: "9px 12px",
                color: C.green,
                lineHeight: 1.6,
              }}
            >
              ● {connCount} peer{connCount > 1 ? "s" : ""} connected
              <br />
              <span style={{ opacity: 0.7 }}>
                Canvas syncing via WebRTC DataChannel. Zero backend. Peer
                cursors broadcast live.
              </span>
            </div>
          )}
          {p2pStatus === "connecting" && (
            <div style={{ fontSize: 11, color: C.cyan, padding: "8px 0" }}>
              ◌ Connecting to peer…
            </div>
          )}
          {p2pStatus === "idle" && myId && (
            <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.75 }}>
              Share your Room ID. Other person pastes it and clicks JOIN.
              <br />
              <span style={{ color: C.cyan }}>Pure WebRTC</span> — no server
              ever sees your data.
            </div>
          )}
          {p2pStatus === "error" && (
            <div
              style={{
                fontSize: 11,
                background: C.coralDim,
                border: `1px solid rgba(255,63,108,.25)`,
                borderRadius: 8,
                padding: "9px 12px",
                color: C.coral,
              }}
            >
              ⚠ WebRTC unavailable here. Run locally for full P2P.
            </div>
          )}
          {connCount > 0 && (
            <div
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: `1px solid ${C.border}`,
              }}
            >
              {conns.map((c, i) => (
                <div
                  key={c.peer}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: C.peers[i % C.peers.length],
                      boxShadow: `0 0 7px ${C.peers[i % C.peers.length]}`,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 10,
                      color: C.muted,
                    }}
                  >
                    {c.peer}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── HELP MODAL ── */}
      {showHelp && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(3,3,16,.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setHelp(false)}
        >
          <div
            style={{
              ...glass,
              borderRadius: 16,
              padding: "28px 32px",
              maxWidth: 440,
              width: "90%",
              animation: "fadein .15s ease",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Brackets size={9} />
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.cyan,
                letterSpacing: "0.1em",
                marginBottom: 20,
              }}
            >
              KEYBOARD SHORTCUTS
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px 28px",
              }}
            >
              {[
                ...TOOLS.map((t) => ({ k: t.key.toUpperCase(), l: t.label })),
                { k: "Ctrl+Z", l: "Undo" },
                { k: "Ctrl+Y", l: "Redo" },
                { k: "Del", l: "Erase selection" },
                { k: "Scroll", l: "Zoom in/out" },
                { k: "Mid-drag", l: "Pan canvas" },
                { k: "Esc", l: "Clear selection" },
                { k: "?", l: "Toggle help" },
              ].map(({ k, l }) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    marginBottom: 2,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      background: C.faint,
                      border: `1px solid ${C.border}`,
                      borderRadius: 4,
                      padding: "2px 8px",
                      color: C.cyan,
                      minWidth: 28,
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {k}
                  </span>
                  <span style={{ fontSize: 11, color: C.dim }}>{l}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <button
                onClick={() => setHelp(false)}
                style={{ ...btnCyan, padding: "6px 22px" }}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div
          style={{
            position: "absolute",
            top: 68,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 60,
            ...glass,
            borderRadius: 8,
            padding: "8px 18px",
            fontSize: 11,
            color: C.cyan,
            border: `1px solid ${C.borderHi}`,
            animation: "fadein .2s ease",
            whiteSpace: "nowrap",
            boxShadow: `0 0 18px rgba(0,218,255,.35)`,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
