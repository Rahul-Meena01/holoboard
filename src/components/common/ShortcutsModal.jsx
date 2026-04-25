import { TOOL_CONFIG } from "../../constants/tools";
import styles from "./ShortcutsModal.module.css";

const EXTRA = [
  ["Ctrl/Cmd + Z", "Undo"],
  ["Ctrl/Cmd + Y", "Redo"],
  ["Delete", "Remove selection"],
  ["Esc", "Clear selection"],
  ["?", "Open shortcuts"],
];

export default function ShortcutsModal({ onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className={styles.title}>Keyboard shortcuts</h2>
        <div className={styles.grid}>
          {TOOL_CONFIG.map((tool) => (
            <div key={tool.id} className={styles.row}>
              <kbd>{tool.key.toUpperCase()}</kbd>
              <span>{tool.label}</span>
            </div>
          ))}
          {EXTRA.map(([key, desc]) => (
            <div key={key} className={styles.row}>
              <kbd>{key}</kbd>
              <span>{desc}</span>
            </div>
          ))}
        </div>
        <button type="button" className={styles.closeBtn} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
