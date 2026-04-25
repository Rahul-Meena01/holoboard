import styles from "./StatusBadge.module.css";

export default function StatusBadge({ connectedPeers }) {
  const online = connectedPeers > 0;

  return (
    <span
      className={`${styles.badge} ${online ? styles.online : styles.offline}`}
    >
      {online ? `Connected: ${connectedPeers}` : "Solo"}
    </span>
  );
}
