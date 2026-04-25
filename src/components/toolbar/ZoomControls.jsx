import styles from "./ZoomControls.module.css";

export default function ZoomControls({ zoom, onZoomIn, onZoomOut, onReset }) {
  return (
    <div className={styles.controls}>
      <button type="button" className={styles.controlBtn} onClick={onZoomIn}>
        +
      </button>
      <span className={styles.zoomValue}>{Math.round(zoom * 100)}%</span>
      <button type="button" className={styles.controlBtn} onClick={onZoomOut}>
        -
      </button>
      <button
        type="button"
        className={`${styles.controlBtn} ${styles.resetBtn}`}
        onClick={onReset}
      >
        Reset
      </button>
    </div>
  );
}
