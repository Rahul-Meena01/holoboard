import StatusBadge from "../common/StatusBadge";
import styles from "./Topbar.module.css";

export default function Topbar({
  connectedPeers,
  onUndo,
  onRedo,
  onClear,
  onToggleTheme,
  onToggleHelp,
  onExportPng,
  onExportJson,
  onToggleCollaboration,
  collaborationOpen,
}) {
  return (
    <header className={styles.topbar}>
      <div className={styles.titleArea}>
        <h1 className={styles.title}>Whiteboard Pro</h1>
        <StatusBadge connectedPeers={connectedPeers} />
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.btn} onClick={onUndo}>
          Undo
        </button>
        <button type="button" className={styles.btn} onClick={onRedo}>
          Redo
        </button>
        <button type="button" className={styles.btn} onClick={onClear}>
          Clear
        </button>
        <button type="button" className={styles.btn} onClick={onExportPng}>
          Export PNG
        </button>
        <button type="button" className={styles.btn} onClick={onExportJson}>
          Export JSON
        </button>
        <button type="button" className={styles.btn} onClick={onToggleTheme}>
          Theme
        </button>
        <button type="button" className={styles.btn} onClick={onToggleHelp}>
          Shortcuts
        </button>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={onToggleCollaboration}
        >
          {collaborationOpen ? "Close Share" : "Share"}
        </button>
      </div>
    </header>
  );
}
