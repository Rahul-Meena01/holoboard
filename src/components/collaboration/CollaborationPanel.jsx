import styles from "./CollaborationPanel.module.css";

function StatusLine({ state, peers }) {
  if (state === "online") {
    return <div className={styles.statusOnline}>Live with {peers} peer(s)</div>;
  }

  if (state === "connecting") {
    return <div className={styles.statusConnecting}>Connecting...</div>;
  }

  if (state === "error") {
    return (
      <div className={styles.statusError}>
        Peer unavailable. Working locally.
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className={styles.statusIdle}>Loading collaboration engine...</div>
    );
  }

  return (
    <div className={styles.statusIdle}>
      Share your room ID and invite others.
    </div>
  );
}

export default function CollaborationPanel({
  peerStatus,
  peerId,
  joinId,
  copied,
  connections,
  onJoinIdChange,
  onJoin,
  onCopy,
}) {
  return (
    <aside className={styles.panel}>
      <h2 className={styles.heading}>Collaboration</h2>
      <p className={styles.label}>Your room ID</p>
      <code className={styles.code}>{peerId || "Initializing"}</code>
      <button type="button" className={styles.primaryBtn} onClick={onCopy}>
        {copied ? "Copied" : "Copy room ID"}
      </button>

      <p className={styles.label}>Join room</p>
      <div className={styles.joinRow}>
        <input
          className={styles.input}
          value={joinId}
          onChange={(event) => onJoinIdChange(event.target.value)}
          placeholder="Paste room ID"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onJoin();
            }
          }}
        />
        <button type="button" className={styles.primaryBtn} onClick={onJoin}>
          Join
        </button>
      </div>

      <StatusLine state={peerStatus} peers={connections.length} />

      {!!connections.length && (
        <div className={styles.peersList}>
          {connections.map((conn) => (
            <div key={conn.peer} className={styles.peerItem}>
              <span className={styles.peerDot} />
              <span>{conn.peer}</span>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
