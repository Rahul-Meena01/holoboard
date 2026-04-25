import { TOOL_IDS } from "../constants/tools";

function drawSmoothedPath(ctx, points) {
  if (points.length === 1) {
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length - 1; i += 1) {
    const nextX = (points[i].x + points[i + 1].x) / 2;
    const nextY = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, nextX, nextY);
  }

  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.stroke();
}

export function renderStroke(ctx, stroke, theme) {
  if (!stroke || !stroke.points?.length) {
    return;
  }

  ctx.save();
  const points = stroke.points;

  if (stroke.tool === TOOL_IDS.PEN || stroke.tool === TOOL_IDS.ERASER) {
    ctx.strokeStyle =
      stroke.tool === TOOL_IDS.ERASER ? theme.canvas : stroke.color;
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth =
      stroke.tool === TOOL_IDS.ERASER ? stroke.width * 6 : stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    drawSmoothedPath(ctx, points);
  }

  if (stroke.tool === TOOL_IDS.RECT) {
    const a = points[0];
    const b = points[points.length - 1];
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
  }

  if (stroke.tool === TOOL_IDS.CIRCLE) {
    const a = points[0];
    const b = points[points.length - 1];
    const cx = (a.x + b.x) / 2;
    const cy = (a.y + b.y) / 2;
    const rx = Math.abs(b.x - a.x) / 2;
    const ry = Math.abs(b.y - a.y) / 2;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (stroke.tool === TOOL_IDS.LINE || stroke.tool === TOOL_IDS.ARROW) {
    const a = points[0];
    const b = points[points.length - 1];
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();

    if (stroke.tool === TOOL_IDS.ARROW) {
      const angle = Math.atan2(b.y - a.y, b.x - a.x);
      const head = Math.max(10, stroke.width * 4);
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(
        b.x - head * Math.cos(angle - 0.4),
        b.y - head * Math.sin(angle - 0.4),
      );
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(
        b.x - head * Math.cos(angle + 0.4),
        b.y - head * Math.sin(angle + 0.4),
      );
      ctx.stroke();
    }
  }

  if (stroke.tool === TOOL_IDS.TEXT && stroke.text) {
    ctx.fillStyle = stroke.color;
    ctx.font = `${stroke.width * 6}px 'Plus Jakarta Sans', 'Manrope', sans-serif`;
    ctx.fillText(stroke.text, points[0].x, points[0].y);
  }

  ctx.restore();
}
