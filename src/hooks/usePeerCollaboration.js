import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  createPeerInstance,
  createRoomId,
  loadPeerLibrary,
} from "../services/peerService";
import { useWhiteboardStore } from "../context/useWhiteboardStore";

export function usePeerCollaboration({
  strokes,
  stickies,
  onRemoteSnapshot,
  onRemoteStroke,
  onRemoteStrokesRemoved,
  onRemoteStickyAdded,
  onRemoteStickyUpdated,
  onRemoteStickyRemoved,
  onRemoteClear,
}) {
  const peers = useWhiteboardStore((state) => state.peers);
  const setPeerStatus = useWhiteboardStore((state) => state.setPeerStatus);
  const setPeerId = useWhiteboardStore((state) => state.setPeerId);
  const setJoinId = useWhiteboardStore((state) => state.setJoinId);
  const setCopied = useWhiteboardStore((state) => state.setCopied);
  const setConnections = useWhiteboardStore((state) => state.setConnections);

  const peerRef = useRef(null);
  const connectionRef = useRef([]);
  const latestBoardRef = useRef({ strokes, stickies });

  latestBoardRef.current = { strokes, stickies };
  connectionRef.current = peers.connections;

  const registerConnection = useCallback(
    (conn) => {
      conn.on("open", () => {
        setConnections((prev) => {
          const next = [
            ...prev.filter((item) => item.peer !== conn.peer),
            conn,
          ];
          return next;
        });
        setPeerStatus("online");
        conn.send({
          type: "sync",
          strokes: latestBoardRef.current.strokes,
          stickies: latestBoardRef.current.stickies,
        });
      });

      conn.on("data", (payload) => {
        if (payload.type === "sync")
          onRemoteSnapshot(payload.strokes || [], payload.stickies || []);
        if (payload.type === "stroke") onRemoteStroke(payload.stroke);
        if (payload.type === "erase") onRemoteStrokesRemoved(payload.ids || []);
        if (payload.type === "sticky_add") onRemoteStickyAdded(payload.sticky);
        if (payload.type === "sticky_upd")
          onRemoteStickyUpdated(payload.sticky);
        if (payload.type === "sticky_del") onRemoteStickyRemoved(payload.id);
        if (payload.type === "clear") onRemoteClear();
      });

      conn.on("close", () => {
        setConnections((prev) => {
          const next = prev.filter((item) => item.peer !== conn.peer);
          if (!next.length) {
            setPeerStatus("idle");
          }
          return next;
        });
      });

      conn.on("error", () => {
        setPeerStatus("error");
      });
    },
    [
      onRemoteSnapshot,
      onRemoteStroke,
      onRemoteStrokesRemoved,
      onRemoteStickyAdded,
      onRemoteStickyUpdated,
      onRemoteStickyRemoved,
      onRemoteClear,
      setConnections,
      setPeerStatus,
    ],
  );

  useEffect(() => {
    let mounted = true;

    loadPeerLibrary()
      .then((PeerLib) => {
        if (!mounted) {
          return;
        }

        const peer = createPeerInstance(PeerLib, createRoomId());
        peerRef.current = peer;

        peer.on("open", (id) => {
          setPeerId(id);
          setPeerStatus("idle");
        });

        peer.on("connection", registerConnection);

        peer.on("error", () => setPeerStatus("error"));
        peer.on("disconnected", () => setPeerStatus("idle"));
      })
      .catch(() => setPeerStatus("error"));

    return () => {
      mounted = false;
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [registerConnection, setPeerId, setPeerStatus]);

  const broadcast = useCallback((message) => {
    connectionRef.current.forEach((conn) => {
      if (!conn.open) {
        return;
      }

      try {
        conn.send(message);
      } catch {
        // ignore single peer failure and keep broadcasting to others
      }
    });
  }, []);

  const joinPeer = useCallback(() => {
    if (!peerRef.current || !peers.joinId.trim()) {
      return;
    }

    setPeerStatus("connecting");
    const conn = peerRef.current.connect(peers.joinId.trim(), {
      reliable: true,
    });
    registerConnection(conn);
    setJoinId("");
  }, [peers.joinId, registerConnection, setJoinId, setPeerStatus]);

  const copyId = useCallback(() => {
    if (!peers.peerId) {
      return;
    }

    navigator.clipboard.writeText(peers.peerId).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    });
  }, [peers.peerId, setCopied]);

  return {
    peerStatus: peers.status,
    peerId: peers.peerId,
    joinId: peers.joinId,
    copied: peers.copied,
    connections: peers.connections,
    connectionCount: peers.connections.length,
    setJoinId,
    joinPeer,
    copyId,
    broadcast,
    isOnline: useMemo(() => peers.status === "online", [peers.status]),
  };
}
