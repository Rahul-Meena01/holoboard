import styles from "./Toolbar.module.css";

export default function StrokeSizePicker({ sizes, value, onChange }) {
  return (
    <div className={styles.sizeRow}>
      <span className={styles.optionLabel}>Size</span>
      {sizes.map((size) => (
        <button
          key={size}
          type="button"
          className={`${styles.sizeBtn} ${value === size ? styles.sizeBtnActive : ""}`}
          onClick={() => onChange(size)}
          aria-label={`Set stroke width ${size}`}
        >
          <span
            className={styles.sizeDot}
            style={{ width: size * 3 + 2, height: size * 3 + 2 }}
          />
        </button>
      ))}
    </div>
  );
}
