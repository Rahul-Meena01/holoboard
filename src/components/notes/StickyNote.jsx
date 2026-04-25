import { useRef } from "react";
import styles from "./StickyNote.module.css";

export default function StickyNote({
  note,
  zoom,
  pan,
  editing,
  onActivate,
  onDeactivate,
  onMove,
  onChange,
  onDelete,
}) {
  const dragRef = useRef(null);

  const left = note.x * zoom + pan.x;
  const top = note.y * zoom + pan.y;
  const width = note.w * zoom;
  const height = note.h * zoom;
  const fontSize = Math.max(11, 13 * zoom);

  function startDrag(event) {
    if (editing) {
      return;
    }

    event.stopPropagation();
    dragRef.current = {
      sx: event.clientX,
      sy: event.clientY,
      ox: note.x,
      oy: note.y,
    };

    const onMoveWindow = (moveEvent) => {
      if (!dragRef.current) {
        return;
      }

      onMove(
        dragRef.current.ox + (moveEvent.clientX - dragRef.current.sx) / zoom,
        dragRef.current.oy + (moveEvent.clientY - dragRef.current.sy) / zoom,
      );
    };

    const onUpWindow = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMoveWindow);
      window.removeEventListener("mouseup", onUpWindow);
    };

    window.addEventListener("mousemove", onMoveWindow);
    window.addEventListener("mouseup", onUpWindow);
  }

  return (
    <div
      className={styles.note}
      style={{ left, top, width, height, background: note.color }}
      onMouseDown={startDrag}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onActivate();
      }}
    >
      <div className={styles.header}>
        <span className={styles.dot} />
        <button
          type="button"
          className={styles.deleteBtn}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
        >
          x
        </button>
      </div>
      <div className={styles.body}>
        {editing ? (
          <textarea
            autoFocus
            className={styles.editor}
            style={{ fontSize }}
            value={note.text}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onDeactivate}
            onMouseDown={(event) => event.stopPropagation()}
          />
        ) : (
          <div className={styles.text} style={{ fontSize }}>
            {note.text || (
              <span className={styles.placeholder}>Double-click to edit</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
