# Pocket Encrypt

Pocket Encrypt is a secure toolkit designed for encrypting, decrypting, and processing media files (images, videos, audio, documents) directly in the browser or Node.js environment. The goal is to provide strong client-side security while keeping the API simple and predictable.

## Features

* **AES‑256‑GCM encryption** with PBKDF2-based key derivation (Argon2 for Node option).
* **Browser‑safe implementation** without relying on unavailable crypto APIs.
* **Support for encryption of any binary data**: images, videos, audio, JSON, text, etc.
* **Additional Authenticated Data (AAD)** support for filename verification.
* **Simple Node.js CLI utilities** for scanning folders, detecting file types, listing files, and processing media.
* **Recommended patterns for handling sensitive media files** in PWAs or browser-based projects.

## Architecture Overview

Pocket Encrypt provides two parallel implementations:

### 1. **Browser Version (PBKDF2)**

* Uses Web Crypto + PBKDF2
* Avoids heavy dependencies like argon2
* Fully client-side and PWA-friendly
* Suitable for user-facing encryption workflows

### 2. **Node Version (PBKDF2 or Argon2)**

* Uses Node `crypto` module
* Optionally supports Argon2 for strong key derivation
* Optimized for automation, batch encryption, and backend integrations

## Encryption Format

Every encrypted payload contains:

* **salt** – random salt for PBKDF2/Argon2
* **iv** – initialization vector for AES-GCM
* **tag** – authentication tag
* **ciphertext** – encrypted bytes
* **aad** – optional information such as filename

Example structure:

```ts
{
  salt: Uint8Array,
  iv: Uint8Array,
  tag: Uint8Array,
  ciphertext: Uint8Array,
  aad: string | undefined
}
```

## CLI Tools

The project includes helper functions to work with the filesystem.

### `scanFolder(path)`

Recursively scans a folder and returns JSON describing:

* filename
* extension
* size
* absolute path
* whether it's a file or a directory

### `detectPathType(path)`

Returns:

* `"file"`
* `"folder"`
* `"unknown"`

### Output Example

```json
[
  {
    "filename": "example.png",
    "extension": ".png",
    "size": 152304,
    "path": "/users/me/images/example.png",
    "type": "file"
  }
]
```

## Media Processing

Pocket Encrypt supports encrypting:

* Images (`png`, `jpeg`, `webp`, `gif`)
* Audio (`wav`, `mp3`)
* Video (`mp4`, `webm`, `ogg`)
* JSON
* Arbitrary binary buffers

MIME-type detection is customizable and fully overridable.

You can also specify regex-based type rules:

```ts
{
  "image/.*": "image",
  "audio/.*": "audio"
}
```

## Security Notes

* AES‑256‑GCM ensures authenticity and confidentiality.
* Each encryption uses a new random IV and salt.
* AAD is used to validate metadata such as filenames.
* Browser version uses PBKDF2 to avoid Argon issues in browsers.
* Node version may use Argon2 for much stronger KDF security.

### Recommended Usage

* Do NOT store plaintext media on the server.
* Always prompt users to manually input passwords.
* Store salts and IVs alongside encrypted data.
* Never reuse IVs.

## License

MIT - free for personal and commercial use.

---

Feel free to open issues or PRs if you want to improve the project!
