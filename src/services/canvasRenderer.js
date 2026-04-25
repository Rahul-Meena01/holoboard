import { renderStroke } from "./drawingEngine";

export function drawBoard({
  ctx,
  width,
  height,
  pan,
  zoom,
  strokes,
  currentStroke,
  selection,
  theme,
}) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = theme.canvas;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(pan.x, pan.y);
  ctx.scale(zoom, zoom);

  drawDotGrid(ctx, width, height, pan, zoom, theme.gridDot);

  strokes.forEach((stroke) => renderStroke(ctx, stroke, theme));

  if (currentStroke) {
    renderStroke(ctx, currentStroke, theme);
  }

  if (selection) {
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1 / zoom;
    ctx.setLineDash([5 / zoom, 3 / zoom]);
    ctx.strokeRect(selection.x, selection.y, selection.w, selection.h);
    ctx.setLineDash([]);
    ctx.fillStyle = theme.accentMuted;
    ctx.fillRect(selection.x, selection.y, selection.w, selection.h);
  }

  ctx.restore();
}

function drawDotGrid(ctx, width, height, pan, zoom, dotColor) {
  const grid = 28;
  const offsetX = (-pan.x / zoom) % grid;
  const offsetY = (-pan.y / zoom) % grid;

  ctx.fillStyle = dotColor;

  for (let x = offsetX - grid; x < width / zoom + grid; x += grid) {
    for (let y = offsetY - grid; y < height / zoom + grid; y += grid) {
      ctx.beginPath();
      ctx.arc(x, y, 1.15, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
