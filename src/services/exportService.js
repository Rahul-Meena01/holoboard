export function exportBoardAsJson(board) {
  const payload = JSON.stringify(board, null, 2);
  downloadBlob(payload, "application/json", `board-${Date.now()}.json`);
}

export function exportCanvasAsPng(canvas) {
  if (!canvas) {
    return;
  }

  canvas.toBlob((blob) => {
    if (!blob) {
      return;
    }

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `board-${Date.now()}.png`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

function downloadBlob(content, mime, filename) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
