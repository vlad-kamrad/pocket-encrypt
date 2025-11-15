// @ts-check

import crypto from "crypto";

const ITERATIONS = 200_000;
const SALT_LEN = 16;
const IV_LEN = 12;
const KEY_LEN = 32;

/**
 * @typedef {{ name: string; ext: string | null; mime: string | null }} EncMetadata
 */

/**
 * @param {{ buffer: Buffer<ArrayBufferLike>; password: string; metadata: EncMetadata; }} params
 * @returns {Promise<Buffer<ArrayBuffer>>}
 */
export async function encodeBuffer({ buffer, password, metadata }) {
  const salt = crypto.randomBytes(SALT_LEN);
  const iv = crypto.randomBytes(IV_LEN);

  // Derive key via PBKDF2
  const key = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, "sha256");

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv, {
    authTagLength: 16,
  });

  // Bind filename and version for AAD
  const aad = Buffer.from(JSON.stringify({ ...metadata, v: 1 }), "utf8");
  cipher.setAAD(aad);

  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Layout: salt(16) | iv(12) | aadLength(2) | aad | ciphertext | tag(16)
  const aadLengthBuffer = Buffer.alloc(2);
  aadLengthBuffer.writeUInt16BE(aad.length, 0);

  // zero key material
  if (Buffer.isBuffer(key)) {
    key.fill(0);
  }

  return Buffer.concat([salt, iv, aadLengthBuffer, aad, encrypted, tag]);
}
