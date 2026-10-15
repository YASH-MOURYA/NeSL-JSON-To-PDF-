import JSZip from "jszip";

function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Downloads one PDF directly. */
export function downloadPdf(doc) {
  saveBlob(new Blob([doc.bytes], { type: "application/pdf" }), doc.fileName);
}

/** Downloads several PDFs one after another (a short gap keeps browsers from dropping them). */
export async function downloadPdfs(documents) {
  for (const [index, doc] of documents.entries()) {
    if (index > 0) await new Promise((resolve) => setTimeout(resolve, 300));
    downloadPdf(doc);
  }
}

/** Zips the documents in the browser and downloads the ZIP. */
export async function downloadZip(documents, zipName) {
  const zip = new JSZip();
  documents.forEach((doc) => zip.file(doc.fileName, doc.bytes));

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  saveBlob(blob, `${zipName}.zip`);
}
