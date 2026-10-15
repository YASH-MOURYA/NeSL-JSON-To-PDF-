import { useState } from "react";
import InputPanel from "./components/InputPanel.jsx";
import DocumentCard from "./components/DocumentCard.jsx";
import Footer from "./components/Footer.jsx";
import { extractDocuments } from "./lib/documents.js";
import { downloadPdf, downloadPdfs, downloadZip } from "./lib/download.js";

const TONE_COUNT = 5;

export default function App() {
  const [ddeId, setDdeId] = useState("");
  const [json, setJson] = useState("");
  const [txnId, setTxnId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState(null); // { text, level }
  const [busy, setBusy] = useState(null); // null | "pdf" | "zip"

  const selected = documents.filter((doc) => doc.selected);
  const allPreviewing = selected.length > 0 && selected.every((doc) => doc.preview);

  // Update one document (or all, when key is omitted).
  const patchDocument = (key, patch) =>
    setDocuments((docs) => docs.map((doc) => (key === undefined || doc.key === key ? { ...doc, ...patch(doc) } : doc)));

  function handleExtract() {
    setMessage(null);
    try {
      const result = extractDocuments(ddeId, json);
      setTxnId(result.txnId);
      setDocuments(result.documents);
      setMessage({
        level: "success",
        text: `${result.documents.length} document(s) extracted. ZIP will be named "${result.txnId}.zip". Use the remove button on a card to leave a PDF out of the download.`,
      });
    } catch (error) {
      setTxnId("");
      setDocuments([]);
      setMessage({ level: error.level ?? "error", text: error.message });
    }
  }

  function handleClear() {
    setDdeId("");
    setJson("");
    setTxnId("");
    setDocuments([]);
    setMessage(null);
  }

  async function handleDownload(kind) {
    setBusy(kind);
    try {
      if (kind === "zip") {
        await downloadZip(selected, txnId);
        setMessage({ level: "success", text: `${selected.length} PDF file(s) downloaded in ${txnId}.zip.` });
      } else {
        await downloadPdfs(selected);
        setMessage({ level: "success", text: `${selected.length} PDF file(s) downloaded.` });
      }
    } catch (error) {
      console.error("Download error:", error);
      setMessage({ level: "error", text: "Could not complete the download. Please try again." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="shell">
      <header className="header">
        <div className="logo" aria-hidden="true" />
        <div>
          <h1>JSON PDF Downloader</h1>
          <p>Extract and select Base64 encoded PDF documents. Works for NeSL submitted JSON.</p>
        </div>
      </header>

      <main>
        <InputPanel
          ddeId={ddeId}
          json={json}
          busy={busy}
          selectedCount={selected.length}
          onDdeIdChange={setDdeId}
          onJsonChange={setJson}
          onExtract={handleExtract}
          onClear={handleClear}
          onDownloadPdfs={() => handleDownload("pdf")}
          onDownloadZip={() => handleDownload("zip")}
        />

        {message && (
          <div className={`message ${message.level}`} role="status">
            {message.text}
          </div>
        )}

        <section className="documents-section">
          <div className="documents-header">
            <div className="documents-title">
              <h2>Documents</h2>
              <span className="count">{selected.length} / {documents.length} selected</span>
            </div>

            <div className="document-actions">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={allPreviewing}
                  disabled={selected.length === 0}
                  onChange={(e) => patchDocument(undefined, () => ({ preview: e.target.checked }))}
                />
                <span className="track" aria-hidden="true" />
                Live preview
              </label>
              <button type="button" className="small-btn" onClick={() => patchDocument(undefined, () => ({ selected: true }))}>
                Select All
              </button>
              <button type="button" className="small-btn" onClick={() => patchDocument(undefined, () => ({ selected: false }))}>
                Remove All
              </button>
            </div>
          </div>

          {selected.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">PDF</div>
              <strong>{documents.length ? "All documents removed" : "No documents extracted"}</strong>
              <span>
                {documents.length
                  ? 'Click "Select All" to bring them back.'
                  : 'Paste your JSON and click "Extract Documents".'}
              </span>
            </div>
          ) : (
            <div className="documents-list">
              {selected.map((doc) => (
                <DocumentCard
                  key={doc.key}
                  doc={doc}
                  tone={documents.indexOf(doc) % TONE_COUNT}
                  onRemove={(key) => patchDocument(key, () => ({ selected: false }))}
                  onDownload={downloadPdf}
                  onTogglePreview={(key) => patchDocument(key, (d) => ({ preview: !d.preview }))}
                  onResize={(key, size) => patchDocument(key, () => ({ size }))}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
