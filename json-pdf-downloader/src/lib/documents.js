/**
 * Pure helpers: find txnID + Base64 PDFs inside any JSON shape.
 * No React in here, so it is easy to test.
 */

const DOC_DATA_KEYS = ["docdata", "documentdata", "base64", "filedata"];
const DOC_LIST_KEYS = ["documentdtls", "docdetails", "documentdetails", "documents", "documentlist", "documentdata"];
const DOC_ID_KEYS = ["documentid", "docid", "documentno", "id", "seqno"];

const normalize = (key) => String(key).toLowerCase().replace(/[^a-z0-9]/g, "");

/** First value whose (normalized) key is in `names`. */
function pick(obj, names) {
  for (const [key, value] of Object.entries(obj)) {
    if (names.includes(normalize(key))) return value;
  }
  return undefined;
}

export const sanitizeFileName = (value) =>
  String(value).replace(/[<>:"/\\|?*]/g, "_").replace(/\s+/g, " ").trim();

/** Strips "data:application/pdf;base64," prefixes and whitespace. */
function cleanBase64(value) {
  let text = String(value ?? "").trim();
  const comma = text.indexOf(",");
  if (comma !== -1 && text.slice(0, comma).toLowerCase().includes("base64")) {
    text = text.slice(comma + 1);
  }
  return text.replace(/\s/g, "");
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Recursively find the first non-empty "txnID" key. */
export function findTxnId(node) {
  if (!node || typeof node !== "object") return null;

  if (!Array.isArray(node)) {
    const value = pick(node, ["txnid"]);
    if (value != null && String(value).trim() !== "") return String(value).trim();
  }

  for (const child of Object.values(node)) {
    const found = findTxnId(child);
    if (found) return found;
  }
  return null;
}

/** A PDF item has a doc-data string that starts with the PDF Base64 header. */
function isPdfItem(item) {
  if (!item || typeof item !== "object" || Array.isArray(item)) return false;
  const data = pick(item, DOC_DATA_KEYS);
  return typeof data === "string" && cleanBase64(data).slice(0, 5).toUpperCase() === "JVBER";
}

/** Walk the whole JSON and collect every object that holds a Base64 PDF. */
function findPdfItems(root) {
  const found = new Set();
  const seen = new WeakSet();

  function walk(node) {
    if (!node || typeof node !== "object" || seen.has(node)) return;
    seen.add(node);

    if (Array.isArray(node)) {
      for (const item of node) {
        if (isPdfItem(item)) found.add(item);
        else walk(item);
      }
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      if (Array.isArray(value) && DOC_LIST_KEYS.includes(normalize(key))) {
        value.filter(isPdfItem).forEach((item) => found.add(item));
      }
      walk(value);
    }
  }

  walk(root);
  return [...found];
}

/** Error with a `level` the UI can use for colouring ("warning" | "error"). */
export class InputError extends Error {
  constructor(message, level = "warning") {
    super(message);
    this.level = level;
  }
}

/**
 * Turn the form input into a list of documents.
 * PDF file name = DDE transaction id + "_" + document id.
 * ZIP name      = txnID found inside the JSON.
 */
export function extractDocuments(ddeTransactionId, rawJson) {
  if (!ddeTransactionId.trim()) throw new InputError("Please enter the DDE Transaction ID.");
  if (!rawJson.trim()) throw new InputError("Please paste the complete JSON.");

  let json;
  try {
    json = JSON.parse(rawJson);
  } catch {
    throw new InputError("The JSON is not valid. Please paste the complete JSON response.", "error");
  }

  const txnId = findTxnId(json);
  if (!txnId) throw new InputError("txnID was not found in the JSON. Please make sure it contains a txnID field.");

  const items = findPdfItems(json);
  if (items.length === 0) {
    throw new InputError("No PDF documents were found. Make sure your JSON contains documentdtls/docDetails with Base64 PDF data.");
  }

  const prefix = sanitizeFileName(ddeTransactionId);
  const documents = [];

  items.forEach((item, index) => {
    try {
      const rawId = pick(item, DOC_ID_KEYS);
      const id = rawId != null && String(rawId).trim() !== "" ? String(rawId) : String(index + 1);
      documents.push({
        key: `${index}-${id}`, // unique React key
        id,
        fileName: `${prefix}_${id}.pdf`,
        bytes: base64ToBytes(cleanBase64(pick(item, DOC_DATA_KEYS))),
        selected: true, // false once the user removes the card
        preview: false, // live preview on/off
        size: null, // custom { w, h } after the user resizes the card
      });
    } catch {
      /* skip items whose Base64 is corrupt */
    }
  });

  if (documents.length === 0) throw new InputError("The Base64 data in the JSON could not be decoded.", "error");

  return { txnId: sanitizeFileName(txnId), documents };
}
