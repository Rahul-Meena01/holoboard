import styles from "./Toolbar.module.css";

export default function ColorPicker({ colors, value, onChange }) {
  return (
    <div className={styles.colorRow}>
      <span className={styles.optionLabel}>Ink</span>
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`Select color ${color}`}
          className={`${styles.swatch} ${value === color ? styles.swatchActive : ""}`}
          style={{ background: color }}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  );
}
