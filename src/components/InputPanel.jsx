export default function InputPanel({
  ddeId,
  json,
  busy,
  selectedCount,
  onDdeIdChange,
  onJsonChange,
  onExtract,
  onClear,
  onDownloadPdfs,
  onDownloadZip,
}) {
  return (
    <section className="panel">
      <div className="toolbar">
        <div className="field">
          <label className="label" htmlFor="transactionId">DDE Transaction ID</label>
          <input
            id="transactionId"
            type="text"
            value={ddeId}
            onChange={(e) => onDdeIdChange(e.target.value)}
            placeholder="Enter DDE Transaction ID"
            autoComplete="off"
          />
          <p className="hint">Example: 180820261111460004709012</p>
        </div>

        <div className="actions">
          <button type="button" className="btn btn-primary" onClick={onExtract}>
            Extract Documents
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClear}>
            Clear
          </button>
          <button
            type="button"
            className="btn btn-download"
            disabled={selectedCount === 0 || busy !== null}
            onClick={onDownloadPdfs}
          >
            {busy === "pdf" ? "Downloading..." : selectedCount === 1 ? "Download PDF" : "Download PDFs"}
          </button>
          <button
            type="button"
            className="btn btn-download"
            disabled={selectedCount === 0 || busy !== null}
            onClick={onDownloadZip}
          >
            {busy === "zip" ? "Creating ZIP..." : "Download ZIP"}
          </button>
        </div>
      </div>

      <div className="field json-field">
        <label className="label" htmlFor="jsonInput">Paste Complete JSON</label>
        <textarea
          id="jsonInput"
          value={json}
          onChange={(e) => onJsonChange(e.target.value)}
          spellCheck={false}
          placeholder="Paste your complete JSON here..."
        />
        <p className="hint">Supports documentdtls, docDetails and nested JSON structures.</p>
      </div>
    </section>
  );
}
