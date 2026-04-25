const PEER_CDN = "https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js";

export async function loadPeerLibrary() {
  if (window.Peer) {
    return window.Peer;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = PEER_CDN;
    script.async = true;
    script.onload = () => {
      if (window.Peer) {
        resolve(window.Peer);
      } else {
        reject(new Error("Peer library loaded but Peer global not found"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load PeerJS"));
    document.head.appendChild(script);
  });
}

export function createPeerInstance(PeerLib, id) {
  return new PeerLib(id, { debug: 0 });
}

export function createRoomId() {
  return `wb-${Math.random().toString(36).slice(2, 9)}`;
}
