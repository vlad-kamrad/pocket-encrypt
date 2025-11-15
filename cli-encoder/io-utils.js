// @ts-check

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

/**
 * @typedef {Object} AnalyzeFileMetadata
 * @property {string} filename
 * @property {number} size
 * @property {string} path
 * @property {string} extension
 */

/**
 * @typedef {"file" | "folder" | "none"} PathType
 */

/**
 *
 * @param {string} directoryPath
 */
export async function analyzeDirectory(directoryPath) {
  /** @type {AnalyzeFileMetadata[]} */
  const result = [];

  /**
   * @param {string} currentPath
   */
  async function walk(currentPath) {
    const type = await detectPathType(currentPath);

    // Skip missing or unsupported paths
    if (type === "none") {
      return;
    }

    if (type === "file") {
      const stats = await fs.stat(currentPath);

      result.push({
        path: currentPath,
        extension: path.extname(currentPath).toLowerCase(),
        filename: path.basename(currentPath),
        size: stats.size,
      });

      return;
    }

    let entries;
    try {
      entries = await fs.readdir(currentPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      await walk(fullPath);
    }
  }

  await walk(directoryPath);

  return result;
}

/**
 * Checks whether a path is a file or a folder.
 * @param {string} targetPath
 * @returns {Promise<PathType>}
 */
export async function detectPathType(targetPath) {
  try {
    const stats = await fs.stat(targetPath);

    if (stats.isFile()) return "file";
    if (stats.isDirectory()) return "folder";

    // Neither file nor folder (symlink, socket, etc.)
    return "none";
  } catch {
    // Path does not exist
    return "none";
  }
}
