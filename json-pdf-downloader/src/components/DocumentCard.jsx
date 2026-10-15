import { useEffect, useRef, useState } from "react";

const MIN_WIDTH = 220;
const MIN_HEIGHT = 130;
const DEFAULT_WIDTH = 260;
const DEFAULT_WIDTH_WITH_PREVIEW = 380;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function DocumentCard({ doc, tone, onRemove, onDownload, onTogglePreview, onResize }) {
  const cardRef = useRef(null);
  const [url, setUrl] = useState(null);

  // Create the blob URL only while the preview is open, and always clean it up.
  useEffect(() => {
    if (!doc.preview) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(new Blob([doc.bytes], { type: "application/pdf" }));
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [doc.preview, doc.bytes]);

  // Drag the corner handle to resize. Width never exceeds the container.
  function startResize(event) {
    event.preventDefault();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);

    const card = cardRef.current;
    const start = { x: event.clientX, y: event.clientY, ...card.getBoundingClientRect().toJSON() };
    const maxWidth = card.parentElement.clientWidth;

    const move = (e) =>
      onResize(doc.key, {
        w: clamp(start.width + e.clientX - start.x, MIN_WIDTH, maxWidth),
        h: Math.max(MIN_HEIGHT, start.height + e.clientY - start.y),
      });
    const stop = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", stop);
      handle.removeEventListener("pointercancel", stop);
    };

    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
  }

  const width = doc.size?.w ?? (doc.preview ? DEFAULT_WIDTH_WITH_PREVIEW : DEFAULT_WIDTH);
  const height = doc.size?.h; // undefined = fit content

  return (
    <article ref={cardRef} className="card" data-tone={tone} style={{ width, height }}>
      <header className="card-head">
        <div className="pdf-badge">PDF</div>
        <div className="card-meta">
          <strong title={`Document ID: ${doc.id}`}>Document ID: {doc.id}</strong>
          <code title={doc.fileName}>{doc.fileName}</code>
        </div>
        <button
          type="button"
          className="icon-btn"
          title="Remove this PDF from ZIP"
          aria-label={`Remove ${doc.fileName}`}
          onClick={() => onRemove(doc.key)}
        >
          <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div className="card-actions">
        <button
          type="button"
          className="chip"
          aria-pressed={doc.preview}
          onClick={() => onTogglePreview(doc.key)}
        >
          {doc.preview ? "Hide preview" : "Preview"}
        </button>
        <button type="button" className="chip" onClick={() => onDownload(doc)}>
          Download
        </button>
      </div>

      {doc.preview && (
        <div className="preview">
          {url ? <iframe src={url} title={`Preview of ${doc.fileName}`} /> : null}
        </div>
      )}

      <div
        className="resize-handle"
        role="separator"
        aria-label="Drag to resize, double-click to reset"
        title="Drag to resize, double-click to reset"
        onPointerDown={startResize}
        onDoubleClick={() => onResize(doc.key, null)}
      />
    </article>
  );
}
