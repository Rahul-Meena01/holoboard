import { TOOL_CONFIG } from "../../constants/tools";
import Icon from "../common/Icon";
import styles from "./Toolbar.module.css";

const DIVIDERS_AFTER = new Set(["select", "eraser", "sticky"]);

export default function Toolbar({ tool, onChangeTool }) {
  return (
    <div className={styles.toolbar}>
      {TOOL_CONFIG.map((item) => (
        <div key={item.id} className={styles.groupItem}>
          <button
            type="button"
            title={`${item.label} (${item.key})`}
            className={`${styles.toolButton} ${tool === item.id ? styles.toolButtonActive : ""}`}
            onClick={() => onChangeTool(item.id)}
          >
            <Icon path={item.icon} size={15} />
          </button>
          {DIVIDERS_AFTER.has(item.id) ? (
            <div className={styles.separator} />
          ) : null}
        </div>
      ))}
    </div>
  );
}
