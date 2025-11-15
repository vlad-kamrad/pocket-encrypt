import { getFileCategory, type FileCategory } from "./file-category";

const ITERATIONS = 200_000;
const HASH = "SHA-256";

type AddPayload = {
  name: string;
  ext: string | null;
  mime: string | null;
};

export async function decodeFile(params: { file: File; password: string }) {
  const buffer = await params.file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // parse: salt(16) | iv(12) | aadLength(2) | aad | ciphertext | tag(16)
  let offset = 0;
  const salt = bytes.slice(offset, offset + 16);
  offset += 16;
  const iv = bytes.slice(offset, offset + 12);
  offset += 12;
  const aadLength = (bytes[offset] << 8) | bytes[offset + 1];
  offset += 2;
  const aad = bytes.slice(offset, offset + aadLength);
  offset += aadLength;

  // Convert Uint8Array to string
  const aadString = new TextDecoder("utf-8").decode(aad);
  const aadPayload: AddPayload = JSON.parse(aadString);

  const tag = bytes.slice(bytes.length - 16);
  const ciphertext = bytes.slice(offset, bytes.length - 16);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(params.password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt, iterations: ITERATIONS, hash: HASH },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  // AES-GCM expects cipherText + tag concatenated
  const cipherTextWithTag = concatUint8Arrays(ciphertext, tag);

  // Decrypt with AAD
  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv, additionalData: aad },
    key,
    cipherTextWithTag
  );

  const blob = new Blob([plainBuffer], { type: aadPayload?.mime || undefined });

  const fileCategory: FileCategory = aadPayload?.mime
    ? getFileCategory(aadPayload.mime)
    : "other";

  return {
    blob,
    category: fileCategory,
    ...aadPayload,
  };
}

function concatUint8Arrays(a: ArrayLike<number>, b: ArrayLike<number>) {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}
